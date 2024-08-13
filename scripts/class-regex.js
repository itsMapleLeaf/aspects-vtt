/* eslint-disable */
const testContent = `
const className = twMerge(
  panel(),

  "flex-center-row gap-2",

  size === "sm" && "h-8 px-2",
  size === "md" && "h-10 px-3",
  size === "lg" && "h-12 px-4",

  "content-['']",

  "rounded border border-primary-300",

  "relative before:absolute before:inset-0 before:size-full",

  "transition active:duration-0",
  "before:transition active:before:duration-0",

  "bg-primary-300/30",
  "before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

  "translate-y-0 active:translate-y-0.5",
  "before:origin-bottom before:scale-y-0 hover:before:scale-y-100",

  "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
)

withMergedClassName()
`

const sequence = (...items) => items.join("")
const either = (...items) => items.join("|")
const capture = (...content) => `(${sequence(...content)})`
const group = (...content) => `(?:${sequence(...content)})`
const oneOrMoreOf = (...content) => `${sequence(...content)}+`
const zeroOrMoreOf = (...content) => `${sequence(...content)}*`
const lazyOneOrMoreOf = (...content) => `${sequence(...content)}+?`
const lazyZeroOrMoreOf = (...content) => `${sequence(...content)}*?`
const characters = (...chars) => `[${sequence(...chars)}]`
const notCharacters = (...chars) => `[^${sequence(...chars)}]`
const anyCharacter = "[^]"
const space = "\\s"

const fnPattern = sequence(
	group(either("twMerge", "tw", "withMergedClassName")),
	zeroOrMoreOf(space),
	`\\(`,
	capture(
		oneOrMoreOf(
			group(
				either(
					sequence("\\(", zeroOrMoreOf(notCharacters(")")), "\\)"),
					notCharacters(")"),
				),
			),
		),
	),
)

const singleQuote = "'"
const doubleQuote = '"'
const backTick = "`"
const quotes = characters(singleQuote, doubleQuote, backTick)
const nonQuotes = notCharacters(singleQuote, doubleQuote, backTick)
const classPattern = sequence(quotes, capture(oneOrMoreOf(nonQuotes)), quotes)

if (process.argv.includes("--debug")) {
	for (const fnContentMatch of testContent.matchAll(fnPattern)) {
		for (const classMatch of fnContentMatch[1].matchAll(classPattern)) {
			console.debug(classMatch[1])
		}
	}
}

console.info(JSON.stringify([fnPattern, classPattern], null, 2))
