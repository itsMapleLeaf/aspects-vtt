import { twMerge } from "tailwind-merge"

export function fadeTransition(on: boolean) {
	return twMerge(
		"transition-all",
		on ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
	)
}

export function fadeZoomTransition(on: boolean) {
	return twMerge(fadeTransition(on), on ? "scale-100" : "scale-95")
}
