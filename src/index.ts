import kaybee from './kaybee.js';
import { cursor } from './cursor.js';

const { Engine, Render, Bodies, Composite, Collision } = Matter;

const engine = Engine.create();
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		background: '#ddd',
		width: Math.floor(innerWidth),
		height: Math.floor(innerHeight),
	},
});

// World bounds
const edgeBounds = (() => {
	const edgeBoundWidth = 100;
	return [
		Bodies.rectangle(
			render.bounds.min.x + render.bounds.max.x / 2,
			render.bounds.min.y + render.bounds.max.y + edgeBoundWidth / 2,
			render.bounds.min.x + render.bounds.max.x,
			edgeBoundWidth,
			{
				isStatic: true,
			},
		),
		Bodies.rectangle(
			render.bounds.min.x + render.bounds.max.x / 2,
			render.bounds.min.x - edgeBoundWidth / 2,
			render.bounds.max.x,
			edgeBoundWidth,
			{
				isStatic: true,
			},
		),
		Bodies.rectangle(
			render.bounds.min.x - edgeBoundWidth / 2,
			render.bounds.min.y + render.bounds.max.y / 2,
			edgeBoundWidth,
			render.bounds.max.x,
			{ isStatic: true },
		),
		Bodies.rectangle(
			render.bounds.min.x + render.bounds.max.x + edgeBoundWidth / 2,
			render.bounds.min.y + render.bounds.max.y / 2,
			edgeBoundWidth,
			render.bounds.max.x,
			{
				isStatic: true,
			},
		),
	];
})();

const trigger = Bodies.rectangle(400, 300, 500, 50, {
	isSensor: true,
	isStatic: true,
});

Composite.add(engine.world, [trigger, cursor.body, ...edgeBounds]);

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

			default:
				break;
		}
	},
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

		if (Collision.collides(trigger, cursor.body)) {
			engine.timing.timeScale = 0.3;
		} else {
			engine.timing.timeScale = 1;
		}

		updateEngine(time);
		Render.world(render);
	}

	loop();
}
