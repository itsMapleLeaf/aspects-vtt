import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useMutationState } from "#app/common/convex.js"
import { Loading } from "#app/ui/Loading.js"
import { useModalContext } from "#app/ui/Modal.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function SceneList() {
	const room = useRoom()
	const scenes = useQuery(api.scenes.list, { roomId: room._id })
	const [createSceneState, createScene] = useMutationState(api.scenes.create)
	const [updateRoomState, updateRoom] = useMutationState(api.rooms.update)
	const modal = useModalContext()
	return (
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(theme(spacing.48),1fr))] gap-3">
			{scenes?.map((scene) => (
				<li key={scene._id}>
					<button
						type="button"
						className="block w-full rounded transition hover:bg-primary-300"
						onClick={async () => {
							await updateRoom({ id: room._id, currentScene: scene._id })
							modal?.hide()
						}}
					>
						<div className={panel("w-full aspect-[4/3] overflow-clip flex-center")}>
							{scene.background ? <UploadedImage id={scene.background} /> : null}
							{updateRoomState.status === "pending" &&
								updateRoomState.args.currentScene === scene._id && <Loading />}
						</div>
						<p className="text-pretty p-2 text-center text-xl/none font-light">{scene.name}</p>
					</button>
				</li>
			))}
			<li>
				<button
					type="button"
					className={panel(
						"w-full aspect-[4/3] overflow-clip flex-center hover:bg-primary-300 transition group",
					)}
					onClick={() => createScene({ roomId: room._id })}
				>
					{createSceneState.status === "pending" ? (
						<Loading />
					) : (
						<Lucide.ImagePlus className="size-16 text-primary-700 opacity-50 transition group-hover:opacity-100" />
					)}
					<p className="text-pretty p-2 text-center text-xl/none font-light">Create Scene</p>
				</button>
			</li>
		</ul>
	)
}
