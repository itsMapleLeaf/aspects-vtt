/**
 * Utilities for customizing the class names of components with many elements.
 *
 * @example
 * 	function Button({
 * 		children,
 * 		...props
 * 	}: ClassSlotProps<"wrapper" | "button", ComponentProps<"div">>) {
 * 		const classes = resolveClasses(className, "wrapper")
 * 		return (
 * 			<div {...props} className={classes.wrapper}>
 * 				<button className={classes.button}>{children}</button>
 * 			</div>
 * 		)
 * 	}
 */
import type { Overwrite } from "../helpers/types.ts"

export type ClassSlotProp<Keys extends string> =
	| Partial<Record<Keys, string>>
	| string
	| null
	| undefined

export type ClassSlotProps<
	Keys extends string,
	BaseProps extends object = Record<string, never>,
> = Overwrite<BaseProps, { className?: ClassSlotProp<Keys> }>

export function resolveClasses<T extends Record<string, string>>(
	classes: Partial<T> | string | null | undefined,
	primary: keyof T,
) {
	return typeof classes === "string" ? { [primary]: classes } : (classes ?? {})
}
