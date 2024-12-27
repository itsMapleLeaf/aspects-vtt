import { ComponentProps, useState } from "react"
import * as v from "valibot"

export function useForm<
	Schema extends v.GenericSchema<Record<string, string>, unknown>,
>(options: { schema: Schema; defaults: v.InferInput<Schema> }) {
	const [values, setValues] = useState(options.defaults)
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const parseResult = v.safeParse(options.schema, values)

	const errors = (
		parseResult.success || !hasSubmitted
			? {}
			: Object.fromEntries(
					parseResult.issues.map(
						(issue) =>
							[
								(issue.path ?? []).map((item) => item.key).join("."),
								issue.message,
							] as const,
					),
				)
	) as Partial<Record<keyof v.InferInput<Schema>, string>>

	const patchValues = (patch: Partial<v.InferInput<Schema>>) => {
		setValues((current) => ({ ...current, ...patch }))
	}

	return {
		values,
		errors,
		action: (handler: (data: v.InferOutput<Schema>) => unknown) => async () => {
			setHasSubmitted(true)
			if (!parseResult.success) return
			await handler(parseResult.output)
		},
		patchValues,
		getInputProps: (name: keyof v.InferInput<Schema> & string) =>
			({
				id: name,
				name,
				value: values[name],
				onChange: (event) => {
					patchValues(
						// @ts-expect-error
						{ [name]: event.currentTarget.value },
					)
				},
			}) satisfies ComponentProps<"input">,
	}
}
