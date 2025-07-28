# Unit Testing Setup for WNYC Vue3 Project

## Overview

This document outlines the unit testing setup for the WNYC Vue3 project using Vitest as the testing framework.

## Testing Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework powered by Vite
- **Assertion Library**: Built-in expect assertions from Vitest
- **Test Environment**: happy-dom for DOM simulation
- **Vue Component Testing**: @vue/test-utils (when needed)

## Installation

The following testing dependencies have been installed:

```bash
npm install --save-dev @vue/test-utils @vitejs/plugin-vue happy-dom
```

## Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
    },
  },
})
```

### Test Setup (`tests/setup.ts`)

Basic setup file for test environment initialization.

## Available NPM Scripts

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (explicit)
- `npm run test:ui` - Run tests with UI interface
- `npm run coverage` - Run tests with coverage report

## Test Structure

Tests are organized in the `tests/` directory:

```
tests/
├── setup.ts                    # Test setup file
├── hello.test.ts               # Example test
├── utilities/
│   └── helpers.test.ts         # Utility function tests
├── components/                 # Vue component tests (future)
└── composables/               # Composable tests (future)
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature or Component Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = someFunction(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### Testing Utility Functions

Example of testing pure utility functions:

```typescript
import { describe, it, expect } from 'vitest'

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

describe('capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })
})
```

### Testing Vue Components (Future Setup)

When testing Vue components, you'll need to install and configure @vue/test-utils properly. Here's an example structure:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

### Testing Composables (Future Setup)

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import useMyComposable from '@/composables/useMyComposable'

describe('useMyComposable', () => {
  it('returns expected values', () => {
    const { value, increment } = useMyComposable()
    
    expect(value.value).toBe(0)
    increment()
    expect(value.value).toBe(1)
  })
})
```

## Best Practices

### 1. Test Structure
- Use descriptive test names that explain what is being tested
- Group related tests using `describe` blocks
- Follow the Arrange-Act-Assert pattern

### 2. Test Coverage
- Aim for high test coverage on utility functions and business logic
- Focus on testing edge cases and error conditions
- Test both positive and negative scenarios

### 3. Mocking
- Mock external dependencies and APIs
- Use `vi.mock()` for module mocking
- Create stable test environments by mocking time-dependent functions

### 4. Assertions
- Use specific assertions that clearly express intent
- Prefer `toBe()` for primitive values and `toEqual()` for objects
- Use custom matchers when appropriate

## Running Tests

### Development Workflow

1. **Watch Mode**: Run `npm run test` to continuously run tests while developing
2. **Single Run**: Use `npm run test:run` for CI/CD or final verification
3. **Coverage**: Run `npm run coverage` to generate test coverage reports
4. **UI Mode**: Use `npm run test:ui` for an interactive testing experience

### Debugging Tests

- Use `console.log()` statements for debugging
- Set breakpoints in your IDE
- Use `test.only()` to run specific tests
- Use `test.skip()` to temporarily disable tests

## Integration with CI/CD

Add the following to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:run

- name: Run Coverage
  run: npm run coverage
```

## Troubleshooting

### Common Issues

1. **Module Resolution**: Ensure path aliases are configured correctly in `vitest.config.ts`
2. **Vue Component Issues**: May need to configure @vitejs/plugin-vue for component testing
3. **Environment Variables**: Set up test-specific environment variables if needed

### Current Limitations

- Vue component testing setup is basic and may need enhancement for complex components
- Some complex Nuxt composables may need additional mocking
- Vite plugin compatibility issues may require workarounds

## Next Steps

1. **Enhanced Vue Component Testing**: Configure full Vue component testing support
2. **E2E Testing**: Consider adding Playwright or Cypress for end-to-end tests
3. **Visual Testing**: Add visual regression testing for UI components
4. **Performance Testing**: Add performance benchmarks for critical functions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
