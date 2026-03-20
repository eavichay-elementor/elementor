import fs from 'fs';
import path from 'path';
import type {
	ScenarioMetadata,
	SnapshotArtifacts,
	ConsoleLogEntry,
	CanvasState,
	DeterministicCheckResult,
} from '../types';
import type { BaseScenario } from '../scenarios/base-scenario';

export class SnapshotRecorder {
	private readonly scenario: BaseScenario;
	private readonly outputDir: string;
	private readonly consoleLogs: ConsoleLogEntry[] = [];
	private startTime: Date;

	constructor( scenario: BaseScenario, outputDir: string ) {
		this.scenario = scenario;
		this.outputDir = outputDir;
		this.startTime = new Date();

		this.ensureDirectoryExists();
	}

	private ensureDirectoryExists(): void {
		if ( ! fs.existsSync( this.outputDir ) ) {
			fs.mkdirSync( this.outputDir, { recursive: true } );
		}
	}

	startRecording(): void {
		this.startTime = new Date();
		this.consoleLogs.length = 0;

		this.scenario.page.on( 'console', ( msg ) => {
			const type = msg.type();
			if ( 'error' === type || 'warning' === type || 'log' === type ) {
				this.consoleLogs.push( {
					type: type as 'log' | 'warning' | 'error',
					message: msg.text(),
					timestamp: new Date().toISOString(),
				} );
			}
		} );
	}

	async captureSnapshot(
		canvasState: CanvasState,
		deterministicResults: DeterministicCheckResult,
	): Promise<SnapshotArtifacts> {
		const endTime = new Date();
		const scenarioDef = this.scenario.scenario;

		const screenshotPath = path.join( this.outputDir, 'screenshot.png' );
		await this.scenario.captureScreenshot( screenshotPath );

		const metadata: ScenarioMetadata = {
			scenarioId: scenarioDef.id,
			scenarioName: scenarioDef.name,
			complexity: scenarioDef.complexity,
			prompt: scenarioDef.prompt,
			startTime: this.startTime.toISOString(),
			endTime: endTime.toISOString(),
			durationMs: endTime.getTime() - this.startTime.getTime(),
			successCriteria: scenarioDef.successCriteria,
			deterministicResults,
			canvasState,
		};

		const metadataPath = path.join( this.outputDir, 'metadata.json' );
		fs.writeFileSync( metadataPath, JSON.stringify( metadata, null, 2 ) );

		const consoleLogsPath = path.join( this.outputDir, 'console-logs.json' );
		fs.writeFileSync( consoleLogsPath, JSON.stringify( this.consoleLogs, null, 2 ) );

		return {
			screenshotPath,
			metadataPath,
			consoleLogs: [ ...this.consoleLogs ],
		};
	}

	getConsoleLogs(): ConsoleLogEntry[] {
		return [ ...this.consoleLogs ];
	}

	getErrorLogs(): ConsoleLogEntry[] {
		return this.consoleLogs.filter( ( log ) => 'error' === log.type );
	}
}
