initWidget( {
	elementType: 'v4-heading',
	callback( { element } ) {
		const targetEl = element.querySelector( 'a' ) || element;
		targetEl.addEventListener( 'click', function() {
			targetEl.textContent = targetEl.textContent.split( '' ).reverse().join( '' );
		} );
	},
} );
