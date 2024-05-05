import { expect } from "../../common/expect.ts"
import { clamp } from "../../common/math.ts"

export interface GameDate {
	year: number
	month: number
	day: number
	time: number
}

export class GameTime {
	static readonly MonthsInYear = 4
	static readonly DaysInWeek = 6
	static readonly DaysInMonth = 24
	static readonly DaysInYear = this.DaysInMonth * this.MonthsInYear
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

	static fromDate({ year, month, day, time }: GameDate) {
		return year * GameTime.DaysInYear + month * GameTime.DaysInMonth + day + time
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
		return Math.floor(this.#time / GameTime.DaysInYear)
	}

	get time() {
		return this.#time % 1
	}

	get timeOfDay() {
		return clamp(
			Math.round(this.time * GameTime.TimesOfDay.length),
			0,
			GameTime.TimesOfDay.length - 1,
		)
	}

	get timeOfDayName() {
		return expect(GameTime.TimesOfDay[this.timeOfDay])
	}

	// visible during the first half of each week
	get auroraVisible() {
		return this.dayOfWeek < GameTime.DaysInWeek / 2
	}

	// visible during the first three quarters of the month
	get nocturneVisible() {
		return this.day < GameTime.DaysInMonth * (3 / 4)
	}

	withDate(date: Partial<GameDate>) {
		return GameTime.fromDate({
			year: date.year ?? this.year,
			month: date.month ?? this.month,
			day: date.day ?? this.day,
			time: date.time ?? this.time,
		})
	}

	add(date: Partial<GameDate>) {
		return GameTime.fromDate({
			year: this.year + (date.year ?? 0),
			month: this.month + (date.month ?? 0),
			day: this.day + (date.day ?? 0),
			time: this.time + (date.time ?? 0),
		})
	}
}
