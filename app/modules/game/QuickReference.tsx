import { Tab, TabList, TabPanel, TabProvider } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { isValidElement } from "react"
import { Fragment } from "react/jsx-runtime"
import { z } from "zod"
import { Button } from "~/ui/Button.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { useLocalStorageState } from "../../../common/dom/useLocalStorage.ts"
import { actions } from "./actions.ts"

export function QuickReference() {
	const pages = [
		{
			title: "Actions",
			icon: <Lucide.Zap />,
			content: (
				<>
					<ActionSection title="Push Yourself">
						Spend <strong>2 resolve</strong> to add one boost die to your roll. You can only do this
						once per action.
					</ActionSection>
					<ActionSection title="Assist">
						Spend <strong>1 resolve</strong> to add one boost die to an ally's roll. You can only do
						this once per action. You must describe how you're helping them.
					</ActionSection>
					<ActionSection title="Rest">
						Rest in-game and gain 1d4 resolve per hour rested. You cannot make any actions or change
						locations while resting, but you can play out downtime.
					</ActionSection>
					{actions.map((action) => (
						<Fragment key={action.name}>
							<ActionSection title={action.name}>{action.description}</ActionSection>
							<aside className="my-1 whitespace-pre-line text-pretty text-sm italic text-primary-800 opacity-60">
								{action.notes}
							</aside>
						</Fragment>
					))}
				</>
			),
		},
		{
			title: "Aspect Art",
			icon: <Lucide.Flame />,
			content: (
				<>
					<p>You can spend points from your aspect art roll to modify it in one of a few ways:</p>
					<ActionSection title="Area">
						<p>Add an area of effect.</p>
						<p>Cost: 2 points / +3m area size</p>
					</ActionSection>
					<ActionSection title="Path">
						<p>Add a path of effect.</p>
						<p>Cost: 1 point / +5m path length</p>
					</ActionSection>
					<ActionSection title="Target">
						<p>Add an additional target.</p>
						<p>Cost: 2 points / +1 target</p>
					</ActionSection>
					<ActionSection title="Range">
						<p>Increase your max range.</p>
						<p>Cost: 1 point / +5m of distance</p>
					</ActionSection>
					<ActionSection title="Duration">
						<p>Make it last longer.</p>
						<p>Cost: 1 point / +1 minute or +1 combat round</p>
					</ActionSection>
				</>
			),
		},
		{
			title: "Attacks",
			icon: <Lucide.Swords />,
			content: (
				<>
					<p>Any action can be made into an attack. To make an attack:</p>
					<ol className="my-2 grid list-inside list-decimal pl-2 gap-2">
						<li>If you haven't, describe narratively how you're attacking.</li>
						<li>Make the appropriate attribute roll.</li>
						<li>
							Subtract the target's defense (Strength + Mobility) from the result, and they take
							that much damage. If the roll is less than the defense, they take no damage.
						</li>
					</ol>
				</>
			),
		},
	]

	const [activeId, setActiveId] = useLocalStorageState(
		"QuickReference:activeId",
		null,
		z.string().nullable(),
	)

	return (
		<div className="grid h-full grid-cols-[12rem,1fr]">
			<TabProvider activeId={activeId} setActiveId={(id) => setActiveId(id ?? null)}>
				<TabList className="flex flex-col p-2 gap-1">
					{pages.map((page) => (
						<Tab
							key={page.title}
							id={page.title}
							render={
								<Button
									text={page.title}
									icon={page.icon}
									appearance="clear"
									align="start"
									active={page.title === activeId}
								/>
							}
						/>
					))}
				</TabList>
				<div className="min-h-0 py-0.5">
					<ScrollArea>
						{pages.map((page) => (
							<TabPanel
								key={page.title}
								id={page.title}
								className="min-w-0 py-4 pl-2 pr-4"
								render={<section />}
							>
								<h2 className="text-3xl font-light">{page.title}</h2>
								{page.content}
							</TabPanel>
						))}
					</ScrollArea>
				</div>
			</TabProvider>
		</div>
	)
}

interface ActionSectionProps {
	title: string
	children: React.ReactNode
}

export function ActionSection({ title, children }: ActionSectionProps) {
	return (
		<>
			<h3 className="mt-6 text-2xl font-light">{title}</h3>
			{isValidElement(children) ? children : <p className="my-1">{children}</p>}
		</>
	)
}
