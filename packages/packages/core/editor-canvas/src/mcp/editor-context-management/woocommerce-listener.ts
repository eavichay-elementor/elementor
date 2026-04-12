import { updateContext } from '@elementor/editor-mcp';

export function addWooCommerceListener(): void {
	void updateContext( 'woocommerce', {} );
}
