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
import type { Nullish, Overwrite } from "../helpers/types.ts"

export type ClassSlots<Keys extends PropertyKey> = { [K in Keys]?: string }

export type ClassSlotProps<
	Keys extends PropertyKey,
	BaseProps extends object = Record<string, never>,
> = Overwrite<BaseProps, { className?: string | ClassSlots<Keys> }>

export function resolveClasses<Keys extends PropertyKey>(
	prop: Nullish<string | ClassSlots<Keys>>,
	defaultKey: NoInfer<Keys>,
): ClassSlots<Keys> {
	if (prop == null) return {}
	if (typeof prop === "object") return prop
	// @ts-expect-error: not sure why this is an error
	return { [defaultKey]: prop }
}
