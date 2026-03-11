import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig( {
	path: resolve( __dirname, '../../.env' ),
} );

const isCI = Boolean( process.env.CI );

export default defineConfig( {
	testDir: './scenarios',
	timeout: 120_000,
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
		baseURL: process.env.LLM_TEST_BASE_URL || 'http://localhost:8888',
		viewport: { width: 1920, height: 1080 },
	},
	outputDir: './artifacts/test-results',
} );
