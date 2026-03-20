import test from '@playwright/test';
import { loadAndRunScenarios } from './scenarios/yaml-scenarios.test';
import { existsSync, rmSync } from 'fs';
import { ANGIE_COOKIES_FILE, LOGIN_FILE } from './factories/context-factory';

test.describe( 'LLM Integration Scenarios', async () => {
	test.afterAll( () => {
		if ( existsSync( LOGIN_FILE ) ) {
			rmSync( LOGIN_FILE );
			rmSync( ANGIE_COOKIES_FILE );
		}
	} );
	await loadAndRunScenarios();
} );
