import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()
crons.daily("import notion docs", { hourUTC: 17, minuteUTC: 0 }, internal.notionImports.importData)
export default crons
