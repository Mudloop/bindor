# bindor

A utility for creating two-way bindings with external state management. Works with both JavaScript and TypeScript.

## Usage

### JavaScript
```javascript
import { bindor } from 'bindor'

// Create a writable binding with a number
const count = bindor({
  // Called when the binding needs to make internal changes
  register: (setter) => {
    // Store the setter for later use
    internalSetCount = setter
  },
  // Called when the value changes from outside
  onchange: (newValue) => {
    // Return false to reject the change
    if (newValue < 0) return false;
    // Return true or undefined to accept the change
    console.log('Value changed to:', newValue)
  },
  init: 0, // Initial value
})

// Use as a getter
console.log(count()) // 0

// Use as a setter
count(42)
console.log(count()) // 42

// Try to set invalid value
count(-1)
console.log(count()) // Still 42, change was rejected

// Use the value property
count.value = 100
console.log(count.value) // 100

// Watch for changes
count.watch((newValue) => {
  console.log('Value updated:', newValue)
})

// Unwatch changes
const watcher = (newValue) => console.log('Watcher triggered:', newValue)
count.watch(watcher)
count.unwatch(watcher)

// Reset to initial value
count.reset()
console.log(count()) // 0
```

### TypeScript
```typescript
import { bindor } from 'bindor'

// Create a writable binding with metadata
type CounterMeta = { label: string }
const labeledCount = bindor<number, CounterMeta>({
  register: (setter) => { /* ... */ },
  onchange: (val) => {
    // TypeScript knows val is a number
    if (val < 0) return { ok: false }; // Reject the change
    return { ok: true, value: val * 2 }; // Accept and transform the value
  },
  init: 0,
  meta: { label: 'counter' }
})

console.log(labeledCount.label) // 'counter'

// Use the value property
labeledCount.value = 50
console.log(labeledCount.value) // 100 (transformed by onchange)

// Watch for changes
labeledCount.watch((newValue) => {
  console.log('Value updated:', newValue)
})

// Reset to initial value
labeledCount.reset()
console.log(labeledCount()) // 0

// Create a readonly binding
const readonlyCount = bindor<number>({
  register: (setter) => { /* ... */ },
  init: 10
})

console.log(readonlyCount()) // 10
readonlyCount.value = 20 // Error: Cannot set value on a readonly binding
```

## API

### `bindor(config)`

Creates a binding with the following configuration:

- `register`: Function that receives a setter function for internal changes
- `onchange`: Optional function called when the value changes from outside.  
  - Return `false` to reject the change.  
  - Return `true` or `undefined` to accept the change.  
  - Return `{ ok: true, value: T }` to accept and transform the value.  
  - Return `{ ok: false }` to reject the change.
- `init`: Initial value
- `value`: Optional initial value (overrides `init`)
- `meta`: Optional metadata to attach to the binding

### Binding Types

- **Writable Binding**: Created when `onchange` is provided. Allows setting values and watching for changes.
- **Readonly Binding**: Created when `onchange` is omitted. Only allows getting values and watching for changes.

### Binding Methods

- `binding()` - Get current value
- `binding(newValue)` - Set new value (may be rejected or transformed by `onchange`)
- `binding.value` - Get/set current value (setter may be rejected or transformed by `onchange`)
- `binding.watch(watcher)` - Add a watcher function
- `binding.unwatch(watcher)` - Remove a watcher function
- `binding.reset()` - Reset to initial value (only available for writable bindings)