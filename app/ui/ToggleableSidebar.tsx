import {
	Disclosure,
	DisclosureContent,
	DisclosureProvider,
	useDisclosureStore,
} from "@ariakit/react"
import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { useLocalStorageState } from "../common/useLocalStorage.ts"
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
	const store = useDisclosureStore({ open, setOpen })
	const isOpen = store.useState("open")
	const Icon = isOpen ? Lucide.SidebarClose : Lucide.SidebarOpen

	return (
		<div
			data-side={side}
			className="group/sidebar-panel pointer-events-none fixed bottom-0 top-16 flex justify-end gap-2 p-2 *:pointer-events-auto data-[side=left]:left-0 data-[side=right]:right-0 data-[side=left]:flex-row-reverse"
		>
			<DisclosureProvider store={store}>
				<Button
					icon={<Icon className={side === "right" ? "-scale-x-100" : ""} />}
					className="shadow-md shadow-black/25"
					element={<Disclosure title={isOpen ? `Hide ${name}` : `Show ${name}`} />}
				/>
				<DisclosureContent
					className={twMerge(
						"h-full opacity-0 data-[enter]:opacity-100 transition data-[enter]:translate-x-0",
						side === "right" ? "translate-x-4" : "-translate-x-4",
					)}
				>
					{children}
				</DisclosureContent>
			</DisclosureProvider>
		</div>
	)
}
