import { scenarioTest as test } from '../fixtures/scenario-fixture';
import { BaseScenario } from './base-scenario';
import { SnapshotRecorder } from '../runner/snapshot-recorder';
import { runDeterministicChecks } from '../runner/deterministic-checks';
import { discoverYamlScenarios, type LoadedScenario } from './yaml-scenario-loader';

const scenarios = discoverYamlScenarios();

function runScenarioTest( loadedScenario: LoadedScenario ) {
	const { definition } = loadedScenario;

	test( definition.name, async ( { page, scenarioArtifactsDir, consoleLogs, captureConsole, apiRequests } ) => {
		captureConsole();

		const scenario = new BaseScenario( page, test.info(), definition, apiRequests );
		const recorder = new SnapshotRecorder( scenario, scenarioArtifactsDir );

		recorder.startRecording();

		await test.step( 'Open editor', async () => {
			await scenario.openEditor();
		} );

		await test.step( 'Send prompt to Angie', async () => {
			await scenario.executePrompt();
		} );

		await test.step( 'Wait for generation to complete', async () => {
			await scenario.waitForPromptExecution();
		} );

		await test.step( 'Capture and validate results', async () => {
			const canvasState = await scenario.getCanvasState();

			const deterministicResults = await runDeterministicChecks(
				page,
				scenario.getPreviewFrame(),
				canvasState,
				consoleLogs,
			);

			await recorder.captureSnapshot( canvasState, deterministicResults );
		} );
	} );
}

export async function loadAndRunScenarios() {
	if ( 0 === scenarios.length ) {
		test.skip( 'No YAML scenarios found', () => { } );
	} else {
		const groupedByComplexity = scenarios.reduce( ( acc, scenario ) => {
			const { complexity } = scenario.definition;
			if ( ! acc[ complexity ] ) {
				acc[ complexity ] = [];
			}
			acc[ complexity ].push( scenario );
			return acc;
		}, {} as Record<string, LoadedScenario[]> );

		for ( const [ complexity, complexityScenarios ] of Object.entries( groupedByComplexity ) ) {
			test.describe( `LLM-integration: ${ complexity.charAt( 0 ).toUpperCase() + complexity.slice( 1 ) } Scenarios (YAML)`, () => {
				for ( const loadedScenario of complexityScenarios ) {
					runScenarioTest( loadedScenario );
				}
			} );
		}
	}
}
