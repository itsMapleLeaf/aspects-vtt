import { Tab, TabList, TabPanel, TabProvider } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { Fragment } from "react/jsx-runtime"
import { z } from "zod"
import { useLocalStorageState } from "~/helpers/dom/useLocalStorage.ts"
import { Button } from "~/ui/Button.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { actions } from "./actions.ts"

export function QuickReference() {
	const pages = [
		{
			title: "Actions",
			icon: <Lucide.Zap />,
			content: (
				<>
					<h3 className="mt-6 text-2xl font-light">Push Yourself</h3>
					<p className="my-1">
						Spend <strong>2 resolve</strong> to add one boost die to your roll. You can only do this
						once per action.
					</p>
					<h3 className="mt-6 text-2xl font-light">Assist</h3>
					<p className="my-1">
						Spend <strong>1 resolve</strong> to add one boost die to an ally's roll. You can only do
						this once per action. You must describe how you're helping them.
					</p>
					<h3 className="mt-6 text-2xl font-light">Rest</h3>
					<p className="my-1">
						Rest in-game and gain 1d4 resolve per hour rested. You cannot make any actions or change
						locations while resting, but you can play out downtime.
					</p>
					{actions.map((action) => (
						<Fragment key={action.name}>
							<h3 className="mt-6 text-2xl font-light">{action.name}</h3>
							<p className="my-1 whitespace-pre-line">{action.description}</p>
							<aside className="my-1 whitespace-pre-line text-pretty text-sm italic text-primary-800 opacity-60">
								{action.notes}
							</aside>
						</Fragment>
					))}
				</>
			),
		},
		{
			title: "Attacks",
			icon: <Lucide.Swords />,
			content: <p>todo</p>,
		},
		{
			title: "Aspect Skills",
			icon: <Lucide.Flame />,
			content: <p>todo</p>,
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
				<TabList className="flex flex-col gap-1 p-2">
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
