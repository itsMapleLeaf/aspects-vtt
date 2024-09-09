import { useSearchParams } from "@remix-run/react"
import { LucideEye, LucideImageOff, LucidePlay } from "lucide-react"
import { Pressable, PressableProps } from "../../ui/Pressable.tsx"
import { heading2xl, panel } from "../../ui/styles.ts"
import { ApiScene } from "./types.ts"

/** A card displayed in the scene list. */
export function SceneListCard({
	scene,
	...props
}: { scene: ApiScene } & PressableProps) {
	const [searchParams] = useSearchParams()
	const previewSceneId = searchParams.get("preview")

	return (
		<Pressable
			{...props}
			className={panel(
				"group relative grid h-20 cursor-default select-none place-content-center overflow-clip",
				props.className,
			)}
			data-testid="scene-card"
		>
			{scene.activeBackgroundUrl ?
				<img
					src={scene.activeBackgroundUrl}
					alt=""
					className="absolute inset-0 size-full scale-110 object-cover blur-sm brightness-[35%] transition group-hover:blur-0 group-aria-expanded:blur-0"
				/>
			:	<div className="absolute inset-0 grid place-content-center">
					<LucideImageOff className="size-16 opacity-25" />
				</div>
			}
			<div className="relative truncate px-4 text-center">
				<p className={heading2xl("min-w-0 truncate text-center text-xl")}>
					{scene.name}
				</p>
				{scene.isActive ?
					<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
						<LucidePlay className="size-4" />
						<span>Now playing</span>
					</p>
				: previewSceneId === scene._id ?
					<p className="relative flex items-center justify-center text-sm font-bold text-primary-200 opacity-75 gap-1">
						<LucideEye className="size-4" />
						<span>Previewing</span>
					</p>
				:	null}
			</div>
		</Pressable>
	)
}
