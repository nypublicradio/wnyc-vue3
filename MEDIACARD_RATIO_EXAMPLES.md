# MediaCard Responsive Ratio Examples

The MediaCard component now supports responsive image ratios that change based on breakpoints.

## Usage Examples

### 1. Default Behavior (all breakpoints use [3,2])
```vue
<MediaCard :data="article" />
```

### 2. Legacy Array Format (all breakpoints use the same ratio)
```vue
<MediaCard :data="article" :ratio="[1, 1]" />
```

### 3. Object Format - Override Specific Breakpoints
```vue
<!-- Square images on small screens, widescreen on large screens -->
<MediaCard 
  :data="article" 
  :ratio="{ sm: [1, 1], lg: [16, 9] }" 
/>

<!-- Different ratio for each breakpoint -->
<MediaCard 
  :data="article" 
  :ratio="{ 
    xs: [4, 3], 
    sm: [1, 1], 
    md: [3, 2], 
    lg: [16, 9],
    xl: [21, 9] 
  }" 
/>

<!-- Only override one breakpoint, others use default [3,2] -->
<MediaCard 
  :data="article" 
  :ratio="{ md: [4, 3] }" 
/>
```

## How It Works

1. **Breakpoint Detection**: The component automatically detects the current screen breakpoint
2. **Ratio Selection**: It looks up the appropriate ratio for that breakpoint from the ratio object
3. **Fallback**: If no ratio is specified for a breakpoint, it defaults to [3, 2]
4. **Image Updates**: When the breakpoint changes, the image dimensions are recalculated and the image is fetched with new dimensions

## Breakpoints

- `xs`: Extra small screens
- `sm`: Small screens  
- `md`: Medium screens
- `lg`: Large screens
- `xl`: Extra large screens
- `xxl`: Extra extra large screens
- `xxxl`: Extra extra extra large screens

## Backward Compatibility

The component maintains full backward compatibility:
- Existing usage with array format continues to work
- Existing usage without ratio prop uses [3, 2] default
- No breaking changes to existing code
