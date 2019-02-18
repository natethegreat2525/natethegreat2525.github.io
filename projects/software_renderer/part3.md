---
layout: tutorial-page
title: "Software Renderer Tutorial - Fragment Shaders"
nexturl: "/projects/software_renderer/part4"
nextname: "Vertex Shaders"
previousurl: "/projects/software_renderer/part2"
previousname: "Rasterizing Triangles"
---

In this tutorial we will add fragment shaders to our triangles. This will allow us to put gradients, textures, and patterns onto the triangles. Our fragment shaders will be implemented as callback functions that are called for each pixel that is rendered and must return a color. A simple fragment shader that returns the same color would make a solid colored triangle just like we already have. To make more interesting shaders we will pass parameters into the shaders. There are two types of parameters we will pass into shaders. The first type are <b>uniforms</b>. Uniforms are the same for every pixel that is rendered. Think of these as normal parameters that are passed into a function. The second type are <b>varyings</b> and will be the focus of this tutorial. Newer versions of opengl no longer use the varying key word and instead use <b>in</b> and <b>out</b> but the concept has not changed. Varyings, as the name implies, change for each pixel. Each time the fragment shader is called, the varyings are different. Varyings are useful if you want to add textures or make color gradients on your triangles. Varyings are set for each vertex and interpolated between vertices. The interpolated values are what will be passed into the fragment shaders. As an example, if I am drawing a line segment from one point to another, and the first point has a value of 1 as a varying and the second point has a value of 0 as a varying, each pixel between the points will have a value between 0 and 1. The pixels closest to the first point will have values closer to 1 and pixels closest to the second point will have values closer to 0. With 3 points for a triangle, we will have 3 values to interpolate between so the math gets a little more complicated but the basic idea remains the same where points closer to a vertex will have varying values closer to the value of that vertex's varyings.

Next we will derive the equation to calculate a varying's value at an arbitrary x and y. Since we have 3 values (x, y, and v) and 3 fixed points, we can interpolate linearly between the points because they will make a plane in 3 dimensions. Our equation for the plane will be `ax + by + c = v` where the constants a, b, and c define the gradient and height of the plane.

To solve for a, b, and c we will plug in the values for each point.

```
a*p1.x + b*p1.y + c = p1.v
a*p2.x + b*p2.y + c = p2.v
a*p3.x + b*p3.y + c = p3.v
```

Now there are two ways to solve this equation. First I will show the algebraic solution. This has so many steps, I will be skipping any steps that may be a simple re-arrangement of the terms.

Solve for C in each equation

```
c = -a*p1.x - b*p1.y + p1.v
c = -a*p2.x - b*p2.y + p2.v
c = -a*p3.x - b*p3.y + p3.v
```

Eliminate C by setting two of the equations above equal to eachother

```
-a*p1.x - b*p1.y + p1.v = -a*p2.x - b*p2.y + p2.v
-a*p1.x - b*p1.y + p1.v = -a*p3.x - b*p3.y + p3.v
```

Solve for A

```
-a*p1.x + a*p2.x = b*p1.y - b*p2.y + p2.v - p1.v
a*(p2.x - p1.x) = b*(p1.y - p2.y) + p2.v - p1.v

a = (b*(p1.y - p2.y) + p2.v - p1.v) / (p2.x - p1.x)
```

Now we have 1 equation with a and b in it. If we were to use 2 different equations above, we would have gotten a slightly different equation. Combining equations 1 and 3 leads to the following solution for a:

```
a = (b*(p1.y - p3.y) + p3.v - p1.v) / (p3.x - p1.x)
```

Eliminate a by setting the right side of both equations equal to each other and then solve for b.

```
(b*(p1.y - p2.y) + p2.v - p1.v) / (p2.x - p1.x) = (b*(p1.y - p3.y) + p3.v - p1.v) / (p3.x - p1.x)
(b*(p1.y - p2.y) + p2.v - p1.v) * (p3.x - p1.x) = (b*(p1.y - p3.y) + p3.v - p1.v) * (p2.x - p1.x)
b*(p1.y - p2.y)*(p3.x - p1.x) + (p2.v - p1.v)*(p3.x - p1.x) = b*(p1.y - p3.y)*(p2.x - p1.x) + (p3.v - p1.v)*(p2.x - p1.x)
b*(p1.y - p2.y)*(p3.x - p1.x) - b*(p1.y - p3.y)*(p2.x - p1.x) = (p3.v - p1.v)*(p2.x - p1.x) - (p2.v - p1.v)*(p3.x - p1.x)
b*((p1.y - p2.y)*(p3.x - p1.x) - (p1.y - p3.y)*(p2.x - p1.x)) = (p3.v - p1.v)*(p2.x - p1.x) - (p2.v - p1.v)*(p3.x - p1.x)
b = ((p3.v - p1.v)*(p2.x - p1.x) - (p2.v - p1.v)*(p3.x - p1.x)) / ((p1.y - p2.y)*(p3.x - p1.x) - (p1.y - p3.y)*(p2.x - p1.x))
```

Now if we repeat the above steps for a, we get:

```
a = ((p3.v - p1.v)*(p2.y - p1.y) - (p2.v - p1.v)*(p3.y - p1.y)) / ((p1.x - p2.x)*(p3.y - p1.y) - (p1.x - p3.x)*(p2.y - p1.y))
```

If a and b were switched in the first set of equations, it would be equivalent to switching the x and y values. The solution for a is actually the same as the solution for b but with the x and y values switched. With some shuffling around we can get the quotient of a to be the negative of the quotient of b.

```
a = ((p3.v - p1.v)*(p2.y - p1.y) - (p2.v - p1.v)*(p3.y - p1.y)) / ((p2.x - p1.x)*(p1.y - p3.y) - (p3.x - p1.x)*(p1.y - p2.y))
a = ((p3.v - p1.v)*(p2.y - p1.y) - (p2.v - p1.v)*(p3.y - p1.y)) / -((p1.y - p2.y)*(p3.x - p1.x) - (p1.y - p3.y)*(p2.x - p1.x))
```

We could solve for c but this will not be necessary. The alternative way to solve this system of equations is using matrices. Here are the resulting matrices:

![Matrix Solution](/assets/software_renderer/abc_matrix.png)

It turns out calculating the inverse of the matrix leads to the same solution. Although it would be a lot cleaner to use a matrix library, we will just use the equations derived above. Creating new objects and arrays for every time we want to do this calculation could be expensive and we don't need the whole solution.

Calculating v for each pixel by computing `ax + by + c` would work but would be very inefficient. Any calculation that happens for every pixel should be as simple as possible. Using calculus we could take the derivative of v with respect to x and of v with respect to y and see that each derivative is constant. `dv/dx = a` and `dv/dy = b` Equivalently since the equation for v is just the equation for a plane, we know that a and b are the x and y gradients respectively. Therefore if we know the value of v for one pixel, we can caculate the value of v for the pixel to its right by adding a. We can also calculate the value of v for the pixel below it by adding b. The fastest way to calculate the varyings for each pixel will be to solve the equations for a and b, then calculate the value of a single pixel using the equations, and after that just add or subtract a and b to calculate the value of every other pixel of the triangle.

Now that we have our equations lets get into the code. First I added several new classes. Our vertex class will contain a point and a list of our varyings. The triangle class will just track the three points of a triangle. Our fragment class will hold the color output of the fragment shader (r,g,b,a). The buffer class will be a better way to hold our image data and depth buffer.

This project is getting big so lets add these files to a new file called shader.js. I also moved the setPixel function, the drawTriangle function, and the doHalfTri function to the shader.js file.

```javascript
export class Vertex {
	constructor(point, varyingArray) {
		this.point = point;
		this.varyingArray = varyingArray;
	}
}

export class Triangle {
	constructor(p1, p2, p3) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}
}

export class Fragment {
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

export class Buffer {
	constructor(w, h) {
		this.imageData = new ImageData(w, h);
		this.depth = new Array(w*h);
		this.depth.fill(0);
	}
}
```

Don't forget to add the new file as a module in index.html!

```html
<script type="module" src="shader.js"></script>
```

We'll start out by modifying our drawTriangle function to use our new classes. The new drawTriangle class should take a buffer, a triangle, and a fragmentShader object. To keep the rest of the function mostly the same I just changed the top of the function to the following:

```javascript
export function drawTriangle(buffer, triangle, fragmentShader) {
	let p1 = triangle.p1.point;
	let p2 = triangle.p2.point;
	let p3 = triangle.p3.point;
```

Here is the equation above implemented to take the triangle object and calculates the gradient of each varying.

```javascript
function calculateVaryingSlope(t) {
	let v1 = t.p1.varyingArray;
	let v2 = t.p2.varyingArray;
	let v3 = t.p3.varyingArray;
	
	let w12 = t.p2.point.x - t.p1.point.x;
	let h12 = t.p2.point.y - t.p1.point.y;
	let w13 = t.p3.point.x - t.p1.point.x;
	let h13 = t.p3.point.y - t.p1.point.y;
	
	let quot = w13 * h12 - w12 * h13;
	
	if (quot === 0) {
		return null;
	}
	
	let slopeArray = [];
	
	for (let i = 0; i < v1.length; i++) {
		let r1 = v1[i];
		let r2 = v2[i];
		let r3 = v3[i];
		let dx = (h12 * (r3 - r1) + h13 * (r1 - r2)) / quot;
		let dy = (w12 * (r3 - r1) + w13 * (r1 - r2)) / -quot;
		
		slopeArray.push({dx: dx, dy: dy});
	}
	
	return slopeArray;
}
```

Now we can call this function right after we check for clockwise triangles:

```javascript
	let varyingSlopes = calculateVaryingSlope(triangle);
	if (!varyingSlopes) {
		return;
	}
```

The function returns null if there is a divide by zero error. This means the points are co-linear and would not render a triangle anyway so we can just return if this is the case.

We have a lot of new objects and parameters that are passed into the drawTriangle function but we aren't using them yet! Lets pass the buffer, a "base vertex", the gradients of the varyings, and a fragment shader into the doHalfTri function. The buffer replaces our imageData we were passing before. The base vertex is a vertex we will plug into the equations to calculate our initial varying values at whole pixel coordinates. The varying gradients can be used to calculate the varying values for each pixel relative to its neighbors. The fragmentShader is a callback function that will be provided by the user that determines the color of each pixel. Here are our new calls to doHalfTri and the new function header for doHalfTri:

```javascript
doHalfTri(buffer, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader);
```

```javascript
doHalfTri(buffer, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader);
```

```javascript
function doHalfTri(buffer, scanStart, scanEnd, p1, slope1, p2, slope2, baseVertex, varyingSlopes, fragmentShader) {
```

Lets create a function that calculates the varyings based on the baseVertex, the varyingSlopes, and the pixel position we want to calculate varyings for. To do this we can determine how far in the x and y direction the point is from the baseVertex. If we multiply these by the x and y gradients for each varying and sum those products, we will end up with the difference between the value of the varying at the base vertex and the value of the varying at the target position. Then we can add this to the varying value of the base vertex to get the final value. Here is the function I wrote to do this:

```javascript
function calculateVaryingBase(base, slopes, x, y) {
	let varyingBase = base.varyingArray.slice(0);
	let xDiff = x - base.point.x;
	let yDiff = y - base.point.y;
	incrementVarying(varyingBase, slopes, xDiff, yDiff);
	return varyingBase;
}

function incrementVarying(varying, slopes, dxm, dym) {
	for (let i = 0; i < varying.length; i++) {
		varying[i] += slopes[i].dx * dxm + slopes[i].dy * dym;
	}
}
```

The slice copies the array. We don't want to accidentally modify the varying data of our base vertex!

The incrementVarying function increments each of the varyings by their respective slopes given a relative x and y position. We will call calculateVaryingBase at the beginning of each scan line and then increment the varyings for each pixel as we move to the right on the scan line. This could be done by calling `incrementVarying(varying, slopes, 1, 0)` After testing in chrome I found that it is about 20% faster to implement another function that avoids the multiplication and can only be used for incrementing the x value by 1. I have included that function below. 20% is a small increase but this code will be run for each pixel so a 20% increase in speed will increase the speed of our entire renderer by 20%!

```javascript
function incrementVaryingX(varying, slopes) {
	for (let i = 0; i < varying.length; i++) {
		varying[i] += slopes[i].dx;
	}
}
```

Now our dohalfTri function should look like this:

```javascript
function doHalfTri(buffer, scanStart, scanEnd, p1, slope1, p2, slope2, baseVertex, varyingSlopes, fragmentShader) {
	//start right x pos
	let sx1 = p1.x + (scanStart - p1.y) * slope1;
	
	//start left x pos
	let sx2 = p2.x + (scanStart - p2.y) * slope2;
	
	//draw scan lines
	for (let i = scanStart; i < scanEnd; i++) {
		let low = Math.ceil(sx2);
		let high = Math.ceil(sx1);
		
		let varyingBase = calculateVaryingBase(baseVertex, varyingSlopes, low, i);
		if (i >= 0 && i < buffer.imageData.height)  {
			for (let j = low; j < high; j++) {
				if (j >= 0 && j < buffer.imageData.width)  {
					let frag = fragmentShader(varyingBase);
					setPixel(buffer.imageData, j, i, frag.r, frag.g, frag.b, frag.a);
					incrementVaryingX(varyingBase, varyingSlopes);
				}
			}
		}
		sx1 += slope1;
		sx2 += slope2;
	}
}
```

In the last section setPixel just added the values to the buffer. For now we can implement a simple alpha blend that will blend colors together based on the alpha value. You can swap out the call to setPixel with a call to this function in the doHalfTri function.

```javascript
function setPixelAlphaBlend(data, x, y, r, g, b, a) {
	if (x >= 0 && y >= 0 && x < data.width && y < data.height) {
		let idx = (x + y * data.width) * 4;
		if (a >= 255) {
			data.data[idx] = r;
			data.data[idx + 1] = g;
			data.data[idx + 2] = b;
			data.data[idx + 3] = a;
		} else {
			let af = a / 255.0
			let oma = 1-af;
			data.data[idx] = data.data[idx] * oma + r * af;
			data.data[idx + 1] = data.data[idx + 1] * oma + g * af;
			data.data[idx + 2] = data.data[idx + 2] * oma + b * af;
			data.data[idx + 3] = data.data[idx + 3] + af * (255 - data.data[idx + 3]);

		}
	}
}
```

Now we can see how our varyings work. Lets make a triangle with a simple color gradient. We will use 4 varyings for each vertex, 1 for each of the colors and alpha. We will make our first vertex red, our second vertex green, and our third vertex blue. Most of the code below is similar to the demo from last time. The main difference is the fragShader callback function. For now it will be very simple and just draw the interpolated colors.

```javascript
let val = 0;
let buffer = new Buffer(width, height);

let fragShader = (varyings) => {
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}

function mainLoop() {
	val += .01;
	
	let a = Math.sin(val - 1.5 - Math.sin(val / 1.3538)) * 100 + 320;
	let b = Math.cos(val - 1.5 - Math.sin(val / 1.3538)) * 100 + 240;
	
	let c = Math.sin(val + 2) * 100 + 320;
	let d = Math.cos(val + 2) * 100 + 240;
	
	let e = Math.sin(val + 1) * 100 + 320;
	let f = Math.cos(val + 1) * 100 + 240;
	
	let v1 = new Vertex(new Point3(a, b, 0), [255, 0, 0, 255]);
	let v2 = new Vertex(new Point3(c, d, 0), [0, 255, 0, 255]);
	let v3 = new Vertex(new Point3(e, f, 0), [0, 0, 255, 255]);

	let tri = new Triangle(v1, v2, v3);
	drawTriangle(buffer, tri, fragShader);

	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.imageData.data.fill(0);
}

setInterval(mainLoop, 1000/60.0);
```
 
<canvas id="canvas1" width="640" height="480"></canvas>

<button id="start1" onclick="toggleRenderer1()">Start</button>

<script src="/assets/software_renderer/demos/2_fragment_shader_color.js" type="text/javascript"></script>

If you see the same thing as the demo above then your varyings are working! Lets do something a little more complicated. If we pass in u and v coordinates, we can draw a grid pattern that stretches and skews with the triangle. Here are the new Vertex lines we will use to pass in u and v coordinates:

```javascript
	let v1 = new Vertex(new Point3(a, b, 0), [255, 0, 0, 255, 0, 0]);
	let v2 = new Vertex(new Point3(c, d, 0), [0, 255, 0, 255, 10, 0]);
	let v3 = new Vertex(new Point3(e, f, 0), [0, 0, 255, 255, 10, 10]);
```

In our fragment shader, if the u and v coordinates add up to an even number, lets just return the color black. Otherwise we will return the color gradient from before.

```javascript
let fragShader = (varyings) => {
	if ((Math.floor(varyings[4]) + Math.floor(varyings[5])) % 2 == 0) {
		return new Fragment(0, 0, 0, 255);
	}
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}
```
 
<canvas id="canvas2" width="640" height="480"></canvas>

<button id="start2" onclick="toggleRenderer2()">Start</button>

<script src="/assets/software_renderer/demos/2_fragment_shader_grid.js" type="text/javascript"></script>

In the next tutorial we will be implementing vertex shaders and doing some matrix math to help position the triangles without having to specify the exact coordinates of every vertex.

Full source code for this page can be found [here](https://github.com/natethegreat2525/SoftwareRenderer/tree/e06e6d1ec368f861335d2ca781090b855a06b9e5).
