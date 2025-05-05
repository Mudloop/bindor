export type Watcher<T> = (val: T) => void;
export type ReadonlyBinding<TData, TMeta> = (() => TData) & TMeta & {
	watch: (watcher: Watcher<TData>) => void,
	unwatch: (watcher: Watcher<TData>) => void
	readonly value: TData
}
export type Binding<TData, TMeta> = ((value?: TData) => TData) & TMeta & {
	watch: (watcher: Watcher<TData>) => void,
	unwatch: (watcher: Watcher<TData>) => void
	reset: () => void,
	value: TData
}
type Change<T> = { ok: true; value: T; } | { ok: false; };
export type ReadInit<TData, TMeta extends Record<string, any>> = {
	register: (setter: (v: TData) => TData) => void;
	init: TData; value?: TData; meta?: TMeta;
};
export type WriteInit<TData, TMeta extends Record<string, any>> = ReadInit<TData, TMeta> & {
	onchange: (v: TData) => void | boolean | Change<TData>;
};
