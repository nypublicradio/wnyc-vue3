# Dynamic Component Loading Pattern in Vue 3

## The Problem

When you dynamically load components in Vue, you need to be careful about **when** and **how often** you create those component instances. Without proper memoization, components can be reloaded on every render, causing performance issues and visual glitches.

## The Pattern

### ❌ Bad (Without Memoization)
```vue
<script setup>
// This creates a NEW async component on EVERY call
const getIconComponent = (iconName) => {
  return defineAsyncComponent(() => import(`./icons/${iconName}.vue`))
}
</script>

<template>
  <component :is="getIconComponent(item.icon)" />
</template>
```

**Problem**: Every time the parent component re-renders (state change, route change, prop update, etc.), `getIconComponent()` is called again, creating a brand new async component instance. This causes the icon to reload from scratch.

### ✅ Good (With Memoization)
```vue
<script setup>
// Cache to store loaded components
const componentCache = new Map()

// Function that checks cache before creating new component
const getIconComponent = (iconName) => {
  if (!componentCache.has(iconName)) {
    componentCache.set(
      iconName,
      defineAsyncComponent(() => import(`./icons/${iconName}.vue`))
    )
  }
  return componentCache.get(iconName)
}
</script>

<template>
  <component :is="getIconComponent(item.icon)" />
</template>
```

**Solution**: The component is only created once and cached. Subsequent calls return the cached instance.

## How It Works

### Step-by-Step Breakdown

1. **First Call**: `getIconComponent('HomeIcon')`
   - Cache check: `componentCache.has('HomeIcon')` → `false`
   - Create async component: `defineAsyncComponent(() => import('./icons/HomeIcon.vue'))`
   - Store in cache: `componentCache.set('HomeIcon', asyncComponent)`
   - Return: the newly created component

2. **Subsequent Calls**: `getIconComponent('HomeIcon')`
   - Cache check: `componentCache.has('HomeIcon')` → `true`
   - Return: `componentCache.get('HomeIcon')` (the cached component)
   - **No new component created!**

## Why Use Map Instead of Object?

```javascript
// Using Map (recommended)
const cache = new Map()
cache.set(key, value)
cache.has(key)
cache.get(key)

// Using Object (alternative)
const cache = {}
cache[key] = value
key in cache
cache[key]
```

**Map advantages**:
- Better performance for frequent additions/lookups
- Keys can be any type (not just strings)
- Has built-in methods like `has()`, `get()`, `set()`
- Cleaner API

## Common Use Cases

### 1. Dynamic Icons (Your Current Use Case)

```vue
<script setup>
const iconCache = new Map()

const getIcon = (iconName) => {
  if (!iconCache.has(iconName)) {
    iconCache.set(
      iconName,
      defineAsyncComponent(() => import(`@/components/icons/${iconName}.vue`))
    )
  }
  return iconCache.get(iconName)
}
</script>

<template>
  <component :is="getIcon('User')" />
  <component :is="getIcon('Settings')" />
</template>
```

### 2. Dynamic Page Components

```vue
<script setup>
const pageCache = new Map()

const getPageComponent = (pageName) => {
  if (!pageCache.has(pageName)) {
    pageCache.set(
      pageName,
      defineAsyncComponent(() => import(`@/pages/${pageName}.vue`))
    )
  }
  return pageCache.get(pageName)
}
</script>

<template>
  <component :is="getPageComponent(currentPage)" />
</template>
```

### 3. Dynamic Form Fields

```vue
<script setup>
const fieldCache = new Map()

const getFieldComponent = (fieldType) => {
  if (!fieldCache.has(fieldType)) {
    fieldCache.set(
      fieldType,
      defineAsyncComponent(() => import(`@/components/fields/${fieldType}.vue`))
    )
  }
  return fieldCache.get(fieldType)
}

const formFields = [
  { type: 'TextInput', name: 'email' },
  { type: 'DatePicker', name: 'birthdate' },
  { type: 'SelectDropdown', name: 'country' }
]
</script>

<template>
  <component
    v-for="field in formFields"
    :key="field.name"
    :is="getFieldComponent(field.type)"
    :name="field.name"
  />
</template>
```

## Advanced: Using Computed for Pre-loading

If you know all the components you'll need upfront, you can pre-load them:

```vue
<script setup>
import { appMenuOptions } from '~/composables/globals'

// Pre-load all icon components based on menu options
const iconComponents = computed(() => {
  const cache = new Map()
  
  appMenuOptions.forEach((option) => {
    cache.set(
      option.icon,
      defineAsyncComponent(() => import(`./icons/${option.icon}.vue`))
    )
  })
  
  return cache
})

// Getter function
const getIcon = (iconName) => {
  return iconComponents.value.get(iconName)
}
</script>
```

## Performance Comparison

### Without Memoization
- Component renders: 1 time
- Icon loads: 5 times (once per icon)
- User clicks button → Component re-renders
- Icon loads: 5 times again! ❌
- **Total icon loads**: 10 times (5 icons × 2 renders)

### With Memoization
- Component renders: 1 time
- Icon loads: 5 times (once per icon)
- User clicks button → Component re-renders
- Icon loads: 0 times (cached) ✅
- **Total icon loads**: 5 times (5 icons × 1 load)

## When to Use This Pattern

✅ **Use memoization when**:
- Components are used in a reactive context (can re-render)
- The same component will be loaded multiple times
- You're using `defineAsyncComponent` with dynamic imports
- Performance and user experience matter

❌ **Skip memoization when**:
- Component is only loaded once and never re-renders
- You're using static imports
- You need fresh component instances for some reason

## Complete Working Example

```vue
<script setup>
import { ref } from 'vue'

// The cache (lives for the lifetime of the component)
const componentCache = new Map()

// The memoized loader function
const loadComponent = (componentName) => {
  if (!componentCache.has(componentName)) {
    componentCache.set(
      componentName,
      defineAsyncComponent(() => import(`./components/${componentName}.vue`))
    )
  }
  return componentCache.get(componentName)
}

// Reactive state that will cause re-renders
const currentView = ref('Dashboard')
const counter = ref(0)

// This will cause the component to re-render, but won't reload components
const increment = () => {
  counter.value++
}
</script>

<template>
  <div>
    <button @click="increment">Clicked {{ counter }} times</button>
    
    <!-- Component won't reload when counter changes -->
    <component :is="loadComponent('UserProfile')" />
    <component :is="loadComponent('Settings')" />
    <component :is="loadComponent(currentView)" />
  </div>
</template>
```

## Key Takeaways

1. **Always memoize** `defineAsyncComponent` calls in reactive contexts
2. **Use Map** for cleaner, more efficient caching
3. **Cache at the component level** (outside the function)
4. **Think about when components reload** - if the parent re-renders, will your dynamic components reload unnecessarily?

## Debugging Tips

If you suspect components are reloading:

```vue
<script setup>
const loadComponent = (name) => {
  if (!cache.has(name)) {
    console.log(`🔄 Loading component: ${name}`) // Should only log once per component
    cache.set(name, defineAsyncComponent(() => import(`./components/${name}.vue`)))
  } else {
    console.log(`✅ Using cached component: ${name}`)
  }
  return cache.get(name)
}
</script>
```

If you see the loading message more than once for the same component, you're missing memoization!
