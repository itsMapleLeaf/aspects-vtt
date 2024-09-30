import { type ComponentPropsWithoutRef } from "react"
import { List } from "~/shared/list.ts"
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
			{List.from(form.formErrors)
				.unique()
				.map((error) => (
					<p key={error} className={errorText()}>
						{error}
					</p>
				))}
		</form>
	)
}
