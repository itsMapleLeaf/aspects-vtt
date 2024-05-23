import { bindWindowEvent } from "../../common/dom.ts"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { panel } from "../../ui/styles.ts"
import bannerUrl from "./banner.webp"
import Content from "./content.mdx"
import "./markdown.css"

export default function GuideRoute() {
	return (
		<>
			<title>How to Play | Aspects VTT</title>

			<div className="sticky inset-x-0 top-0 z-10 border-b border-primary-300 bg-primary-100 p-4 shadow-md">
				<AppHeader />
			</div>

			<section className="flex-center relative aspect-[5/2] min-h-64 w-full overflow-clip border-b border-primary-300 p-8 text-center font-light">
				<div
					style={{ backgroundImage: `url(${bannerUrl})` }}
					className="absolute inset-0 bg-cover bg-top bg-no-repeat brightness-75"
					ref={(element) => {
						return bindWindowEvent("scroll", () => {
							if (element) {
								element.style.translate = `0 ${window.scrollY / 2}px`
							}
						})
					}}
				></div>
				<h2 className="text-4xl tracking-wider drop-shadow-xl sm:text-6xl">Aspects of Nature</h2>
				<p className="text-2xl tracking-wide drop-shadow-xl">How to play</p>
			</section>

			<main
				className={panel("markdown relative mx-auto -mt-16 mb-8 w-full max-w-2xl p-4 shadow-md")}
			>
				<Content />
			</main>
		</>
	)
}
