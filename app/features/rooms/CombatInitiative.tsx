import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { withMovedItem } from "#app/common/array.js"
import { applyOptimisticQueryUpdates } from "#app/common/convex.js"
import type { Nullish } from "#app/common/types.js"
import {
	RoomOwnerOnly,
	useCharacter,
	useCharacters,
	useRoom,
} from "#app/features/rooms/roomContext.js"
import { Button } from "#app/ui/Button.js"
import { EmptyState } from "#app/ui/EmptyState.js"
import { FormLayout } from "#app/ui/Form.js"
import { Menu, MenuButton, MenuItem, MenuPanel } from "#app/ui/Menu.js"
import { Select } from "#app/ui/Select.js"
import { Tooltip } from "#app/ui/Tooltip.old.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { UploadedImage } from "../images/UploadedImage.tsx"

export function CombatInitiative() {
	const { combat, ...room } = useRoom()
	const characters = useCharacters()

	const { members, currentMemberId, currentMemberIndex } = useQuery(
		api.rooms.combat.getCombatMembers,
		{
			roomId: room._id,
		},
	) ?? {
		memberIds: [],
		currentMember: null,
		currentMemberIndex: 0,
	}

	const moveMember = useMutation(api.rooms.combat.moveMember).withOptimisticUpdate(
		(store, args) => {
			applyOptimisticQueryUpdates(store, api.rooms.combat.getCombatMembers, (current) => ({
				...current,
				members: withMovedItem(current.members, args.fromIndex, args.toIndex),
			}))
		},
	)

	const setCurrentMember = useMutation(api.rooms.combat.setCurrentMember).withOptimisticUpdate(
		(store, args) => {
			applyOptimisticQueryUpdates(store, api.rooms.combat.getCombatMembers, (current) => ({
				...current,
				currentMemberId: args.characterId,
			}))
		},
	)

	const [animateRef] = useAutoAnimate({
		easing: "ease-out",
	})

	const actions = {
		startCombat: useMutation(api.rooms.combat.start),
		endCombat: useMutation(api.rooms.combat.end),
		advance: useMutation(api.rooms.combat.advance),
		back: useMutation(api.rooms.combat.back),
		reset: useMutation(api.rooms.combat.reset),
		addMember: useMutation(api.rooms.combat.addMember),
		removeMember: useMutation(api.rooms.combat.removeMember),
	}

	const attributes = useAttributes()
	const initiativeAttribute = attributes.find((it) => it.id === combat?.initiativeAttribute)

	if (combat == null) {
		return <CombatEmptyState />
	}

	const isRoundStart = combat.currentRoundNumber === 1 && currentMemberIndex === 0
	const combatMemberIds = new Set(members?.map((it) => it.characterId))

	return (
		<section className="flex h-full flex-col gap-3">
			<h3 className="-mb-2 text-3xl font-light">Combat</h3>
			<p className="text-sm font-bold uppercase tracking-wide text-primary-700">
				<span>Round {combat.currentRoundNumber}</span>
				{initiativeAttribute && (
					<>
						<span> • </span>
						<span>{initiativeAttribute?.name} Initiative</span>
					</>
				)}
			</p>

			<ol className="grid items-start gap-3" ref={animateRef}>
				{members?.map((member, index) => (
					<li key={member.characterId}>
						<CombatMemberItem
							characterId={member.characterId}
							initiative={member.initiative}
							isCurrent={member.characterId === currentMemberId}
							index={index}
							onDrop={(fromIndex) =>
								moveMember({ id: room._id, fromIndex: fromIndex, toIndex: index })
							}
							onSetCurrentMember={(characterId) =>
								setCurrentMember({ id: room._id, characterId: member.characterId })
							}
						/>
					</li>
				))}
			</ol>

			<RoomOwnerOnly>
				<div className="grid auto-cols-fr grid-flow-col gap-3">
					<Button
						text="Reset"
						icon={<Lucide.RotateCcw />}
						onClick={() => actions.reset({ id: room._id })}
					/>
					<Button
						text="Back"
						icon={<Lucide.ChevronsLeft />}
						onClick={() => actions.back({ id: room._id })}
						disabled={isRoundStart}
					/>
					<Button
						text="Advance"
						icon={<Lucide.ChevronsRight />}
						onClick={() => actions.advance({ id: room._id })}
					/>
				</div>
				<div className="grid auto-cols-fr grid-flow-col gap-3">
					{characters && (
						<Menu placement="bottom">
							<Button icon={<Lucide.Plus />} text="Add Member" element={<MenuButton />} />
							<MenuPanel>
								{characters
									.filter((character) => !combatMemberIds.has(character._id))
									.map((character) => (
										<MenuItem
											key={character._id}
											icon={<UploadedImage id={character.imageId} emptyIcon={<Lucide.Ghost />} />}
											text={character.name}
											onClick={() =>
												actions.addMember({ id: room._id, characterId: character._id })
											}
										/>
									))}
							</MenuPanel>
						</Menu>
					)}
					<Button
						text="End Combat"
						icon={<Lucide.X />}
						onClick={() => actions.endCombat({ id: room._id })}
					/>
				</div>
			</RoomOwnerOnly>
		</section>
	)
}

export function CombatMemberItem(props: {
	characterId: Id<"characters">
	initiative: Nullish<number>
	isCurrent: boolean
	index: number
	onDrop: (fromIndex: number) => void
	onSetCurrentMember: (characterId: Id<"characters">) => void
}) {
	const room = useRoom()
	const character = useCharacter(props.characterId)
	const removeMember = useMutation(api.rooms.combat.removeMember)

	const className = panel(
		"h-22 flex w-full items-center justify-between text-start transition-[color,border-color,opacity]",
		props.isCurrent ? "" : "opacity-50",
	)

	const content = (
		<>
			<div className="grid gap-1 px-3 py-2">
				<h4 className="text-2xl font-light">
					{character?.displayName ?? "???"}{" "}
					{room.isOwner && character?.visible !== true && (
						<span className="opacity-50">(hidden)</span>
					)}
				</h4>
				{character && (
					<p className="flex gap-3">
						<Tooltip text="Damage" className="flex gap-1">
							<Lucide.HeartCrack className="text-red-400" />
							<span className="text-lg text-red-400">
								{character.damage}/{character.damageThreshold}
							</span>
						</Tooltip>
						<Tooltip text="Fatigue" className="flex gap-1">
							<Lucide.Brain className="text-purple-400" />
							<span className="text-lg text-purple-400">
								{character.fatigue}/{character.fatigueThreshold}
							</span>
						</Tooltip>
					</p>
				)}
				{props.initiative != null && (
					<aside className="text-sm font-bold uppercase tracking-wide text-primary-600">
						Initiative {props.initiative}
					</aside>
				)}
			</div>
		</>
	)

	if (!room.isOwner) {
		return <div className={className}>{content}</div>
	}

	return (
		<div
			className={className}
			draggable
			onDragStart={(e) => e.dataTransfer.setData("text/plain", `${props.index}`)}
			onDragEnd={(e) => e.preventDefault()}
			onDragOver={(e) => e.preventDefault()}
			onDrop={(e) => {
				e.preventDefault()

				const otherIndex = Number(e.dataTransfer.getData("text/plain"))
				if (!Number.isInteger(otherIndex)) return

				props.onDrop(otherIndex)
			}}
			onDoubleClick={() => props.onSetCurrentMember(props.characterId)}
		>
			{content}
			<button
				type="button"
				className="p-2 opacity-50 transition-opacity hover:opacity-100"
				onClick={() => removeMember({ id: room._id, characterId: props.characterId })}
			>
				<Lucide.X />
			</button>
		</div>
	)
}

function CombatEmptyState() {
	const room = useRoom()
	const startCombat = useMutation(api.rooms.combat.start)
	const attributes = useAttributes()

	const form = useForm({
		defaultValues: {
			initiativeAttribute: attributes.find((it) => it.name.toLowerCase() === "mobility")?.id,
		},
	})

	return (
		<EmptyState icon={<Lucide.ListStart />} message="Combat is currently inactive.">
			<RoomOwnerOnly>
				<FormLayout className="w-full p-0">
					<Select
						{...form.bind("initiativeAttribute")}
						label="Initiative Attribute"
						options={attributes.map((it) => ({
							label: it.name,
							value: it.id,
						}))}
					/>
					<Button
						text="Start Combat"
						className="self-center"
						icon={<Lucide.Swords />}
						onClick={async () => {
							await startCombat({
								id: room._id,
								initiativeAttribute: form.values.initiativeAttribute ?? null,
							})
						}}
					/>
				</FormLayout>
			</RoomOwnerOnly>
		</EmptyState>
	)
}

function useAttributes() {
	const notionImports = useQuery(api.notionImports.get)
	return notionImports?.attributes ?? []
}

function useForm<Values>(options: {
	defaultValues: Partial<Values>
}) {
	const [values, setValues] = useState<Partial<Values>>({})

	const resolvedValues = {
		...options.defaultValues,
		...values,
	}

	return {
		values: resolvedValues,
		bind<F extends keyof Values>(field: F) {
			return {
				value: resolvedValues[field],
				onChange(eventOrValue: Values[F] | { target: { value: Values[F] } }) {
					setValues((values) => {
						const value =
							typeof eventOrValue === "object" && eventOrValue !== null && "target" in eventOrValue
								? eventOrValue.target.value
								: eventOrValue
						return { ...values, [field]: value }
					})
				},
			}
		},
	}
}
