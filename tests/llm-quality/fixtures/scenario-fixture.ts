import { BrowserContext } from '@playwright/test';
import { parallelTest as baseTest } from '../../playwright/parallelTest';

import fs from 'fs';
import path from 'path';
import type { ConsoleLogEntry } from '../types';
import { createAuthenticatedContext, getLoginCachePath } from '../factories/context-factory';
import EditorPage from '../../playwright/pages/editor-page';

interface ScenarioFixtures {
	scenarioArtifactsDir: string;
	consoleLogs: ConsoleLogEntry[];
	captureConsole: () => void;
	editorPage: EditorPage;
}

interface ScenarioWorkerFixtures {
	workerBaseURL: string;
	authenticatedContext: BrowserContext;
	workerStorageState: string;
}

export const scenarioTest = baseTest.extend<ScenarioFixtures, ScenarioWorkerFixtures>( {
	workerBaseURL: [
		async ( {}, use ) => {
			const baseURL = process.env.LLM_TEST_BASE_URL;
			if ( ! baseURL ) {
				throw new Error( 'LLM_TEST_BASE_URL environment variable is required' );
			}
			await use( baseURL );
		},
		{ scope: 'worker' },
	],

	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),

	workerStorageState: [
		async ( {}, use ) => {
			const cachePath = getLoginCachePath();
			await use( cachePath );
		},
		{ scope: 'worker' },
	],

	authenticatedContext: [
		async ( { browser }, use ) => {
			const context = await createAuthenticatedContext( browser );
			await use( context );
		},
		{ scope: 'worker' },
	],

	context: async ( { authenticatedContext }, use ) => {
		await use( authenticatedContext );
	},

	page: async ( { authenticatedContext }, use ) => {
		const page = await authenticatedContext.newPage();
		await use( page );
	},

	editorPage: async ( { page }, use, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		await use( editor );
	},

	scenarioArtifactsDir: async ( {}, use, testInfo ) => {
		const artifactsBase = path.resolve( __dirname, '../artifacts' );
		const scenarioDir = path.join( artifactsBase, testInfo.titlePath.join( '-' ).replace( /[^a-zA-Z0-9-]/g, '_' ) );

		if ( ! fs.existsSync( scenarioDir ) ) {
			fs.mkdirSync( scenarioDir, { recursive: true } );
		}

		await use( scenarioDir );
	},

	consoleLogs: async ( {}, use ) => {
		const logs: ConsoleLogEntry[] = [];
		await use( logs );
	},

	captureConsole: async ( { page, consoleLogs }, use ) => {
		const capture = () => {
			page.on( 'console', ( msg ) => {
				const type = msg.type();
				if ( 'error' === type || 'warning' === type || 'log' === type ) {
					consoleLogs.push( {
						type: type as 'log' | 'warning' | 'error',
						message: msg.text(),
						timestamp: new Date().toISOString(),
					} );
				}
			} );
		};

		await use( capture );
	},
} );

export { expect } from '@playwright/test';
