import * as Lucide from "lucide-react"
import { GameTime } from "~/modules/game/GameTime.tsx"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { useSelectedScene } from "~/modules/scenes/hooks.ts"
import { getSceneWeather } from "~/modules/scenes/weather.ts"

export function SceneHeading() {
	const scene = useSelectedScene()
	const room = useRoom()
	if (!scene) return

	const gameTime = new GameTime(room.gameTime)
	const weather = getSceneWeather(room.gameTime ?? 0)

	const weatherIcon = (() => {
		if (
			weather.precipitation === "Light Snow" ||
			weather.precipitation === "Snowing" ||
			weather.precipitation === "Heavy Snow"
		) {
			return <Lucide.Snowflake />
		}

		if (weather.precipitation === "Light Rain") {
			return <Lucide.CloudDrizzle />
		}

		if (
			weather.precipitation === "Raining" ||
			weather.precipitation === "Heavy Rain"
		) {
			return weather.windSpeed === "Very Windy" ?
					<Lucide.LucideCloudRainWind />
				:	<Lucide.CloudRain />
		}

		if (weather.cloudCover === "Overcast") {
			return <Lucide.Waves />
		}

		if (weather.cloudCover === "Cloudy") {
			return <Lucide.Cloudy />
		}

		if (weather.cloudCover === "Sunny") {
			return <Lucide.Sun />
		}

		return <Lucide.CloudSun />
	})()

	return (
		<h2 className="pointer-events-none fixed inset-x-0 top-3 mx-auto flex max-w-md select-none flex-col items-center text-pretty p-4 text-center text-2xl font-light tracking-wide text-primary-900/90 drop-shadow-[0px_0px_3px_rgba(0,0,0,0.9)] gap-0.5">
			{scene.name}
			<p className="text-base font-medium tracking-wide">
				{gameTime.monthName.name} the {formatWithRankSuffix(gameTime.day + 1)},{" "}
				{gameTime.year + 1} • {gameTime.timeOfDayName}
			</p>
			<div className="flex items-center gap-1.5">
				{weatherIcon}
				<p className="text-base font-medium tracking-wide">
					{[
						weather.precipitation,
						`${weather.temperatureFahrenheit}°F / ${weather.temperatureCelsius}°C`,
						weather.cloudCover,
						weather.windSpeed,
					]
						.filter(Boolean)
						.join(" • ")}
				</p>
			</div>
		</h2>
	)
}

function formatWithRankSuffix(number: number) {
	if (number % 10 === 1) return `${number}st`
	if (number % 10 === 2) return `${number}nd`
	if (number % 10 === 3) return `${number}rd`
	return `${number}th`
}
