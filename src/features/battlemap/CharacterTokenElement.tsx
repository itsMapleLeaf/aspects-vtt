import { ComponentProps, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Vec } from "~/shared/vec.ts"
import { ApiCharacter } from "../characters/types.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { BaseTokenElement } from "./BaseTokenElement.tsx"

export function CharacterTokenElement({
	character,
	selected,
	children: _,
	annotationLayer,
	viewport,
	...props
}: {
	character: ApiCharacter
	selected: boolean
	annotationLayer: HTMLElement | null
	viewport: { scale: number }
} & ComponentProps<typeof BaseTokenElement>) {
	const [annotationsVisible, setAnnotationsVisible] = useState(false)
	const altPressed = useKeyPressed("Alt")

	return (
		<>
			<BaseTokenElement {...props}>
				{character.imageId && (
					<img
						src={getImageUrl(character.imageId)}
						alt=""
						className="absolute inset-0 size-full rounded-full object-cover object-top"
						draggable={false}
						onPointerEnter={() => setAnnotationsVisible(true)}
						onPointerLeave={() => setAnnotationsVisible(false)}
					/>
				)}
				{selected && (
					<div className="pointer-events-none absolute -inset-0.5 rounded-full border-2 border-accent-900 bg-accent-600/50 transition-opacity" />
				)}
			</BaseTokenElement>

			{annotationLayer &&
				createPortal(
					<div
						// using opacity-95 because the browser (just Firefox?)
						// disables GPU rendering at 100,
						// which causes weird artifacts like pixel shifting
						className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity data-[visible=true]:opacity-95"
						data-visible={annotationsVisible || altPressed}
						style={{
							transform: `translate(${Vec.from(props.token.position)
								.times(viewport.scale)
								.toCSSPixels()})`,
						}}
					>
						<div
							className="relative"
							style={{
								width: props.scene.cellSize * viewport.scale,
								height: props.scene.cellSize * viewport.scale,
							}}
						>
							<div className="absolute left-1/2 top-full -translate-x-1/2 p-2">
								<div className="flex items-center whitespace-nowrap rounded border border-black bg-black/75 px-2 py-1 text-center font-medium leading-5 backdrop-blur-sm">
									{character.identity?.name}
								</div>
							</div>
						</div>
					</div>,
					annotationLayer,
				)}
		</>
	)
}

function useKeyPressed(targetKey: string) {
	const [isPressed, setIsPressed] = useState(false)

	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener(
			"keydown",
			function handleKeyDown(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setIsPressed(true)
				}
			},
			{ signal: controller.signal },
		)

		window.addEventListener(
			"keyup",
			function handleKeyUp(event: KeyboardEvent) {
				if (event.key === targetKey) {
					event.preventDefault()
					setIsPressed(false)
				}
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	}, [targetKey])

	return isPressed
}
