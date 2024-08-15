import {
	type ComponentProps,
	type ReactNode,
	createContext,
	isValidElement,
	use,
	useId,
} from "react"
import type { Nullish } from "../../common/types.ts"
import { useConsumer, useConsumerProvider } from "./ConsumerContext.tsx"
import { twc } from "./twc.ts"
import { withMergedClassName } from "./withMergedClassName.ts"

const FieldContext = createContext({
	inputId: "",
})

export const FormLayout = twc.div`flex flex-col p-3 gap-3`

export const FormRow = twc.div`flex flex-wrap gap-3`

export const FormActions = twc.div`flex flex-wrap justify-end gap-3`

export function FormErrors({
	errors,
}: {
	errors: Nullish<string | Iterable<string>>
}) {
	const uniqueErrors: string[] =
		typeof errors === "string" ? [errors] : [...new Set(errors)]
	return (
		<div className="flex flex-col gap-1 empty:hidden">
			{uniqueErrors.map((error) => (
				<p key={error} className="text-red-400">
					{error}
				</p>
			))}
		</div>
	)
}

export function FormField({
	label,
	description,
	htmlFor,
	className,
	children,
}: {
	label: ReactNode
	description?: ReactNode
	htmlFor?: string
	className?: string
	children: React.ReactNode
}) {
	return (
		<FormFieldProvider htmlFor={htmlFor}>
			<FormFieldContainer className={className}>
				<FormFieldLabel>{label}</FormFieldLabel>
				{description && (
					<FormFieldDescription>{description}</FormFieldDescription>
				)}
				{children}
			</FormFieldContainer>
		</FormFieldProvider>
	)
}

export function FormFieldProvider({
	children,
	htmlFor,
}: {
	children: React.ReactNode
	htmlFor?: string
}) {
	const consumers = useConsumerProvider()
	const fallbackInputId = useId()
	const inputId = htmlFor || (consumers.count > 0 && fallbackInputId) || ""
	return (
		<FieldContext value={{ inputId }}>
			<consumers.Provider>{children}</consumers.Provider>
		</FieldContext>
	)
}

export function FormFieldContainer(props: ComponentProps<"div">) {
	return <div {...withMergedClassName(props, "flex flex-col")} />
}

export function FormFieldLabel({ children, ...props }: ComponentProps<"div">) {
	const field = useField()
	return (
		<div {...withMergedClassName(props, "select-none font-bold leading-6")}>
			{isValidElement(children) ?
				children
			:	<label htmlFor={field.inputId}>{children}</label>}
		</div>
	)
}

export function FormFieldDescription(props: ComponentProps<"div">) {
	return (
		<div
			{...withMergedClassName(
				props,
				"mb-1 text-sm/tight font-bold text-primary-700",
			)}
		/>
	)
}

export function useField() {
	useConsumer()
	const context = use(FieldContext)
	const fallbackInputId = useId()
	return { ...context, inputId: context.inputId || fallbackInputId }
}
