import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig( {
	path: resolve( __dirname, '../../.env' ),
} );

const isCI = Boolean( process.env.CI );

if ( ! process.env.LLM_TEST_BASE_URL ) {
	throw new Error( 'missing LLM_TEST_BASE_URL environment variable' );
}

if ( ! process.env.ANGIE_PRODUCTION_URL ) {
	throw new Error( 'missing ANGIE_PRODUCTION_URL environment variable' );
}

export default defineConfig( {
	testDir: './',
	globalSetup: require.resolve( './global-setup' ),
	timeout: 180_000,
	globalTimeout: 600_000,
	expect: {
		timeout: 30_000,
	},
	forbidOnly: isCI,
	retries: 0,
	workers: 1,
	fullyParallel: false,
	reporter: isCI
		? [ [ 'github' ], [ 'list' ], [ 'json', { outputFile: './artifacts/results.json' } ] ]
		: [ [ 'list' ] ],
	use: {
		headless: true,
		ignoreHTTPSErrors: true,
		actionTimeout: 60_000,
		navigationTimeout: 60_000,
		trace: 'retain-on-failure',
		video: 'retain-on-failure',
		screenshot: 'on',
		baseURL: process.env.LLM_TEST_BASE_URL,
		viewport: { width: 1920, height: 1080 },
	},
} );
