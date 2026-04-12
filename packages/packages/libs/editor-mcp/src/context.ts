import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
	ListPromptsRequestSchema,
	ListToolsRequestSchema,
	SubscribeRequestSchema,
	UnsubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getSDK } from './utils/get-sdk';

const CONTEXT_RESOURCE_NAME = 'current-context';
const CONTEXT_RESOURCE_URI = 'context://current';

type ContextData = Record< string, Record< string, unknown > >;

let currentContext: ContextData = {};
let contextServer: McpServer | null = null;
let initPromise: Promise< void > | null = null;

function createContextServer(): McpServer {
	const server = new McpServer(
		{
			name: 'context-server',
			version: '2.0.0',
		},
		{
			capabilities: {
				prompts: {
					listChanged: false,
				},
				tools: {
					listChanged: false,
				},
				resources: {
					subscribe: true,
				},
			},
		}
	);

	server.resource( CONTEXT_RESOURCE_NAME, CONTEXT_RESOURCE_URI, async ( uri ) => ( {
		contents: [
			{
				uri: uri.href,
				mimeType: 'application/json',
				text: JSON.stringify( currentContext ),
			},
		],
	} ) );

	server.server.setRequestHandler( ListToolsRequestSchema, async () => ( { tools: [] } ) );
	server.server.setRequestHandler( ListPromptsRequestSchema, async () => ( { prompts: [] } ) );

	server.server.setRequestHandler( SubscribeRequestSchema, async ( request ) => {
		// eslint-disable-next-line no-console
		console.log( `[Editor context server] Subscription to ${ request.params.uri }` );
		return {};
	} );

	server.server.setRequestHandler( UnsubscribeRequestSchema, async ( request ) => {
		// eslint-disable-next-line no-console
		console.log( `[Editor context server] Unsubscribed to ${ request.params.uri }` );
		return {};
	} );

	// @ts-ignore: expected
	const originalHandler = server.server.handleRequest?.bind( server.server );
	if ( originalHandler ) {
		// @ts-ignore: expected
		server.server.handleRequest = async ( request, extra ) => {
			// eslint-disable-next-line no-console
			console.log( '[context-server] Received method:', request.method );
			return originalHandler( request, extra );
		};
	}

	return server;
}

async function initializeContextServer(): Promise< void > {
	const sdk = getSDK();
	await sdk.waitForReady();

	contextServer = createContextServer();

	await new Promise( ( resolve ) => setTimeout( resolve, 1500 ) );

	await sdk.registerLocalServer( {
		name: 'context-server',
		title: 'Context',
		version: '2.0.0',
		description: 'Provides current editor context',
		server: contextServer,
	} );
}

export async function ensureInitialized(): Promise< void > {
	if ( contextServer ) {
		return Promise.resolve();
	}

	if ( ! initPromise ) {
		initPromise = initializeContextServer();
	}

	return initPromise;
}

function getSafeOrigin() {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	return window.location.protocol + '//' + window.location.hostname;
}

async function notifyContextUpdate(): Promise< void > {
	if ( ! contextServer ) {
		return;
	}

	await contextServer.server.sendResourceUpdated( { uri: CONTEXT_RESOURCE_URI } ).catch( ( error: Error ) => {
		if ( ! error?.message?.includes( 'Not connected' ) ) {
			throw error;
		}
	} );

	const origin = getSafeOrigin();
	window.postMessage(
		{
			type: 'CHAT_CONTEXT_UPDATE',
			payload: { ...currentContext },
		},
		origin
	);
}

export async function updateContext( key: string, data: Record< string, unknown > ): Promise< void > {
	await ensureInitialized();

	const existingKeyData = currentContext[ key ] || {};

	currentContext = {
		...currentContext,
		[ key ]: {
			...existingKeyData,
			...data,
		},
	};

	await notifyContextUpdate();
}

export async function deleteContext( key: string ): Promise< void > {
	await ensureInitialized();

	if ( ! ( key in currentContext ) ) {
		return;
	}

	const { [ key ]: _, ...rest } = currentContext;
	currentContext = rest;

	await notifyContextUpdate();
}

export function getContext( key: string ): Record< string, unknown > | undefined {
	if ( key === '*' ) {
		return { ...currentContext };
	}

	return currentContext[ key ] ? { ...currentContext[ key ] } : undefined;
}
