import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { ensureInitialized, updateContext } from './context';
import { activateMcpRegistration } from './mcp-registry';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';

export function init() {
	if ( isExperimentActive( 'editor_mcp' ) && isAngieAvailable() ) {
		return getSDK().waitForReady();
	}
	return Promise.resolve();
}

export function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) && isAngieAvailable() ) {
		const sdk = getSDK();
		sdk.waitForReady().then( async () => {
			await ensureInitialized();
			activateMcpRegistration( sdk );
			updateContext( 'editor', {} );
		} );
	}
	return Promise.resolve();
}

document.addEventListener(
	'DOMContentLoaded',
	() => {
		startMCPServer();
	},
	{
		once: true,
	}
);
