import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { $params, $path } from "remix-routes"
import { expect } from "~/common/expect.ts"
import type { Nullish } from "~/common/types.ts"
import { CharacterForm } from "~/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "~/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "~/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "~/features/characters/DeleteCharacterButton.tsx"
import { useCurrentCharacterId } from "~/features/characters/useCurrentCharacterId.ts"
import { DiceRollForm } from "~/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "~/features/dice/DiceRollList.tsx"
import { getPreferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { panel } from "~/ui/styles.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { roomSlug } = $params("/rooms/:roomSlug", params)
	const preferences = await getPreferences(request)
	return preferences.update(
		{ defaultRoomId: roomSlug },
		preferences.username ?
			json({ username: preferences.username })
		:	redirect($path("/rooms/:roomSlug/setup", { roomSlug })),
	)
}

export const shouldRevalidate = () => false

export default function RoomRoute() {
	const { username } = useLoaderData<typeof loader>()
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	const characters = useQuery(api.characters.list, { roomSlug })
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	const firstCharacter = characters?.[0]
	const character = characters?.find((c) => c._id === currentCharacterId) ?? firstCharacter

	useEffect(() => {
		if (!character?._id && firstCharacter?._id) {
			setCurrentCharacterId(firstCharacter._id)
		}
	}, [character?._id, firstCharacter?._id, setCurrentCharacterId])

	return (
		<div className="flex h-dvh flex-col gap-2 bg-primary-100 p-2">
			<header className="flex justify-end gap-[inherit]">
				<Form method="post" action={$path("/rooms/:roomSlug/leave", { roomSlug })}>
					<Button
						type="submit"
						icon={<Lucide.DoorOpen />}
						text="Leave"
						name="clearUsername"
						value="do it"
					/>
				</Form>
				<Button
					element={<Link to={`setup?username=${username}`} />}
					icon={<Lucide.Edit />}
					text={username}
				/>
			</header>
			<main className="flex min-h-0 flex-1 gap-2">
				<div className="flex h-full max-w-[360px] flex-1 flex-col gap-2">
					<DiceRollForm username={username} roomSlug={roomSlug} />
					<div className="min-h-0 flex-1">
						<DiceRollList roomSlug={roomSlug} />
					</div>
				</div>
				<div className={panel("flex min-w-0 flex-1")}>
					<MapGrid />
				</div>
				{characters !== undefined ?
					<div className="flex max-w-[360px] flex-1 flex-col gap-2">
						<div className="flex gap-2">
							<div className="flex-1">
								<CharacterSelect characters={characters} />
							</div>
							{character && <DeleteCharacterButton character={character} />}
							<CreateCharacterButton roomSlug={roomSlug} username={username} />
						</div>
						{character && (
							<div className="min-h-0 flex-1">
								<CharacterForm character={character} />
							</div>
						)}
					</div>
				:	<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				}
			</main>
		</div>
	)
}

function MapGrid() {
	const cellSize = 50

	const offsetX = useRef(0)
	const offsetY = useRef(0)

	const containerRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const draw = useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "failed to get canvas context")

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.save()

		context.strokeStyle = "white"
		context.globalAlpha = 0.25

		context.beginPath()

		for (let x = offsetX.current % cellSize; x <= canvas.width; x += cellSize) {
			context.moveTo(...pixelCoords(x, 0))
			context.lineTo(...pixelCoords(x, canvas.height))
		}

		for (let y = offsetY.current % cellSize; y <= canvas.height; y += cellSize) {
			context.moveTo(...pixelCoords(0, y))
			context.lineTo(...pixelCoords(canvas.width, y))
		}

		context.stroke()

		context.restore()

		context.save()
		context.fillStyle = "white"
		context.font = "16px sans-serif"
		context.textBaseline = "top"
		context.fillText(`offset: ${-offsetX.current}, ${-offsetY.current}`, 10, 10)
		context.restore()
	}, [])

	useEffect(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const container = expect(containerRef.current, "container ref not set")
		canvas.width = container.clientWidth
		canvas.height = container.clientHeight
		draw()
	}, [draw])

	useResizeObserver(containerRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return (
		<div
			ref={containerRef}
			className="size-full overflow-clip"
			onPointerMove={(event) => {
				const buttonLeft = 0b0001
				const buttonRight = 0b0010
				const buttonMiddle = 0b0100
				event.preventDefault()
				if ((event.buttons & (buttonLeft | buttonMiddle)) > 0) {
					offsetX.current += event.movementX
					offsetY.current += event.movementY
					draw()
				}
			}}
		>
			<canvas ref={canvasRef} className="size-full" />
		</div>
	)
}

function useResizeObserver(
	ref: Nullish<React.RefObject<Element> | Element>,
	callback: (entry: ResizeObserverEntry) => void,
) {
	const callbackRef = useRef<typeof callback>()
	useEffect(() => {
		callbackRef.current = callback
	})

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return

		const observer = new ResizeObserver((entries) => {
			callbackRef.current?.(expect(entries[0], "resize observer entry not found"))
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref])
}

function pixelCoords<T extends readonly number[]>(...input: readonly [...T]): readonly [...T] {
	const output = [...input] as const
	for (const [index, value] of input.entries()) {
		output[index] = Math.floor(value) + 0.5
	}
	return output
}
