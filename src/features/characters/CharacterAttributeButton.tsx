import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { startCase } from "lodash-es"
import { LucideDices } from "lucide-react"
import * as v from "valibot"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeName } from "~/features/characters/types.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { NumberInputField } from "../forms/fields.tsx"
import { Form } from "../forms/Form.tsx"
import { useFields, useForm, valibotAction } from "../forms/useForm.ts"
import { getAttributeDie } from "./helpers.ts"

export function CharacterAttributeButton({
	character,
	attribute,
	icon,
}: {
	character: NormalizedCharacter
	attribute: CharacterAttributeName
	icon: React.ReactNode
}) {
	const createMessage = useMutation(api.messages.create)
	const attributeDieFaces = getAttributeDie(character.attributes[attribute])

	const form = useForm({
		initialValues: {
			boost: 0,
			snag: 0,
			pushYourself: false,
		},
		action: valibotAction(
			v.object({
				boost: v.pipe(v.number(), v.integer(), v.minValue(0)),
				snag: v.pipe(v.number(), v.integer(), v.minValue(0)),
				pushYourself: v.boolean(),
			}),
			async (values) => {
				await createMessage({
					characterId: character._id,
					content: [
						{
							type: "text",
							text: `${character.name} rolled ${startCase(attribute)}`,
						},
						{
							type: "diceRoll",
							dice: [
								{ faces: attributeDieFaces },
								{ faces: attributeDieFaces },
								...Iterator.range(
									values.boost + (values.pushYourself ? 1 : 0),
								).map(() => ({
									faces: 6,
									color: "green",
								})),
								...Iterator.range(values.snag).map(() => ({
									faces: 6,
									color: "red",
									operation: "subtract",
								})),
							],
						},
					],
				})
			},
		),
	})

	const fields = useFields(form)

	return (
		<Popover.Root placement="bottom-start">
			<div className="flex flex-col items-center gap-0.5">
				<Popover.Button
					render={
						<Button appearance="clear" square icon={icon} type="button" />
					}
				/>
				<p className="text-[12px] font-semibold leading-3 text-primary-200">
					d{attributeDieFaces}
				</p>
			</div>
			<Popover.Content>
				<Form form={form} className="flex flex-col p-gap gap">
					<Heading className={secondaryHeading()}>
						Rolling <strong>{startCase(attribute)}</strong>
					</Heading>
					<div className="flex gap-2">
						<NumberInputField label="Boost dice" field={fields.boost} />
						<NumberInputField label="Snag dice" field={fields.snag} />
					</div>
					<label className="flex items-center gap-2">
						<input type="checkbox" {...fields.pushYourself.checkbox} />
						<div>
							<p>Push yourself</p>
							<p className={subText()}>
								Spend 2 resolve to add a d6 boost die.
							</p>
						</div>
					</label>
					<Button type="submit" icon={<LucideDices />}>
						Roll
					</Button>
					{/* i want this hint to be here but it clutters the UI so i'll figure it out later */}
					{/* <aside className={subText("text-balance text-center")}>
						Psst, your friends can spend 1 resolve to assist and add a boost
						die!
					</aside> */}
				</Form>
			</Popover.Content>
		</Popover.Root>
	)
}
