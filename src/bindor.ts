import { Binding, ReadInit, ReadonlyBinding, WriteInit } from "./types";

export function bindor<TData, TMeta extends Record<string, any> = {}>(config: WriteInit<TData, TMeta>): Binding<TData, TMeta>;
export function bindor<TData, TMeta extends Record<string, any> = {}>(config: ReadInit<TData, TMeta>): ReadonlyBinding<TData, TMeta>;
export function bindor<TData, TMeta extends Record<string, any>>(config: ReadInit<TData, TMeta> & Partial<WriteInit<TData, TMeta>>) {
	const { init, meta } = config, watchers = new Set<(val: TData) => void>();
	const notify = (value: TData) => (watchers.forEach(w => w(value)), value);
	const binding = (val?: TData) => {
		if (val && config.onchange) {
			const result = config.onchange(val);
			if (result === false) return value;
			if (result === undefined || result === true) notify(value = val);
			else if (result.ok) notify(value = result.value);
		}
		return value;
	};
	const extensions = {
		watch: (watcher: (val: TData) => void) => (watcher(value), watchers.add(watcher), undefined),
		unwatch: (watcher: (val: TData) => void) => watchers.delete(watcher),
		reset: config.onchange ? () => notify(value = init) : undefined,
	}
	let value = config.value ?? init;
	config.register(val => notify(value = val));
	return Object.defineProperties(Object.assign(binding, meta, extensions), {
		value: {
			get: () => value,
			set: config.onchange ? (val: TData) => binding(val) : undefined
		}
	}) as typeof binding & TMeta & typeof extensions & { value: TData; } as any
}