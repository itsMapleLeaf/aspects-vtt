import { useDisclosureContext } from "@ariakit/react"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import type * as React from "react"
import { api } from "../../../convex/_generated/api"
import { Button } from "../../ui/Button.tsx"
import { FormField, FormLayout } from "../../ui/Form.tsx"
import { NumberInput } from "../../ui/NumberInput.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "../../ui/Popover.tsx"
import { panel } from "../../ui/styles.ts"
import { DiceCounter } from "../dice/DiceCounter.tsx"
import { getDiceInputList } from "../dice/getDiceInputList.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiCharacter } from "./types.ts"

export function StressUpdateMenu({
	children,
	...props
}: {
	characters: ApiCharacter[]
	field: "damage" | "fatigue"
	children: React.ReactElement
}) {
	return (
		<Popover>
			<PopoverTrigger render={children} />
			<PopoverPanel modal>
				<StressUpdateForm {...props} />
			</PopoverPanel>
		</Popover>
	)
}

function StressUpdateForm({
	characters,
	field,
}: { field: "damage" | "fatigue"; characters: ApiCharacter[] }) {
	const room = useRoom()
	const disclosure = useDisclosureContext()
	const applyStress = useMutation(api.characters.functions.applyStress)

	const [values, setValues] = useState<{
		operation: "add" | "remove"
		amount: number
		dice: Record<string, number>
	}>({
		operation: "add",
		amount: 0,
		dice: {},
	})

	return (
		<form
			className="contents"
			action={async () => {
				await applyStress({
					roomId: room._id,
					characterIds: characters.map((it) => it._id),
					amount: values.amount,
					delta: values.operation === "remove" ? -1 : 1,
					dice: getDiceInputList(values.dice).toArray(),
					property: field,
				})
				disclosure?.hide()
			}}
		>
			<FormLayout>
				<fieldset className={panel("grid grid-flow-col auto-cols-fr bg-transparent overflow-clip")}>
					<label className="flex-center-row h-10 gap-1 px-2 text-red-300 opacity-50 transition hover:bg-primary-300/50 has-[:checked]:bg-primary-200 has-[:checked]:opacity-100 has-[:checked]:hover:bg-primary-200">
						<input
							type="radio"
							name="operation"
							className="appearance-none"
							checked={values.operation === "add"}
							onChange={(event) => setValues({ ...values, operation: "add" })}
						/>
						<Lucide.X className="-ml-1" />
						<span>Hurt</span>
					</label>
					<label className="flex-center-row h-10 gap-1 px-2 text-green-300 opacity-50 transition hover:bg-primary-300/50 has-[:checked]:bg-primary-200 has-[:checked]:opacity-100 has-[:checked]:hover:bg-primary-200">
						<input
							type="radio"
							name="operation"
							className="appearance-none"
							checked={values.operation === "remove"}
							onChange={(event) => setValues({ ...values, operation: "remove" })}
						/>
						<Lucide.ChevronsUp className="-ml-1" />
						<span>Heal</span>
					</label>
				</fieldset>
				<FormField label="Amount">
					<NumberInput
						value={values.amount}
						onChange={(amount) => setValues({ ...values, amount })}
						fallback={0}
						className="text-center"
					/>
				</FormField>
				<FormField label="Dice">
					<DiceCounter value={values.dice} onChange={(dice) => setValues({ ...values, dice })} />
				</FormField>
				<Button type="submit" text="Apply" icon={<Lucide.Check />} />
			</FormLayout>
		</form>
	)
}
