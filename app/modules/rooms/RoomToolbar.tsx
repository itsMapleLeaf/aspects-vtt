import * as Lucide from "lucide-react"
import { type ReactNode, useState } from "react"
import { Button } from "~/ui/Button.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "~/ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { pluralize } from "../../../common/string.ts"
import { CharacterRestForm } from "../characters/CharacterRestForm.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacters } from "../characters/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { QuickReference } from "../game/QuickReference.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import type { RoomToolbarStore } from "./RoomToolbarStore.ts"
import { RoomOwnerOnly } from "./roomContext.tsx"

export function RoomToolbar({ store }: { store: RoomToolbarStore }) {
	const character = useOwnedCharacters()[0]

	const aspect =
		character?.learnedAspectSkills?.length ?
			character?.learnedAspectSkills?.reduce((a, b) =>
				a.aspectSkillIds.length > b.aspectSkillIds.length ? a : b,
			).aspectId
		:	undefined

	// yes, i'm petty
	// prettier-ignore
	const aspectIcon =
		aspect === "fire" ? <Lucide.Flame /> :
		aspect === "water" ? <Lucide.Droplet /> :
		aspect === "wind" ? <Lucide.Wind /> :
		aspect === "light" ? <Lucide.Sun /> :
		aspect === "darkness" ? <Lucide.Moon /> :
		<Lucide.Tornado />

	return (
		<nav aria-label="Toolbar" className="flex gap-2">
			<ToolbarButton
				icon={<Lucide.SquareDashedMousePointer />}
				tooltip="Draw Area"
				active={store.activeTool === "Draw"}
				onClick={store.toggleDrawTool}
			/>

			<ToolbarSeparator />

			<RoomOwnerOnly>
				<ToolbarPopover icon={aspectIcon} tooltip="Aspect Art">
					<AspectArtStats />
				</ToolbarPopover>
			</RoomOwnerOnly>

			{character && (
				<>
					<ToolbarPopover icon={<Lucide.HeartPulse />} tooltip="Status">
						<div className="grid w-48 p-2 gap-2">
							<CharacterStatusFields character={character} />
						</div>
					</ToolbarPopover>
					<ToolbarPopover icon={<Lucide.FlameKindling />} tooltip="Rest">
						<CharacterRestForm character={character} />
					</ToolbarPopover>
				</>
			)}

			<ToolbarSeparator />

			<RoomOwnerOnly>
				<ToolbarPopover icon={<Lucide.CalendarClock />} tooltip="Date & Time">
					<div className="w-96">
						<DateTimeSettingsForm />
					</div>
				</ToolbarPopover>
				<ToolbarPopover icon={<Lucide.Settings />} tooltip="Settings">
					<div className="w-64">
						<RoomSettingsForm />
					</div>
				</ToolbarPopover>
			</RoomOwnerOnly>

			<ToolbarModal icon={<Lucide.HelpCircle />} tooltip="Help">
				<ModalPanel title="Quick Reference" className="max-w-screen-md" fullHeight>
					<ModalPanelContent>
						<QuickReference />
					</ModalPanelContent>
				</ModalPanel>
			</ToolbarModal>
		</nav>
	)
}

function ToolbarButton({
	icon,
	tooltip,
	active,
	onClick,
}: {
	icon: React.ReactNode
	tooltip: string
	active?: boolean
	onClick?: () => void
}) {
	return (
		<Button
			icon={icon}
			tooltip={tooltip}
			appearance="clear"
			size="md"
			square
			active={active}
			onClick={onClick}
		/>
	)
}

function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
}

function ToolbarPopover({
	icon,
	tooltip,
	children,
}: {
	icon: React.ReactNode
	tooltip: string
	children: React.ReactNode
}) {
	return (
		<Popover>
			<PopoverTrigger render={<ToolbarButton icon={icon} tooltip={tooltip} />} />
			<PopoverPanel gutter={16}>{children}</PopoverPanel>
		</Popover>
	)
}

function ToolbarModal({
	icon,
	tooltip,
	children,
}: {
	icon: React.ReactNode
	tooltip: string
	children: React.ReactNode
}) {
	return (
		<ModalProvider>
			<ModalButton render={<ToolbarButton icon={icon} tooltip={tooltip} />} />
			{children}
		</ModalProvider>
	)
}

function AspectArtStats() {
	const modifiers = [
		{
			name: "Area",
			icon: <Lucide.Grid2X2 />,
			description: "Add an area of effect.",
			cost: 2,
			metric: "+3m area size",
		},
		{
			name: "Path",
			icon: <Lucide.Route />,
			description: "Add a path of effect.",
			cost: 1,
			metric: "+5m path length",
		},
		{
			name: "Target",
			icon: <Lucide.Target />,
			description: "Add an additional target.",
			cost: 2,
			metric: "+1 target",
		},
		{
			name: "Range",
			icon: <Lucide.Ruler />,
			description: "Increase your max range.",
			cost: 1,
			metric: "+5m of distance",
		},
		{
			name: "Duration",
			icon: <Lucide.Timer className="translate-y-[-2px]" />,
			description: "Make it last longer.",
			cost: 1,
			metric: "+1 minute / +1 combat round",
		},
	]

	type Modifier = (typeof modifiers)[number]

	const [addedModifiers, addedModifiersActions] = useMap<Modifier["name"], number, number>({
		fallback: () => 0,
	})

	const totalAdded = modifiers.reduce(
		(total, mod) => total + (addedModifiers.get(mod.name) ?? 0) * mod.cost,
		0,
	)

	return (
		<div className="grid w-96 py-3">
			{modifiers.map((mod) => (
				<ModifierRow
					key={mod.name}
					{...mod}
					added={addedModifiers.get(mod.name) ?? 0}
					onAddedChange={(value) => addedModifiersActions.set(mod.name, Math.max(value, 0))}
				/>
			))}

			<div className="flex">
				<div className="flex flex-1 items-center border-r border-r-primary-300/50 px-3 py-2 gap-1.5">
					<h2 className="translate-y-px text-2xl font-light">Total</h2>
				</div>
				<div className="flex-center w-16 py-2 gap-2">
					<p className="text-2xl font-light">{totalAdded}</p>
				</div>
			</div>

			<Button
				icon={<Lucide.RotateCcw />}
				className="mx-3 mt-1.5"
				onClick={() => addedModifiersActions.clear()}
			>
				Clear
			</Button>
		</div>
	)
}

function ModifierRow({
	name,
	icon,
	cost,
	description,
	metric,
	added,
	onAddedChange,
}: {
	name: ReactNode
	icon: ReactNode
	cost: number
	description: ReactNode
	metric: ReactNode
	added: number
	onAddedChange: (value: number) => void
}) {
	return (
		<div className="flex">
			<div className="flex flex-1 items-center border-r border-r-primary-300/50 px-3 py-2 gap-1.5">
				<div className="flex-1">
					<div className="flex items-center gap-1.5">
						<div className="*:size-6">{icon}</div>
						<h2 className="translate-y-px text-2xl font-light">{name}</h2>
					</div>
					<p className="px-0.5 text-lg text-primary-900">{description}</p>
					<p className="px-0.5 text-sm font-bold uppercase tracking-wider text-primary-800">
						{cost} {pluralize("point", cost)} • <span className="inline-block">{metric}</span>
					</p>
				</div>
			</div>

			<div className="flex-center w-16 py-2 gap-2">
				<Button
					icon={<Lucide.ChevronUp />}
					appearance="clear"
					square
					size="sm"
					className="-mx-2 -my-3"
					aria-label="Add"
					onClick={() => onAddedChange(added + 1)}
				></Button>
				<Button
					icon={null}
					appearance="clear"
					aria-label="Current"
					onClick={() => onAddedChange(added + 1)}
					onContextMenu={(event) => {
						event.preventDefault()
						onAddedChange(added - 1)
					}}
				>
					<p className="text-2xl font-light">{added}</p>
				</Button>
				<Button
					icon={<Lucide.ChevronDown />}
					appearance="clear"
					square
					size="sm"
					className="-mx-2 -my-3"
					aria-label="Subtract"
					onClick={() => onAddedChange(added - 1)}
				></Button>
			</div>
		</div>
	)
}

function useMap<Key, Value, Fallback = undefined>(options?: { fallback?: () => Fallback }) {
	const [state, setState] = useState<ReadonlyMap<Key, Value>>(new Map())

	const map = {
		get(key: Key) {
			return state.has(key) ? (state.get(key) as Value) : (options?.fallback?.() as Fallback)
		},
		values() {
			return state.values()
		},
		keys() {
			return state.keys()
		},
		entries() {
			return state.entries()
		},
	}

	const actions = {
		set(key: Key, value: Value) {
			setState((state) => new Map(new Map(state).set(key, value)))
		},
		remove(key: Key) {
			setState((state) => new Map(new Map([...state].filter(([k]) => k !== key))))
		},
		clear() {
			setState(new Map())
		},
	}

	return [map, actions] as const
}
