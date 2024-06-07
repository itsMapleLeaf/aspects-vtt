import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import * as Lucide from "lucide-react"
import type { ReactNode } from "react"

export function Collapse({ title, children }: { title: ReactNode; children: ReactNode }) {
	return (
		<DisclosureProvider>
			<Disclosure className="flex items-center gap-0.5 transition-colors hover:text-primary-700">
				<Lucide.ChevronDown className="transition-transform [[aria-expanded=true]>&]:rotate-180" />
				<span className="select-none font-bold leading-6">{title}</span>
			</Disclosure>
			<DisclosureContent className="grid grid-rows-[0fr] transition-all data-[enter]:grid-rows-[1fr]">
				<div className="overflow-hidden">{children}</div>
			</DisclosureContent>
		</DisclosureProvider>
	)
}
