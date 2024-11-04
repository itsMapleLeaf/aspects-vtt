import { useEffect, useState } from "react"

export function useKeyDown(targetKey: string) {
	const [down, setDown] = useState(false)

	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener(
			"keydown",
			function handleKeyDown(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setDown(true)
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"keyup",
			function handleKeyUp(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setDown(false)
				}
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	}, [targetKey])

	return down
}
