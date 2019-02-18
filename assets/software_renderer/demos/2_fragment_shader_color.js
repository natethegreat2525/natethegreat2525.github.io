let canvas = document.getElementById('canvas1');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

class Point3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	sub(p) {
		return new Point3(this.x - p.x, this.y - p.y, this.z - p.z);
	}
	
	add(p) {
		return new Point3(this.x + p.x, this.y + p.y, this.z + p.z);
	}
	
	dot2(p) {
		return this.x * p.x + this.y * p.y;
	}
	
	cross2(p) {
		return this.x * p.y - this.y * p.x;
	}
	
	clone() {
		return new Point3(this.x, this.y, this.z);
	}
}

class Vertex {
	constructor(point, varyingArray) {
		this.point = point;
		this.varyingArray = varyingArray;
	}
}

class Triangle {
	constructor(p1, p2, p3) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}
}

class Fragment {
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

class Buffer {
	constructor(w, h) {
		this.imageData = new ImageData(w, h);
		this.depth = new Array(w*h);
		this.depth.fill(0);
	}
}

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

mainLoop();

let running = false;
let interval = null;
let button = document.getElementById('start1');
function toggleRenderer1() {
	if (!running) {
		button.innerHTML = "Stop";
		interval = setInterval(mainLoop, 1000/60.0);
		running = true;
	} else {
		button.innerHTML = "Start";
		clearInterval(interval);
		running = false;
	}
}

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

function drawTriangle(buffer, triangle, fragmentShader) {
	let p1 = triangle.p1.point;
	let p2 = triangle.p2.point;
	let p3 = triangle.p3.point;

	if (p2.y < p1.y && p2.y < p3.y) {
		let tmp = p1;
		p1 = p2;
		p2 = p3;
		p3 = tmp;
	}
	if (p3.y < p2.y && p3.y < p1.y) {
		let tmp = p1;
		p1 = p3;
		p3 = p2;
		p2 = tmp;
	}
	let vL = p2.sub(p1);
	let vR = p3.sub(p1);
	let cr = vL.cross2(vR);

	//keep Clockwise Faces
	//cull Counter Clockwise Faces
	if (cr < 0) {
		return;
	}

	let varyingSlopes = calculateVaryingSlope(triangle);
	if (!varyingSlopes) {
		return;
	}

	let yScanStart = Math.ceil(p1.y);
	let yScanEnd = Math.ceil(Math.min(p2.y, p3.y));
	if (yScanEnd !== yScanStart) {
		let vec1 = p2.sub(p1);
		let vec2 = p3.sub(p1);
		doHalfTri(buffer, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader);
	}
	yScanStart = yScanEnd;
	let vec1, vec2, start1, start2;
	if (p2.y > p3.y) {
		yScanEnd = Math.ceil(p2.y);
		vec1 = p2.sub(p1);
		vec2 = p2.sub(p3);
		start1 = p1;
		start2 = p3;
	} else {
		yScanEnd = Math.ceil(p3.y);
		vec1 = p3.sub(p2);
		vec2 = p3.sub(p1);
		start1 = p2;
		start2 = p1;
	}
	if (yScanStart !== yScanEnd) {
		doHalfTri(buffer, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader);
	}
}

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
		for (let j = low; j < high; j++) {
			let frag = fragmentShader(varyingBase);
			setPixelAlphaBlend(buffer.imageData, j, i, frag.r, frag.g, frag.b, frag.a);
			incrementVaryingX(varyingBase, varyingSlopes);
		}
		sx1 += slope1;
		sx2 += slope2;
	}
}

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

function incrementVaryingX(varying, slopes) {
	for (let i = 0; i < varying.length; i++) {
		varying[i] += slopes[i].dx;
	}
}

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

