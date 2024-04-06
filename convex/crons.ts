import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()
crons.weekly(
	"import notion docs",
	{ dayOfWeek: "friday", hourUTC: 17, minuteUTC: 0 },
	internal.notionImports.importData,
)
export default crons
