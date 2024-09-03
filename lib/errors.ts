export class AppError extends Error {
	readonly userMessage: string

	constructor(args: {
		userMessage: string
		message?: string
		cause?: unknown
	}) {
		super(args.message, { cause: args.cause })
		this.userMessage = args.userMessage
	}
}
