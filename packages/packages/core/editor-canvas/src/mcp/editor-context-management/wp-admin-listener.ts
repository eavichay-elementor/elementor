import { updateContext } from '@elementor/editor-mcp';

export function addWpAdminListener(): void {
	void updateContext( 'wp_admin_fields', {} );
}
