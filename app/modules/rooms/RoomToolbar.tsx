import * as Lucide from "lucide-react"
import type { Falsy } from "~/helpers/types.ts"
import { Button } from "~/ui/Button.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacter } from "../characters/hooks.ts"
import { DateTimeSettingsForm } from "../game/DateTimeSettingsForm.tsx"
import { useRoom } from "./roomContext.tsx"
import { RoomSettingsForm } from "./RoomSettingsForm.tsx"
import { RoomTool, RoomToolbarStore } from "./RoomToolbarStore.tsx"

interface ToolbarItem {
	name: string
	icon: React.ReactNode
	active?: boolean
	onClick?: () => void
	popoverContent?: React.ReactNode
}

const separator = Symbol("separator")

export function RoomToolbar() {
	const state = RoomToolbarStore.useState()
	const actions = RoomToolbarStore.useActions()
	const room = useRoom()
	const character = useOwnedCharacter()

	const toolbarItems: Array<ToolbarItem | typeof separator | Falsy> = [
		{
			name: "Draw Area",
			icon: <Lucide.SquareDashedMousePointer />,
			active: state.activeTool === RoomTool.Draw,
			onClick: actions.toggleDrawTool,
		},
		separator,
		{
			name: "Actions",
			icon: <Lucide.Zap />,
			popoverContent: <p>todo figure this out</p>,
		},
		character && {
			name: "Status",
			icon: <Lucide.BarChart2 />,
			popoverContent: (
				<div className="grid w-48 gap-2 p-2">
					<CharacterStatusFields character={character} />
				</div>
			),
		},
		separator,
		room.isOwner && {
			name: "Date & Time",
			icon: <Lucide.CalendarClock />,
			popoverContent: (
				<div className="w-96">
					<DateTimeSettingsForm />
				</div>
			),
		},
		room.isOwner && {
			name: "Settings",
			icon: <Lucide.Settings />,
			popoverContent: (
				<div className="w-64">
					<RoomSettingsForm />
				</div>
			),
		},
		{
			name: "Help",
			icon: <Lucide.HelpCircle />,
			onClick: () => {
				// todo
			},
		},
	]

	return (
		<nav aria-label="Toolbar" className="flex gap-2">
			{toolbarItems.filter(Boolean).map((item, i) =>
				item === separator ? <ToolbarSeparator key={i} />
				: item.popoverContent ?
					<Popover key={i}>
						<PopoverTrigger
							onClick={item.onClick}
							render={
								<Button
									key={i}
									icon={item.icon}
									tooltip={item.name}
									appearance="clear"
									size="md"
									square
									active={item.active}
								/>
							}
						/>
						<PopoverPanel gutter={16}>{item.popoverContent}</PopoverPanel>
					</Popover>
				:	<Button
						key={i}
						icon={item.icon}
						tooltip={item.name}
						appearance="clear"
						size="md"
						square
						active={item.active}
						onClick={item.onClick}
					/>,
			)}
		</nav>
	)
}

function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
}
