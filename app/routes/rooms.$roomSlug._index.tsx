import * as Ariakit from "@ariakit/react"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import type { Doc, Id } from "convex-backend/_generated/dataModel.js"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
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
import { UploadedImage } from "~/features/images/UploadedImage.tsx"
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
					<RoomMap roomSlug={roomSlug} />
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

const cellSize = 80
const leftMouseButton = 0b0001

function RoomMap({ roomSlug }: { roomSlug: string }) {
	const tokens = useQuery(api.mapTokens.list, { roomSlug }) ?? []
	const updateToken = useMutation(api.mapTokens.update).withOptimisticUpdate((store, args) => {
		if (!tokens) return
		store.setQuery(
			api.mapTokens.list,
			{ roomSlug },
			tokens.map((token) =>
				token._id === args.id ? { ...token, x: args.x ?? token.x, y: args.y ?? token.y } : token,
			),
		)
	})

	type Input =
		| { type: "idle" }
		| { type: "draggingViewport" }
		| { type: "movingToken"; tokenId: Id<"mapTokens">; position: { x: number; y: number } }

	const [input, setInput] = useState<Input>({ type: "idle" })
	const [offsetX, setOffsetX] = useState(0)
	const [offsetY, setOffsetY] = useState(0)

	const containerRef = useRef<HTMLDivElement>(null)

	useWindowEvent("pointermove", (event) => {
		if (input.type === "draggingViewport") {
			setOffsetX((prev) => prev + event.movementX)
			setOffsetY((prev) => prev + event.movementY)
		} else if (input.type === "movingToken") {
			const container = expect(containerRef.current, "container ref not set")
			const containerRect = container.getBoundingClientRect()

			const x = (event.clientX - containerRect.x - offsetX) / cellSize - 0.5
			const y = (event.clientY - containerRect.y - offsetY) / cellSize - 0.5
			setInput({ ...input, position: { x, y } })
		}
	})

	const finishInput = () => {
		if (input.type === "movingToken") {
			updateToken({
				id: input.tokenId,
				x: Math.round(input.position.x),
				y: Math.round(input.position.y),
			})
		}
		setInput({ type: "idle" })
	}
	useWindowEvent("pointerup", finishInput)
	useWindowEvent("pointercancel", finishInput)
	useWindowEvent("blur", finishInput)

	return (
		<div
			ref={containerRef}
			className="relative size-full select-none overflow-hidden"
			onPointerDown={(event) => {
				if (event.target === event.currentTarget && event.buttons & leftMouseButton) {
					setInput({ type: "draggingViewport" })
				}
			}}
		>
			<CanvasGrid offsetX={offsetX} offsetY={offsetY} />
			{tokens.map((token) => (
				<button
					type="button"
					key={token._id}
					className="absolute left-0 top-0"
					style={{
						width: cellSize,
						height: cellSize,
						translate:
							input.type === "movingToken" && input.tokenId === token._id ?
								`${input.position.x * cellSize + offsetX}px ${input.position.y * cellSize + offsetY}px`
							:	`${token.x * cellSize + offsetX}px ${token.y * cellSize + offsetY}px`,
					}}
					onPointerDown={(event) => {
						event.preventDefault()
						if (event.buttons & leftMouseButton) {
							setInput({
								type: "movingToken",
								tokenId: token._id,
								position: token,
							})
						}
					}}
				>
					<MapToken token={token} />
				</button>
			))}
			{/* {characters.map((character) => (
				<MapToken key={character._id} name={character.name} image={character.image?.storageId} />
			))} */}
		</div>
	)
}

function MapToken({ token }: { token: Doc<"mapTokens"> }) {
	const removeToken = useMutation(api.mapTokens.remove)
	const menu = Ariakit.useMenuStore()
	const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })
	return (
		<div
			className="relative size-full"
			onContextMenu={(event) => {
				event.preventDefault()
				event.stopPropagation()
				setAnchorRect({ x: event.clientX, y: event.clientY })
				menu.show()
			}}
		>
			{token.imageId ?
				<UploadedImage imageId={token.imageId} className="size-full" />
			:	<Lucide.Ghost className="size-full" />}
			<p className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 rounded bg-primary-100/75 p-1.5 leading-none">
				{token.name}
			</p>
			<Ariakit.Menu store={menu} portal getAnchorRect={() => anchorRect} className={panel()}>
				<Button
					icon={<Lucide.Trash />}
					text="Delete"
					className="cursor-default"
					element={<Ariakit.MenuItem onClick={() => removeToken({ id: token._id })} />}
				/>
			</Ariakit.Menu>
		</div>
	)
}

function CanvasGrid({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const draw = useCallback(() => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		const context = expect(canvas.getContext("2d"), "failed to get canvas context")

		context.clearRect(0, 0, canvas.width, canvas.height)

		context.save()

		context.strokeStyle = "white"
		context.globalAlpha = 0.25

		context.beginPath()

		for (let x = offsetX % cellSize; x <= canvas.width; x += cellSize) {
			context.moveTo(...pixelCoords(x, 0))
			context.lineTo(...pixelCoords(x, canvas.height))
		}

		for (let y = offsetY % cellSize; y <= canvas.height; y += cellSize) {
			context.moveTo(...pixelCoords(0, y))
			context.lineTo(...pixelCoords(canvas.width, y))
		}

		context.stroke()

		context.restore()

		context.save()
		context.fillStyle = "white"
		context.font = "16px sans-serif"
		context.textBaseline = "top"
		context.fillText(`offset: ${-offsetX}, ${-offsetY}`, 10, 10)
		context.restore()
	}, [offsetX, offsetY])

	useEffect(() => {
		draw()
	}, [draw])

	useResizeObserver(canvasRef, (entry) => {
		const canvas = expect(canvasRef.current, "canvas ref not set")
		canvas.width = entry.contentRect.width
		canvas.height = entry.contentRect.height
		draw()
	})

	return <canvas ref={canvasRef} className="pointer-events-none size-full" />
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

function useWindowEvent<E extends keyof WindowEventMap>(
	event: E,
	listener: (this: Window, ev: WindowEventMap[E]) => void,
	options?: boolean | AddEventListenerOptions,
) {
	useEffect(() => {
		window.addEventListener(event, listener, options)
		return () => window.removeEventListener(event, listener, options)
	})
}
