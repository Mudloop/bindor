import { bindor } from "../src";

const test = bindor({
	register: setter => setTimeout(() => setter(10), 2000),
	onchange: val => console.log('External change', val),
	init: 10,
	value: 0,
	meta: {
		test: 1
	}
});
test.watch(val => console.log('value changed', val));
test.value = 11;
test(22);
console.log('---', test());