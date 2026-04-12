export type ElementorContainer = {
	id: string;
	parent?: { id: string };
	model?: { attributes?: { widgetType?: string } };
	type?: string;
	label?: string;
	settings?: { attributes?: { image?: { url?: string } } };
};

type CommandsEmitter = {
	on: (
		event: string,
		callback: ( component: unknown, command: string, args: { container?: ElementorContainer } ) => void
	) => void;
};

type WpDataSelect = ( storeName: string ) => Record< string, unknown > | undefined;

type WpData = {
	select: WpDataSelect;
	subscribe: ( callback: () => void ) => () => void;
};

export type ExtendedWindow = Window & {
	$e?: {
		commands?: CommandsEmitter;
	};
	wp?: {
		data?: WpData;
	};
};
