import { createDndModule } from "../../ui/dnd.tsx"
import type { ApiCharacter } from "./types.ts"

export const CharacterDnd = createDndModule<ApiCharacter>()
