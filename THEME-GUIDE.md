# Domlii Dashboard Theme System

A comprehensive design system built from Figma specifications, featuring a warm, professional color palette with green primary colors and golden yellow accents.

## 🎨 Color Palette

### Primary Colors (Green Theme)
- **Primary**: `#39996B` - Main action buttons, primary CTAs
- **Primary Hover**: `#2E8055` - Hover states for primary elements
- **Primary Background**: `#CCEFDC` - Light green backgrounds
- **Primary Subtle**: `#E6F7ED` - Very subtle green backgrounds

### Secondary Colors (Golden Yellow Theme)  
- **Secondary**: `#FABB17` - Active tabs, accent elements
- **Secondary Hover**: `#E1A325` - Hover states for secondary elements
- **Secondary Background**: `#FCF4D6` - Light yellow backgrounds
- **Secondary Subtle**: `#FDF9E8` - Very subtle yellow backgrounds

### Background Colors
- **Default**: `#FFFDF8` - Main page background (warm cream)
- **Base**: `#FFFFFF` - Cards, tables, pure white surfaces
- **Sidebar**: `#FFF9E8` - Sidebar background (light cream)

### Text Colors
- **Primary Text**: `#1F2937` - Headings, important text
- **Body Text**: `#65656A` - Regular paragraph text
- **Light Text**: `#6B7280` - Secondary text, captions
- **Header Text**: `#534E43` - Table headers, labels

### Border Colors
- **Line**: `#F2F0EA` - Table borders, dividers
- **Border**: `#E0DDD5` - General borders
- **Border Hover**: `#D0CCC3` - Hover state borders

### Status Badge Colors
- **Published**: Orange theme (`#EE6237` on `#FDF0EC`)
- **Review**: Purple theme (`#A258D6` on `#FBEBFF`) 
- **Success/Active**: Green theme (`#027A48` on `#ECFDF3`)
- **Sponsored**: Blue theme (`#2B2BCE` on `#D5D5FF`)
- **Warning**: Orange theme (`#FFA30C` on `#FFF7EB`)

## 📝 Typography

### Font Family
- **Primary**: Graphik (custom font loaded from `/fonts/Graphik-Regular.otf`)
- **Fallback**: Inter, system fonts

### Font Configuration
```css
@font-face {
  font-family: 'Graphik';
  src: url('/fonts/Graphik-Regular.otf') format('opentype');
  font-weight: 100 1500;
  font-style: normal;
  font-display: swap;
}
```

## 🛠 Usage

### CSS Variables
All colors are available as CSS custom properties:

```css
/* Use in CSS */
.my-component {
  background-color: var(--bg-default);
  color: var(--fg-text-contrast);
  border: 1px solid var(--fg-border);
}

/* Primary colors */
.primary-button {
  background-color: var(--primary-solid);
  color: var(--primary-on-primary);
}

.primary-button:hover {
  background-color: var(--primary-solid-hover);
}
```

### Tailwind Classes
All colors are configured for Tailwind CSS:

```jsx
// Background colors
<div className="bg-bg-default">      {/* #FFFDF8 */}
<div className="bg-bg-base">         {/* #FFFFFF */}
<div className="bg-bg-subtle">       {/* #FFF9E8 */}

// Text colors  
<h1 className="text-fg-text-contrast">   {/* #1F2937 */}
<p className="text-fg-text">             {/* #65656A */}
<span className="text-fg-solid-hover">   {/* #6B7280 */}

// Primary colors
<button className="bg-primary-solid text-primary-on-primary hover:bg-primary-solid-hover">
  Primary Button
</button>

// Secondary colors
<div className="bg-secondary-solid text-secondary-on-secondary">
  Accent Element
</div>

// Borders
<div className="border border-fg-border hover:border-fg-border-hover">
  Card with borders
</div>
```

### Pre-built Component Classes
Use ready-made component classes for common patterns:

```jsx
// Buttons
<button className="theme-button-primary">
  Create scholarship
</button>

// Tabs
<button className="theme-tab-active">Active Tab</button>
<button className="theme-tab-inactive">Inactive Tab</button>

// Badges
<div className="theme-badge theme-badge-success">
  <div className="theme-badge-dot theme-badge-dot-success"></div>
  Active
</div>

// Tables
<div className="theme-table">
  <table>
    <thead>
      <tr>
        <th className="theme-table-header">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="theme-table-cell">Cell</td>
      </tr>
    </tbody>
  </table>
</div>

// Search
<input className="theme-search" placeholder="Search..." />
```

## 🎯 Component Examples

### Primary Button
```jsx
<button className="theme-button-primary">
  <span className="mr-2">+</span>
  Create scholarship
</button>
```

### Status Badges  
```jsx
<div className="theme-badge theme-badge-success">
  <div className="theme-badge-dot theme-badge-dot-success"></div>
  Active
</div>

<div className="theme-badge theme-badge-warning">
  <div className="theme-badge-dot theme-badge-dot-warning"></div>
  Warning  
</div>
```

### Navigation Tabs
```jsx
<div className="border-b border-fg-border">
  <div className="flex space-x-8">
    <button className="theme-tab-active pb-4">
      Scholarships
    </button>
    <button className="theme-tab-inactive pb-4">
      Applications
    </button>
  </div>
</div>
```

### Data Table
```jsx
<div className="theme-table">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="theme-table-header text-left">Name</th>
        <th className="theme-table-header text-left">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="theme-table-cell">
          <div className="font-medium text-fg-text-contrast">
            Excellence Scholarship
          </div>
        </td>
        <td className="theme-table-cell">
          <div className="theme-badge theme-badge-success">
            <div className="theme-badge-dot theme-badge-dot-success"></div>
            Active
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🧩 Design Tokens

### Border Radius
- **Small**: `4px` (var(--border-radius-sm))
- **Medium**: `7px` (var(--border-radius-md))  
- **Large**: `10px` (var(--border-radius-lg))
- **Extra Large**: `16px` (var(--border-radius-xl))

### Shadows
- **Small**: `0px 1px 2px rgba(16, 24, 40, 0.05)`
- **Medium**: `0px 4px 8px -2px rgba(16, 24, 40, 0.1)`
- **Large**: `0px 12px 16px -4px rgba(16, 24, 40, 0.08)`

### Layout
- **Navbar Height**: `75px`
- **Sidebar Width**: `267px`

## 🎪 Test Pages

Visit these pages to see the theme in action:

- `/theme-test` - Complete theme showcase with all colors and components
- `/example-usage` - Practical example of a dashboard layout using the theme
- `/font-test` - Font rendering test page

## 🔧 Development

### Adding New Colors
1. Add CSS custom property to `:root` in `globals.css`
2. Add corresponding Tailwind class in `tailwind.config.ts`
3. Document the new color in this README

### Customizing Components
Component classes are defined in `globals.css` under the `@layer components` section. Modify existing classes or add new ones as needed.

### Dark Mode Support
The theme includes dark mode variants. Colors automatically adapt based on the `.dark` class applied to the document.

## 📱 Responsive Design

The theme works seamlessly with Tailwind's responsive utilities:

```jsx
<div className="bg-bg-default md:bg-bg-subtle lg:bg-primary-bg-subtle">
  Responsive backgrounds
</div>

<button className="theme-button-primary text-sm md:text-base">
  Responsive button
</button>
```

## ✨ Best Practices

1. **Use semantic color names**: Prefer `text-fg-text-contrast` over `text-gray-800`
2. **Consistent spacing**: Use Tailwind's spacing scale consistently
3. **Component composition**: Combine utility classes with component classes
4. **Accessibility**: Maintain proper contrast ratios (all colors meet WCAG AA standards)
5. **Performance**: CSS variables ensure minimal bundle size impact