import { twMerge, type ClassNameValue } from "tailwind-merge"
import { panel } from "~/styles/panel.ts"
import { fadeZoomTransition } from "./transitions.ts"

export const menuPanel = (...classes: ClassNameValue[]) =>
	twMerge(
		panel(),
		fadeZoomTransition(),
		"w-content flex max-h-[400px] min-w-[--popover-anchor-width] max-w-lg flex-col overflow-y-auto rounded-md border border-primary-600 bg-primary-700 p-gap shadow-md gap-1",
		classes,
	)

export const menuItem = (...classes: ClassNameValue[]) =>
	twMerge(
		"flex h-control-md cursor-default items-center justify-start rounded px-control-padding-md text-start hover:bg-primary-600 data-[active-item]:bg-primary-600",
		// this scary class ensures the item padding
		// always aligns with control padding,
		// with respect to the popover side padding
		"px-[calc(theme(spacing.control-padding-md)-(theme(spacing.1)))]",
		classes,
	)
