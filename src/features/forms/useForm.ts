import {
	startTransition,
	useId,
	useRef,
	useState,
	type ComponentProps,
} from "react"
import { toast } from "react-toastify"
import * as v from "valibot"
import { useToastAction } from "~/components/ToastActionForm.tsx"

export interface FormConfig<Values extends FormValues> {
	initialValues?: Values
	pendingMessage?: string
	successMessage?: string
	action: FormAction<keyof Values>
}

export type FormValues = Partial<
	Record<string, string | number | File | undefined>
>

export type FormAction<Keys extends PropertyKey> = (
	values: FormActionInput<Keys>,
) => Promise<readonly FormError[] | undefined>

export type FormActionInput<Keys extends PropertyKey> = Partial<
	Record<Keys, FormDataEntryValue>
>

export interface FormError {
	message: string
	field?: string
}

export type FormState<Values extends FormValues = FormValues> = ReturnType<
	typeof useForm<Values>
>

export function useForm<Values extends FormValues>(
	options: FormConfig<Values>,
) {
	const [defaultValues, setDefaultValues] = useState<FormValues | undefined>(
		options.initialValues,
	)
	const formRef = useRef<HTMLFormElement | null>(null)

	const [errors, action, pending] = useToastAction<
		readonly FormError[],
		FormData
	>(
		async (_state, formData) => {
			const values = Object.fromEntries(formData)

			// set the new default values so that when react resets the form,
			// the input will use the user's entered values
			// instead of the initial ones
			setDefaultValues(values)

			return await options.action(values as FormActionInput<keyof Values>)
		},
		{
			pendingMessage: options.pendingMessage,
			successMessage: options.successMessage,
		},
	)

	const fieldIdPrefix = useId()
	const fieldId = (name: string) => `${fieldIdPrefix}:${name}`

	const formErrors =
		errors
			?.filter((error) => error.field === undefined)
			.map((error) => error.message) ?? []

	function getFieldErrors(name: keyof Values) {
		return (
			errors
				?.filter((error) => error.field === name)
				.map((error) => error.message) ?? []
		)
	}

	function getFormProps() {
		return {
			action,
			ref: formRef,
		} satisfies ComponentProps<"form">
	}

	function getLabelProps(name: keyof Values) {
		return {
			htmlFor: fieldId(String(name)),
		}
	}

	function getInputProps<Name extends keyof Values>(name: Name) {
		const defaultValue = defaultValues?.[String(name)]
		const props = {
			id: fieldId(String(name)),
			name: String(name),
			defaultValue: defaultValue instanceof File ? undefined : defaultValue,
		}
		return props satisfies ComponentProps<"input">
	}

	return {
		action,
		pending,
		fieldId,
		formErrors,
		getFieldErrors,
		getFormProps,
		getLabelProps,
		getInputProps,
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

export function valibotAction<const Keys extends PropertyKey, ParsedInput>(
	schema: v.GenericSchema<
		Required<FormActionInput<NoInfer<Keys>>>,
		ParsedInput
	>,
	action: (input: ParsedInput) => unknown,
): FormAction<Keys> {
	return async (data) => {
		const result = v.safeParse(schema, data)

		if (result.issues) {
			return result.issues.map((issue) => ({
				field: String(issue.path?.[0].key),
				message: issue.message,
			}))
		}

		try {
			await action(result.output)
		} catch (error) {
			console.error("Form submission failed", error)
			toast.error(
				"Form submission failed. Check the browser console for details.",
			)
			return [{ message: "Unknown submission error" }]
		}
	}
}
