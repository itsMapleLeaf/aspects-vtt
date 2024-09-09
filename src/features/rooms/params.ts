import { useSearchParams } from "@remix-run/react"

export function useRoomParams() {
	const [searchParams, setSearchParams] = useSearchParams()
	return {
		previewSceneId: searchParams.get("preview"),
		setPreviewSceneId: (sceneId: string | null) => {
			setSearchParams((params) => {
				if (sceneId) {
					params.set("preview", sceneId)
				} else {
					params.delete("preview")
				}
				return params
			})
		},
	}
}
