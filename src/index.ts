import kaybee from './kaybee.js';

const { Engine, Render, Runner, Bodies, Composite, Body, Collision } = Matter;

const engine = Engine.create({
	gravity: {
		// y: 0,
	},
});
const runner = Runner.create();
const render = Render.create({
	element: document.body,
	engine: engine,
});

const cursor = (() => {
	const position = {
		x: 400,
		y: 400,
	};
	const headWidth = 20;
	const headHeight = 30;
	const tailWidth = 6;
	const tailHeight = 10;

	const head = Bodies.fromVertices(position.x, position.y, [
		[
			// { x: 0, y: -headHeight / 2 },
			// { x: -headWidth / 2, y: headHeight / 2 },
			// { x: headWidth / 2, y: headHeight / 2 },
			{ x: headHeight / 2, y: 0 },
			{ x: -headHeight / 2, y: headWidth / 2 },
			{ x: -headHeight / 2, y: -headWidth / 2 },
		],
	]);
	const tail = Bodies.rectangle(
		// position.x,
		// position.y + headHeight / 2,
		position.x - headHeight / 2,
		position.y,
		tailHeight,
		tailWidth,
	);

	const cursor = Body.create({
		label: 'Cursor',
		parts: [head, tail],
		// angle: -Math.PI / 2,
	});
	Body.setAngle(cursor, -Math.PI / 4);
	return cursor;
})();

// World bounds
const edgeBoundWidth = 100;
const edgeBounds = [
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

const trigger = Bodies.rectangle(400, 300, 500, 50, {
	isSensor: true,
	isStatic: true,
});

const balls = new Array(10).fill(0).map(() => {
	const ball = Bodies.circle(
		Math.random() * render.bounds.max.x,
		Math.random() * render.bounds.max.y,
		Math.random() * 50,
		{
			frictionAir: 0,
			friction: 0,
			restitution: 1,
		},
	);
	Body.applyForce(ball, ball.position, {
		x: Math.random() * 0.1,
		y: Math.random() * 0.1,
	});
	return ball;
});

Composite.add(engine.world, [cursor, trigger, ...edgeBounds, ...balls]);

Runner.run(runner, engine);
Render.run(render);

function boost(backwards = false) {
	const magnitude = 0.006 * (backwards ? -1 : 1);
	Body.applyForce(cursor, cursor.position, {
		x: Math.cos(cursor.angle) * magnitude,
		y: Math.sin(cursor.angle) * magnitude,
	});
}

// render.canvas.addEventListener('click', (ev) => {
// 	boost(ev.button === 2 ? true : false);
// });

kaybee.start({
	renameKeys: true,
	onKeyDown({ key }) {
		switch (key) {
			case 'space':
			case 'w':
				boost();
				break;

			case 's':
				boost(true);
				break;

			case 'a':
			case 'd':
				{
					const roundedYVel = Math.round(cursor.velocity.y);
					const isOnGround = roundedYVel <= 2 && roundedYVel >= -2;
					const strength = (Math.PI / 4) * (isOnGround ? 0.2 : 0.07);
					const direction = key === 'a' ? -1 : 1;
					const angle = strength * direction;
					Body.setAngularVelocity(cursor, angle);
				}
				break;

			default:
				break;
		}
	},
});

(function loop() {
	requestAnimationFrame(loop);
	if (Collision.collides(trigger, cursor)) {
		engine.timing.timeScale = 0.3;
		console.log('Trigger hit');
	} else engine.timing.timeScale = 1;
})();

// (function inputLoop() {
// 	requestAnimationFrame(inputLoop);
// 	if (kb.getKey('space')) {
// 		Body.applyForce(cursor, cursor.position, {
// 			x: 0,
// 			y: -0.005,
// 		});
// 	}
// })();
