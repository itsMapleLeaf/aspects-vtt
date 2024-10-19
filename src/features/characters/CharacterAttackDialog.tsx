import { useMutation, useQuery } from "convex/react"
import { LucideSwords, LucideVenetianMask } from "lucide-react"
import { ComponentProps, useState } from "react"
import { Button } from "~/components/Button.tsx"
import { Checkbox } from "~/components/Checkbox.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { Field } from "~/components/Field.tsx"
import { Select } from "~/components/Select.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter, ProtectedCharacter } from "~/convex/characters.ts"
import { getImageUrl } from "~/features/images/getImageUrl.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { lightPanel } from "~/styles/panel.ts"

export function CharacterAttackDialog({
	characters,
	...props
}: {
	characters: ProtectedCharacter[]
} & ComponentProps<typeof Dialog.Root>) {
	const room = useRoomContext()
	const user = useQuery(api.users.me)
	const allCharacters = useQuery(api.characters.list, { roomId: room._id })

	const attackerOptions = allCharacters
		?.map((it) => it.full)
		.filter(Boolean)
		.filter((attacker) =>
			characters.every((defender) => defender._id !== attacker._id),
		)

	const [attackerId, setAttackerId] = useState<NormalizedCharacter["_id"]>()
	const attacker =
		attackerOptions?.find((it) => it._id === attackerId) ??
		attackerOptions?.find((it) => it.playerId === user?._id) ??
		attackerOptions?.[0]

	const [attributeSelected, setAttributeSelected] =
		useState<keyof NormalizedCharacter["attributes"]>()

	const attribute =
		attributeSelected ??
		(attacker
			? // lol
				(Object.entries(attacker.attributes).toSorted(
					(a, b) => b[1] - a[1],
				)[0]?.[0] as keyof NormalizedCharacter["attributes"])
			: "strength")

	const [pushYourself, setPushYourself] = useState(false)
	const [sneakAttack, setSneakAttack] = useState(false)

	const attack = useMutation(api.characters.attack)

	const [, action] = useToastAction(async () => {
		if (!attacker) {
			throw new Error("Unexpected: no attacker")
		}
		await attack({
			characterIds: characters.map((it) => it._id),
			attackerId: attacker._id,
			attribute,
			pushYourself,
			sneakAttack,
		})
		props.setOpen?.(false)
	})

	return (
		<Dialog.Root {...props}>
			<Dialog.Content
				title="Attack"
				description="I hope you know what you're doing."
			>
				<form action={action} className="contents">
					<Field label="Targets">
						<div className="mt-1 flex flex-wrap gap-4">
							{characters.map((it) => (
								<div key={it._id} className="flex items-center gap-2">
									{it.imageId ? (
										<img
											src={getImageUrl(it.imageId)}
											alt=""
											className={lightPanel("size-8 rounded-full")}
										/>
									) : (
										<div
											className={lightPanel(
												"flex size-8 items-center justify-center rounded-full",
											)}
										>
											<LucideVenetianMask className="size-5" />
										</div>
									)}
									{it.identity?.name ?? "(unknown)"}
								</div>
							))}
						</div>
					</Field>
					<div className="flex gap *:flex-1">
						<Select
							label="Attacker"
							value={attacker?._id ?? ""}
							options={[
								{ name: "Choose one", value: "" },
								...(attackerOptions ?? [])?.map((it) => ({
									name: it.name,
									value: it._id,
								})),
							]}
							onChangeValue={(value) => {
								if (value !== "") setAttackerId(value)
							}}
						/>
						<Select
							label="Attribute / Aspect"
							value={attribute}
							options={[
								{ name: "Strength / Fire", value: "strength" },
								{ name: "Sense / Water", value: "sense" },
								{ name: "Mobility / Wind", value: "mobility" },
								{ name: "Intellect / Light", value: "intellect" },
								{ name: "Wit / Darkness", value: "wit" },
							]}
							onChangeValue={setAttributeSelected}
						/>
					</div>
					<div className="flex gap-2 empty:hidden">
						{attacker && attacker.resolve >= 2 && (
							<Checkbox
								label="Push yourself"
								checked={pushYourself}
								onChange={setPushYourself}
							/>
						)}
						{attacker &&
							attacker.resolve >= 3 &&
							attacker.race === "Renari" && (
								<Checkbox
									label="Sneak Attack"
									checked={sneakAttack}
									onChange={setSneakAttack}
								/>
							)}
					</div>
					{attacker ? (
						<Button type="submit" icon={<LucideSwords />}>
							Attack
						</Button>
					) : (
						<p className="flex h-10 items-center text-center">
							No valid attackers found.
						</p>
					)}
				</form>
			</Dialog.Content>
		</Dialog.Root>
	)
}
