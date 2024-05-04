import {
	type ReactNode,
	createContext,
	isValidElement,
	use,
	useEffect,
	useId,
	useMemo,
	useState,
} from "react"
import { twMerge } from "tailwind-merge"
import { useEffectEvent } from "../common/react.ts"
import { twc } from "./twc.ts"

const FieldContext = createContext({
	inputId: "",
	registerConsumer: () => () => {},
})

export const FormLayout = twc.form`flex flex-col gap-3 p-3`

export const FormRow = twc.div`flex flex-wrap gap-3`

export const FormActions = twc.div`flex flex-wrap justify-end gap-3`

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
	const [consumerCount, setConsumerCount] = useState(0)
	const fallbackInputId = useId()
	const inputId = htmlFor || (consumerCount > 0 && fallbackInputId) || ""

	const registerConsumer = useEffectEvent(() => {
		setConsumerCount((it) => it + 1)
		return () => {
			setConsumerCount((it) => it - 1)
		}
	})

	const fieldContext = useMemo(
		() => ({
			inputId,
			registerConsumer,
		}),
		[inputId, registerConsumer],
	)

	return (
		<div className={twMerge("flex flex-col", className)}>
			<div className="select-none font-bold leading-6">
				{isValidElement(label) ? label : inputId ? <label htmlFor={inputId}>{label}</label> : label}
			</div>
			{description && <div className="text-sm/6 font-bold text-primary-700">{description}</div>}
			<FieldContext value={fieldContext}>{children}</FieldContext>
		</div>
	)
}

export function useField() {
	const { registerConsumer, ...field } = use(FieldContext)
	useEffect(() => registerConsumer(), [registerConsumer])
	return field
}
