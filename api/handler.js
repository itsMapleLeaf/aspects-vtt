import { createRequestHandler } from "@vercel/remix"
import * as build from "../build/server/index.js"

export default createRequestHandler(build, process.env.NODE_ENV)
