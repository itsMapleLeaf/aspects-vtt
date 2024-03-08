import { useSearchParams } from "@remix-run/react"
import { useCallback } from "react"

export function useCurrentCharacterId() {
	const [searchParams, setSearchParams] = useSearchParams()
	return [
		searchParams.get("character"),
		useCallback(
			(newCharacterId: string) => {
				setSearchParams(
					(params) => {
						params.set("character", newCharacterId)
						return params
					},
					{ replace: true },
				)
			},
			[setSearchParams],
		),
	] as const
}
