# Test Page

## Src / import paths

### Image path with space, Local Folder

(+ config defined css classes)

![Image With Space Local Folder](./img%20with%20space.png)

### Image no space in path, local folder

(+ config defined css classes)

![Image no space, local folder](./img.png)

### Image no space in path, lib folder

(+ config defined css classes)

![Image no space, lib folder](../lib/images/img.png)

## CSS classes and attributes

Url params: 2 css class in url params (+ config defined css classes)

![(one css class in url params)](./img.png?class=test-border&class=test-shadow)

Url params: 3 css classes, and one `loading=lazy` attribute (+ config defined css classes)

![Image no space, lib folder](../lib/images/img.png?loading=lazy&class=test-border&class=test-outline;test-rotation-animation)

## Image processing directives

Url params: 2 css classes + `blur=0` and `flip=true` images directives

![Image no space, lib folder](../lib/images/img.png?blur=0&flip=true&class=test-outline;test-border)

Another image, one CSS class + `rotate=25` and `tint=ff3355` image directives

![Image no space, local folder](./vitejs-logo.png?rotate=25&tint=ff3355&class=test-shadow)

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

