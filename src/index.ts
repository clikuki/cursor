const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

const engine = Engine.create();

const boxA = Bodies.rectangle(400, 200, 80, 80);
const boxB = Bodies.rectangle(450, 50, 80, 80);
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
Composite.add(engine.world, [boxA, boxB, ground]);

// runner
const runner = Runner.create();
Runner.run(runner, engine);

// renderer
const render = Render.create({
	element: document.body,
	engine: engine,
});
Render.run(render);

// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d')!;
// document.body.appendChild(canvas);

// canvas.width = 800;
// canvas.height = 500;

// type Vec = [x: number, y: number];
// class Polygon {
// 	pos: Vec = [100, 100];
// 	vel: Vec = [0, 0];
// 	acc: Vec = [0, 0];
// 	hw: number;
// 	hh: number;
// 	dampening = 0.6;
// 	points: Vec[];
// 	constructor(points: Vec[]) {
// 		[this.hw, this.hh] = points
// 			.reduce(
// 				([xList, yList], [x, y]): [number[], number[]] => {
// 					xList.push(x);
// 					yList.push(y);
// 					return [xList, yList];
// 				},
// 				[[], []] as [number[], number[]],
// 			)
// 			.map((list) => {
// 				const min = Math.min(...list);
// 				return (Math.max(...list) - min) / 2 + min;
// 			});
// 		this.points = points.map(([x, y]) => [x - this.hw, y - this.hh]);
// 	}
// 	show(ctx: CanvasRenderingContext2D) {
// 		ctx.save();
// 		ctx.translate(this.pos[0], this.pos[1]);

// 		ctx.strokeStyle = 'black';
// 		ctx.fillStyle = 'white';
// 		const path = new Path2D();
// 		this.points.forEach(([px, py], i) => {
// 			if (!i) path.moveTo(px, py);
// 			else path.lineTo(px, py);
// 		});
// 		path.closePath();
// 		ctx.fill(path);
// 		ctx.stroke(path);

// 		// // show position
// 		// ctx.fillStyle = 'red';
// 		// ctx.beginPath();
// 		// ctx.ellipse(0, 0, 2, 2, 0, 0, Math.PI * 2);
// 		// ctx.fill();

// 		ctx.restore();
// 	}
// 	update() {
// 		this.pos[0] += this.vel[0];
// 		this.pos[1] += this.vel[1];
// 		this.vel[0] += this.acc[0];
// 		this.vel[1] += this.acc[1];
// 		this.acc = [0, 0];
// 	}
// 	edges() {
// 		if (this.pos[0] - this.hw < 0) {
// 			this.pos[0] = this.hw;
// 			this.vel[0] = Math.floor(this.vel[0] * -this.dampening);
// 		} else if (this.pos[0] + this.hh >= canvas.width) {
// 			this.pos[0] = canvas.width - this.hw;
// 			this.vel[0] = Math.floor(this.vel[0] * -this.dampening);
// 		}

// 		if (this.pos[1] - this.hh < 0) {
// 			this.pos[1] = this.hh;
// 			this.vel[1] = Math.floor(this.vel[1] * -this.dampening);
// 		} else if (this.pos[1] + this.hh >= canvas.height) {
// 			this.pos[1] = canvas.height - this.hh;
// 			this.vel[1] = Math.floor(this.vel[1] * -this.dampening);
// 		}
// 	}
// 	addForce(vec: Vec) {
// 		this.acc[0] += vec[0];
// 		this.acc[1] += vec[1];
// 	}
// }

// const cursor = new Polygon([
// 	[0, 0],
// 	[-10, 27],
// 	[-3, 27],
// 	[-3, 35],
// 	[3, 35],
// 	[3, 27],
// 	[10, 27],
// ]);

// let then = Date.now();
// const fpsInterval = 1000 / 60;
// (function loop() {
// 	requestAnimationFrame(loop);
// 	const now = Date.now();
// 	const elapsed = now - then;
// 	if (elapsed > fpsInterval) {
// 		then = now;
// 		canvas.width = canvas.width;
// 		cursor.show(ctx);
// 		cursor.update();
// 		cursor.addForce([0, 1]);
// 		cursor.edges();
// 	}
// })();
