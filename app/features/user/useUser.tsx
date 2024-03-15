import { createContext, useContext } from "react"

const UserContext = createContext<{ username: string } | undefined>(undefined)

export function useUser() {
	return useContext(UserContext)
}

export function UserProvider({
	children,
	user,
}: { children: React.ReactNode; user: { username: string } | undefined }) {
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
