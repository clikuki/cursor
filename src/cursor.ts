const { Body, Bodies } = Matter;

// Cursor part values
const dimensions = {
	head: {
		w: 20,
		h: 30,
	},
	tail: {
		w: 6,
		h: 10,
	},
};
const renderStyles = {
	fillStyle: '#fff',
	strokeStyle: '#000',
	lineWidth: 2,
};

export class Cursor {
	head: Matter.Body;
	tail: Matter.Body;
	body: Matter.Body;
	engine: Matter.Engine;
	constructor(x: number, y: number, engine: Matter.Engine) {
		this.engine = engine;

		// X and Y is swapped to make it point to the right
		// because 0 degrees angle points to the right
		this.head = Bodies.fromVertices(
			x,
			y,
			[
				[
					{ x: dimensions.head.h / 2, y: 0 },
					{ x: -dimensions.head.h / 2, y: dimensions.head.w / 2 },
					{ x: -dimensions.head.h / 2, y: -dimensions.head.w / 2 },
				],
			],
			{ render: renderStyles },
		);

		this.tail = Bodies.rectangle(
			x - dimensions.head.h / 2,
			y,
			dimensions.tail.h,
			dimensions.tail.w,
			{ render: renderStyles },
		);

		const headTailConnectionCover = Bodies.rectangle(
			x - dimensions.head.h / 3,
			y,
			dimensions.tail.h,
			dimensions.tail.w,
			{ render: { fillStyle: renderStyles.fillStyle } },
		);

		this.body = Body.create({
			label: 'Cursor',
			parts: [this.head, this.tail, headTailConnectionCover],
			friction: 0.3,
		});

		// Point towards top right
		Body.setAngle(this.body, -Math.PI / 4);
	}
	boost(backwards = false) {
		const magnitude =
			(0.006 * (backwards ? -1 : 1)) / this.engine.timing.timeScale;
		Body.applyForce(this.body, this.body.position, {
			x: Math.cos(this.body.angle) * magnitude,
			y: Math.sin(this.body.angle) * magnitude,
		});
	}
	turn(direction: -1 | 1) {
		const strength = 0.15 * direction * this.engine.timing.timeScale;
		Body.setAngularVelocity(this.body, strength);
	}
	// // Possible simpler implementation if convex shape rendering gets fixed
	// const cursor = Bodies.fromVertices(
	// 	position.x,
	// 	position.y,
	// 	[
	// 		[
	// 			// X and Y is swapped to make it point to the right
	// 			// because 0 degrees angle points to the right
	// 			{ x: headHeight / 2, y: 0 },
	// 			{ x: -headHeight / 2, y: headWidth / 2 },
	// 			{ x: -headHeight / 2, y: tailWidth / 2 },
	// 			{ x: -headHeight / 2 - tailHeight, y: tailWidth / 2 },
	// 			{ x: -headHeight / 2 - tailHeight, y: -tailWidth / 2 },
	// 			{ x: -headHeight / 2, y: -tailWidth / 2 },
	// 			{ x: -headHeight / 2, y: -headWidth / 2 },
	// 		],
	// 	],
	// 	{
	// 		render: {
	// 			fillStyle: '#fff',
	// 			strokeStyle: '#000',
	// 			lineWidth: 1,
	// 		},
	// 	},
	// );
}

// function setCursorToMouse({ x, y }: MouseEvent) {
// 	Body.setPosition(cursor.body, { x, y });
// }
// if (cursor.body.isStatic) {
// 	document.body.addEventListener('mousemove', setCursorToMouse);
// }
