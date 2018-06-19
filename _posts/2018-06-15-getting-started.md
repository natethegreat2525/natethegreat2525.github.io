---
layout: post
title: "Software Renderer Tutorial - Getting Started"
date: 2018-06-15
---

Before we can start on the software renderer we have to have a way to draw the pixels to the screen. If you are using another language and already know how to draw pixels to the screen or a buffer, you can skip this page and go to the next section. Since we are using javascript the easiest way to draw directly to the screen is to use a canvas with an ImageData object. The goal is just to have an interface that you can send an array of RGB values and make the resulting image appear on the screen.

To keep it simple, start out by making a new folder for the project that will contain all of our html and js files that will be served statically. The html file only needs to have a canvas element. For this tutorial we will be using a 640x480 canvas. You can use whatever size canvas you want but larger canvases may cause the software renderer to become much slower since the rasterization has to happen for each pixel drawn to the screen.

Here is the initial index.html file:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Software Renderer</title>
</head>
<body>
  <canvas id="canvas" width="640" height="480"/>
</body>
</html>
```

To view the result, you can just double click on the file to open it in your preferred browser. This will work for a while but does not work with modules with certain browsers so it is best to use a simple static server. You can use any server you prefer but it is easiest just to install http-server with npm.

```
npm install http-server -g
cd software_renderer
http-server
```

Now in your browser you can navigate to `localhost:8080` and your index.html file will be shown.

This just produces a blank page for now. To add some color to it make a new file called main.js. This file will import the other modules and contain the main rendering loop. For now though let's just get something on the screen.

main.js:

```javascript
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

let imageData = new ImageData(width, height);

for (let i = 0; i < width; i++) {
  for (let j = 0; j < height; j++) {
    idx = (i + j * width) * 4;
    imageData.data[idx] = 255 * i / width;
    imageData.data[idx + 1] = 255 * j / height;
    imageData.data[idx + 2] = 0;
    imageData.data[idx + 3] = 255;
  }
}
ctx.putImageData(imageData, 0, 0);
```

To make this file part of our page, add this line to the end of the body in index.html:

```html
<script type="module" src="main.js"></script>
```

When you refresh your page you should see a red and green gradient. If you don't see any change, try ctrl-f5 to make sure the new files are loaded.

<canvas id="canvas" width="320" height="240"></canvas>

Now that we can set pixel values, we are ready to start rasterizing triangles!

<script>
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

let imageData = new ImageData(width, height);

for (let i = 0; i < width; i++) {
  for (let j = 0; j < height; j++) {
    idx = (i + j * width) * 4;
    imageData.data[idx] = 255 * i / width;
    imageData.data[idx + 1] = 255 * j / height;
    imageData.data[idx + 2] = 0;
    imageData.data[idx + 3] = 255;
  }
}
ctx.putImageData(imageData, 0, 0);
</script>
