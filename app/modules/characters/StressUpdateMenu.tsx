import * as Ariakit from "@ariakit/react"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api"
import { Button } from "../../ui/Button.tsx"
import { FormField, FormLayout } from "../../ui/Form.tsx"
import { Modal } from "../../ui/Modal.tsx"
import { NumberInput } from "../../ui/NumberInput.tsx"
import { Select } from "../../ui/Select.tsx"
import { panel } from "../../ui/styles.ts"
import { DiceCounter } from "../dice/DiceCounter.tsx"
import { getDiceInputList } from "../dice/helpers.ts"
import type { ApiCharacter } from "./types.ts"

const stressTypeOptions = [
	{
		id: "health",
		value: ["health"],
		label: "Health",
		icon: <Lucide.Heart />,
	},
	{
		id: "resolve",
		value: ["resolve"],
		label: "Resolve",
		icon: <Lucide.Sun />,
	},
	{
		id: "both",
		value: ["health", "resolve"],
		label: "Health & Resolve",
		icon: <Lucide.Activity />,
	},
] as const

export function StressUpdateMenu({
	children,
	characters,
}: {
	characters: ApiCharacter[]
	children: React.ReactElement
}) {
	const dialog = Ariakit.useDialogStore()
	const applyStress = useMutation(api.characters.functions.applyStress)
	const [amount, setAmount] = useState(0)
	const [dice, setDice] = useState<Record<string, number>>({})
	const [operation, setOperation] = useState<"heal" | "damage">("heal")

	const [stressTypes, setStressTypes] = useState<
		(typeof stressTypeOptions)[number]["value"]
	>(stressTypeOptions[0].value)

	return (
		<Modal trigger={children} title="Update vitality" store={dialog}>
			<form
				className="contents"
				action={async () => {
					await applyStress({
						characterIds: characters.map((it) => it._id),
						amount,
						delta: operation === "damage" ? -1 : 1,
						dice: [...getDiceInputList(dice)],
						properties: [...stressTypes],
					})
					dialog?.hide()
				}}
			>
				<FormLayout>
					<div className="flex flex-wrap gap-2 *:flex-1 *:basis-32">
						<FormField
							label="Amount"
							description="Positive amounts heal, negative amounts hurt."
						>
							<NumberInput
								value={amount}
								onChange={setAmount}
								min={Number.NEGATIVE_INFINITY}
								fallback={0}
								className="text-center"
							/>
						</FormField>
						<Select
							label="Stat"
							options={stressTypeOptions}
							value={stressTypes}
							onChange={setStressTypes}
						/>
					</div>

					<Collapse title="Dice">
						<div className="flex flex-col gap-2">
							<ButtonOptionGroup>
								<ButtonOption
									name="operation"
									type="radio"
									text="Heal"
									icon={<Lucide.Heart />}
									className="text-green-300"
									checked={operation === "heal"}
									onChange={() => setOperation("heal")}
								/>
								<ButtonOption
									name="operation"
									type="radio"
									text="Damage"
									icon={<Lucide.Flame />}
									className="text-red-300"
									checked={operation === "damage"}
									onChange={() => setOperation("damage")}
								/>
							</ButtonOptionGroup>
							<DiceCounter value={dice} onChange={setDice} />
						</div>
					</Collapse>
					<Button type="submit" text="Apply" icon={<Lucide.Check />} />
				</FormLayout>
			</form>
		</Modal>
	)
}

function ButtonOptionGroup({ children }: { children: React.ReactNode }) {
	return (
		<div
			className={panel(
				"flex overflow-clip bg-primary-900 *:flex-1 empty:hidden",
			)}
		>
			{children}
		</div>
	)
}

function ButtonOption({
	text,
	icon,
	name,
	type,
	checked,
	className,
	onChange,
}: {
	text: string
	icon: React.ReactNode
	name: string
	type: "checkbox" | "radio"
	checked: boolean
	className?: string
	onChange: (checked: boolean) => void
}) {
	return (
		<label
			className={twMerge(
				"flex-center-row h-10 px-2 opacity-50 transition gap-1 hover:bg-primary-700/50 has-[:checked]:bg-primary-800 has-[:checked]:opacity-100 has-[:checked]:hover:bg-primary-800",
				className,
			)}
		>
			<input
				type={type}
				name={name}
				className="appearance-none focus-visible:ring-0"
				checked={checked}
				onChange={() => onChange(!checked)}
			/>
			{icon}
			<span>{text}</span>
		</label>
	)
}

function Collapse({
	title,
	children,
}: {
	title: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Ariakit.DisclosureProvider>
			<div className="flex flex-col gap-1">
				<Ariakit.Disclosure className="-m-1 flex rounded p-1 hover:text-primary-300">
					<Lucide.ChevronDown className="[[aria-expanded=true]>&]:rotate-180" />
					<span className="font-bold">{title}</span>
				</Ariakit.Disclosure>
				<Ariakit.DisclosureContent>{children}</Ariakit.DisclosureContent>
			</div>
		</Ariakit.DisclosureProvider>
	)
}
