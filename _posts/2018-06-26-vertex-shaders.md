---
layout: post
title: "Software Renderer Tutorial - Vertex Shaders"
date: 2018-06-26
---

Before now we have had to specify the exact position of every vertex. Vertex shaders will allow us to manipulate the positions of vertices in more complex ways. Fragment shaders are run for each pixel or 'fragment' on a screen or buffer, so vertex shaders are run for each vertex before it is passed to the fragment shaders. If we want to shift triangles to the right for example, we could add a constant to the x position in the vertex shader. This would shift all vertices by that constant value.

Just like the fragmentShader was passed into the drawTriangle method and called for each pixel, we will make a function in shader.js called <b>drawTiangles</b> that draws an array of triangles and calls the vertexShader callback for each vertex before calling the drawTriangle function.

```javascript
export function drawTriangles(buffer, triangles, vertexShader, fragmentShader, uniforms) {
	for (let i = 0; i < triangles.length; i++) {
		let t = triangles[i];
		let tNext = new Triangle();
		tNext.p1 = vertexShader(t.p1, uniforms);
		tNext.p2 = vertexShader(t.p2, uniforms);
		tNext.p3 = vertexShader(t.p3, uniforms);
		drawTriangle(buffer, tNext, fragmentShader, uniforms);
	}
}
```

Notice that I am also passing the uniforms object into the drawTriangle function. In javascipt we are just using an object but in most languages it would be a map, hashmap, or dictionary. We will be using this to pass in parameters that are constant into both the vertex and fragment shaders. We need to update our drawTriangle function to pass these uniforms by updating the following lines:

```javascript
function drawTriangle(buffer, triangle, fragmentShader, uniforms) {
```

```javascript
		doHalfTri(buffer, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
```

```javascript
		doHalfTri(buffer, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
```

```javascript
function doHalfTri(buffer, scanStart, scanEnd, p1, slope1, p2, slope2, baseVertex, varyingSlopes, fragmentShader, uniforms) {
```

```javascript
			let frag = fragmentShader(varyingBase, uniforms);
```

Congratulations, you can now write vertex shaders. Our vertex shaders will now let us move triangles around in bulk. We could for instance pass all of the triangles of a character into the drawtriangles function and change their position to the position of the character. This is useful, but not the most powerful part of vertex shaders. Another thing we might want to do is calculate a value in the vertex shader and pass it on as a varying. That way calculated values in the vertex shader can be interpolated across the face of a triangle. This can be useful with smoothed lighting and shading or coloring our vertices. Lets change the vertex to contain both attributes and varyings. Attributes will be passed into the vertex shader and the vertex shader will return a vertex with a list of varyings. Some of these may be attributes but others may be computed in the vertex shader. To do this, all we need to do is update the vertex class.

```javascript
export class Vertex {
	constructor(point, attributes, varyingArray) {
		this.point = point;
		this.varyingArray = varyingArray || [];
		this.attributes = attributes;
	}
}
```

Now we can manipulate vertices in the vertex shader, pass new varying values and get those varying values in the fragment shader. But what is the best way to manipulate vertices? It is pretty simple to shift a vertex in the x, y, or z direction, but when we want to do something like rotation, things could get messy. To aide with this we need matrices. A matrix can represent a translation, a rotation, or scaling (and other operations we will get to later). I hope to make it clear by the end of this section and the next how powerful and useful matrices are for graphics. It is standard in graphics to use 4x4 matrices. The matrices operate on vectors by matrix multiplication. Since the rules for matrix multiplication require matrices to be compatible sizes in order to be multiplied (an mxn matrix can only be multiplied by an nxp matrix) we will need to make a Point4 class that gives us a lot of the same functions as our Point3 class. While you are free to exclusively use Point4 and replace previous references to Point3, I will be using Point3 objects in the main.js file and converting them to Point4 objects in the vertex shader. Here is our Point4 class, mostly copy-pasted from the Point3 class:

```javascript
export class Point4 {
	constructor(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
	}
	
	static fromPoint3(p3, w) {
		return new Point4(p3.x, p3.y, p3.z, w);
	}
	
	sub(p) {
		return new Point4(this.x - p.x, this.y - p.y, this.z - p.z, this.w - p.w);
	}
	
	add(p) {
		return new Point4(this.x + p.x, this.y + p.y, this.z + p.z, this.w + p.w);
	}
	
	cross2(p) {
		return this.x * p.y - this.y * p.x;
	}
	
	clone() {
		return new Point4(this.x, this.y, this.z, this.w);
	}
}
```

In the "Full source code" section I accidentally used a single | in the Point4 constructor which lead to some weird behavior. `|| 0` simply ensures that the value is not undefined while `| 0` will convert the value to an integer. Using `|| 0` is the intended behavior, as rounding all of our vectors might have unintended consequences!

Now it's time to work on our matrices. Our matrix class will need an array of 16 values since it is a 4x4 matrix. Here is our base matrix class in math.js:

```javascript
export class Mat4 {
	constructor() {
		this.vals = new Array(16).fill(0);
	}
}
```

There are several ways we could map the array indices to the values in the matrix. I will be using row major order:

![Row Major Order](/assets/row_major_order.png)

Now we will need to implement matrix multiplication. There are plenty of resources online to explain every detail of matrix multiplication. I find that the most intuitive explanation is that every number in the output matrix is a dot product of two vectors. The first vector is the row corresponding to the output row in the left matrix. The second vector is the column corresponding to the output column in the right matrix. The dot product is just `x*x + y*y + z*z` ...etc so this can be extrapolated to matrices of any size.

![Multiplication](/assets/multiplication.png)

In the image above, `j = a*e + b*f + c*g + d*h`. This must be done for every point in the output matrix. Here is the matrix multiplication for 4x4 (mat4) and 4x1 matrices (point4).

```javascript
	mult(m2) {
		let ret = new Mat4();
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				let idx = i + j * 4;
				for (let k = 0; k < 4; k++) {
					//dot product of the j'th row from m1 (this) and the i'th column from m2
					ret.vals[idx] += this.vals[k + j * 4] * m2.vals[i + k * 4];
				}
			}
		}
		return ret;
	}
	
	multVec4(vec) {
		let ret = new Point4();
		let vecV = [vec.x, vec.y, vec.z, vec.w];
		let retV = [0, 0, 0, 0];
		//multiply this x vec where vec is a 4x1 matrix
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				retV[i] += this.vals[j + i * 4] * vecV[j];
			}
		}
		ret.x = retV[0];
		ret.y = retV[1];
		ret.z = retV[2];
		ret.w = retV[3];
		return ret;
	}
```

When multiplying a 4x4 matrix by a 4x1 matrix (our Point4) we will get a 4x1 matrix as a result.

![Linear System](/assets/linear_system.png)

Later it may be useful to think of these as being equivalent to the following:

![System of Equations](/assets/system_eq.png)


Given the equation above, we can start defining what our operations will look like. The scaling matrix where we want to scale the vector by (a, b, c) in the x, y, and z directions respectively looks like this:

![Scale Matrix](/assets/scale_matrix.png)

Eliminating terms with 0 in them we get the following simplified equations:

```
x' = x*a
y' = y*a
z' = z*a
w' = w
```

Now our code to make a scale matrix looks like this:

```javascript
	static scale(x, y, z) {
		let m = new Mat4();
		m.vals[0] = x;
		m.vals[5] = y;
		m.vals[10] = z;
		m.vals[15] = 1;
		return m;
	}
```

The translation matrix where we will translate a vector by (a, b,c) in the x, y, and z directions looks like this:

![Translation Matrix](/assets/translation_matrix.png)

If we set our w value to be the constant value `1` we can simplify the following equations:

```
x' = x + w*a
y' = y + w*b
z' = z + w*c
w' = w
```

```
x' = x + a
y' = y + b
z' = z + c
w' = w
```

Setting the w value to 1 is crucial to allow for translation. If w is not set to 1 before, we can only do scaling and rotation in 3d. Here is the translation matrix function:

```javascript
	static translate(x, y, z) {
		let m = new Mat4();
		m.vals[0] = 1;
		m.vals[5] = 1;
		m.vals[10] = 1;
		m.vals[15] = 1;

		m.vals[3] = x;
		m.vals[7] = y;
		m.vals[11] = z;
		return m;
	}
```

Rotation is a bit more complicated, but rotating around a single axis can be pretty simple. If we are rotating around the z axis then the z value should remain untouched. The x and y values will be the ones changing. Our final equations should look like this:

```
x' = x*cos(a) + y*sin(a)
y' = x*-sin(a) + y*cos(a)
z' = z
w' = w
```

which is the same as this matrix

![Rotation Matrix](/assets/rotation_z_matrix.png)

Here is the function for the rotationZ matrix:

```javascript
	static rotateZ(r) {
		let m = new Mat4();
		m.vals[10] = 1;
		m.vals[15] = 1;
		
		m.vals[0] = Math.cos(r);
		m.vals[1] = Math.sin(r);
		m.vals[4] = -Math.sin(r);
		m.vals[5] = Math.cos(r);
		return m;
	}
```

There are two quick changes we will want to make before using the vertex shaders. Drawing things to the screen will be simpler if our screen coordinates go from (-1,-1) to (1,1) with the center being at (0,0). To fix this, lets rescale the vectors in the drawTriangle function. Be sure to do this before calculating vL and vR.

```javascript
	//lets rescale the -1 to 1 point x and y coordinates to be buffer coordinates 0 - width and 0 - height
	let xScale = buffer.imageData.width / 2;
	let yScale = buffer.imageData.height / 2;
	
	p1.x = (p1.x + 1) * xScale;
	p1.y = (p1.y + 1) * yScale;
	
	p2.x = (p2.x + 1) * xScale;
	p2.y = (p2.y + 1) * yScale;
	
	p3.x = (p3.x + 1) * xScale;
	p3.y = (p3.y + 1) * yScale;
```

And I also updated the buffer class with a clear function and to use the canvas context:

```javascript
export class Buffer {
	constructor(ctx, w, h) {
		this.imageData = ctx.createImageData(w, h);
		this.depth = new Array(w*h);
		this.depth.fill(0);
	}
	
	clear() {
		this.imageData.data.fill(0);
	}
}
```



Full source code for this page can be found [here](https://github.com/natethegreat2525/SoftwareRenderer/tree/7f02beb9efe168ce35a1ef2e0e7b00090aad774f).
