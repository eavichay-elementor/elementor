import { AIIcon } from '@elementor/icons';

import { toolsMenu } from '../../locations';

export function initAngieToolbar() {
	toolsMenu.registerToggleAction( {
		id: 'angie-button',
		priority: 2,
		useProps: () => ( {
			id: 'angie-toolbar-button',
			title: 'Angie',
			icon: AIIcon,
		} ),
	} );
}
