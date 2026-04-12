import { addElementorListener } from './elementor-listener';
// import { addGeneralListener } from './general-listener';
// import { addGutenbergListener } from './gutenberg-listener';
// import { addStudioListener } from './studio-listener';
// import { addWooCommerceListener } from './woocommerce-listener';
// import { addWpAdminListener } from './wp-admin-listener';

export function initListeners(): void {
	addElementorListener();
	// addGutenbergListener();
	// addStudioListener();
	// addGeneralListener();
	// addWpAdminListener();
	// addWooCommerceListener();
}
