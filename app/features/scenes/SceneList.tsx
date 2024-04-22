import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useMutationState } from "#app/common/convex.js"
import { Loading } from "#app/ui/Loading.js"
import { useModalContext } from "#app/ui/Modal.js"
import { MoreMenu } from "#app/ui/MoreMenu.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function SceneList() {
	const room = useRoom()
	const scenes = useQuery(api.scenes.list, { roomId: room._id })
	const [createSceneState, createScene] = useMutationState(api.scenes.create)
	const [updateRoomState, updateRoom] = useMutationState(api.rooms.update)
	const removeScene = useMutation(api.scenes.remove)
	const duplicateScene = useMutation(api.scenes.duplicate)
	const modal = useModalContext()

	const moreMenuOptions = (sceneId: Id<"scenes">) => [
		{
			text: "Duplicate",
			icon: <Lucide.Copy />,
			onClick: () => duplicateScene({ id: sceneId }),
		},
		{
			text: "Delete",
			icon: <Lucide.Trash />,
			onClick: () => removeScene({ id: sceneId }),
		},
	]

	return (
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(theme(spacing.48),1fr))] gap-3">
			{scenes?.map((scene) => (
				<li key={scene._id} className="-m-1">
					<MoreMenu options={moreMenuOptions(scene._id)}>
						<button
							type="button"
							className="block w-full rounded p-1 transition hover:bg-primary-300"
							onClick={async () => {
								await updateRoom({ id: room._id, currentScene: scene._id })
								modal?.hide()
							}}
						>
							<div
								style={{
									backgroundImage: scene.background
										? `url(${getApiImageUrl(scene.background)})`
										: undefined,
								}}
								className={panel(
									"w-full aspect-[4/3] overflow-clip flex-center bg-cover bg-center",
								)}
							>
								{updateRoomState.status === "pending" &&
								updateRoomState.args.currentScene === scene._id ? (
									<Loading />
								) : scene.background == null ? (
									<Lucide.ImageOff className="size-16 text-primary-700 opacity-50 transition group-hover:opacity-100" />
								) : null}
							</div>
							<p className="text-pretty px-2 py-1.5 text-center text-xl/tight font-light">
								{scene.name}
								{room.currentScene === scene._id && (
									<span className="text-primary-700 opacity-50 transition group-hover:opacity-100">
										{" "}
										(current)
									</span>
								)}
							</p>
						</button>
					</MoreMenu>
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
