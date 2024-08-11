import { GridList } from "../../ui/grid-list.tsx"
import { ImageCard } from "../../ui/image-card.tsx"

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
		<GridList className="gap-4">
			{mockScenes.map((scene) => (
				<SceneCard key={scene._id} scene={scene} />
			))}
		</GridList>
	)
}

function SceneCard({ scene }: { scene: (typeof mockScenes)[number] }) {
	return (
		<ImageCard caption={scene.name}>
			{scene.background ? (
				<ImageCard.Image src={scene.background} />
			) : (
				<ImageCard.Placeholder />
			)}
		</ImageCard>
	)
}
