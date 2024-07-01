import { LucideFileQuestion } from "lucide-react"
import { EmptyState } from "~/ui/EmptyState.tsx"

import type { LoaderFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
	return new Response(null, { status: 404 })
}

export default function GuidePageNotFound() {
	return (
		<EmptyState
			icon={<LucideFileQuestion />}
			message="That page doesn't exist."
			className="py-24"
		/>
	)
}
