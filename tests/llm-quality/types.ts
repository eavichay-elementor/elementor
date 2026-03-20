import type { Page, TestInfo } from '@playwright/test';

export interface ScenarioDefinition {
	id: string;
	name: string;
	complexity: string;
	prompt: string;
	successCriteria: SuccessCriteria;
	timeout?: number;
}

export interface SuccessCriteria {
	requiredElements?: RequiredElement[];
	requiredText?: string[];
	layoutExpectations?: LayoutExpectation[];
	customValidations?: string[];
}

export interface RequiredElement {
	type: string;
	minCount?: number;
	maxCount?: number;
	attributes?: Record<string, string | RegExp>;
}

export interface LayoutExpectation {
	description: string;
	selector?: string;
	assertion: 'exists' | 'visible' | 'contains-text' | 'has-children';
	value?: string | number;
}

export interface ScenarioMetadata {
	scenarioId: string;
	scenarioName: string;
	complexity: string;
	prompt: string;
	startTime: string;
	endTime: string;
	durationMs: number;
	successCriteria: SuccessCriteria;
	deterministicResults: DeterministicCheckResult;
	canvasState: CanvasState;
}

export interface CanvasState {
	elementCount: number;
	widgetTypes: string[];
	hasContent: boolean;
	documentStructure: DocumentElement[];
}

export interface DocumentElement {
	id: string;
	type: string;
	widgetType?: string;
	children?: DocumentElement[];
}

export interface DeterministicCheckResult {
	passed: boolean;
	failures: CriticalFailure[];
}

export interface CriticalFailure {
	type: CriticalFailureType;
	message: string;
	details?: Record<string, unknown>;
}

export type CriticalFailureType =
	| 'empty-canvas'
	| 'runtime-error'
	| 'broken-layout'
	| 'timeout'
	| 'security-violation'
	| 'chat-error';

export interface SnapshotArtifacts {
	screenshotPath: string;
	metadataPath: string;
	consoleLogs: ConsoleLogEntry[];
}

export interface ConsoleLogEntry {
	type: 'log' | 'warning' | 'error';
	message: string;
	timestamp: string;
}

export interface ScenarioContext {
	page: Page;
	testInfo: TestInfo;
	scenario: ScenarioDefinition;
	artifacts: SnapshotArtifacts;
}

export interface AngieChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

export interface AngieChatState {
	isOpen: boolean;
	isProcessing: boolean;
	messages: AngieChatMessage[];
	lastError?: string;
}

export interface ScenarioResult {
	metadata: ScenarioMetadata;
	artifacts: SnapshotArtifacts;
	passed: boolean;
	failureReason?: string;
}

export interface ScoringDimension {
	name: string;
	weight: number;
	score: number;
	maxScore: number;
	feedback: string;
}

export interface EvaluationResult {
	scenarioId: string;
	overallScore: number;
	passed: boolean;
	dimensions: ScoringDimension[];
	deterministicPassed: boolean;
}
