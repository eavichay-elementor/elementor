import { updateContext } from '@elementor/editor-mcp';

const UPDATE_INTERVAL_MS = 60000;

export function addGeneralListener(): void {
	void updateContext( 'general', {} );

	setInterval( () => {
		void updateContext( 'general', {} );
	}, UPDATE_INTERVAL_MS );
}
