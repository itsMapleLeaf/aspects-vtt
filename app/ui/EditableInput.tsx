import type { ComponentProps } from "react"
import { Input } from "./Input.tsx"
import { LoadingDecoration } from "./LoadingDecoration.tsx"
import { type ClassSlotProps, resolveClasses } from "./classSlots.tsx"
import { type EditableProps, useEditable } from "./useEditable.tsx"

export function EditableInput(
	props: ClassSlotProps<
		"wrapper" | "input",
		EditableProps<ComponentProps<typeof Input>, string>
	>,
) {
	const editable = useEditable(props)
	const classes = resolveClasses(props.className, "wrapper")
	return (
		<LoadingDecoration pending={editable.pending} className={classes.wrapper}>
			<Input
				{...editable.inputProps}
				invalid={props.invalid ?? editable.invalid}
				className={classes.input}
			/>
		</LoadingDecoration>
	)
}
