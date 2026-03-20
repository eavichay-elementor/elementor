import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ScenarioDefinition, SuccessCriteria } from '../types';

interface YamlScoringItem {
	type: 'llm-rubric' | 'deterministic';
	evaluation_prompt?: string;
	threshold?: number;
	check?: string;
}

interface YamlScenario {
	'test-name': string;
	complexity: 'simple' | 'medium' | 'complex';
	'setup_script'?: string;
	'teardown-script'?: string;
	user_prompt: string;
	timeout?: number;
	scoring?: YamlScoringItem[];
}

export interface LoadedScenario {
	definition: ScenarioDefinition;
	filePath: string;
	setupScript?: string;
	teardownScript?: string;
	scoring?: YamlScoringItem[];
}

function parsePrompt( promptValue: string, scenarioDir: string ): string {
	if ( promptValue.startsWith( 'file://' ) ) {
		const relativePath = promptValue.slice( 7 );
		const absolutePath = path.resolve( scenarioDir, relativePath );
		return fs.readFileSync( absolutePath, 'utf-8' ).trim();
	}
	return promptValue.trim();
}

function yamlToScenarioDefinition( yamlData: YamlScenario, scenarioDir: string ): ScenarioDefinition {
	const prompt = parsePrompt( yamlData.user_prompt, scenarioDir );

	const successCriteria: SuccessCriteria = {
		requiredElements: [],
		requiredText: [],
		layoutExpectations: [],
		customValidations: [],
	};

	if ( yamlData.scoring ) {
		for ( const item of yamlData.scoring ) {
			if ( 'llm-rubric' === item.type && item.evaluation_prompt ) {
				successCriteria.customValidations?.push( item.evaluation_prompt.trim() );
			}
		}
	}

	return {
		id: `${ yamlData.complexity }-${ yamlData[ 'test-name' ] }`,
		name: yamlData[ 'test-name' ],
		complexity: yamlData.complexity,
		prompt,
		timeout: yamlData.timeout,
		successCriteria,
	};
}

export function loadScenarioFromYaml( filePath: string ): LoadedScenario {
	const content = fs.readFileSync( filePath, 'utf-8' );
	const yamlData = yaml.load( content ) as YamlScenario;
	const scenarioDir = path.dirname( filePath );

	return {
		definition: yamlToScenarioDefinition( yamlData, scenarioDir ),
		filePath,
		setupScript: yamlData.setup_script,
		teardownScript: yamlData[ 'teardown-script' ],
		scoring: yamlData.scoring,
	};
}

export function discoverYamlScenarios( scenariosDir?: string ): LoadedScenario[] {
	const baseDir = scenariosDir || path.resolve( __dirname );
	const scenarios: LoadedScenario[] = [];

	function scanDirectory( dir: string ) {
		const entries = fs.readdirSync( dir, { withFileTypes: true } );

		for ( const entry of entries ) {
			const fullPath = path.join( dir, entry.name );

			if ( entry.isDirectory() ) {
				scanDirectory( fullPath );
			} else if ( entry.isFile() && ( entry.name.endsWith( '.yaml' ) || entry.name.endsWith( '.yml' ) ) ) {
				try {
					scenarios.push( loadScenarioFromYaml( fullPath ) );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( `Failed to load scenario from ${ fullPath }:`, error );
				}
			}
		}
	}

	scanDirectory( baseDir );
	return scenarios;
}

export function getScenariosByComplexity( scenarios: LoadedScenario[], complexity: string ): LoadedScenario[] {
	return scenarios.filter( ( s ) => s.definition.complexity === complexity );
}
