const { Body, Bodies } = Matter;

export const cursor = (() => {
	const startPos = {
		x: 400,
		y: 400,
	};
	const headDimensions = {
		w: 20,
		h: 30,
	};
	const tailDimensions = {
		w: 6,
		h: 10,
	};
	const renderStyles = {
		fillStyle: '#fff',
		strokeStyle: '#000',
		lineWidth: 2,
	};

	// X and Y is swapped to make it point to the right
	// because 0 degrees angle points to the right

	const head = Bodies.fromVertices(
		startPos.x,
		startPos.y,
		[
			[
				{ x: headDimensions.h / 2, y: 0 },
				{ x: -headDimensions.h / 2, y: headDimensions.w / 2 },
				{ x: -headDimensions.h / 2, y: -headDimensions.w / 2 },
			],
		],
		{ render: renderStyles },
	);

	const headTailConnectionCover = Bodies.rectangle(
		startPos.x - headDimensions.h / 3,
		startPos.y,
		tailDimensions.h,
		tailDimensions.w,
		{ render: { fillStyle: renderStyles.fillStyle } },
	);

	const tail = Bodies.rectangle(
		startPos.x - headDimensions.h / 2,
		startPos.y,
		tailDimensions.h,
		tailDimensions.w,
		{ render: renderStyles },
	);

	const cursorBody = Body.create({
		label: 'Cursor',
		parts: [head, tail, headTailConnectionCover],
	});

	// Point towards top right
	Body.setAngle(cursorBody, -Math.PI / 4);

	return {
		body: cursorBody,
		boost(backwards = false) {
			const magnitude = 0.006 * (backwards ? -1 : 1);
			Body.applyForce(cursorBody, cursorBody.position, {
				x: Math.cos(cursorBody.angle) * magnitude,
				y: Math.sin(cursorBody.angle) * magnitude,
			});
		},
		turn(direction: -1 | 1) {
			const strength = (Math.PI / 4) * 0.15;
			const angle = strength * direction;
			Body.setAngularVelocity(cursor.body, angle);
		},
	};
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
})();

// function setCursorToMouse({ x, y }: MouseEvent) {
// 	Body.setPosition(cursor.body, { x, y });
// }
// if (cursor.body.isStatic) {
// 	document.body.addEventListener('mousemove', setCursorToMouse);
// }
