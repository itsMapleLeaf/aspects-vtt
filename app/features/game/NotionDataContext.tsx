import { useQuery } from "convex/react"
import { createContext, use } from "react"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import type { Nullish } from "../../common/types.ts"

const NotionDataConext = createContext<Nullish<Doc<"notionImports">>>(undefined)

export function NotionDataProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const notionData = useQuery(api.notionImports.functions.get, {})
	return <NotionDataConext value={notionData}> {children} </NotionDataConext>
}

export function useNotionData() {
	return use(NotionDataConext)
}
