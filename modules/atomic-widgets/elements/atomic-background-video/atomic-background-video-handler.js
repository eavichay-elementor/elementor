import { register } from '@elementor/frontend-handlers';

register( {
	elementType: 'atomic-background-video',
	id: 'elementor-background-video-handler',
	callback: ( { element, listenToChildren } ) => {
		const init = () => {
			const playBtn = element.querySelector( '[data-e-type="e-bgvideo-play-button"]' );
			const pauseBtn = element.querySelector( '[data-e-type="e-bgvideo-pause-button"]' );
			const video = element.querySelector( 'video' );
			if ( playBtn ) {
				playBtn.onclick = () => {
					video.play();
				};
			}
			if ( pauseBtn ) {
				pauseBtn.onclick = () => {
					video.pause();
				};
			}
		};
		if ( listenToChildren ) {
			listenToChildren( [ 'e-bgvideo-play-button', 'e-bgvideo-pause-button' ] )
				.render( () => init() );
		}

		init();
	},
} );
