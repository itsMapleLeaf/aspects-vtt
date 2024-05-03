import { Hovercard, HovercardAnchor, HovercardProvider, type PopoverStore } from "@ariakit/react"
import { useGesture } from "@use-gesture/react"
import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api"
import type { Branded } from "../../../convex/helpers.ts"
import type { ApiToken } from "../../../convex/scenes/tokens.ts"
import { Rect } from "../../common/Rect.ts"
import { keyedByProperty, patchByKey } from "../../common/collection.ts"
import { sortBy } from "../../common/collection.ts"
import { queryMutators } from "../../common/convex.ts"
import { clamp } from "../../common/math.ts"
import { pick } from "../../common/object.ts"
import { randomItem } from "../../common/random.ts"
import { useWindowEvent } from "../../common/useWindowEvent.ts"
import { Vector } from "../../common/vector.ts"
import { Button } from "../../ui/Button.tsx"
import { DragSelectArea, DragSelectable, useDragSelectStore } from "../../ui/DragSelect.tsx"
import { FormField } from "../../ui/Form.tsx"
import { ModalButton } from "../../ui/Modal.tsx"
import { Popover, PopoverPanel, usePopoverStore } from "../../ui/Popover.tsx"
import { RectDrawArea } from "../../ui/RectDrawArea.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { CharacterDnd } from "../characters/CharacterDnd.tsx"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { CharacterModal } from "../characters/CharacterModal.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacterSkills } from "../characters/useCharacterSkills.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { RoomTool, RoomToolbarStore } from "../rooms/RoomToolbarStore.tsx"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
import type { ApiScene } from "./types.ts"
import { ViewportStore } from "./viewport.tsx"

export function SceneTokens({ scene }: { scene: ApiScene }) {
	const viewport = ViewportStore.useState()
	const tokens = useQuery(api.scenes.tokens.list, { sceneId: scene._id }) ?? []
	const [dragOffset, setDragOffset] = useState(Vector.zero)
	const addToken = useAddTokenMutation()
	const updateToken = useUpdateTokenMutation()
	const dragSelectStore = useDragSelectStore<ApiToken["key"]>()
	const roomToolbarState = RoomToolbarStore.useState()
	const roomToolbarActions = RoomToolbarStore.useActions()
	const [previewArea, setPreviewArea] = useState<Rect>()

	const bindDrag = useGesture(
		{
			onDrag: (state) => {
				setDragOffset(Vector.from(state.movement))
			},
			onDragEnd: (state) => {
				setDragOffset(Vector.zero)
				if (!tokens) return
				for (const token of tokens) {
					if (!dragSelectStore.selected.has(token.key)) continue
					const position = Vector.from(token.position).plus(dragOffset).roundedTo(scene.cellSize).xy
					updateToken({
						sceneId: scene._id,
						key: token.key,
						position: position,
					})
				}
			},
		},
		{
			drag: {
				from: [0, 0],
			},
			transform: (input) => [
				...Vector.from(input).minus(viewport.offset).dividedBy(viewport.scale).tuple,
			],
		},
	)

	const selectedTokens = () =>
		Iterator.from(tokens).filter((it) => dragSelectStore.isSelected(it.key))

	let tokenMenuAnchorRect = Rect.from({
		topLeft: selectedTokens()
			.map((it) => it.position)
			.reduce(Vector.topLeftMost, Number.POSITIVE_INFINITY),
		bottomRight: selectedTokens()
			.map((it) => {
				if (it.character) return Vector.from(it.position).plus(scene.cellSize)
				if (it.area) return Vector.from(it.position).plus(it.area)
				return it.position
			})
			.reduce(Vector.bottomRightMost, Number.NEGATIVE_INFINITY),
	})

	tokenMenuAnchorRect = tokenMenuAnchorRect
		.withPosition(viewport.offset.plus(tokenMenuAnchorRect.topLeft.times(viewport.scale)))
		.scale(viewport.scale)

	const tokenMenuStore = usePopoverStore({
		open:
			dragSelectStore.selected.size > 0 &&
			dragSelectStore.area == null &&
			dragOffset.equals(Vector.zero),
		placement: "bottom",
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: we specifically want to re-render when these change
	React.useLayoutEffect(() => {
		tokenMenuStore.render()
	}, [
		tokenMenuStore.render,
		tokenMenuAnchorRect.left,
		tokenMenuAnchorRect.top,
		tokenMenuAnchorRect.width,
		tokenMenuAnchorRect.height,
	])

	function getTokenProps(token: ApiToken) {
		const translate = getTokenTranslate(token)
		return {
			className: "absolute left-0 top-0 origin-top-left touch-none",
			style: { translate, scale: viewport.scale },
		}
	}

	function getTokenTranslate(token: ApiToken) {
		return Vector.from(token.position)
			.roundedTo(scene.cellSize)
			.plus(dragSelectStore.isSelected(token.key) ? dragOffset : Vector.zero)
			.times(viewport.scale)
			.plus(viewport.offset)
			.css.translate()
	}

	let tokenElements = (
		<>
			{/* sort so characters are last and are on top of everything else */}
			{sortBy(tokens ?? [], (it) => (it.character ? 1 : 0))?.map((token) => (
				<div {...getTokenProps(token)} key={token.key}>
					<DragSelectable
						{...bindDrag()}
						className="group touch-none rounded"
						store={dragSelectStore}
						item={token.key}
					>
						{token.character && (
							<UploadedImage
								id={token.character.imageId}
								style={{
									width: scene.cellSize,
									height: scene.cellSize,
								}}
								emptyIcon={<Lucide.Ghost />}
								className={{
									container: "overflow-clip rounded shadow-md shadow-black/50 bg-primary-300",
									image: "object-top object-cover",
								}}
							/>
						)}
						{token.area && (
							<div
								className="rounded border-4 border-blue-500 bg-blue-500/30"
								style={pick(token.area, ["width", "height"])}
							/>
						)}
						<div className="pointer-events-none absolute inset-0 rounded bg-primary-600/25 opacity-0 outline outline-4 outline-primary-700 group-data-[selected]:opacity-100" />
					</DragSelectable>
				</div>
			))}

			{/* character token decorations */}
			{Iterator.from(tokens ?? [])
				?.map((token) => token.character && { token, character: token.character })
				.filter((it) => it != null)
				.map(({ token, character }) => (
					<div
						className="pointer-events-none absolute left-0 top-0 origin-top-left"
						style={{ translate: getTokenTranslate(token) }}
						key={token.key}
					>
						<div
							className="relative"
							style={{
								width: scene.cellSize * viewport.scale,
								height: scene.cellSize * viewport.scale,
							}}
						>
							<div className="flex-center absolute inset-x-0 bottom-full justify-end gap-1.5 pb-2">
								<TokenMeter
									value={character.damage / character.damageThreshold}
									className={{
										base: "text-yellow-400",
										warning: "text-orange-400",
										danger: "text-red-400",
									}}
								/>
								<TokenMeter
									value={character.fatigue / character.fatigueThreshold}
									className={{
										base: "text-green-400",
										warning: "text-blue-400",
										danger: "text-purple-400",
									}}
								/>
							</div>
							<TokenLabel text={character.displayName} subText={character.displayPronouns} />
						</div>
					</div>
				))
				.toArray()}

			{/* area sizes */}
			{Iterator.from(tokens ?? [])
				?.map((token) => {
					if (!token.area) return
					return {
						token,
						area: token.area,
						gridSize: Vector.fromSize(token.area).dividedBy(scene.cellSize).floor,
					}
				})
				.filter((it) => it != null)
				.map(({ token, area, gridSize }) => (
					<div
						className="flex-center pointer-events-none absolute left-0 top-0 origin-top-left"
						style={{
							...pick(area, ["width", "height"]),
							translate: getTokenTranslate(token),
							scale: viewport.scale,
						}}
						key={token.key}
					>
						<p className="rounded-lg bg-black p-3 text-3xl/none font-bold text-white opacity-50">
							{gridSize.x}x{gridSize.y}
						</p>
					</div>
				))
				.toArray()}
		</>
	)

	if (roomToolbarState.activeTool === RoomTool.Draw) {
		const gridSnappedPreviewArea =
			previewArea &&
			Rect.from({
				topLeft: previewArea.topLeft
					.minus(viewport.offset)
					.floorTo(scene.cellSize * viewport.scale)
					.plus(viewport.offset),
				bottomRight: previewArea.bottomRight
					.minus(viewport.offset)
					.ceilingTo(scene.cellSize * viewport.scale)
					.plus(viewport.offset),
			})

		const gridSize = gridSnappedPreviewArea?.size.dividedBy(scene.cellSize * viewport.scale).rounded

		tokenElements = (
			<RectDrawArea
				className="absolute inset-0"
				preview={false}
				rect={previewArea}
				onRectChange={setPreviewArea}
				onFinish={() => {
					if (!gridSnappedPreviewArea) {
						throw new Error("grid preview area is undefined")
					}

					const position = gridSnappedPreviewArea.topLeft
						.minus(viewport.offset)
						.dividedBy(viewport.scale).xy

					const size = gridSnappedPreviewArea.size.dividedBy(viewport.scale).toSize()

					addToken({
						sceneId: scene._id,
						visible: true,
						position: position,
						area: {
							...size,
							color: randomItem(["red", "orange", "yellow", "green", "blue", "purple"]),
						},
					})
					roomToolbarActions.enableSelectTool()
				}}
			>
				<div className="pointer-events-none size-full opacity-50">{tokenElements}</div>
				{gridSnappedPreviewArea && (
					<div
						className="flex-center absolute left-0 top-0 rounded border-4 border-blue-500 bg-blue-500/30"
						style={{
							translate: gridSnappedPreviewArea.topLeft.css.translate(),
							...gridSnappedPreviewArea.size.toSize(),
						}}
					>
						<p className="rounded-lg bg-black p-3 text-xl/none font-bold text-white opacity-50">
							{gridSize?.x}x{gridSize?.y}
						</p>
					</div>
				)}
			</RectDrawArea>
		)
	} else {
		tokenElements = (
			<DragSelectArea className="absolute inset-0 size-full" store={dragSelectStore}>
				{tokenElements}
				<TokenMenu
					store={tokenMenuStore}
					anchor={tokenMenuAnchorRect}
					selectedTokens={selectedTokens}
				/>
			</DragSelectArea>
		)
	}

	return (
		<CharacterDnd.Dropzone
			className="absolute inset-0"
			onDrop={(character, event) => {
				const position = Vector.from(event.clientX, event.clientY)
					.minus(viewport.offset)
					.minus((scene.cellSize / 2) * viewport.scale)
					.dividedBy(viewport.scale).xy

				const existing = tokens.find((it) => it.character?._id === character._id)
				if (existing) {
					updateToken({
						key: existing.key,
						sceneId: scene._id,
						position,
					})
				} else {
					addToken({
						sceneId: scene._id,
						characterId: character._id,
						position,
						visible: character.visible,
					})
				}
			}}
		>
			{tokenElements}
		</CharacterDnd.Dropzone>
	)
}

function TokenMenu({
	store,
	anchor,
	selectedTokens,
}: {
	store: PopoverStore
	anchor: Rect
	selectedTokens: () => Iterator<ApiToken>
}) {
	const room = useRoom()

	const selectedCharacters = selectedTokens()
		.map((it) => it.character)
		.filter((it) => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0
	const singleSelectedCharacter = !selectedCharacters[1] && selectedCharacters[0]

	return (
		<Popover store={store}>
			<PopoverPanel
				getAnchorRect={() => anchor}
				modal={false}
				fixed
				flip={false}
				className="flex w-min flex-col gap-2 rounded-xl p-2"
			>
				<div className="flex gap-[inherit]">
					{singleSelectedCharacter && (
						<CharacterModal character={singleSelectedCharacter}>
							<Tooltip content="View profile">
								<ModalButton render={<Button icon={<Lucide.BookUser />} />} />
							</Tooltip>
						</CharacterModal>
					)}
					{selectionHasCharacters && (
						<Tooltip content="Roll attribute">
							<Button icon={<Lucide.Dices />} />
						</Tooltip>
					)}
					{selectionHasCharacters && (
						<Tooltip content="Update damage">
							<Button icon={<Lucide.HeartPulse />} />
						</Tooltip>
					)}
					{selectionHasCharacters && (
						<Tooltip content="Update stress">
							<Button icon={<Lucide.Brain />} />
						</Tooltip>
					)}
					<Tooltip content="Choose random">
						<Button icon={<Lucide.Shuffle />} />
					</Tooltip>
					{room.isOwner && (
						<Tooltip content="Hide token">
							<Button icon={<Lucide.Image />} />
						</Tooltip>
					)}
					{room.isOwner && (
						<Tooltip content="Hide name">
							<Button icon={<Lucide.Eye />} />
						</Tooltip>
					)}
				</div>
				{singleSelectedCharacter && (
					<FormField label="Skills">
						<CharacterSkillsShortList character={singleSelectedCharacter} />
					</FormField>
				)}
				{singleSelectedCharacter && <CharacterNotesFields character={singleSelectedCharacter} />}
			</PopoverPanel>
		</Popover>
	)
}

function CharacterSkillsShortList({ character }: { character: ApiCharacter }) {
	const skills = useCharacterSkills(character)
	return (
		<ul className="flex flex-wrap gap-2">
			{skills.map((skill) => (
				<HovercardProvider key={skill.name} timeout={250} placement="top">
					<HovercardAnchor
						render={<li />}
						className={panel(
							"leading-none font-light bg-primary-200/50 hover:bg-primary-200 cursor-default transition p-2",
						)}
					>
						{skill.name}
					</HovercardAnchor>
					<Hovercard
						className={translucentPanel(
							"p-2 max-w-xs opacity-0 translate-y-1 transition data-[enter]:opacity-100 data-[enter]:translate-y-0 shadow-md shadow-black/50 whitespace-pre-line pointer-events-none",
						)}
						unmountOnHide
						gutter={12}
						portal
					>
						{skill.description}
					</Hovercard>
				</HovercardProvider>
			))}
		</ul>
	)
}

function useAddTokenMutation() {
	const characters = useCharacters()
	return useMutation(api.scenes.tokens.add).withOptimisticUpdate((store, args) => {
		const charactersById = keyedByProperty(characters, "_id")
		for (const entry of queryMutators(store, api.scenes.tokens.list)) {
			entry.set([
				...entry.value,
				{
					...args,
					key: crypto.randomUUID() as Branded<"token">,
					character: args.characterId ? charactersById.get(args.characterId) : undefined,
				},
			])
		}
	})
}

function useUpdateTokenMutation() {
	return useMutation(api.scenes.tokens.update).withOptimisticUpdate((store, args) => {
		for (const entry of queryMutators(store, api.scenes.tokens.list)) {
			if (!entry.value) continue
			entry.set(patchByKey(entry.value, "key", args).toArray())
		}
	})
}

export function TokenLabel(props: { text: string; subText: string }) {
	const [visible, setVisible] = useState(false)
	const hoverAreaRef = React.useRef<HTMLDivElement>(null)

	// this needs to ignore pointer events for dragging and other stuff to work,
	// so we'll use a global listener and check position instead for this
	// TODO: use a portal instead, probably
	useWindowEvent("pointermove", (event) => {
		if (!hoverAreaRef.current) return
		const rect = Rect.from(hoverAreaRef.current.getBoundingClientRect())
		setVisible(rect.contains(event.clientX, event.clientY))
	})

	return (
		<>
			<div className="absolute inset-0" ref={hoverAreaRef} />
			<div
				className="flex-center absolute inset-x-0 top-full translate-y-2 opacity-0 transition-opacity data-[visible=true]:opacity-100"
				data-visible={visible}
			>
				<div className="flex-center whitespace-nowrap rounded bg-black/50 px-2.5 py-2 text-center shadow shadow-black/50">
					<p className="text-lg/none">{props.text}</p>
					<p className="mt-0.5 text-base/none opacity-75 empty:hidden">{props.subText}</p>
				</div>
			</div>
		</>
	)
}

export function TokenMeter({
	value,
	className,
}: { value: number; className: { base: string; warning: string; danger: string } }) {
	return (
		<div
			aria-hidden
			className={twMerge(
				"h-3 w-24 rounded border border-current shadow shadow-black/50 relative transition-all",
				value < 0.5 ? className.base : value < 0.8 ? className.warning : className.danger,
				value > 0 ? "opacity-100 visible" : "opacity-0 invisible",
			)}
		>
			<div
				className="absolute inset-0 origin-left bg-current transition-[scale]"
				style={{ scale: `${clamp(value, 0, 1)} 1` }}
			/>
			<div className="absolute inset-0 bg-current opacity-25" />
		</div>
	)
}
