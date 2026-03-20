import fs from 'fs';
import path from 'path';
import { request, Browser, BrowserContext } from '@playwright/test';
import { login } from '../../playwright/wp-authentication';

export const LOGIN_FILE = path.resolve( __dirname, '../wordpress.login.result.json' );
export const ANGIE_COOKIES_FILE = path.resolve( __dirname, '../angie-cookies.json' );
const wordpressConfig = () => ( {
	wpUsername: process.env.WP_USERNAME,
	wpPassword: process.env.WP_PASSWORD,
	angieProductionUrl: process.env.ANGIE_PRODUCTION_URL,
	baseURL: process.env.LLM_TEST_BASE_URL,
} ) as Record<string, string>;

function parseAngieCookiesFile(): Array<{ name: string; value: string }> | null {
	// eslint-disable-next-line no-console
	console.log( `Parsing cookies from: ${ ANGIE_COOKIES_FILE }` );
	if ( ! fs.existsSync( ANGIE_COOKIES_FILE ) ) {
		return null;
	}

	const content = fs.readFileSync( ANGIE_COOKIES_FILE, 'utf-8' );
	return JSON.parse( content );
}

function buildAngieLocalStorageFromEnv() {
	const oidcClientId = process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID_V2;
	const oidcAuthEndpoint = process.env.NEXT_PUBLIC_OAUTH2_AUTH_ENDPOINT;
	const oidcAuthority = new URL( oidcAuthEndpoint ).origin;
	const oidcStorageKey = `oidc.user:${ oidcAuthority }:${ oidcClientId }` as string;
	const angieTokens = {
		access_token: process.env.ANGIE_SERVICE_ACCOUNT_TOKEN,
		refresh_token: 'service-account-no-refresh',
		expires_in: String( 7776000 ),
		token_type: 'Bearer',
		user: {
			email: process.env.ANGIE_SERVICE_ACCOUNT_EMAIL,
			id: process.env.ELEMENTOR_USER_ID,
			display_name: 'Service Account',
			login: '',
			phone: null,
			status: 'enabled',
			support_level: 'PREMIUM',
		},
		termsAccepted: 'true',
		[ oidcStorageKey ]: {
			access_token: process.env.ANGIE_SERVICE_ACCOUNT_TOKEN,
			scope: 'openid offline_access',
			expires_at: String( Math.floor( Date.now() / 1000 ) + 3600 ),
			refresh_token: 'local-refresh-token',
			profile: { sub: 'service-account' },
			token_type: 'Bearer',
		},
	};

	const asTokens = Object.entries( angieTokens ).map( ( [ name, value ] ) => ( {
		name, value: JSON.stringify( value ),
	} ) );

	return [
		{ name: 'angie_sidebar_state', value: process.env.ANGIE_SIDEBAR_STATE },
		{ name: 'termsAccepted', value: 'true' },
		{ name: 'termsAcceptedDate', value: new Date().toISOString() },
		...asTokens,
	];
}

function buildAngieLocalStorage() {
	const fromFile = parseAngieCookiesFile();
	if ( fromFile ) {
		// eslint-disable-next-line no-console
		console.log( 'Using Angie credentials from angie-cookies.json file' );
		return fromFile;
	}

	// eslint-disable-next-line no-console
	console.log( 'Using Angie credentials from environment variables' );
	const data = buildAngieLocalStorageFromEnv();
	fs.writeFileSync( ANGIE_COOKIES_FILE, JSON.stringify( data ) );
	return data;
}

async function getCachedOrFreshLogin( baseURL: string, username: string, password: string ) {
	if ( fs.existsSync( LOGIN_FILE ) ) {
		return JSON.parse( fs.readFileSync( LOGIN_FILE, 'utf-8' ) );
	}

	const context = await login( request, username, password, baseURL );
	const state = await context.storageState();
	await context.dispose();

	fs.writeFileSync( LOGIN_FILE, JSON.stringify( state, null, 2 ) );
	return state;
}

export async function createAuthenticatedContext( browser: Browser ): Promise<BrowserContext> {
	let wpState = { cookies: [], origins: [] };
	const wpConfig = wordpressConfig();

	wpState = await getCachedOrFreshLogin( wpConfig.baseURL, wpConfig.wpUsername, wpConfig.wpPassword );
	const angieLocalStorage = buildAngieLocalStorage( );
	const storageState = {
		cookies: wpState.cookies || [],
		origins: [
			...( wpState.origins || [] ),
			{
				origin: wpConfig.angieProductionUrl,
				localStorage: angieLocalStorage,
			},
		],
	};

	return browser.newContext( { storageState } );
}

export async function writeWordPressLoginCache(): Promise<string> {
	const config = wordpressConfig();
	if ( ! config.wpUsername || ! config.wpPassword || ! config.baseURL ) {
		throw new Error( 'WP_USERNAME, WP_PASSWORD, and LLM_TEST_BASE_URL are required to write login cache' );
	}

	if ( fs.existsSync( LOGIN_FILE ) ) {
		return LOGIN_FILE;
	}

	const context = await login( request, config.wpUsername, config.wpPassword, config.baseURL );
	const state = await context.storageState();
	await context.dispose();

	fs.writeFileSync( LOGIN_FILE, JSON.stringify( state, null, 2 ) );
	return LOGIN_FILE;
}

export function getLoginCachePath(): string {
	return LOGIN_FILE;
}

export function hasLoginCache(): boolean {
	return fs.existsSync( LOGIN_FILE );
}
