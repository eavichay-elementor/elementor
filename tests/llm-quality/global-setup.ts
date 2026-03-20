/* eslint-disable no-console */
import { writeWordPressLoginCache, hasLoginCache, getLoginCachePath } from './factories/context-factory';

async function globalSetup() {
	const wpUsername = process.env.WP_USERNAME;
	const wpPassword = process.env.WP_PASSWORD;
	const skipAuth = 'true' === process.env.LLM_TEST_SKIP_AUTH;

	if ( skipAuth ) {
		console.log( 'Skipping authentication (LLM_TEST_SKIP_AUTH=true)' );
		return;
	}

	if ( wpUsername && wpPassword ) {
		if ( hasLoginCache() ) {
			console.log( `Using cached WordPress login from ${ getLoginCachePath() }` );
		} else {
			console.log( 'Performing WordPress login and caching credentials...' );
			try {
				const cachePath = await writeWordPressLoginCache();
				console.log( `WordPress login cached to ${ cachePath }` );
			} catch ( error ) {
				console.error( 'Failed to cache WordPress login:', error );
				throw error;
			}
		}
	} else if ( hasLoginCache() ) {
		console.log( `Using pre-cached WordPress login from ${ getLoginCachePath() }` );
	} else {
		console.warn(
			'Warning: No WordPress credentials provided and no cached login found. ' +
			'Tests requiring authentication will fail. ' +
			'Set WP_USERNAME and WP_PASSWORD, or provide a pre-cached login file.',
		);
	}
}

export default globalSetup;
