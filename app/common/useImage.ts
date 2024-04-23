import * as React from "react"
import { loadImage } from "#app/common/dom.js"
import type { Falsy } from "#app/common/types.js"

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
