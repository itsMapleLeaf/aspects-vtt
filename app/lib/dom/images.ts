import * as React from "react"
import type { Falsy } from "../types.ts"

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
export function loadImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.src = src
		if (image.complete) {
			resolve(image)
		} else {
			image.onload = () => resolve(image)
			image.onerror = () => reject(new Error(`Failed to load image "${src}"`))
		}
		signal?.addEventListener("abort", () => {
			image.onload = null
			image.onerror = null
			image.src = ""
			reject(new Error("Aborted"))
		})
	})
}
