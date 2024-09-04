import { useEffect, useState } from "react"

export function ClientOnly({ children }: { children: React.ReactNode }) {
	const [client, setClient] = useState(false)
	useEffect(() => setClient(true), [])
	return client ? children : null
}
