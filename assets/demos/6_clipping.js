
let getTXL = (pA, pB) => {
	return (pB.x + pB.w) / (pB.x - pA.x + pB.w - pA.w);
}

let getTYL = (pA, pB) => {
	return (pB.y + pB.w) / (pB.y - pA.y + pB.w - pA.w);
}

let getTZL = (pA, pB) => {
	return (pB.z + pB.w) / (pB.z - pA.z + pB.w - pA.w);
}

let getTXH = (pA, pB) => {
	return (pB.w - pB.x) / (-pB.x + pA.x + pB.w - pA.w);
}

let getTYH = (pA, pB) => {
	return (pB.w - pB.y) / (-pB.y + pA.y + pB.w - pA.w);
}

let getTZH = (pA, pB) => {
	return (pB.w - pB.z) / (-pB.z + pA.z + pB.w - pA.w);
}

let getX = (p) => p.point.x;
let getY = (p) => p.point.y;
let getZ = (p) => p.point.z;
let getNX = (p) => -p.point.x;
let getNY = (p) => -p.point.y;
let getNZ = (p) => -p.point.z;

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
	constructor(ctx, w, h) {
		this.imageData = ctx.createImageData(w, h);
		this.depth = new Array(w*h);
		this.depth.fill(1);
	}
	
	clear() {
		this.imageData.data.fill(0);
		this.depth.fill(1);
	}
}

class Vertex {
	constructor(point, attributes, varyingArray) {
		this.point = point;
		this.varyingArray = varyingArray || [];
		this.attributes = attributes;
	}

	clone() {
		return new Vertex(this.point.clone(), this.attributes, this.varyingArray.slice(0));
	}
}

class Point4 {
	constructor(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
	}

	static fromPoint3(p3, w) {
		return new Point4(p3.x, p3.y, p3.z, w);
	}

	normalizeW() {
		this.x = this.x / this.w;
		this.y = this.y / this.w;
		this.z = this.z / this.w;
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

	scale(s) {
		return new Point4(this.x * s, this.y * s, this.z * s, this.w * s);
	}

	clone() {
		return new Point4(this.x, this.y, this.z, this.w);
	}
}

class Mat4 {
	constructor() {
		this.vals = new Array(16).fill(0);
	}

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

	static scale(x, y, z) {
		let m = new Mat4();
		m.vals[0] = x;
		m.vals[5] = y;
		m.vals[10] = z;
		m.vals[15] = 1;
		return m;
	}

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

	static rotateX(r) {
		let m = new Mat4();
		m.vals[0] = 1;
		m.vals[15] = 1;
		
		m.vals[5] = Math.cos(r);
		m.vals[6] = Math.sin(r);
		m.vals[9] = -Math.sin(r);
		m.vals[10] = Math.cos(r);
		return m;
	}

	static rotateY(r) {
		let m = new Mat4();
		m.vals[5] = 1;
		m.vals[15] = 1;
		
		m.vals[0] = Math.cos(r);
		m.vals[2] = Math.sin(r);
		m.vals[8] = -Math.sin(r);
		m.vals[10] = Math.cos(r);
		return m;
	}

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

	static perspective(w, h, near, far, fov) {
		let r = Math.tan(fov / 2);
		let t = r * h / w;
		let v00 = 1 / r;
		let v11 = 1 / t;
		let v22 = (far + near) / (near - far);
		let v23 = 2 * far * near / (near - far);
		let v32 = -1;
	
		let m = new Mat4();
		m.vals[0] = v00;
		m.vals[5] = v11;
		m.vals[10] = v22;
		m.vals[11] = v23;
		m.vals[14] = v32;
		return m;
	}

}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

let val = 0;
let buffer = new Buffer(ctx, width, height);
let perspective = Mat4.perspective(width, height, .1, 1000, Math.PI / 2);

let fragShader = (varyings) => {
	let r = getVarying(varyings, 0);
	let g = getVarying(varyings, 1);
	let b = getVarying(varyings, 2);
	let a = getVarying(varyings, 3);
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);

	if ((Math.floor(u * 10) + Math.floor(v * 10)) % 2 == 0) {
		return new Fragment(g, b, r, a);
	} else {
		return new Fragment(r, g, b, a);
	}
}

let vertexShader = (vertex, uniforms) => {
	let newPoint = Point4.fromPoint3(vertex.point, 1);
	newPoint = uniforms.projMatrix.multVec4(uniforms.modelMatrix.multVec4(newPoint));
	return new Vertex(newPoint, [], vertex.attributes.slice());
}

let v1 = new Vertex(new Point3(-1, -1, 0), [255, 0, 0, 255, 0, 0]);
let v2 = new Vertex(new Point3(1, -1, 0), [0, 255, 0, 255, 1, 0]);
let v3 = new Vertex(new Point3(1, 1, 0), [0, 0, 255, 255, 1, 1]);
let v4 = new Vertex(new Point3(-1, 1, 0), [0, 0, 0, 255, 0, 1]);

let tri1 = new Triangle(v1, v2, v3);
let tri2 = new Triangle(v1, v3, v4);

let tri3 = new Triangle(v2, v1, v3);
let tri4 = new Triangle(v3, v1, v4);

let square = [tri1, tri2, tri3, tri4];

function mainLoop() {
	val += .01;

	let zOffs = Math.sin(val*2.5) - 1;

	let translate = Mat4.translate(0, 0, zOffs);
	let translate2 = Mat4.translate(0, 0, -1);
	let scale = Mat4.scale(.3, .3, .3);
	let rotate = Mat4.rotateX(val);
	let rotate2 = Mat4.rotateX(val * 1.532);
	let uniforms = {modelMatrix: translate.mult(scale.mult(rotate)), projMatrix: perspective};
	let uniforms2 = {modelMatrix: translate2.mult(scale.mult(rotate2)), projMatrix: perspective};

	drawTriangles(buffer, square, vertexShader, fragShader, uniforms);
	drawTriangles(buffer, square, vertexShader, fragShader, uniforms2);

	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
}

mainLoop();

let running = false;
let interval = null;
let button = document.getElementById('start');
function toggleRenderer() {
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

function clipTriangles(tris, getV, getT, checkW) {
	let ret = [];
	for (let i = 0; i < tris.length; i++) {
		let tri = tris[i];
		//clip for z/w <= -1
		let p1b = (getV(tri.p1) / tri.p1.point.w <= -1);
		let p2b = (getV(tri.p2) / tri.p2.point.w <= -1);
		let p3b = (getV(tri.p3) / tri.p3.point.w <= -1);
		
		if (checkW) {
			p1b = p1b || tri.p1.point.w <= 0;
			p2b = p2b || tri.p2.point.w <= 0;
			p3b = p3b || tri.p3.point.w <= 0;
		}
		if (!p1b && !p2b && !p3b) {
			ret.push(tri);
			continue;
		}
		if (p1b && p2b && p3b) {
			continue;
		}

		//if we got here, part of the triangle is on the wrong side of the line
		let twoBehind = false;
		if (p2b && !p1b) {
			//rotate left
			let tmp = tri.p1;
			tri.p1 = tri.p2;
			tri.p2 = tri.p3;
			tri.p3 = tmp;
			twoBehind = p3b;
		} else if (p3b && !p2b) {
			//rotate right
			let tmp = tri.p3;
			tri.p3 = tri.p2;
			tri.p2 = tri.p1;
			tri.p1 = tmp;
			twoBehind = p1b;
		} else {
			twoBehind = p2b;
		}

		if (twoBehind) {
			//first two verts are getting clipped
			//results in one triangle
			let tA = getT(tri.p1.point, tri.p3.point);
			let tB = getT(tri.p2.point, tri.p3.point);
			tri.p1.point = tri.p1.point.scale(tA).add(tri.p3.point.scale(1-tA));
			tri.p2.point = tri.p2.point.scale(tB).add(tri.p3.point.scale(1-tB));
			for (let i = 0; i < tri.p1.varyingArray.length; i++) {
				tri.p1.varyingArray[i] = tri.p1.varyingArray[i] * tA + tri.p3.varyingArray[i] * (1 - tA);
				tri.p2.varyingArray[i] = tri.p2.varyingArray[i] * tB + tri.p3.varyingArray[i] * (1 - tB);
			}
			ret.push(tri);
		} else {
			//only the first vert is getting clipped
			//results in two triangles
			let tA = getT(tri.p1.point, tri.p2.point);
			let tB = getT(tri.p1.point, tri.p3.point);
			let p12 = tri.p1.point.scale(tA).add(tri.p2.point.scale(1-tA));
			let p13 = tri.p1.point.scale(tB).add(tri.p3.point.scale(1-tB));
			let v12var = new Array(tri.p1.varyingArray.length);
			let v13var = new Array(tri.p1.varyingArray.length);
			for (let i = 0; i < tri.p1.varyingArray.length; i++) {
				v12var[i] = tri.p1.varyingArray[i] * tA + tri.p2.varyingArray[i] * (1 - tA);
				v13var[i] = tri.p1.varyingArray[i] * tB + tri.p3.varyingArray[i] * (1 - tB);
			}
			let v12 = new Vertex(p12, null, v12var);
			let v13 = new Vertex(p13, null, v13var);
			let tri1 = new Triangle(v12.clone(), tri.p2.clone(), tri.p3.clone());
			let tri2 = new Triangle(v12, tri.p3.clone(), v13);
			
			ret.push(tri1, tri2);
		}
	}
	return ret;
}

function drawTriangles(buffer, triangles, vertexShader, fragmentShader, uniforms) {
	for (let i = 0; i < triangles.length; i++) {
		let t = triangles[i];
		let tNext = new Triangle();
		tNext.p1 = vertexShader(t.p1, uniforms);
		tNext.p2 = vertexShader(t.p2, uniforms);
		tNext.p3 = vertexShader(t.p3, uniforms);
		
		let tris = clipTriangles([tNext], getZ, getTZL, true);
		tris = clipTriangles(tris, getNZ, getTZH);
		
		tris = clipTriangles(tris, getX, getTXL);
		tris = clipTriangles(tris, getNX, getTXH);
		
		tris = clipTriangles(tris, getNY, getTYH);
		tris = clipTriangles(tris, getY, getTYL);
		
		for (let j = 0; j < tris.length; j++) {
			drawTriangle(buffer, tris[j], fragmentShader, uniforms);
		}
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

function drawTriangle(buffer, triangle, fragmentShader, uniforms) {
	let p1 = triangle.p1.point;
	let p2 = triangle.p2.point;
	let p3 = triangle.p3.point;

	p1.normalizeW();
	p2.normalizeW();
	p3.normalizeW();

	if (p2.y < p1.y && p2.y <= p3.y) {
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

	//lets rescale the -1 to 1 point x and y coordinates to be buffer coordinates 0 - width and 0 - height
	let xScale = buffer.imageData.width / 2;
	let yScale = buffer.imageData.height / 2;

	p1.x = (p1.x + 1) * xScale;
	p1.y = (p1.y + 1) * yScale;

	p2.x = (p2.x + 1) * xScale;
	p2.y = (p2.y + 1) * yScale;

	p3.x = (p3.x + 1) * xScale;
	p3.y = (p3.y + 1) * yScale;

	let vL = p2.sub(p1);
	let vR = p3.sub(p1);
	let cr = vL.cross2(vR);

	//keep Clockwise Faces
	//cull Counter Clockwise Faces
	if (cr < 0) {
		return;
	}

	perspectiveCorrectTriangleVarying(triangle);
	let varyingSlopes = calculateVaryingSlope(triangle);
	if (!varyingSlopes) {
		return;
	}

	let yScanStart = Math.ceil(p1.y);
	let yScanEnd = Math.ceil(Math.min(p2.y, p3.y));
	if (yScanEnd !== yScanStart) {
		let vec1 = p2.sub(p1);
		let vec2 = p3.sub(p1);
		doHalfTri(buffer, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
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
		doHalfTri(buffer, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
	}
}

function getVarying(base, idx) {
	return base[idx] / base[base.length - 1];
}

function doHalfTri(buffer, scanStart, scanEnd, p1, slope1, p2, slope2, baseVertex, varyingSlopes, fragmentShader, uniforms) {	
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
			let frag = fragmentShader(varyingBase, uniforms);
			if (frag && frag.a !== 0) {
				let depth = varyingBase[varyingBase.length - 2];
				if (depth > -1 && depth < 1) {
					let idx = j + i * buffer.imageData.width;
					if (depth <= buffer.depth[idx]) {
						buffer.depth[idx] = depth;
						setPixelAlphaBlend(buffer.imageData, j, i, frag.r, frag.g, frag.b, frag.a);
					}
				}
			}
			incrementVaryingX(varyingBase, varyingSlopes);
		}
		sx1 += slope1;
		sx2 += slope2;
	}
}

function perspectiveCorrectTriangleVarying(t) {
	let v1 = t.p1.varyingArray;
	let v2 = t.p2.varyingArray;
	let v3 = t.p3.varyingArray;

	for (let i = 0; i < v1.length; i++) {
		v1[i] /= t.p1.point.w;
		v2[i] /= t.p2.point.w;
		v3[i] /= t.p3.point.w;
	}

	v1.push(t.p1.point.z);
	v2.push(t.p2.point.z);
	v3.push(t.p3.point.z);

	v1.push(1/t.p1.point.w);
	v2.push(1/t.p2.point.w);
	v3.push(1/t.p3.point.w);
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

