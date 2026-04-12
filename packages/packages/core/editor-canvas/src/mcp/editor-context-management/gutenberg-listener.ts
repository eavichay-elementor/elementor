import { updateContext } from '@elementor/editor-mcp';

import { type ExtendedWindow } from './types';

function isGutenbergAvailable(): boolean {
	const extendedWindow = window as unknown as ExtendedWindow;

	try {
		return !! extendedWindow.wp?.data?.select && !! extendedWindow.wp.data.select( 'core/block-editor' );
	} catch {
		return false;
	}
}

export function addGutenbergListener(): void {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! isGutenbergAvailable() ) {
		return;
	}

	let debounceTimeout: number | null = null;

	const updateIfChanged = () => {
		void updateContext( 'general', {} );
	};

	updateIfChanged();

	extendedWindow.wp?.data?.subscribe( () => {
		if ( debounceTimeout !== null ) {
			clearTimeout( debounceTimeout );
		}

		debounceTimeout = window.setTimeout( () => {
			updateIfChanged();
		}, 300 );
	} );
}
