import * as React from "react"
import { loadImage } from "./dom.ts"
import type { Falsy } from "./types.ts"

export function useImage(src: string | Falsy) {
	const [image, setImage] = React.useState<HTMLImageElement>()
	React.useEffect(() => {
		if (!src) return
		const controller = new AbortController()
		loadImage(src, controller.signal).then((image) => {
			setImage(image)
		})
		return () => {
			controller.abort()
		}
	}, [src])
	return image
}
