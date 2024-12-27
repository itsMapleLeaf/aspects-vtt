import { HeadingLevel } from "@ariakit/react"
import { Link } from "react-router"
import {
	LucideBoxes,
	LucideChevronUpSquare,
	LucideCircle,
	LucideFlame,
	LucideLink,
	LucideSquare,
} from "lucide-react"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { textArea, textInput } from "~/styles/input.ts"
import { panel } from "~/styles/panel.ts"
import { primaryHeading } from "~/styles/text.ts"

export default function DesignSystem() {
	return (
		<main className="mx-auto flex w-full max-w-(--breakpoint-md) flex-col gap-8 p-8">
			<PageSection title="Button">
				<div className="flex gap-2">
					<Button appearance="solid" icon={<LucideFlame />}>
						solid
					</Button>
					<Button appearance="clear" icon={<LucideBoxes />}>
						clear
					</Button>
					<Button appearance="outline" icon={<LucideChevronUpSquare />}>
						outline
					</Button>
				</div>
				<div className="flex gap-2">
					<Button size="large" icon={<LucideFlame />}>
						large
					</Button>
					<Button size="medium" icon={<LucideFlame />}>
						medium
					</Button>
					<Button size="small" icon={<LucideFlame />}>
						small
					</Button>
					<Button square icon={<LucideSquare />} />
					<Button square rounded icon={<LucideCircle />} />
				</div>
				<div className="flex gap-2">
					<Button pending icon={<LucideFlame />}>
						pending
					</Button>
					<Button disabled icon={<LucideFlame />}>
						disabled
					</Button>
					<Button asChild icon={<LucideLink />}>
						<Link to=".">link</Link>
					</Button>
				</div>
			</PageSection>

			<PageSection title="Input">
				<input
					type="text"
					className={textInput()}
					defaultValue="enter some text"
				/>
			</PageSection>

			<PageSection title="Textarea">
				<textarea
					className={textArea()}
					defaultValue={"some lines\n\nsome more\nlines"}
					rows={3}
				/>
				<div className="grid auto-cols-fr grid-flow-col gap-2">
					<input
						type="text"
						className={textInput()}
						defaultValue="should be same height"
					/>
					<textarea
						className={textArea()}
						rows={1}
						defaultValue="should be same height"
					/>
				</div>
			</PageSection>

			<PageSection title="Loading Cover">
				<div className="border-primary-700 relative h-[480px] overflow-clip rounded-lg border">
					<LoadingCover visible={true} />
				</div>
			</PageSection>

			<PageSection title="Natural Gradient">
				<GradientBox natural>Natural</GradientBox>
				<GradientBox>Linear</GradientBox>
			</PageSection>
		</main>
	)
}

function PageSection({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-2">
			<HeadingLevel>
				<Heading className={primaryHeading()}>{title}</Heading>
				{children}
			</HeadingLevel>
		</section>
	)
}

function GradientBox({
	children,
	natural,
}: {
	children: React.ReactNode
	natural?: boolean
}) {
	return (
		<div
			className={panel(
				"from-accent-500 grid h-40 place-content-center rounded-none bg-linear-to-r",
				natural && "natural-gradient",
			)}
		>
			<p className="text-primary-100 font-medium tracking-wide drop-shadow-sm">
				{children}
			</p>
		</div>
	)
}
