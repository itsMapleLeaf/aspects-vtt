import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export function useUser() {
	return useQuery(api.users.me)
}
