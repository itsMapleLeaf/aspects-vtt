import { HeadingLevel } from "@ariakit/react"
import { Link } from "@remix-run/react"
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
import { primaryHeading } from "~/styles/text.ts"

export default function DesignSystem() {
	return (
		<main className="mx-auto flex w-full max-w-screen-md flex-col p-8 gap-8">
			<section>
				<HeadingLevel>
					<Heading className={primaryHeading()}>Button</Heading>
					<div className="my-2 flex gap-2">
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
					<div className="my-2 flex gap-2">
						<Button size="large" icon={<LucideFlame />}>
							large
						</Button>
						<Button size="medium" icon={<LucideFlame />}>
							medium
						</Button>
						<Button size="small" icon={<LucideFlame />}>
							small
						</Button>
						<Button shape="square" icon={<LucideSquare />} />
						<Button shape="circle" icon={<LucideCircle />} />
					</div>
					<div className="my-2 flex gap-2">
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
				</HeadingLevel>
			</section>

			<section>
				<HeadingLevel>
					<Heading className={primaryHeading()}>Loading Cover</Heading>
				</HeadingLevel>
				<div className="relative mt-2 size-[480px] overflow-clip rounded-lg border border-primary-700">
					<LoadingCover visible={true} />
				</div>
			</section>
		</main>
	)
}
