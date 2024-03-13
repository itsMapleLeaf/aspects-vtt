import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import type { Doc, Id } from "convex-backend/_generated/dataModel.js"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react"
import { $params, $path } from "remix-routes"
import { expect } from "~/common/expect.ts"
import type { Nullish, Overwrite } from "~/common/types.ts"
import { Vector } from "~/common/vector.ts"
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
import { FormField } from "~/ui/FormField.tsx"
import { Input, type InputProps } from "~/ui/Input.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { panel } from "~/ui/styles.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { roomSlug } = $params("/rooms/:roomSlug", params)
	const preferences = await getPreferences(request)
	return preferences.update(
		{ defaultRoomId: roomSlug },
		preferences.username
			? json({ username: preferences.username })
			: redirect($path("/rooms/:roomSlug/setup", { roomSlug })),
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
				{characters !== undefined ? (
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
				) : (
					<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				)}
			</main>
		</div>
	)
}

type InputAction =
	| { type: "idle" }
	| { type: "draggingViewport" }
	| { type: "movingToken"; tokenId: Id<"mapTokens">; position: Vector }

type MapState = {
	selectedTokenId?: Id<"mapTokens">
	inputAction: InputAction
	viewportOffset: Vector
}

const cellSize = 80
const leftMouseButton = 0b0001
const rightMouseButton = 0b0010
const middleMouseButton = 0b0100

function RoomMap({ roomSlug }: { roomSlug: string }) {
	const tokens = useQuery(api.mapTokens.list, { roomSlug }) ?? []
	const removeToken = useMutation(api.mapTokens.remove)

	const updateToken = useMutation(api.mapTokens.update).withOptimisticUpdate((store, args) => {
		if (!tokens) return
		store.setQuery(
			api.mapTokens.list,
			{ roomSlug },
			tokens.map((token) =>
				token._id === args.id
					? { ...token, ...args, x: args.x ?? token.x, y: args.y ?? token.y }
					: token,
			),
		)
	})

	const [state, updateState] = useReducer(
		(state: MapState, action: SetStateAction<Partial<MapState>>) => ({
			...state,
			...(typeof action === "function" ? action(state) : action),
		}),
		{
			selectedTokenId: undefined,
			inputAction: { type: "idle" },
			viewportOffset: Vector.from({ x: 0, y: 0 }),
		},
	)

	const containerRef = useRef<HTMLDivElement>(null)

	useWindowEvent("pointermove", (event) => {
		if (state.inputAction.type === "draggingViewport") {
			updateState({
				viewportOffset: state.viewportOffset.plus(event.movementX, event.movementY),
			})
		} else if (state.inputAction.type === "movingToken") {
			const container = expect(containerRef.current, "container ref not set")

			const position = Vector.from(event.clientX, event.clientY)
				.minus(container.getBoundingClientRect())
				.minus(state.viewportOffset)
				.dividedBy(cellSize)
				.minus(0.5)

			updateState({
				inputAction: { ...state.inputAction, position },
			})
		}
	})

	const finishInput = () => {
		if (state.inputAction.type === "movingToken") {
			updateToken({
				id: state.inputAction.tokenId,
				x: Math.round(state.inputAction.position.x),
				y: Math.round(state.inputAction.position.y),
			})
		}
		updateState({ inputAction: { type: "idle" } })
	}
	useWindowEvent("pointerup", finishInput)
	useWindowEvent("pointercancel", finishInput)
	useWindowEvent("blur", finishInput)

	const getTokenStyle = (token: Doc<"mapTokens">) => {
		let position = Vector.from(token)
		if (state.inputAction.type === "movingToken" && state.inputAction.tokenId === token._id) {
			position = state.inputAction.position
		}
		return {
			width: cellSize,
			height: cellSize,
			...position.times(cellSize).plus(state.viewportOffset).toObject("left", "top"),
		}
	}

	return (
		<div
			ref={containerRef}
			className="relative size-full select-none overflow-hidden"
			onPointerDown={(event) => {
				if (
					event.target === event.currentTarget &&
					event.buttons & (leftMouseButton | middleMouseButton)
				) {
					updateState({ inputAction: { type: "draggingViewport" } })
					if (event.buttons & leftMouseButton) {
						updateState({ selectedTokenId: undefined })
					}
				}
			}}
		>
			<CanvasGrid offsetX={state.viewportOffset.x} offsetY={state.viewportOffset.y} />
			{tokens.map((token) => (
				<div key={token._id} className="absolute" style={getTokenStyle(token)}>
					<div
						data-selected={state.selectedTokenId === token._id}
						className="group relative size-full outline outline-2 outline-transparent data-[selected=true]:outline-primary-600"
					>
						<button
							type="button"
							className="size-full"
							onPointerDown={(event) => {
								event.preventDefault()
								if (event.buttons & leftMouseButton) {
									updateState({
										selectedTokenId: token._id,
										inputAction: {
											type: "movingToken",
											tokenId: token._id,
											position: Vector.from(token),
										},
									})
								}
							}}
						>
							{token.imageId ? (
								<UploadedImage imageId={token.imageId} className="size-full" />
							) : (
								<Lucide.Ghost className="size-full" />
							)}
							<p className="-translate-x-1/2 -translate-y-1/2 absolute top-full left-1/2 rounded bg-primary-100/75 p-1.5 leading-none">
								{token.name}
							</p>
						</button>

						<div className="-translate-x-1/2 -translate-y-2 absolute bottom-full left-1/2 z-10 h-3 w-16 rounded border border-red-500 p-px opacity-50">
							<div
								className="h-full rounded-sm bg-red-600"
								style={{ width: `${((token.health ?? 8) / (token.maxHealth ?? 8)) * 100}%` }}
							/>
						</div>

						<div
							className={panel(
								"-translate-x-4 -translate-y-1/2 absolute top-1/2 right-full z-10 w-32 shadow-md",
								"hidden flex-col gap-3 group-data-[selected=true]:flex",
								"p-2",
							)}
						>
							<FormField label="Health">
								<LazyInput
									type="number"
									value={Math.min(token.health ?? 8, token.maxHealth ?? 8)}
									min={0}
									max={token.maxHealth ?? 8}
									onChangeValue={(value) => {
										updateToken({ id: token._id, health: toPositiveInt(value) ?? token.health })
									}}
								/>
							</FormField>
							<FormField label="Max Health">
								<LazyInput
									type="number"
									value={token.maxHealth ?? 8}
									min={0}
									onChangeValue={(value) => {
										updateToken({
											id: token._id,
											maxHealth: toPositiveInt(value) ?? token.maxHealth,
										})
									}}
								/>
							</FormField>
							<FormField label="Fatigue">
								<LazyInput
									type="number"
									value={token.fatigue ?? 0}
									min={0}
									onChangeValue={(value) => {
										updateToken({ id: token._id, fatigue: toPositiveInt(value) ?? token.fatigue })
									}}
								/>
							</FormField>
							<Button
								icon={<Lucide.Trash />}
								text="Delete"
								className="cursor-default"
								onClick={() => removeToken({ id: token._id })}
							/>
						</div>
					</div>
				</div>
			))}
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

function LazyInput({
	onChangeValue,
	...props
}: Overwrite<InputProps, { value: string | number; onChangeValue: (value: string) => void }>) {
	const [value, setValue] = useState<string>()
	return (
		<Input
			{...props}
			value={value ?? props.value}
			onChange={(event) => {
				setValue(event.target.value)
			}}
			onBlur={() => {
				if (value !== props.value && value !== undefined) {
					onChangeValue(value)
					setValue(undefined)
				}
			}}
		/>
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

function toPositiveInt(value: unknown): number | undefined {
	const number = Number(value)
	return Number.isFinite(number) ? Math.floor(Math.max(number, 0)) : undefined
}
