import * as Ariakit from "@ariakit/react"
import { usePopoverStore } from "@ariakit/react"
import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type RefObject, createContext, use, useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { useListener } from "#app/common/emitter.js"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { CharactersPanel } from "#app/features/characters/CharactersPanel.js"
import { editCharacterEvent } from "#app/features/characters/events.js"
import { MessageForm } from "#app/features/messages/MessageForm.js"
import { MessageList } from "#app/features/messages/MessageList.js"
import { CombatInitiative } from "#app/features/rooms/CombatInitiative.js"
import { RoomOwnerOnly, useCharacters, useRoom } from "#app/features/rooms/roomContext.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import type { ViewportController } from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { Button } from "#app/ui/Button.js"
import { DefinitionList } from "#app/ui/DefinitionList.js"
import { FormField } from "#app/ui/Form.js"
import { Input } from "#app/ui/Input.js"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { Tooltip, type TooltipProps } from "#app/ui/Tooltip.js"
import { panel, translucentPanel } from "#app/ui/styles.js"
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

			<div
				className={translucentPanel(
					"px-4 rounded-none border-0 border-b h-16 flex flex-col justify-center",
				)}
			>
				<AppHeader
					end={<UserButton afterSignOutUrl={currentUrl} />}
					center={
						<Toolbar>
							<CharactersToolbarButton />

							<ToolbarDialogButton
								text="Chat & Dice"
								icon={<Lucide.MessageSquareMore />}
								defaultOpen
							>
								<ToolbarDialogContent
									className={
										"fixed bottom-0 right-0 top-16 w-[24rem] transition translate-x-4 p-2 opacity-0 data-[enter]:translate-x-0 data-[enter]:opacity-100"
									}
								>
									<div className={translucentPanel("h-full")}>
										<MessagesPanel />
									</div>
								</ToolbarDialogContent>
							</ToolbarDialogButton>

							<ToolbarPopoverButton
								id="combatInitiative"
								text="Combat Initiative"
								icon={<Lucide.ListStart />}
							>
								<div className="p-4">
									<CombatInitiative />
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

							<ToolbarPopoverButton
								id="generalSkills"
								text="General Skills"
								icon={<Lucide.Hammer />}
							>
								<div className="p-4">
									<GeneralSkillsList />
								</div>
							</ToolbarPopoverButton>

							<ToolbarPopoverButton id="combatInfo" text="Combat Info" icon={<Lucide.Swords />}>
								<div className="p-4">
									<CombatDetails />
								</div>
							</ToolbarPopoverButton>

							<ToolbarPopoverButton
								id="criticalInjuries"
								text="Critical Injuries"
								icon={<Lucide.HeartCrack />}
							>
								<div className="p-4">
									<CriticalInjuryDetails />
								</div>
							</ToolbarPopoverButton>

							<ToolbarSeparator />

							<RoomOwnerOnly>
								<ToolbarPopoverButton id="settings" text="Settings" icon={<Lucide.Settings />}>
									<RoomSettingsForm />
								</ToolbarPopoverButton>
							</RoomOwnerOnly>
						</Toolbar>
					}
				/>
			</div>

			<CombatTurnBanner />
		</>
	)
}

function CharactersToolbarButton() {
	const store = Ariakit.useDialogStore({ defaultOpen: true })
	useListener(editCharacterEvent, () => store.show())
	return (
		<ToolbarDialogButton text="Characters" icon={<Lucide.Users2 />} store={store}>
			<ToolbarDialogContent
				className={
					"fixed bottom-0 left-0 top-16 w-[24rem] transition -translate-x-4 p-2 opacity-0 data-[enter]:translate-x-0 data-[enter]:opacity-100"
				}
			>
				<div className={translucentPanel("h-full")}>
					<CharactersPanel />
				</div>
			</ToolbarDialogContent>
		</ToolbarDialogButton>
	)
}

const ToolbarContext = createContext<{
	ref: RefObject<HTMLDivElement>
	popoverId: string | undefined
	open: (id: string) => void
	close: () => void
}>({
	ref: { current: null },
	popoverId: undefined,
	open: () => {},
	close: () => {},
})

function Toolbar(props: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)
	const [popoverId, setPopoverId] = useState<string>()
	return (
		<nav aria-label="Toolbar" ref={ref} className="flex gap-1 p-1">
			<ToolbarContext.Provider
				value={{ ref, popoverId, open: setPopoverId, close: () => setPopoverId(undefined) }}
			>
				{props.children}
			</ToolbarContext.Provider>
		</nav>
	)
}

function toolbarButtonStyle(className?: string) {
	return twMerge(
		"flex-center rounded p-2 text-primary-900 opacity-50 transition *:size-6  hover:bg-primary-100 hover:opacity-100",
		className,
	)
}

function ToolbarButton({ icon, ...props }: TooltipProps & { icon: React.ReactNode }) {
	return (
		<Tooltip placement="bottom" {...props} className={toolbarButtonStyle(props.className)}>
			{icon}
		</Tooltip>
	)
}

function ToolbarPopoverButton(props: {
	id: string
	text: string
	icon: React.ReactNode
	children: React.ReactNode
}) {
	const context = use(ToolbarContext)

	const popoverStore = usePopoverStore({
		open: context.popoverId === props.id,
		setOpen: (open) => (open ? context.open(props.id) : context.close()),
	})

	return (
		<Popover placement="bottom" store={popoverStore}>
			<PopoverTrigger
				render={({ ref, ...rest }) => <ToolbarButton {...rest} {...props} buttonRef={ref} />}
			/>
			<PopoverPanel
				gutter={8}
				autoFocusOnShow={false}
				autoFocusOnHide={false}
				hideOnInteractOutside={false}
				getAnchorRect={() => context.ref.current?.getBoundingClientRect() ?? null}
				className="relative max-h-[calc(100dvh-2rem)] w-[360px] bg-primary-100/75 backdrop-blur-sm"
			>
				{props.children}
				<Button
					icon={<Lucide.X />}
					title="Close"
					onClick={() => context.close()}
					className="absolute inset-y-0 left-[calc(100%+0.5rem)] my-auto aspect-square opacity-50 hover:opacity-100"
				/>
			</PopoverPanel>
		</Popover>
	)
}

function ToolbarDialogButton({
	children,
	store,
	defaultOpen,
	...props
}: {
	text: string
	icon: React.ReactNode
	children: React.ReactNode
	store?: Ariakit.DialogStore
	defaultOpen?: boolean
}) {
	return (
		<Ariakit.DialogProvider store={store} defaultOpen={store ? undefined : defaultOpen}>
			<Ariakit.DialogDisclosure
				render={({ ref, ...rest }) => <ToolbarButton {...rest} {...props} buttonRef={ref} />}
			/>
			{children}
		</Ariakit.DialogProvider>
	)
}

function ToolbarDialogContent(props: Ariakit.DialogProps) {
	return (
		<Ariakit.Dialog portal modal={false} hideOnInteractOutside={false} unmountOnHide {...props} />
	)
}

function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
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
				<h3 className="-mx-3 mb-3 border-y border-primary-300 bg-primary-100 p-4 text-lg font-bold">
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

function CombatTurnBanner() {
	const room = useRoom()
	const characters = useCharacters()
	const isTurn =
		!room.isOwner && characters.find((c) => c._id === room.combat?.currentMemberId)?.isOwner
	return (
		<div
			className={panel(
				"flex-center fixed inset-x-0 top-20 mx-auto max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md shadow-black/50 transition",
				isTurn && "translate-y-0 opacity-100",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
