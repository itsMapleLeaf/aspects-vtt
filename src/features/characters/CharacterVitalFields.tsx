import { useId, useState } from "react"
import { twMerge } from "tailwind-merge"
import { NumberInput } from "~/components/NumberInput.tsx"
import { formField } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"

export function CharacterVitalFields({ className }: { className?: string }) {
	const [health, setHealth] = useState(20)
	const [resolve, setResolve] = useState(10)
	const healthId = useId()
	const resolveId = useId()
	return (
		<div className={twMerge("grid grid-cols-2 gap", className)}>
			<div className={formField()}>
				<label htmlFor={healthId}>Health</label>
				<NumberInput
					id={healthId}
					className={textInput()}
					value={health}
					onSubmitValue={setHealth}
				/>
			</div>
			<div className={formField()}>
				<label htmlFor={resolveId}>Resolve</label>
				<NumberInput
					id={resolveId}
					className={textInput()}
					value={resolve}
					onSubmitValue={setResolve}
				/>
			</div>
		</div>
	)
}
