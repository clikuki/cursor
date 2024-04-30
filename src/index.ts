import kaybee from './kaybee.js';
import { Cursor } from './cursor.js';

const { Engine, Render, Bodies, Composite } = Matter;

const engine = Engine.create({
	// gravity: {
	// 	y: 0,
	// },
});
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		background: '#ddd',
		width: Math.floor(innerWidth),
		height: Math.floor(innerHeight),
		hasBounds: true,
	},
});

class Orb {
	private static list: Orb[] = [];
	body: Matter.Body;
	baseColor: string;
	clrProgress = 0;
	constructor(
		x: number,
		y: number,
		r: number,
		color: string,
		// effect: (body: Matter.Body) => void,
	) {
		this.baseColor = color;
		this.body = Bodies.circle(x, y, r, {
			render: { fillStyle: color },
		});
		// Matter.World.remove(engine.world, this.body);
		Orb.list.push(this);
	}
	static pulsate() {
		const speed = 0.5;
		const incVal = (1 / 16) * speed;
		for (const orb of this.list) {
			orb.clrProgress += incVal;
			if (orb.clrProgress >= 2) orb.clrProgress = 0;
			const transparency = Math.min(
				Math.trunc(Math.abs(orb.clrProgress - 1) * 16),
				15,
			);
			const transparencyChar = transparency.toString(16);
			orb.body.render.fillStyle = `${orb.baseColor}${transparencyChar}${transparencyChar}`;
		}
	}
}

// World bounds
const walls = (() => {
	const wallColor = '#14151f';
	function getWall(x: number, y: number, w: number, h: number) {
		return Bodies.rectangle(x, y, w, h, {
			isStatic: true,
			render: {
				fillStyle: wallColor,
				strokeStyle: wallColor,
				lineWidth: 1,
			},
		});
	}
	const wallWidth = 100;
	return (
		[
			[
				render.bounds.min.x + render.bounds.max.x / 2,
				render.bounds.min.y + render.bounds.max.y + wallWidth / 2,
				render.bounds.min.x + render.bounds.max.x + wallWidth * 2,
				wallWidth,
			],
			[
				render.bounds.min.x + render.bounds.max.x / 2,
				render.bounds.min.x - wallWidth / 2,
				render.bounds.max.x + wallWidth * 2,
				wallWidth,
			],
			[
				render.bounds.min.x - wallWidth / 2,
				render.bounds.min.y + render.bounds.max.y / 2,
				wallWidth,
				render.bounds.max.y,
			],
			[
				render.bounds.min.x + render.bounds.max.x + wallWidth / 2,
				render.bounds.min.y + render.bounds.max.y / 2,
				wallWidth,
				render.bounds.max.y,
			],
		] as [number, number, number, number][]
	).map((dim) => getWall(...dim));
})();

const cursor = new Cursor(innerWidth / 2, innerHeight / 2, engine);

const orb = new Orb(200, 500, 10, '#ff0055');

Composite.add(engine.world, [cursor.body, orb.body, ...walls]);

function sleep(t: number) {
	return new Promise((res) => setTimeout(res, t));
}

const timeSlowEffect = {
	isActive: false,
	isCoolingDown: false,
	async activate() {
		if (this.isActive || this.isCoolingDown) return;
		this.isActive = true;
		engine.timing.timeScale = 0.2;

		await sleep(2000);
		this.isActive = false;
		engine.timing.timeScale = 1;
		this.isCoolingDown = true;

		await sleep(5000);
		this.isCoolingDown = false;
	},
};

kaybee.start({
	renameKeys: true,
	onKeyDown({ key }) {
		switch (key) {
			case 'space':
				cursor.boost();
				break;

			case 'a':
			case 'd':
				cursor.turn(key === 'a' ? -1 : 1);
				break;

			case 'q':
				timeSlowEffect.activate();
				break;

			default:
				break;
		}
	},
	// onKeyUp({ key }) {
	// 	switch (key) {
	// 		default:
	// 			break;
	// 	}
	// },
});

{
	let prevTime = NaN;
	const fps = 60;
	const deltaNorm = 1000 / fps;
	const deltaMin = deltaNorm;
	const deltaMax = 1000 / (fps * 0.5);
	const deltaSampleSize = 60;
	let deltaHistory: number[] = [];
	let prevTimeScale = 1;
	function updateEngine(time: number) {
		// dynamic timestep based on wall clock between calls
		let delta: number = time - prevTime || deltaNorm;
		prevTime = time;

		// optimistically filter delta over a few frames, to improve stability
		deltaHistory.push(delta);
		deltaHistory = deltaHistory.slice(-deltaSampleSize);
		delta = Math.min(...deltaHistory);

		// limit delta
		delta = Math.max(Math.min(deltaMax, delta), deltaMin);

		// correction for delta
		let correction = delta / deltaNorm;

		// time correction for time scaling
		if (engine.timing.timeScale === 0) correction = 0;
		else if (prevTimeScale !== 0) {
			correction *= engine.timing.timeScale / prevTimeScale;
		}

		prevTimeScale = engine.timing.timeScale;

		// update
		Engine.update(engine, delta, correction);
	}

	function lerp(a: number, b: number, p: number) {
		return (b - a) * p + a;
	}
	function follow(render: Matter.Render, body: Matter.Body) {
		const viewHeight = render.canvas.height;
		const viewWidth = render.canvas.width;
		const padding = {
			x: (viewWidth / 8) * 5,
			y: (viewHeight / 8) * 5,
		};
		const width = body.bounds.max.x - body.bounds.min.x + 2 * padding.x;
		const height = body.bounds.max.y - body.bounds.min.y + 2 * padding.y;
		const outerRatio = viewWidth / viewHeight;
		const innerRatio = width / height;
		const scaleX = innerRatio > outerRatio ? 1 : outerRatio / innerRatio;
		const scaleY = innerRatio > outerRatio ? innerRatio / outerRatio : 1;
		const percentMove = 0.1;

		render.bounds.min.x = lerp(
			render.bounds.min.x,
			body.bounds.min.x + width / 2 - (width * scaleX) / 2 - padding.x,
			percentMove,
		);
		render.bounds.max.x = lerp(
			render.bounds.max.x,
			body.bounds.min.x +
				width * scaleX +
				width / 2 -
				(width * scaleX) / 2 -
				padding.x,
			percentMove,
		);
		render.bounds.min.y = lerp(
			render.bounds.min.y,
			body.bounds.min.y + height / 2 - (height * scaleY) / 2 - padding.y,
			percentMove,
		);
		render.bounds.max.y = lerp(
			render.bounds.max.y,
			body.bounds.min.y +
				height * scaleY +
				height / 2 -
				(height * scaleY) / 2 -
				padding.y,
			percentMove,
		);
	}

	function loop(time?: number) {
		requestAnimationFrame(loop);
		if (time === undefined) return;

		follow(render, cursor.body);
		Orb.pulsate();

		updateEngine(time);
		Render.world(render);
	}

	loop();
}
