import { ScrollArea } from "~/ui/ScrollArea.tsx"

export default function ScrollAreaTest() {
	return (
		<div className="h-[300px] w-[300px]">
			<ScrollArea>
				<div className="h-[1000px] w-[1000px] bg-gradient-to-br from-blue-500 to-red-500" />
			</ScrollArea>
		</div>
	)
}
