import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { useLocalStorageState } from "../../common/dom/useLocalStorage.ts"
import { Button } from "./Button.tsx"

export function ToggleableSidebar({
	name,
	side,
	children,
}: {
	name: string
	side: "left" | "right"
	children: React.ReactNode
}) {
	const [open, setOpen] = useLocalStorageState(`sidebar:${name}`, true, z.boolean().catch(true))
	const Icon = open ? Lucide.SidebarClose : Lucide.SidebarOpen

	return (
		<div
			data-side={side}
			className="group/sidebar-panel pointer-events-none flex h-full justify-end gap-2 *:pointer-events-auto data-[side=left]:left-0 data-[side=right]:right-0 data-[side=left]:flex-row-reverse"
		>
			<DisclosureProvider open={open} setOpen={setOpen}>
				<Button
					icon={<Icon className={side === "right" ? "-scale-x-100" : ""} />}
					className="shadow-md"
					element={<Disclosure title={open ? `Hide ${name}` : `Show ${name}`} />}
				/>
				<DisclosureContent
					className={twMerge(
						"h-full opacity-0 transition data-[enter]:translate-x-0 data-[enter]:opacity-100",
						side === "right" ? "translate-x-4" : "-translate-x-4",
					)}
				>
					{children}
				</DisclosureContent>
			</DisclosureProvider>
		</div>
	)
}
