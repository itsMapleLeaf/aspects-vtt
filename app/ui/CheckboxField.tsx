import * as Lucide from "lucide-react"
import { useId } from "react"
import {
	FormFieldDescription,
	FormFieldLabel,
	FormFieldProvider,
} from "./Form.tsx"

export function CheckboxField({
	label,
	description,
	checked,
	onChange,
}: {
	label: string
	description?: string
	checked: boolean
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
	const id = useId()
	return (
		<FormFieldProvider htmlFor={id}>
			<div className="flex items-center gap-1.5">
				<div className="relative flex size-5 items-center justify-center overflow-clip">
					<input
						className="peer size-full appearance-none rounded border-2 border-primary-400 bg-primary-100 transition checked:bg-primary-300/50 hover:bg-primary-200 checked:hover:bg-primary-300 active:border-primary-600 active:duration-0"
						id={id}
						aria-label={label}
						type="checkbox"
						checked={checked}
						onChange={onChange}
					/>
					<Lucide.X
						className="pointer-events-none invisible absolute size-5 text-primary-700 peer-checked:visible"
						strokeWidth={3}
						absoluteStrokeWidth
					/>
				</div>
				<FormFieldLabel className="flex flex-col">
					{label}
					{description && (
						<FormFieldDescription>{description}</FormFieldDescription>
					)}
				</FormFieldLabel>
			</div>
		</FormFieldProvider>
	)
}
