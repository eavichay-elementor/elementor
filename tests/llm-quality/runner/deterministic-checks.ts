import type { Page, Frame } from '@playwright/test';
import type {
	DeterministicCheckResult,
	CriticalFailure,
	CriticalFailureType,
	CanvasState,
	ConsoleLogEntry,
} from '../types';

interface CheckContext {
	page: Page;
	previewFrame: Frame;
	canvasState: CanvasState;
	consoleLogs: ConsoleLogEntry[];
}

type CheckFunction = ( context: CheckContext ) => Promise<CriticalFailure | null>;

const DANGEROUS_PATTERNS = [
	/<script\b[^>]*>/i,
	/javascript:/i,
	/on\w+\s*=/i,
	/eval\s*\(/i,
	/document\.write/i,
];

const checkEmptyCanvas: CheckFunction = async ( { canvasState } ) => {
	if ( ! canvasState.hasContent || 0 === canvasState.elementCount ) {
		return {
			type: 'empty-canvas',
			message: 'Canvas is empty - no elements were generated',
			details: {
				elementCount: canvasState.elementCount,
				widgetTypes: canvasState.widgetTypes,
			},
		};
	}
	return null;
};

const checkRuntimeErrors: CheckFunction = async ( { consoleLogs } ) => {
	const criticalErrors = consoleLogs.filter( ( log ) => {
		if ( log.type !== 'error' ) {
			return false;
		}

		const message = log.message.toLowerCase();
		return (
			message.includes( 'uncaught' ) ||
			message.includes( 'typeerror' ) ||
			message.includes( 'referenceerror' ) ||
			message.includes( 'syntaxerror' ) ||
			message.includes( 'fatal' )
		);
	} );

	if ( criticalErrors.length > 0 ) {
		return {
			type: 'runtime-error',
			message: `Found ${ criticalErrors.length } critical JavaScript error(s)`,
			details: {
				errors: criticalErrors.map( ( e ) => e.message ),
			},
		};
	}

	return null;
};

const checkBrokenLayout: CheckFunction = async ( { previewFrame, canvasState } ) => {
	if ( ! canvasState.hasContent ) {
		return null;
	}

	const layoutIssues = await previewFrame.evaluate( () => {
		const issues: string[] = [];

		const elements = document.querySelectorAll( '.elementor-element' );
		elements.forEach( ( el ) => {
			const rect = el.getBoundingClientRect();

			if ( 0 === rect.width && 0 === rect.height ) {
				issues.push( `Zero-size element: ${ el.getAttribute( 'data-id' ) }` );
			}

			if ( rect.left < -1000 || rect.top < -1000 ) {
				issues.push( `Off-screen element: ${ el.getAttribute( 'data-id' ) }` );
			}
		} );

		const hasOverlappingCritical = false;

		return { issues, hasOverlappingCritical };
	} );

	if ( layoutIssues.issues.length > 0 ) {
		return {
			type: 'broken-layout',
			message: 'Layout issues detected',
			details: {
				issues: layoutIssues.issues,
			},
		};
	}

	return null;
};

const checkSecurityViolations: CheckFunction = async ( { previewFrame } ) => {
	const violations = await previewFrame.evaluate( ( patterns: string[] ) => {
		const found: string[] = [];

		const html = document.body.innerHTML;
		for ( const pattern of patterns ) {
			const regex = new RegExp( pattern, 'gi' );
			if ( regex.test( html ) ) {
				found.push( pattern );
			}
		}

		return found;
	}, DANGEROUS_PATTERNS.map( ( p ) => p.source ) );

	if ( violations.length > 0 ) {
		return {
			type: 'security-violation',
			message: 'Potential security violation detected',
			details: {
				patterns: violations,
			},
		};
	}

	return null;
};

const ALL_CHECKS: CheckFunction[] = [
	checkEmptyCanvas,
	checkRuntimeErrors,
	checkBrokenLayout,
	checkSecurityViolations,
];

export async function runDeterministicChecks(
	page: Page,
	previewFrame: Frame,
	canvasState: CanvasState,
	consoleLogs: ConsoleLogEntry[],
): Promise<DeterministicCheckResult> {
	const context: CheckContext = {
		page,
		previewFrame,
		canvasState,
		consoleLogs,
	};

	const failures: CriticalFailure[] = [];

	for ( const check of ALL_CHECKS ) {
		const failure = await check( context );
		if ( failure ) {
			failures.push( failure );
		}
	}

	return {
		passed: 0 === failures.length,
		failures,
	};
}

export function hasFailureOfType(
	result: DeterministicCheckResult,
	type: CriticalFailureType,
): boolean {
	return result.failures.some( ( f ) => f.type === type );
}

export function getFailuresByType(
	result: DeterministicCheckResult,
	type: CriticalFailureType,
): CriticalFailure[] {
	return result.failures.filter( ( f ) => f.type === type );
}
