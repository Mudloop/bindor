import { bindor } from '../src/bindor'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✅ ${name}`)
  } catch (error) {
    console.error(`❌ ${name}`)
    console.error(error)
  }
}

// Mock functions
const mockFn = () => {
  let calls: any[] = []
  const fn = (...args: any[]) => {
    calls.push(args)
    return undefined
  }
  fn.calls = calls
  return fn
}

// Tests
test('should initialize with the initial value', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  assert(binding.value === 42, 'Initial value should be 42')
})

test('should update value when called with a new value', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding(100)
  assert(binding.value === 100, 'Value should be updated to 100')
})

test('should notify watchers when value changes', () => {
  const watcher = mockFn()
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding.watch(watcher)
  binding(100)
  assert(watcher.calls.length === 2, 'Watcher should be called twice (once on watch, once on update)')
  assert(watcher.calls[1][0] === 100, 'Watcher should receive new value')
})

test('should stop notifying after unwatch', () => {
  const watcher = mockFn()
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding.watch(watcher)
  binding.unwatch(watcher)
  binding(100)
  assert(watcher.calls.length === 1, 'Watcher should only be called once (during watch)')
})

test('should reset to initial value', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding(100)
  binding.reset()
  assert(binding.value === 42, 'Value should be reset to initial value')
})

test('should handle custom metadata', () => {
  type Meta = { label: string }
  const binding = bindor<number, Meta>({
    register: mockFn(),
    onchange: mockFn(),
    init: 42,
    meta: { label: 'test' }
  })
  assert(binding.label === 'test', 'Metadata should be accessible')
})

test('should provide internal setter to creator', () => {
  const internalSetter = mockFn()
  const binding = bindor({
    register: (setter) => internalSetter(setter),
    onchange: mockFn(),
    init: 42
  })
  assert(internalSetter.calls.length === 1, 'Creator should receive internal setter')
  const setter = internalSetter.calls[0][0]
  assert(typeof setter === 'function', 'Internal setter should be a function')
})

test('should notify creator of external changes', () => {
  const onchange = mockFn()
  const binding = bindor({
    register: mockFn(),
    onchange,
    init: 42
  })
  binding.value = 100
  assert(onchange.calls.length === 1, 'Creator should be notified of external change')
  assert(onchange.calls[0][0] === 100, 'Creator should receive new value')
})

test('should reject external changes when validation returns false', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: () => false,
    init: 42
  })
  binding(100)
  assert(binding.value === 42, 'Value should not change when validation fails')
})

test('should accept external changes when validation returns true', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: () => true,
    init: 42
  })
  binding(100)
  assert(binding.value === 100, 'Value should change when validation passes')
})

test('should accept external changes when validation returns undefined', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: () => undefined,
    init: 42
  })
  binding(100)
  assert(binding.value === 100, 'Value should change when validation returns undefined')
})

test('should always accept internal changes', () => {
  let internalSetter: ((val: number) => void) | undefined
  const binding = bindor({
    register: (setter) => { internalSetter = setter },
    onchange: () => false,
    init: 42
  })
  internalSetter!(100)
  assert(binding.value === 100, 'Internal changes should always be accepted')
})

test('should handle multiple watchers', () => {
  const watcher1 = mockFn()
  const watcher2 = mockFn()
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding.watch(watcher1)
  binding.watch(watcher2)
  binding(100)
  assert(watcher1.calls.length === 2, 'First watcher should be called twice')
  assert(watcher2.calls.length === 2, 'Second watcher should be called twice')
  assert(watcher1.calls[1][0] === 100, 'First watcher should receive new value')
  assert(watcher2.calls[1][0] === 100, 'Second watcher should receive new value')
})

test('should handle undefined value by using initial value', () => {
  const binding = bindor({
    register: mockFn(),
    onchange: mockFn(),
    init: 42
  })
  binding(undefined)
  assert(binding.value === 42, 'Value should fall back to initial value')
}) 