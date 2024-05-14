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

export function bindWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	window.addEventListener(eventType, handler, options)
	return () => {
		window.removeEventListener(eventType, handler, options)
	}
}
