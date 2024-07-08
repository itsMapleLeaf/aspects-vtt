import { Outlet } from "@remix-run/react"
import { Suspense, useRef } from "react"
import banner from "~/assets/banner.webp"
import { useWindowEvent } from "~/helpers/dom/events.ts"
import { unwrap } from "~/helpers/errors.ts"
import { AppHeader } from "~/ui/AppHeader.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"

export default function GuideLayout() {
	return (
		<>
			<style>{`
				:root {
					overflow-x: clip;
				}
			`}</style>

			<div className="fixed inset-x-0 top-0 z-10 h-32 p-4 bg-natural-gradient-100">
				<AppHeader />
			</div>

			<div className="relative w-full overflow-clip">
				<ParallaxBanner />
				<div className="absolute inset-x-0 bottom-0 h-24 translate-y-px -scale-y-100 bg-natural-gradient-100"></div>
			</div>

			<div className="mx-auto flex max-w-screen-lg gap-2 p-4">
				<div className="sticky top-16 h-fit w-56">
					<ScrollArea>
						<GuideNav />
					</ScrollArea>
				</div>
				<Suspense fallback={<Loading />}>
					<main className="h-[200dvh] min-w-0 flex-1">
						<div className="prose prose-invert prose-headings:font-light prose-headings:mb-2 prose-headings:mt-10 relative rounded-lg bg-primary-200 p-4 text-primary-900 shadow-md">
							<Outlet />
						</div>
					</main>
				</Suspense>
			</div>
		</>
	)
}

function GuideNav() {
	return <nav className="flex flex-col">{/* todo: generate this from headers */}</nav>
}

function ParallaxBanner() {
	const ref = useRef<HTMLImageElement>(null)

	useWindowEvent("scroll", () => {
		const scroll = window.scrollY
		unwrap(ref.current).style.transform = `translateY(${scroll * 0.75}px)`
	})

	return (
		<img
			src={banner}
			alt=""
			draggable={false}
			className="aspect-[20/7] max-h-[32rem] min-h-[16rem] w-full object-cover object-[50%,25%]"
			ref={ref}
		/>
	)
}