import { type ReactNode, createContext, isValidElement, use, useId, useMemo } from "react"
import { twMerge } from "tailwind-merge"
import type { Nullish } from "~/helpers/types.ts"
import { useConsumer, useConsumerProvider } from "./ConsumerContext.tsx"
import { twc } from "./twc.ts"

const FieldContext = createContext({
	inputId: "",
})

export const FormLayout = twc.div`flex flex-col gap-3 p-3`

export const FormRow = twc.div`flex flex-wrap gap-3`

export const FormActions = twc.div`flex flex-wrap justify-end gap-3`

export function FormErrors({ errors }: { errors: Nullish<string | Iterable<string>> }) {
	const uniqueErrors: string[] = typeof errors === "string" ? [errors] : [...new Set(errors)]
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
	const consumers = useConsumerProvider()
	const fallbackInputId = useId()
	const inputId = htmlFor || (consumers.count > 0 && fallbackInputId) || ""
	const fieldContext = useMemo(() => ({ inputId }), [inputId])
	return (
		<div className={twMerge("flex flex-col", className)}>
			<div className="select-none font-bold leading-6">
				{isValidElement(label) ?
					label
				: inputId ?
					<label htmlFor={inputId}>{label}</label>
				:	label}
			</div>
			<FieldContext value={fieldContext}>
				<consumers.Provider>{children}</consumers.Provider>
			</FieldContext>
			{description && (
				<div className="mt-1 text-sm/tight font-bold text-primary-700">{description}</div>
			)}
		</div>
	)
}

export function useField() {
	useConsumer()
	return use(FieldContext)
}
