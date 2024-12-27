import { twMerge, type ClassNameValue } from "tailwind-merge"
import { panel } from "~/styles/panel.ts"
import { fadeZoomTransition } from "./transitions.ts"

export const menuPanel = (...classes: ClassNameValue[]) =>
	twMerge(
		panel(),
		fadeZoomTransition(),
		"w-content border-primary-600 bg-primary-700 p-gap flex max-h-[400px] max-w-lg min-w-(--popover-anchor-width) flex-col gap-1 overflow-y-auto rounded-md border shadow-md",
		classes,
	)

export const menuItem = (...classes: ClassNameValue[]) =>
	twMerge(
		"h-control-md px-control-padding-md hover:bg-primary-600 data-active-item:bg-primary-600 flex cursor-default items-center justify-start rounded-sm text-start",
		// this scary class ensures the item padding
		// always aligns with control padding,
		// with respect to the popover side padding
		"px-[calc(var(--spacing-control-padding-md)-(calc(var(--spacing)*1)))]",
		classes,
	)
