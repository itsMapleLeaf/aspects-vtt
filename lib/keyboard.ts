import { useEffect, useState } from "react"

export function useKeyPressed(targetKey: string) {
	const [isPressed, setIsPressed] = useState(false)

	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener(
			"keydown",
			function handleKeyDown(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setIsPressed(true)
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"keyup",
			function handleKeyUp(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setIsPressed(false)
				}
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	}, [targetKey])

	return isPressed
}
