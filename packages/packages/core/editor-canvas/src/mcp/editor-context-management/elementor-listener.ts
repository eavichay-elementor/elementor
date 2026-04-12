import { updateContext } from '@elementor/editor-mcp';

import { type ElementorContainer, type ExtendedWindow } from './types';

const createEmptyData = () => ( {
	data: {
		pageTitle: 'none',
		pageContent: null,
		currentlyViewedScreen: 'none',
	},
} );

export function addElementorListener(): void {
	const extendedWindow = window as unknown as ExtendedWindow;

	if ( ! extendedWindow.$e?.commands ) {
		return;
	}

	extendedWindow.$e.commands.on(
		'run:after',
		( _component: unknown, command: string, args: { container?: ElementorContainer } ) => {
			if ( command === 'document/elements/deselect-all' ) {
				void updateContext( 'editor', createEmptyData() );
				return;
			}

			const container = args.container;
			if (
				! container?.id ||
				( command !== 'document/elements/select' && command !== 'document/elements/settings' )
			) {
				return;
			}

			void updateContext( 'editor', createEmptyData() );
		}
	);

	void updateContext( 'editor', createEmptyData() );
}
