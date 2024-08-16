import { lerp } from "../../../common/math.ts"
import { GameTime } from "../game/GameTime.tsx"

// rate of change over time
const variation = 8

export function getSceneWeather(timestamp: number) {
	// how hot it is from 0 to 1
	const temperatureNormal = deterministicPseudoRandom(
		timestamp * variation,
		7,
		13,
		19,
	)

	// how cloudy it is from 0 to 1
	const cloudCover = deterministicPseudoRandom(timestamp * variation, 9, 11, 17)

	// how rainy or snowy it is from 0 to 1
	// multiply by cloud cover to lower the chance of precipitation with clear skies
	// temperature should change a lot more frequently than the other factors
	const precipitation =
		deterministicPseudoRandom(timestamp * variation, 5, 17, 19) * cloudCover

	// wind speed from 0 to 1
	const windSpeed = deterministicPseudoRandom(timestamp * variation, 11, 17, 23)

	const progressMonths = timestamp / GameTime.DaysInMonth
	const distanceToMidSummer = Math.abs(((progressMonths - 0.5) % 4) - 2) / 2

	// modify depending on time of day
	// 1 -> 0.5 -> 0
	const daylightModifier =
		(GameTime.TimesOfDay.length - 1 - new GameTime(timestamp).timeOfDay) /
		(GameTime.TimesOfDay.length - 1)

	// temperature range is dependent on how far we are from mid summer
	const minTemperatureFahrenheit = lerp(
		-30,
		50,
		distanceToMidSummer * lerp(0.7, 1, daylightModifier),
	)
	const maxTemperatureFahrenheit = lerp(
		50,
		120,
		distanceToMidSummer * lerp(0.7, 1, daylightModifier),
	)

	// get the actual temperature using the range and the normal temperature
	const temperatureFahrenheit = lerp(
		minTemperatureFahrenheit,
		maxTemperatureFahrenheit,
		temperatureNormal,
	)

	const temperatureCelsius = (temperatureFahrenheit - 32) * (5 / 9)

	const precipitationType = temperatureCelsius > 0 ? "Rain" : "Snow"

	return {
		temperatureFahrenheit: temperatureFahrenheit.toFixed(0),
		temperatureCelsius: temperatureCelsius.toFixed(0),

		cloudCover:
			cloudCover > 0.9 ? ("Overcast" as const)
			: cloudCover > 0.5 ? ("Cloudy" as const)
			: cloudCover > 0.2 ? ("Partly Cloudy" as const)
			: ("Sunny" as const),

		precipitation:
			precipitation > 0.9 ? (`Heavy ${precipitationType}` as const)
			: precipitation > 0.5 ? (`${precipitationType}ing` as const)
			: precipitation > 0.2 ? (`Light ${precipitationType}` as const)
			: undefined,

		windSpeed:
			windSpeed > 0.9 ? ("Very Windy" as const)
			: windSpeed > 0.5 ? ("Windy" as const)
			: windSpeed > 0.2 ? ("Breezy" as const)
			: undefined,
	}
}

function deterministicPseudoRandom(
	seed: number,
	c1: number,
	c2: number,
	c3: number,
) {
	const result = Math.sin(seed / c1) + Math.sin(seed / c2) + Math.sin(seed / c3)
	return result / 6 + 0.5
}
