import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { Button } from "#app/ui/Button.js"
import { EmptyState } from "#app/ui/EmptyState.js"
import { Menu, MenuButton, MenuItem, MenuPanel } from "#app/ui/Menu.js"
import { Tooltip } from "#app/ui/Tooltip.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"

export function CombatInitiative() {
	const room = useRoom()

	const updateRoom = useMutation(api.rooms.update).withOptimisticUpdate((store, args) => {
		for (const query of store.getAllQueries(api.rooms.get)) {
			const room = query.value?.value
			if (!room) continue
			if (room._id !== args.id) continue

			const membersById = new Map(room.combat?.members.map((member) => [member._id, member]))
			const newMembers = args.combat?.members?.map((id) => membersById.get(id)).filter(Boolean)

			store.setQuery(
				api.rooms.get,
				{ slug: room.slug },
				{
					ok: true as const,
					value: {
						...room,
						...args,
						combat: room.combat && {
							...room.combat,
							members: newMembers ?? [],
						},
					},
					error: null,
				},
			)
			return
		}
	})

	const characters = useQuery(api.characters.list, { roomId: room._id })
	const combatMembersById = new Map(room.combat?.members.map((member) => [member._id, member]))

	const actions = {
		startCombat: useMutation(api.rooms.combat.start),
		endCombat: useMutation(api.rooms.combat.end),
		advance: useMutation(api.rooms.combat.advance),
		back: useMutation(api.rooms.combat.back),
		reset: useMutation(api.rooms.combat.reset),
		addMember: useMutation(api.rooms.combat.addMember),
		removeMember: useMutation(api.rooms.combat.removeMember),
	}

	const combat = room.combat
	return combat == null ?
			<EmptyState
				icon={<Lucide.ListStart />}
				message="Combat is currently inactive."
				actions={
					<RoomOwnerOnly>
						<Button
							text="Start Combat"
							icon={<Lucide.Swords />}
							onClick={() => actions.startCombat({ id: room._id })}
						/>
					</RoomOwnerOnly>
				}
			/>
		:	<section className="grid gap-3">
				<h3 className="-mb-2 text-3xl font-light">Combat</h3>
				<p className="text-sm font-bold uppercase tracking-wide text-primary-800">
					Round {combat.currentRoundNumber}
				</p>
				<ol className="grid gap-3">
					{combat.members.map((member, index) => (
						<li
							key={member._id}
							className={panel(
								"flex justify-between",
								combat?.currentMemberIndex !== index && "opacity-50",
							)}
							draggable
							onDragStart={(e) => e.dataTransfer.setData("text/plain", member._id)}
							onDragEnd={(e) => e.preventDefault()}
							onDragOver={(e) => e.preventDefault()}
							onDrop={(e) => {
								e.preventDefault()
								const newMembers = [...combat.members]
								const droppedId = e.dataTransfer.getData("text/plain")
								if (!droppedId) return
								const droppedMember = newMembers.find((member) => member._id === droppedId)
								if (!droppedMember) return

								const droppedMemberIndex = newMembers.indexOf(droppedMember)
								newMembers.splice(droppedMemberIndex, 1)
								newMembers.splice(index, 0, droppedMember)
								updateRoom({
									id: room._id,
									combat: { members: newMembers.map((member) => member._id) },
								})
							}}
						>
							<div className="grid gap-1 px-3 py-2">
								<h4 className="text-2xl font-light">{member.displayName}</h4>
								<p className="flex gap-3">
									<Tooltip text="Damage" className="flex gap-1">
										<Lucide.HeartCrack className="text-red-400" />
										<span className="text-lg text-red-400">
											{member.damage}/{member.damageThreshold}
										</span>
									</Tooltip>
									<Tooltip text="Fatigue" className="flex gap-1">
										<Lucide.Brain className="text-purple-400" />
										<span className="text-lg text-purple-400">
											{member.damage}/{member.damageThreshold}
										</span>
									</Tooltip>
								</p>
							</div>
							<RoomOwnerOnly>
								<button
									type="button"
									className="p-2 opacity-50 transition-opacity hover:opacity-100"
									onClick={() => actions.removeMember({ id: room._id, characterId: member._id })}
								>
									<Lucide.X />
								</button>
							</RoomOwnerOnly>
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
							disabled={combat.currentMemberIndex === 0 && combat.currentRoundNumber === 1}
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
										.filter((character) => !combatMembersById.has(character._id))
										.map((character) => (
											<MenuItem
												key={character._id}
												onClick={() =>
													actions.addMember({ id: room._id, characterId: character._id })
												}
											>
												{character.name}
											</MenuItem>
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
}
