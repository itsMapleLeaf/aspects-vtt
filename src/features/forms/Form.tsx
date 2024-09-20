import type { ComponentPropsWithoutRef } from "react"
import { errorText } from "~/styles/forms.ts"
import type { FormState } from "./useForm.ts"

export function Form({
	form,
	children,
	...props
}: ComponentPropsWithoutRef<"form"> & { form: FormState<{}> }) {
	return (
		<form
			{...form.getFormProps()}
			onReset={(event) => event.preventDefault()}
			{...props}
		>
			{[...new Set(form.formErrors)].map((error) => (
				<p key={error} className={errorText()}>
					{error}
				</p>
			))}
			{children}
		</form>
	)
}
