import { createContext, ReactNode, use, useState } from "react"
import { Id } from "~/convex/_generated/dataModel.js"
import { raise } from "~/shared/errors.ts"

function useEntityStore() {
	const [selected, setSelected] = useState<
		{
			type: "character"
			id: Id<"characters">
		}[]
	>([])

	return { selected, setSelected }
}

const EntityStoreContext = createContext<ReturnType<
	typeof useEntityStore
> | null>(null)

export function EntityStoreProvider({ children }: { children: ReactNode }) {
	return (
		<EntityStoreContext value={useEntityStore()}>{children}</EntityStoreContext>
	)
}

export function useEntityStoreContext() {
	return use(EntityStoreContext) ?? raise("EntityStoreProvider not found")
}
