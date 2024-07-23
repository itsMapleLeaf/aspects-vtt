import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { Suspense, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Loading } from "~/ui/Loading.tsx"
import { TranslucentPanel } from "~/ui/Panel.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { withMovedItem } from "../../helpers/array.ts"
import { typed, type Nullish } from "../../helpers/types.ts"
import { Button } from "../../ui/Button.tsx"
import { EmptyState } from "../../ui/EmptyState.tsx"
import { FormLayout } from "../../ui/Form.tsx"
import { Select } from "../../ui/Select.tsx"
import { Tooltip } from "../../ui/Tooltip.old.tsx"
import { getAttribute, listAttributes, type Attribute } from "../attributes/data.ts"
import { CharacterSearchList } from "../characters/CharacterSearchList.tsx"
import { queryMutators } from "../convex/helpers.ts"
import { useCurrentSceneTokens } from "../scenes/hooks.ts"
import { RoomOwnerOnly, useCharacter, useCharacters, useRoom } from "./roomContext.tsx"

export function CombatInitiative() {
	const { combat, ...room } = useRoom()
	const characters = useCharacters()

	const {
		members = [],
		currentMemberId,
		currentMemberIndex = 0,
	} = useQuery(api.rooms.combat.functions.getCombatMembers, {
		roomId: room._id,
	}) ?? {}

	const moveMember = useMutation(api.rooms.combat.functions.moveMember).withOptimisticUpdate(
		(store, args) => {
			for (const entry of queryMutators(store, api.rooms.combat.functions.getCombatMembers)) {
				entry.set({
					...entry.value,
					members: withMovedItem(entry.value.members, args.fromIndex, args.toIndex),
				})
			}
		},
	)

	const setCurrentMember = useMutation(
		api.rooms.combat.functions.setCurrentMember,
	).withOptimisticUpdate((store, args) => {
		for (const entry of queryMutators(store, api.rooms.combat.functions.getCombatMembers)) {
			entry.set({
				...entry.value,
				currentMemberId: args.characterId,
			})
		}
	})

	const [animateRef] = useAutoAnimate({
		easing: "ease-out",
	})

	const actions = {
		startCombat: useMutation(api.rooms.combat.functions.start),
		endCombat: useMutation(api.rooms.combat.functions.end),
		advance: useMutation(api.rooms.combat.functions.advance),
		back: useMutation(api.rooms.combat.functions.back),
		reset: useMutation(api.rooms.combat.functions.reset),
		addMember: useMutation(api.rooms.combat.functions.addMember),
		removeMember: useMutation(api.rooms.combat.functions.removeMember),
	}

	const initiativeAttribute =
		combat?.initiativeAttribute && getAttribute(combat.initiativeAttribute)

	if (combat == null) {
		return <CombatEmptyState />
	}

	const isRoundStart = combat.currentRoundNumber === 1 && currentMemberIndex === 0

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

			<ScrollArea className="-mx-3 h-[240px]">
				<ol ref={animateRef} className="divide-y divide-primary-300 px-3 *:py-2">
					{members?.map((member, index) => (
						<li key={member.characterId}>
							<CombatMemberItem
								characterId={member.characterId}
								initiative={member.initiative}
								isCurrent={member.characterId === currentMemberId}
								index={index}
								onDrop={(fromIndex) =>
									moveMember({
										id: room._id,
										fromIndex,
										toIndex: index,
									})
								}
								onSetCurrentMember={(characterId) =>
									setCurrentMember({
										id: room._id,
										characterId: member.characterId,
									})
								}
							/>
						</li>
					))}
				</ol>
			</ScrollArea>

			<RoomOwnerOnly>
				<div className="flex justify-between">
					<Button
						tooltip="Reset"
						icon={<Lucide.RotateCcw />}
						square
						appearance="clear"
						onClick={() => actions.reset({ id: room._id })}
					/>
					{characters && (
						<Popover placement="bottom">
							<Button
								icon={<Lucide.Plus />}
								tooltip="Add Member"
								square
								appearance="clear"
								element={<PopoverTrigger />}
							/>
							<PopoverPanel className="flex min-h-0 w-64 flex-col p-2 gap-2">
								<AddCombatMemberListbox />
							</PopoverPanel>
						</Popover>
					)}
					<Button
						tooltip="End Combat"
						square
						appearance="clear"
						icon={<Lucide.X />}
						onClick={() => actions.endCombat({ id: room._id })}
					/>
					<Button
						tooltip="Back"
						icon={<Lucide.ChevronsLeft />}
						square
						appearance="clear"
						onClick={() => actions.back({ id: room._id })}
						disabled={isRoundStart}
					/>
					<Button
						tooltip="Advance"
						icon={<Lucide.ChevronsRight />}
						square
						appearance="clear"
						onClick={() => actions.advance({ id: room._id })}
					/>
				</div>
			</RoomOwnerOnly>
		</section>
	)
}

function AddCombatMemberListbox() {
	const characters = useCharacters()
	const tokens = useCurrentSceneTokens()
	const room = useRoom()
	const addMember = useMutation(api.rooms.combat.functions.addMember)

	const combatMemberIds = new Set(room.combat?.memberObjects?.map((it) => it.characterId) ?? [])
	const tokenIds = new Set(tokens.map((it) => it.characterId).filter(Boolean))

	const validCharacterIds = new Set(
		characters.map((it) => it._id).filter((it) => tokenIds.has(it) && !combatMemberIds.has(it)),
	)

	return (
		<CharacterSearchList
			characters={characters.filter((it) => validCharacterIds.has(it._id))}
			onSelect={(character) => addMember({ id: room._id, characterId: character._id })}
		/>
	)
}

export function CombatInitiativePanel(props: React.ComponentProps<typeof TranslucentPanel>) {
	const room = useRoom()

	if (!room.combat && !room.isOwner) {
		return null
	}

	return (
		<TranslucentPanel {...withMergedClassName(props, "p-3")}>
			<Suspense fallback={<Loading fill="parent" />}>
				<CombatInitiative />
			</Suspense>
		</TranslucentPanel>
	)
}

function CombatMemberItem(props: {
	characterId: Id<"characters">
	initiative: Nullish<number>
	isCurrent: boolean
	index: number
	onDrop: (fromIndex: number) => void
	onSetCurrentMember: (characterId: Id<"characters">) => void
}) {
	const room = useRoom()
	const character = useCharacter(props.characterId)
	const removeMember = useMutation(api.rooms.combat.functions.removeMember)

	const className = twMerge(
		"flex w-full items-center justify-between text-start transition-[color,border-color,opacity]",
		props.isCurrent ? "" : "opacity-50",
	)

	const content = (
		<>
			<div className="grid">
				<h4 className="text-xl font-light">
					{character?.name ?? "???"}{" "}
					{room.isOwner && character?.visible !== true && (
						<span className="opacity-50">(hidden)</span>
					)}
				</h4>
				<p className="flex items-center gap-2 empty:hidden">
					{character?.health != null && character?.healthMax != null && (
						<Tooltip text="Health" className="flex gap-1">
							<Lucide.Heart className="size-5 text-red-400" />
							<span className="leading-5 text-red-400">
								{character.health}/{character.healthMax}
							</span>
						</Tooltip>
					)}
					{character?.resolve != null && character?.resolveMax != null && (
						<Tooltip text="Resolve" className="flex gap-1">
							<Lucide.Brain className="size-5 text-purple-400" />
							<span className="leading-5 text-purple-400">
								{character.resolve}/{character.resolveMax}
							</span>
						</Tooltip>
					)}
				</p>
				{/* {props.initiative != null && (
					<aside className="mt-1 text-[13px] font-bold uppercase tracking-wide text-primary-600">
						Initiative {props.initiative}
					</aside>
				)} */}
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
	const startCombat = useMutation(api.rooms.combat.functions.start)

	const form = useForm({
		defaultValues: {
			initiativeAttribute: typed<Attribute["id"]>("mobility"),
		},
	})

	return (
		<EmptyState icon={<Lucide.ListStart />} message="Combat is currently inactive.">
			<RoomOwnerOnly>
				<FormLayout className="w-full p-0">
					<Select
						{...form.bind("initiativeAttribute")}
						label="Initiative Attribute"
						options={listAttributes().map((it) => ({
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

function useForm<Values>(options: { defaultValues: Partial<Values> }) {
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
							(
								typeof eventOrValue === "object" &&
								eventOrValue !== null &&
								"target" in eventOrValue
							) ?
								eventOrValue.target.value
							:	eventOrValue
						return { ...values, [field]: value }
					})
				},
			}
		},
	}
}
