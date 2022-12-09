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

const cursor = new Cursor(400, 400, engine);

Composite.add(engine.world, [cursor.body, ...walls]);

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

	function loop(time?: number) {
		requestAnimationFrame(loop);
		if (time === undefined) return;

		// Render.lookAt(render, cursor.body, {
		// 	x: 400,
		// 	y: 400,
		// });

		updateEngine(time);
		Render.world(render);
	}

	loop();
}
