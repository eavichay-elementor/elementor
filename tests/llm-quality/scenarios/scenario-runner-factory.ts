import { Browser } from '@playwright/test';
import { createAuthenticatedContext, writeWordPressLoginCache } from '../factories/context-factory';

export async function createScenarioContext( browser: Browser ) {
	return createAuthenticatedContext( browser );
}

export { writeWordPressLoginCache };
