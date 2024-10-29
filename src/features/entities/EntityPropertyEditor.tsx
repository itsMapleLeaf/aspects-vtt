import { useQuery } from "convex/react"
import { useId, useState } from "react"
import { flushSync } from "react-dom"
import { Button } from "~/components/Button.tsx"
import { Checkbox } from "~/components/Checkbox.tsx"
import { Field } from "~/components/Field.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { ScrollArea } from "~/components/ScrollArea.tsx"
import { api } from "~/convex/_generated/api.js"
import { useEntityStoreContext } from "~/features/entities/context.tsx"
import { textInput } from "~/styles/input.ts"
export function EntityPropertyEditor() {
	const entityStore = useEntityStoreContext()
	const result = useQuery(api.entities.get, { selection: entityStore.selected })
	return result == undefined ? (
		<LoadingIcon />
	) : (
		<ScrollArea>
			<div className="flex flex-col gap-3">
				{Object.entries(result?.properties ?? {}).map(([key, property]) =>
					property.type === "boolean" ? (
						<Checkbox key={key} label={key} checked onChange={() => {}} />
					) : (
						<Field key={key} label={key}>
							{property.type === "string" ? (
								<EditableInput
									value={result.docs[0]?.[key]}
									onSubmit={() => {}}
								/>
							) : property.type === "number" ? (
								<NumberInput className={textInput("-outline-offset-2")} />
							) : property.type === "array" ? (
								<div>todo</div>
							) : property.type === "record" ? (
								<div>todo</div>
							) : property.type === "object" ? (
								<div>todo</div>
							) : property.type === "image" ? (
								<div>todo</div>
							) : (
								<p>unknown property type</p>
							)}
						</Field>
					),
				)}
			</div>
		</ScrollArea>
	)
}

function EditableInput({
	value,
	onSubmit,
}: {
	value: string
	onSubmit: (value: string) => void
}) {
	const [state, setState] = useState<"display" | "editing">("display")
	const id = useId()

	return state === "display" ? (
		<Button
			id={id}
			onFocus={() => {
				flushSync(() => {
					setState("editing")
				})
				document.getElementById(id)?.focus()
			}}
		>
			{value}
		</Button>
	) : (
		<input
			id={id}
			className={textInput("-outline-offset-2")}
			defaultValue={value}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === "Escape") {
					event.preventDefault()
					if (event.key === "Enter") {
						onSubmit(event.currentTarget.value)
					}
					flushSync(() => {
						setState("display")
					})
					document.getElementById(id)?.focus()
				}
			}}
			onBlur={(event) => {
				onSubmit(event.currentTarget.value)
				setState("display")
			}}
		/>
	)
}
