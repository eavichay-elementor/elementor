import { type Page, type Frame, type TestInfo } from '@playwright/test';
import type ApiRequests from '../../playwright/assets/api-requests';
import type {
	ScenarioDefinition,
	AngieChatState,
	CanvasState,
	DocumentElement,
	DeterministicCheckResult,
	CriticalFailure,
} from '../types';

const ANGIE_SELECTORS = {
	angieFrame: 'iframe[title="Angie AI Assistant"]',
	chatPanel: 'iframe[title="Angie AI Assistant"], [data-testid="angie-chat-panel"], .angie-chat-panel',
	chatInput: '[data-testid="angie-chat-input-text-field"]',
	sendButton: 'button.MuiButton-containedSizeSmall',
	stopButton: 'button[aria-label="Stop Angie response"]',
	errorMessage: '[data-testid="angie-error"], .angie-error',
	openChatButton: '#angie-toolbar-button-container button',
};

const TIMEOUTS = {
	chatOpen: 10_000,
	messageProcessing: 720_000,
	elementRender: 30_000,
	action: 5_000,
};

export class BaseScenario {
	readonly page: Page;
	readonly testInfo: TestInfo;
	readonly scenario: ScenarioDefinition;
	readonly apiRequests: ApiRequests;

	constructor( page: Page, testInfo: TestInfo, scenario: ScenarioDefinition, apiRequests: ApiRequests ) {
		this.page = page;
		this.testInfo = testInfo;
		this.scenario = scenario;
		this.apiRequests = apiRequests;
	}

	async openEditor(): Promise<void> {
		const postId = await this.apiRequests.create( this.page.request, 'pages', {
			title: `LLM Test - ${ this.scenario.name }`,
			status: 'draft',
		} );

		await this.page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
		await this.waitForEditorReady();
	}

	async waitForEditorReady(): Promise<void> {
		await this.page.waitForSelector( '#elementor-preview-iframe', { timeout: TIMEOUTS.chatOpen } );
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached', timeout: TIMEOUTS.chatOpen } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden', timeout: TIMEOUTS.chatOpen } );
	}

	getPreviewFrame(): Frame {
		const frame = this.page.frame( { name: 'elementor-preview-iframe' } );
		if ( ! frame ) {
			throw new Error( 'Preview iframe not found' );
		}
		return frame;
	}

	async openAngieChat(): Promise<void> {
		const chatPanel = this.page.locator( ANGIE_SELECTORS.angieFrame );
		const isVisible = await chatPanel.isVisible().catch( () => false );

		if ( isVisible ) {
			return;
		}

		const openButton = this.page.locator( ANGIE_SELECTORS.openChatButton );
		if ( await openButton.isVisible() ) {
			await openButton.click();
			await this.page.waitForSelector( ANGIE_SELECTORS.angieFrame, { timeout: TIMEOUTS.chatOpen } );
		}
	}

	async sendPromptToAngie( prompt: string ): Promise<void> {
		await this.openAngieChat();
		const angieFrame = this.page.locator( ANGIE_SELECTORS.angieFrame ).contentFrame();
		const chatInput = angieFrame.locator( ANGIE_SELECTORS.chatInput );
		await chatInput.fill( prompt );

		const sendButton = angieFrame.locator( ANGIE_SELECTORS.sendButton ).first();
		await sendButton.click();
		const stopButton = angieFrame.locator( ANGIE_SELECTORS.stopButton ).first();
		await stopButton.waitFor( { state: 'visible' } );
	}

	async getAngieChatState(): Promise<AngieChatState> {
		const chatPanel = this.page.locator( ANGIE_SELECTORS.chatPanel );
		const isOpen = await chatPanel.isVisible().catch( () => false );

		const loadingIndicator = this.page.getByText( 'Thinking' );
		const isProcessing = await loadingIndicator.isVisible().catch( () => false );

		const errorElement = this.page.locator( ANGIE_SELECTORS.errorMessage );
		const lastError = await errorElement.isVisible()
			? await errorElement.textContent()
			: undefined;

		return {
			isOpen,
			isProcessing,
			messages: [],
			lastError: lastError || undefined,
		};
	}

	async executePrompt(): Promise<void> {
		await this.sendPromptToAngie( this.scenario.prompt );
	}

	async waitForPromptExecution(): Promise<void> {
		const angieFrame = this.page.locator( ANGIE_SELECTORS.angieFrame ).contentFrame();
		const stopButton = angieFrame.locator( ANGIE_SELECTORS.stopButton ).first();
		const submitButton = angieFrame.locator( ANGIE_SELECTORS.sendButton ).first();
		await stopButton.waitFor( { state: 'visible' } );
		await submitButton.waitFor( { state: 'visible', timeout: TIMEOUTS.messageProcessing } );
	}

	async getCanvasState(): Promise<CanvasState> {
		const frame = this.getPreviewFrame();

		type ElementData = {
			id: string,
			type: string,
			widgetType: string,
			children: ElementData[]
		}

		const documentStructure = await frame.evaluate( () => {
			const getElementData = ( element: Element ) => {
				const id = element.getAttribute( 'data-id' ) || '';
				const dataElement = element.getAttribute( 'data-element_type' ) || '';
				const widgetType = element.getAttribute( 'data-widget_type' )?.split( '.' )[ 0 ];

				const children: ElementData[] = [];
				element.querySelectorAll( ':scope > .elementor-element' ).forEach( ( child ) => {
					children.push( getElementData( child ) );
				} );

				return {
					id,
					type: dataElement,
					widgetType,
					children: children.length > 0 ? children : undefined,
				};
			};

			const elements: ElementData[] = [];
			document.querySelectorAll( '.elementor-section-wrap > .elementor-element, .elementor > .elementor-element' ).forEach( ( el ) => {
				elements.push( getElementData( el ) );
			} );

			return elements;
		} );

		const widgetTypes = this.extractWidgetTypes( documentStructure );
		const elementCount = this.countElements( documentStructure );

		return {
			elementCount,
			widgetTypes: [ ...new Set( widgetTypes ) ],
			hasContent: elementCount > 0,
			documentStructure,
		};
	}

	private extractWidgetTypes( elements: DocumentElement[] ): string[] {
		const types: string[] = [];

		for ( const element of elements ) {
			if ( element.widgetType ) {
				types.push( element.widgetType );
			}
			if ( element.children ) {
				types.push( ...this.extractWidgetTypes( element.children ) );
			}
		}

		return types;
	}

	private countElements( elements: DocumentElement[] ): number {
		let count = elements.length;

		for ( const element of elements ) {
			if ( element.children ) {
				count += this.countElements( element.children );
			}
		}

		return count;
	}

	async captureScreenshot( outputPath: string ): Promise<void> {
		const frame = this.getPreviewFrame();
		const content = frame.locator( '.elementor' ).first();

		await content.screenshot( {
			path: outputPath,
		} );
	}

	async runDeterministicChecks(): Promise<DeterministicCheckResult> {
		const failures: CriticalFailure[] = [];

		const canvasState = await this.getCanvasState();
		if ( ! canvasState.hasContent ) {
			failures.push( {
				type: 'empty-canvas',
				message: 'Canvas is empty after AI generation',
				details: { canvasState },
			} );
		}

		const consoleErrors = await this.page.evaluate( () => {
			const errors: string[] = [];
			// eslint-disable-next-line no-console
			const originalError = console.error;
			// eslint-disable-next-line no-console
			console.error = ( ...args: unknown[] ) => {
				errors.push( args.join( ' ' ) );
				originalError.apply( console, args );
			};
			return errors;
		} );

		if ( consoleErrors.length > 0 ) {
			const criticalErrors = consoleErrors.filter( ( err ) =>
				err.includes( 'Uncaught' ) ||
				err.includes( 'TypeError' ) ||
				err.includes( 'ReferenceError' ),
			);

			if ( criticalErrors.length > 0 ) {
				failures.push( {
					type: 'runtime-error',
					message: 'Critical JavaScript errors detected',
					details: { errors: criticalErrors },
				} );
			}
		}

		const chatState = await this.getAngieChatState();
		if ( chatState.lastError ) {
			failures.push( {
				type: 'chat-error',
				message: 'Angie chat returned an error',
				details: { error: chatState.lastError },
			} );
		}

		return {
			passed: 0 === failures.length,
			failures,
		};
	}
}
