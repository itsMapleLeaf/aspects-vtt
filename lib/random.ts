export function rollDice(faces: number, count: number) {
	let total = 0
	const results = []
	for (let i = 0; i < count; i++) {
		const roll = Math.floor(Math.random() * faces) + 1
		total += roll
		results.push(roll)
	}
	return { total, results }
}
