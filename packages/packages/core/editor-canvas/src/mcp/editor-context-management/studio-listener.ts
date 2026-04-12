import { deleteContext, updateContext } from '@elementor/editor-mcp';

const STUDIO_UI_SESSION_START = 'angie:studio-ui:session-start';
const STUDIO_UI_STATE_UPDATE = 'angie:studio-ui:state-update';
const STUDIO_UI_SESSION_END = 'angie:studio-ui:session-end';

export function addStudioListener(): void {
	window.addEventListener( STUDIO_UI_SESSION_START, () => {
		void deleteContext( 'studio' );
	} );

	window.addEventListener( STUDIO_UI_STATE_UPDATE, ( event: Event ) => {
		const customEvent = event as CustomEvent;
		void updateContext( 'studio', customEvent.detail || {} );
	} );

	window.addEventListener( STUDIO_UI_SESSION_END, () => {
		void deleteContext( 'studio' );
	} );
}
