import { useConvex, useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.js"
import { api } from "#convex/_generated/api.js"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"

export function SetMapBackgroundButton() {
	const room = useRoom()
	const updateRoom = useMutation(api.rooms.update)
	const backgroundImageInputRef = useRef<HTMLInputElement>(null)
	const [pending, setPending] = useState(false)
	const convex = useConvex()

	return (
		<>
			<Button
				text="Set Background"
				icon={pending ? <Loading size="sm" className="p-0" /> : <Lucide.Image />}
				onClick={() => {
					backgroundImageInputRef.current?.click()
				}}
				disabled={pending}
			/>
			<input
				type="file"
				accept="image/png,image/jpeg,image/gif,image/webp"
				ref={backgroundImageInputRef}
				className="hidden"
				onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
					const file = event.target.files?.[0]
					if (!file) return

					setPending(true)
					try {
						const mapDimensions = await new Promise<{ width: number; height: number }>(
							(resolve, reject) => {
								const image = new Image()
								image.src = URL.createObjectURL(file)
								image.onload = () => {
									resolve({ width: image.width, height: image.height })
								}
								image.onerror = () =>
									reject(new Error(`Failed to get dimensions from image "${file.name}"`))
							},
						)

						const mapImageId = await uploadImage(file, convex)

						await updateRoom({
							id: room._id,
							mapImageId,
							mapDimensions,
						})
					} catch (error) {
						console.error(error)
						alert("Failed to upload image")
					} finally {
						setPending(false)
					}
				}}
				disabled={pending}
			/>
		</>
	)
}
