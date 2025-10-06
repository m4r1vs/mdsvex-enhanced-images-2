# MDSvex Enhanced Images Demo

Welcome to the interactive demonstration of **mdsvex-enhanced-images**, a powerful plugin that seamlessly integrates SvelteKit's `enhanced:img` components with MDSvex markdown processing.

## 🚀 Features Showcase

### Basic Image Processing

Transform regular markdown images into optimized `enhanced:img` components automatically:

![Basic enhanced example](./img.png)

**Markdown code:**
```markdown
![Basic enhanced example](./img.png)
```

### Images with Spaces in Filenames

Handles complex file paths including spaces and special characters:

![Example with space in filename](./img%20with%20space.png)

**Markdown code:**
```markdown
![Example with space in filename](./img%20with%20space.png)
```

### Library Images

Process images from various directories including the `$lib` folder:

![Library example](../lib/images/img.png)

**Markdown code:**
```markdown
![Library example](../lib/images/img.png)
```

## 🎨 CSS Classes & Attributes

### Multiple CSS Classes via URL Parameters

Apply multiple CSS classes using semicolon separation or multiple `class` parameters:

![Multiple CSS classes](./img.png?class=test-border&class=test-shadow)

**Markdown code:**
```markdown
![Multiple CSS classes](./img.png?class=test-border&class=test-shadow)
```

### Combined Classes and HTML Attributes

Mix CSS classes with HTML attributes like `loading="lazy"` for performance optimization:

![Enhanced with attributes](../lib/images/img.png?loading=lazy&class=test-border&class=test-outline;test-rotation-animation)

**Markdown code:**
```markdown
![Enhanced with attributes](../lib/images/img.png?loading=lazy&class=test-border&class=test-outline;test-rotation-animation)
```

## 🛠️ Image Processing Directives

### Image Transformations

Apply imagetools directives for on-the-fly image processing:

![Processed example with blur and flip](../lib/images/img.png?blur=0&flip=true&class=test-outline;test-border)

**Markdown code:**
```markdown
![Processed example with blur and flip](../lib/images/img.png?blur=0&flip=true&class=test-outline;test-border)
```

### Advanced Effects

Combine rotation and tinting effects with styling:

![Rotated and tinted logo](./vitejs-logo.png?rotate=25&tint=ff3355&class=test-shadow)

**Markdown code:**
```markdown
![Rotated and tinted logo](./vitejs-logo.png?rotate=25&tint=ff3355&class=test-shadow)
```

## 📖 How It Works

1. **Markdown Processing**: Write standard markdown image syntax
2. **Plugin Integration**: The plugin automatically detects relative image paths
3. **Enhanced Components**: Images are transformed to `enhanced:img` components
4. **Import Generation**: Automatic ES module imports with imagetools directives
5. **Optimization**: Built-in performance optimizations and responsive images

## 💡 Configuration

The plugin supports global configuration for default attributes and imagetools directives, as demonstrated by the base styling applied to all images on this page.

---

*This demo is automatically deployed to GitHub Pages using SvelteKit's static adapter.*

<style>
  .test-decoration {
    background-image: radial-gradient(orange, yellow);
    border-radius: 100%;
    padding: 2em;
    margin: 2em;
  }

  .test-shadow {
    box-shadow: -1ex 2ex 2ex lightgray;
  }

  .test-border {
    border: 2px solid red;
  }
  .test-outline {
    outline: 4px solid rebeccaPurple;
  }
  .test-rotation-animation {
    animation: rotation 2s infinite linear;
  }
  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
