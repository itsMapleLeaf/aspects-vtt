import { twMerge, type ClassNameValue } from "tailwind-merge"

export const fadeTransition = (...classes: ClassNameValue[]) =>
	twMerge(
		"opacity-0 transition duration-100 ease-in data-[enter]:opacity-100 data-[enter]:ease-out",
		classes,
	)

export const fadeZoomTransition = (...classes: ClassNameValue[]) =>
	twMerge(
		fadeTransition(
			"origin-[--popover-transform-origin] scale-95 data-[enter]:scale-100",
		),
		classes,
	)
