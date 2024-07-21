import { ConvexError } from "convex/values"
import { ComponentProps, ReactNode, useActionState } from "react"
import { mapValues } from "../../lib/object.ts"
import { mergeClassProp } from "./helpers.ts"
import { Slot, SlotProps } from "./slot.tsx"

export function Form({ element = <form />, ...props }: SlotProps) {
	return (
		<Slot element={element} {...mergeClassProp(props, "grid w-full gap-3")} />
	)
}

export function FormField({
	label,
	inputId,
	description,
	descriptionId,
	children,
	...props
}: ComponentProps<"div"> & {
	label: ReactNode
	inputId?: string
	description?: ReactNode
	descriptionId?: string
}) {
	return (
		<div {...mergeClassProp(props, "flex w-full flex-col gap-1 text-left")}>
			<label htmlFor={inputId} className="text-sm font-bold leading-4">
				{label}
			</label>
			{children}
			{description && (
				<p id={descriptionId} className="text-sm leading-4 text-base-400">
					{description}
				</p>
			)}
		</div>
	)
}

export function FormActions(props: SlotProps) {
	return <Slot {...mergeClassProp(props, "flex gap-1")} />
}

export function FormError(props: SlotProps) {
	return (
		<Slot
			{...mergeClassProp(
				props,
				"text-center font-medium text-red-400 empty:hidden",
			)}
		/>
	)
}

export interface FormInputState {
	value: unknown
	[key: string]: unknown
}

export type InputValues<Inputs extends Record<string, FormInputState>> = {
	[Key in keyof Inputs]: Inputs[Key]["value"]
}

export function useForm<Inputs extends Record<string, FormInputState>>({
	inputs,
	action: actionOption,
}: {
	inputs: Inputs
	action: (values: InputValues<Inputs>) => Promise<void>
}) {
	const values = mapValues(
		inputs,
		(input) => input.value,
	) as InputValues<Inputs>

	const [error, action] = useActionState(async function formAction() {
		try {
			await actionOption(values)
		} catch (error) {
			return error instanceof ConvexError
				? error.message
				: "Oops, something went wrong. Try again."
		}
	})

	return {
		inputs,
		values,
		action,
		error,
	}
}
