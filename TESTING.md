# Unit Testing Setup for WNYC Vue3 Project

## Overview

This document outlines the comprehensive unit testing setup for the WNYC Vue3 project, with a focus on server API endpoint testing and utility function validation.

## Testing Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework powered by Vite
- **Assertion Library**: Built-in expect assertions from Vitest
- **Test Environment**: happy-dom for DOM simulation
- **Vue Component Testing**: @vue/test-utils (when needed)
- **HTTP Mocking**: Axios mocking for API endpoint testing

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
├── setup.ts                              # Test setup file
├── hello.test.ts                         # Example test
├── utilities/
│   └── helpers.test.ts                   # Utility function tests
├── server/
│   ├── api-business-logic.test.ts        # API endpoint business logic
│   └── api-integration.test.ts           # API workflow integration tests
├── components/                           # Vue component tests (future)
└── composables/                          # Composable tests (future)
```

## API Endpoint Testing

### Server API Business Logic (`tests/server/api-business-logic.test.ts`)

Comprehensive tests for all WNYC API endpoint logic:

#### Shows API Logic
- Image template URL formatting and transformation
- Featured shows matching with main shows by slug
- CMS source attribution for data tracking

#### Streams API Logic
- Stream filtering by source tags (new-wnyc-app)
- URL construction with query parameters
- Empty data and edge case handling

#### Story API Logic
- CMS source validation (publisher/wagtail)
- Dynamic endpoint URL construction
- Route parameter validation and handling

#### Homepage Curation Logic
- Complex data structure transformation
- Missing field graceful handling
- Content normalization across different types

#### Data Normalization Patterns
- Automatic CMS source addition
- Audio content presence detection
- Alphabetical sorting implementations

#### Error Handling Patterns
- HTTP error status identification (404, 500)
- Fallback data structure provision
- Network error pattern recognition

#### Performance & Caching
- Cache duration configuration validation
- Cache header formatting verification
- URL construction optimization

### API Integration Testing (`tests/server/api-integration.test.ts`)

Complete workflow tests simulating real API interactions:

#### Full API Workflows
- **Shows Workflow**: Fetches all shows + featured shows, processes image templates, matches featured content
- **Streams Workflow**: Multi-step stream enrichment with filtering, detail fetching, and current show data
- **Story Workflow**: Handles both Publisher and Wagtail CMS story retrieval and normalization
- **Homepage Workflow**: Assembles complete homepage with featured content, recent articles, and Gothamist stories

#### Error Handling Simulations
- API timeout scenarios with appropriate fallbacks
- Network error retry logic validation
- Malformed response data graceful handling

#### Performance Optimization Testing
- Concurrent API call simulation and timing
- Cache header validation across endpoints
- Response processing performance verification

### API Testing Strategy

The API tests use comprehensive HTTP mocking to ensure:

1. **Deterministic Results**: All external API calls are mocked for consistent test outcomes
2. **Complete Coverage**: Both success and failure scenarios are thoroughly tested
3. **Real-world Simulation**: Tests mirror actual API endpoint behavior and data flow
4. **Performance Awareness**: Validates caching strategies and concurrent request handling

Example API test pattern:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios globally
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process complete API workflow', async () => {
    // Mock API responses
    const mockResponse = { data: { results: [/* test data */] } }
    mockedAxios.mockResolvedValue(mockResponse)

    // Test the workflow
    const result = await processApiWorkflow()
    
    // Verify results
    expect(result).toMatchObject({
      processed: true,
      cmsSource: 'publisher'
    })
  })
})
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

## Current Test Coverage

The project now includes comprehensive test coverage with **49 passing tests** across 5 test files:

- **API Endpoint Testing**: 29 tests covering all major WNYC API endpoints
  - Business logic validation
  - Integration workflow testing  
  - Error handling patterns
  - Performance optimization
- **Utility Functions**: 11 tests for helper methods and data transformations
- **Integration Patterns**: 9 tests for complete API workflows
- **Basic Examples**: Example tests demonstrating testing patterns

### Test Results Summary

```
✓ tests/server/api-business-logic.test.ts (20 tests)
✓ tests/server/api-integration.test.ts (9 tests)  
✓ tests/utilities/helpers.test.ts (11 tests)
✓ tests/examples/basic-utilities.test.ts (6 tests)
✓ tests/hello.test.ts (3 tests)

Total: 49 tests passing across 5 files
```

### API Endpoints Covered

All major WNYC API endpoints are comprehensively tested:

- `/api/shows` - Show listings and featured content
- `/api/streams` - Live stream data and filtering
- `/api/story/[cmsSource]/[storyId]` - Individual story content
- `/api/homepagecuration` - Homepage content assembly

## Running Specific Test Suites

```bash
# Run only API endpoint tests
npm run test -- tests/server/

# Run only utility function tests
npm run test -- tests/utilities/

# Run specific test file
npm run test -- tests/server/api-business-logic.test.ts

# Run tests matching pattern
npm run test -- --grep "Shows API"

# Run with coverage report
npm run coverage
```

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
