import { UserButton } from "@clerk/remix"
import * as FloatingUI from "@floating-ui/react-dom"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type RefObject, createContext, use, useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { CharactersPanel } from "#app/features/characters/CharactersPanel.js"
import { MessageForm } from "#app/features/messages/MessageForm.js"
import { MessageList } from "#app/features/messages/MessageList.js"
import { CombatInitiative } from "#app/features/rooms/CombatInitiative.js"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import type { ViewportController } from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { DefinitionList } from "#app/ui/DefinitionList.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { Tooltip, type TooltipProps } from "#app/ui/Tooltip.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"

export default function RoomIndexRoute() {
	const currentUrl = useHref(useLocation())
	const viewportRef = useRef<ViewportController>(null)
	const [drawingArea, setDrawingArea] = useState(false)
	return (
		<>
			<JoinRoomEffect />

			<div className="fixed inset-0 -z-10">
				<TokenMap
					viewportRef={viewportRef}
					drawingArea={drawingArea}
					onFinishDrawingArea={() => setDrawingArea(false)}
				/>
			</div>

			<div className="flex-center-col h-16 items-stretch border-b border-primary-300 bg-primary-100/75 px-4 shadow shadow-black/50 backdrop-blur">
				<AppHeader>
					<UserButton afterSignOutUrl={currentUrl} />
				</AppHeader>
			</div>

			<Toolbar>
				<ToolbarPopoverButton text="Chat" icon={<Lucide.MessageCircle />}>
					<div className="h-[960px]">
						<MessagesPanel />
					</div>
				</ToolbarPopoverButton>
				<ToolbarPopoverButton text="Characters" icon={<Lucide.VenetianMask />}>
					<div className="h-[960px]">
						<CharactersPanel />
					</div>
				</ToolbarPopoverButton>
				<ToolbarPopoverButton text="Combat Initiative" icon={<Lucide.ListStart />}>
					<div className="p-4">
						<CombatInitiative />
					</div>
				</ToolbarPopoverButton>

				<ToolbarSeparator />

				<ToolbarPopoverButton text="General Skills" icon={<Lucide.Hammer />}>
					<div className="p-4">
						<GeneralSkillsList />
					</div>
				</ToolbarPopoverButton>

				<ToolbarPopoverButton text="Combat Info" icon={<Lucide.Swords />}>
					<div className="p-4">
						<CombatDetails />
					</div>
				</ToolbarPopoverButton>

				<ToolbarPopoverButton text="Critical Injuries" icon={<Lucide.HeartCrack />}>
					<div className="p-4">
						<CriticalInjuryDetails />
					</div>
				</ToolbarPopoverButton>

				<ToolbarSeparator />

				<ToolbarButton
					text="Draw Area"
					icon={<Lucide.SquareDashedMousePointer />}
					onClick={() => setDrawingArea(true)}
				/>

				<ToolbarButton
					text="Reset View"
					icon={<Lucide.Compass />}
					onClick={() => viewportRef.current?.resetView()}
				/>

				<ToolbarSeparator />

				<RoomOwnerOnly>
					<ToolbarPopoverButton text="Settings" icon={<Lucide.Cog />}>
						<RoomSettingsForm />
					</ToolbarPopoverButton>
				</RoomOwnerOnly>
			</Toolbar>
		</>
	)
}

const ToolbarRefContext = createContext<RefObject<HTMLDivElement>>({ current: null })

function Toolbar(props: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)
	return (
		<nav
			aria-label="Toolbar"
			ref={ref}
			className={panel(
				"fixed inset-y-0 left-2 my-auto flex h-max flex-col gap-1 rounded-md bg-primary-100/75 p-2 shadow-md shadow-black/50 backdrop-blur",
			)}
		>
			<ToolbarRefContext.Provider value={ref}>{props.children}</ToolbarRefContext.Provider>
		</nav>
	)
}

function ToolbarButton(props: TooltipProps & { icon: React.ReactNode }) {
	return (
		<Tooltip
			placement="right"
			middleware={[
				FloatingUI.offset(16),
				FloatingUI.shift({
					crossAxis: true,
					padding: 8,
				}),
			]}
			{...props}
			className={twMerge(
				"flex-center rounded p-2 text-primary-900 opacity-50 transition *:size-6  hover:bg-primary-100 hover:opacity-100",
				props.className,
			)}
		>
			{props.icon}
		</Tooltip>
	)
}

function ToolbarPopoverButton(props: {
	text: string
	icon: React.ReactNode
	children: React.ReactNode
}) {
	const toolbarRef = use(ToolbarRefContext)
	return (
		<Popover placement="right">
			<PopoverTrigger
				render={({ ref, ...rest }) => <ToolbarButton {...rest} {...props} buttonRef={ref} />}
			/>
			<PopoverPanel
				gutter={8}
				autoFocusOnHide={false}
				getAnchorRect={() => toolbarRef.current?.getBoundingClientRect() ?? null}
				className="max-h-[calc(100dvh-2rem)] w-[420px] overflow-y-auto"
			>
				{props.children}
			</PopoverPanel>
		</Popover>
	)
}

function ToolbarSeparator() {
	return <hr className="border-primary-300 first:hidden last:hidden" />
}

function CombatDetails() {
	return (
		<ul className="flex list-inside list-disc flex-col gap-1.5">
			<li>Make one action</li>
			<li>Take 1 fatigue → one extra action</li>
			<li>
				Move meters <abbr title="less than or equal to">≤</abbr> mobility
			</li>
		</ul>
	)
}

function CriticalInjuryDetails() {
	return (
		<div className="-my-3 *:mb-3">
			<section>
				<h3 className="-mx-3 mb-3 border-b border-primary-300 bg-primary-100 p-4 text-lg font-bold">
					Damage
				</h3>
				<DefinitionList
					items={[
						{
							name: "Internal Bleeding",
							description: "Any time you take damage, double it.",
						},
						{
							name: "Broken Bone",
							description: "Subtract 1d12 movement each turn to a minimum of 1.",
						},
						{
							name: "Concussion",
							description:
								"Double the modifier value of snag dice for Sense, Intellect, and Wit rolls.",
						},
						{
							name: "Dislocation",
							description: "Subtract 1d12 from the effect of your strength and mobility rolls.",
						},
						{
							name: "Pulled Muscle",
							description: "Immediately take 1d6 additional damage.",
						},
						{
							name: "Overexerted",
							description: "All of your action rolls use a 1d4.",
						},
					]}
				/>
			</section>

			<section>
				<h3 className=" -mx-3 mb-3 border-y border-primary-300 bg-primary-100 p-4 text-lg font-bold">
					Fatigue
				</h3>
				<DefinitionList
					items={[
						{
							name: "Crippling Migraine",
							description: "You must take one fatigue before making any action.",
						},
						{
							name: "Panic Attack",
							description: "Immediately take 1d6 hits of fatigue.",
						},
						{
							name: "Neural Stunlock",
							description: "Double the modifier value of snag dice for intellect rolls.",
						},
						{
							name: "Exhaustion",
							description: "The effect of your wit and intellect rolls is 1.",
						},
						{
							name: "Confusion",
							description: "Your sense, intellect, and wit rolls use a 1d4.",
						},
						{
							name: "Sensory Overload",
							description: "The effect of your sense rolls is 1.",
						},
					]}
				/>
			</section>
		</div>
	)
}

function JoinRoomEffect() {
	const room = useRoom()
	const user = useQuery(api.auth.user)
	const join = useMutation(api.rooms.join)
	const hasJoined = room.players.some((p) => p.clerkId === user?.value?.clerkId)

	useEffect(() => {
		if (!hasJoined) join({ id: room._id })
	}, [room._id, join, hasJoined])

	return null
}

function MessagesPanel() {
	return (
		<div className="flex h-full flex-1 flex-col gap-2 rounded-md p-2">
			<MessageForm />
			<div className="min-h-0 flex-1">
				<MessageList />
			</div>
		</div>
	)
}

function GeneralSkillsList() {
	const notionData = useQuery(api.notionImports.get)
	return (
		<DefinitionList
			items={notionData?.generalSkills.toSorted((a, b) => a.name.localeCompare(b.name))}
		/>
	)
}

function RoomSettingsForm() {
	const room = useRoom()
	const [updateRoomState, updateRoom] = useAsyncState(useMutation(api.rooms.update))
	return (
		<div className="grid gap-2">
			<SetMapBackgroundButton />
			<FormField label="Cell Size" htmlFor="cellSize">
				<Input
					id="cellSize"
					type="number"
					className="w-20"
					value={updateRoomState.args?.mapCellSize ?? room.mapCellSize}
					onChange={(event) => {
						const value = event.currentTarget.valueAsNumber
						if (Number.isNaN(value)) return
						updateRoom({ id: room._id, mapCellSize: Math.max(value, 1) })
					}}
				/>
			</FormField>
			<FormField label="Experience">
				<Input
					type="number"
					value={updateRoomState.args?.experience ?? room.experience}
					min={0}
					step={5}
					onChange={(e) => updateRoom({ id: room._id, experience: Number(e.target.value) })}
				/>
			</FormField>
		</div>
	)
}
