import { useParams, useSearchParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { RoomContent } from "../features/rooms/RoomContent.tsx"
import { assert } from "../lib/assertions.ts"
import { QueryResult } from "../lib/convex.tsx"
import { EmptyState } from "../ui/empty-state.tsx"
import { LoadingCover } from "../ui/loading.tsx"

export default function RoomRoute() {
	const params = useParams()

	const [searchParams] = useSearchParams()
	const previewSceneId = searchParams.get("preview")

	const room = useQuery(api.functions.rooms.getBySlug, {
		slug: assert(params.room, "Room param not found"),
		previewSceneId,
	})

	return (
		<QueryResult
			data={room}
			renderLoading={() => <LoadingCover visible />}
			renderEmpty={() => (
				<EmptyState
					title="Room not found"
					icon={<Lucide.SearchX className="size-12" />}
				/>
			)}
			renderData={(room) => <RoomContent room={room} />}
		/>
	)
}
