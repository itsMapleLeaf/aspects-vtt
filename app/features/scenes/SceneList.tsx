import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api.js"
import { useMutationState } from "../../common/convex.ts"
import { useCanvasDraw } from "../../common/dom.ts"
import { useImage } from "../../common/useImage.ts"
import { Vector } from "../../common/vector.ts"
import { Loading } from "../../ui/Loading.tsx"
import { useModalContext } from "../../ui/Modal.tsx"
import { MoreMenu, MoreMenuItem, MoreMenuPanel } from "../../ui/MoreMenu.tsx"
import { usePrompt } from "../../ui/Prompt.tsx"
import { panel } from "../../ui/styles.ts"
import { getApiImageUrl } from "../images/getApiImageUrl.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function SceneList() {
	const room = useRoom()
	const scenes = useQuery(api.scenes.functions.list, { roomId: room._id })
	const [createSceneState, createScene] = useMutationState(
		api.scenes.functions.create,
	)
	const [updateRoomState, updateRoom] = useMutationState(
		api.rooms.functions.update,
	)
	const removeScene = useMutation(api.scenes.functions.remove)
	const duplicateScene = useMutation(api.scenes.functions.duplicate)
	const modal = useModalContext()
	const prompt = usePrompt()

	return (
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(theme(spacing.48),1fr))] gap-3">
			{scenes?.map((scene) => (
				<li key={scene._id} className="-m-1">
					<MoreMenu>
						<button
							type="button"
							className="block w-full rounded p-1 transition hover:bg-primary-300"
							onClick={async () => {
								await updateRoom({ id: room._id, currentScene: scene._id })
								modal?.hide()
							}}
						>
							<div
								className={panel(
									"flex-center aspect-[4/3] w-full overflow-clip bg-cover bg-center",
								)}
							>
								{(
									updateRoomState.status === "pending" &&
									updateRoomState.args.currentScene === scene._id
								) ?
									<Loading />
								: scene.background != null ?
									<CanvasThumbnail
										imageUrl={getApiImageUrl(scene.background)}
									/>
								:	<Lucide.ImageOff className="size-16 text-primary-700 opacity-50 transition group-hover:opacity-100" />
								}
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
						<MoreMenuPanel>
							<MoreMenuItem
								text="Duplicate"
								icon={<Lucide.Copy />}
								onClick={() => duplicateScene({ id: scene._id })}
							/>
							<MoreMenuItem
								text="Delete"
								icon={<Lucide.Trash />}
								onClick={() => removeScene({ id: scene._id })}
							/>
						</MoreMenuPanel>
					</MoreMenu>
				</li>
			))}
			<li>
				<button
					type="button"
					className={panel(
						"group flex-center aspect-[4/3] w-full overflow-clip transition hover:bg-primary-300",
					)}
					onClick={async () => {
						const name = await prompt({
							title: "Scene name?",
							inputLabel: "Name",
							inputPlaceholder: "The Scene of All Time",
						})
						if (name) {
							await createScene({ roomId: room._id, name })
						}
					}}
				>
					{createSceneState.status === "pending" ?
						<Loading />
					:	<Lucide.ImagePlus className="size-16 text-primary-700 opacity-50 transition group-hover:opacity-100" />
					}
					<p className="text-pretty p-2 text-center text-xl/none font-light">
						Create Scene
					</p>
				</button>
			</li>
		</ul>
	)
}

function CanvasThumbnail({
	imageUrl,
	...props
}: { imageUrl: string } & ComponentProps<"canvas">) {
	const image = useImage(imageUrl)

	const canvasRef = useCanvasDraw((context) => {
		if (!image) return

		const canvasSize = Vector.fromSize(context.canvas)
		const imageSize = Vector.fromSize(image)

		const coverScale = Math.max(...canvasSize.dividedBy(imageSize).tuple)
		const offset = canvasSize.minus(imageSize.times(coverScale)).dividedBy(2)

		// use setTimeout to yield to the main thread
		setTimeout(() => {
			context.drawImage(
				image,
				...offset.tuple,
				...imageSize.times(coverScale).tuple,
			)
		}, 0)
	})

	return (
		<div className="flex-center relative size-full">
			{image == null && <Loading className="absolute m-auto" />}
			<canvas
				{...props}
				className={twMerge("size-full", props.className)}
				ref={canvasRef}
			/>
		</div>
	)
}
