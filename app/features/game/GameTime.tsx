import { expect } from "../../common/expect.ts"

export class GameTime {
	static readonly DaysInWeek = 6
	static readonly DaysInMonth = 24
	static readonly MonthsInYear = 4
	static readonly TimesOfDay = ["Daytime", "Evening", "Night"] as const

	static readonly Months = [
		{ name: "Sunburst", season: "Summer" },
		{ name: "Harvest", season: "Fall" },
		{ name: "Snowfall", season: "Winter" },
		{ name: "Blossom", season: "Spring" },
	] as const

	readonly #time

	/**
	 * @param timestamp The amount in days since the start of the calendar.
	 * This is required to prevent mistakes.
	 */
	constructor(timestamp: number | undefined) {
		this.#time = Math.max(0, timestamp ?? 0)
	}

	get day() {
		return Math.floor(this.#time % GameTime.DaysInMonth)
	}

	get dayOfWeek() {
		return Math.floor(this.#time % GameTime.DaysInWeek)
	}

	get week() {
		return Math.floor(this.day / GameTime.DaysInWeek)
	}

	get month() {
		return Math.floor(this.#time / GameTime.DaysInMonth) % GameTime.MonthsInYear
	}

	get monthName() {
		return expect(GameTime.Months[this.month])
	}

	get year() {
		return Math.floor(this.month / GameTime.MonthsInYear) // 4 months in a year
	}

	get timeOfDay() {
		return (this.#time * GameTime.TimesOfDay.length) % GameTime.TimesOfDay.length
	}

	// visible during the first half of each week
	get auroraVisible() {
		return this.dayOfWeek < GameTime.DaysInWeek / 2
	}

	// visible during the first three quarters of the month
	get nocturneVisible() {
		return this.day < GameTime.DaysInMonth * (3 / 4)
	}
}
