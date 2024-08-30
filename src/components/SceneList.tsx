import { LucideImagePlus } from "lucide-react"
import { SearchableList } from "../ui/SearchableList.tsx"
import { clearButton, heading2xl } from "../ui/styles.ts"

const mockScenes = [
	{
		_id: "1",
		name: "Rosenfeld",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "2",
		name: "Whisperwood Forest",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "3",
		name: "Azeurus",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "4",
		name: "The Caldera",
		// background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "5",
		name: "Aeropolis",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "6",
		name: "The Undergrowth",
		// background: "https://placehold.co/800x450.webp",
	},
]

export function SceneList() {
	return (
		<SearchableList
			items={mockScenes}
			renderItem={(scene) => <SceneCard scene={scene} />}
			searchKeys={["name"]}
			actions={
				<button type="button" className={clearButton()}>
					<LucideImagePlus />
					<span className="sr-only">Create scene</span>
				</button>
			}
		/>
	)
}

function SceneCard({ scene }: { scene: (typeof mockScenes)[number] }) {
	return (
		<div className="group relative grid h-20 cursor-default place-content-center">
			<div
				style={{ backgroundImage: `url(${scene.background})` }}
				className="absolute inset-0 size-full rounded-lg object-cover brightness-[40%] backdrop-blur-lg transition group-hover:brightness-[60%] group-hover:backdrop-blur-sm"
			/>
			<p className={heading2xl("relative")}>{scene.name}</p>
		</div>
	)
}
