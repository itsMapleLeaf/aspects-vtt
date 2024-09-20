import { startTransition, useId, useRef, type ComponentProps } from "react"
import * as v from "valibot"
import { useToastAction } from "~/components/ToastActionForm.tsx"

export interface UseFormOptions<
	Values extends Record<string, string | number>,
	Parsed,
	SubmissionData,
> {
	initialValues?: Values
	pendingMessage?: string
	successMessage?: string

	validate: (values: Record<string, FormDataEntryValue>) => Validation<Parsed>

	action: (data: Parsed) => SubmissionData | PromiseLike<SubmissionData>
}

interface FormError {
	field?: string
	message: string
}

type Validation<Parsed> =
	| { type: "success"; data: Parsed }
	| { type: "error"; errors: readonly FormError[] }

type Submission<Data> =
	| { type: "success"; data: Awaited<Data>; errors?: undefined }
	| { type: "error"; data?: undefined; errors: readonly FormError[] }

export type UseFormReturn<
	Values extends Record<string, string | number>,
	Parsed,
	SubmissionData,
> = ReturnType<typeof useForm<Values, Parsed, SubmissionData>>

export function useForm<
	Values extends Record<string, string | number>,
	Parsed,
	SubmissionData,
>(options: UseFormOptions<Values, Parsed, SubmissionData>) {
	const formRef = useRef<HTMLFormElement | null>(null)

	const [submission, action, pending] = useToastAction<
		Submission<SubmissionData>,
		FormData
	>(
		async (_state, formData) => {
			const rawValues = Object.fromEntries(
				[...formData.entries()].filter(([, value]) => {
					if (typeof value === "string" && value.trim() === "") return false
					if (value instanceof File && value.size === 0) return false
					return true
				}),
			)

			const validateResult = options.validate(rawValues)
			if (validateResult.type === "error") {
				return validateResult
			}

			const submissionData = await options.action(validateResult.data)

			return { type: "success", data: submissionData } as const
		},
		{
			pendingMessage: options.pendingMessage,
			successMessage: options.successMessage,
		},
	)

	const fieldIdPrefix = useId()
	const fieldId = (name: string) => `${fieldIdPrefix}:${name}`

	return {
		initialValues: options.initialValues,
		formRef,
		submission,
		action,
		pending,
		fieldId,
		submit: async () => {
			const form = formRef.current
			if (!form) {
				throw new Error("form ref not set")
			}
			startTransition(() => {
				action(new FormData(form))
			})
		},
	}
}

export function getFormProps(
	form: UseFormReturn<Record<string, string | number>, unknown, unknown>,
) {
	return {
		action: form.action,
		ref: form.formRef,
	} satisfies ComponentProps<"form">
}

export function getLabelProps<Values extends Record<string, string | number>>(
	form: UseFormReturn<Values, unknown, unknown>,
	name: keyof Values & string,
) {
	return {
		htmlFor: form.fieldId(name),
	}
}

export function getInputProps<
	Values extends Record<string, string | number>,
	Name extends Extract<keyof Values, string>,
>(form: UseFormReturn<Values, unknown, unknown>, name: Name) {
	return {
		id: form.fieldId(name),
		name: name,
		defaultValue: form.initialValues?.[name] as Values[Name] | undefined,
	} satisfies ComponentProps<"input">
}

export function valibotValidator<Output>(
	schema: v.GenericSchema<Record<string, number | FormDataEntryValue>, Output>,
) {
	return (data: Record<string, FormDataEntryValue>): Validation<Output> => {
		const result = v.safeParse(schema, data)
		return result.success ?
				{
					type: "success",
					data: result.output,
				}
			:	{
					type: "error",
					errors: result.issues.map((issue) => ({
						field: String(issue.path?.[0].key),
						message: issue.message,
					})),
				}
	}
}
