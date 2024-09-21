import { type ComponentPropsWithoutRef } from "react"
import { errorText } from "~/styles/forms.ts"
import type { FormStore } from "./useForm.ts"

export function Form({
	form,
	children,
	...props
}: ComponentPropsWithoutRef<"form"> & {
	form: Pick<FormStore, "submit" | "formErrors">
}) {
	return (
		<form {...props} action={form.submit}>
			{children}
			{[...new Set(form.formErrors)].map((error) => (
				<p key={error} className={errorText()}>
					{error}
				</p>
			))}
		</form>
	)
}
