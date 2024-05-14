import { bindWindowEvent } from "../../common/dom.ts"
import { AppHeader } from "../../ui/AppHeader.tsx"
import bannerUrl from "./banner.webp"

export default function GuideRoute() {
	return (
		<>
			<title>How to Play | Aspects VTT</title>

			<div className="sticky inset-x-0 top-0 z-10 border-b border-primary-300 bg-primary-100 p-4 shadow-md">
				<AppHeader />
			</div>

			<section className="flex-center relative aspect-[5/2] min-h-64 w-full overflow-clip p-8 text-center font-light">
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

			<div className="relative w-full">
				<main className="relative mx-auto h-[150dvh] w-full max-w-screen-sm bg-primary-200 p-4">
					<p></p>
				</main>
			</div>
		</>
	)
}
