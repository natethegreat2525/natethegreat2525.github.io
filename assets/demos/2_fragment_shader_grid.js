let canvas2 = document.getElementById('canvas2');
let ctx2 = canvas2.getContext('2d');
let width2 = canvas2.width;
let height2 = canvas2.height;


let val2 = 0;
let buffer2 = new Buffer(width2, height2);

let fragShaderGrid = (varyings) => {
	if ((Math.floor(varyings[4]) + Math.floor(varyings[5])) % 2 == 0) {
		return new Fragment(0, 0, 0, 255);
	}
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}

function mainLoop2() {
	val2 += .01;
	
	let a = Math.sin(val2 - 1.5 - Math.sin(val2 / 1.3538)) * 100 + 320;
	let b = Math.cos(val2 - 1.5 - Math.sin(val2 / 1.3538)) * 100 + 240;
	
	let c = Math.sin(val2 + 2) * 100 + 320;
	let d = Math.cos(val2 + 2) * 100 + 240;
	
	let e = Math.sin(val2 + 1) * 100 + 320;
	let f = Math.cos(val2 + 1) * 100 + 240;
	
	let v1 = new Vertex(new Point3(a, b, 0), [255, 0, 0, 255, 0, 0]);
	let v2 = new Vertex(new Point3(c, d, 0), [0, 255, 0, 255, 10, 0]);
	let v3 = new Vertex(new Point3(e, f, 0), [0, 0, 255, 255, 10, 10]);

	let tri = new Triangle(v1, v2, v3);
	drawTriangle(buffer, tri, fragShaderGrid);

	ctx2.putImageData(buffer.imageData, 0, 0);
	buffer.imageData.data.fill(0);
}

mainLoop2();

let running2 = false;
let interval2 = null;
let button2 = document.getElementById('start2');
function toggleRenderer2() {
	if (!running2) {
		button2.innerHTML = "Stop";
		interval2 = setInterval(mainLoop2, 1000/60.0);
		running2 = true;
	} else {
		button2.innerHTML = "Start";
		clearInterval(interval2);
		running2 = false;
	}
}

