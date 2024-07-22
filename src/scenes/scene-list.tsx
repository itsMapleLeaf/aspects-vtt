import { GridList } from "../ui/grid-list.tsx"

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
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "5",
		name: "Aeropolis",
		background: "https://placehold.co/800x450.webp",
	},
	{
		_id: "6",
		name: "The Undergrowth",
		background: "https://placehold.co/800x450.webp",
	},
]

export function SceneList() {
	return (
		<GridList className="gap-4">
			{mockScenes.map((scene) => (
				<SceneCard key={scene._id} scene={scene} />
			))}
		</GridList>
	)
}

function SceneCard({ scene }: { scene: (typeof mockScenes)[number] }) {
	return (
		<figure className="group transition">
			<img
				className="aspect-video w-full rounded-md transition group-hover:brightness-110"
				src={scene.background}
				alt={`Preview of ${scene.name}`}
			/>
			<figcaption className="mt-1 group-hover:text-accent-200">
				{scene.name}
			</figcaption>
		</figure>
	)
}
