import { useMutation } from "convex/react"
import { startCase } from "es-toolkit"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { LucideDices } from "lucide-react"
import { useState } from "react"
import { match, P } from "ts-pattern"
import * as v from "valibot"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { CharacterAttributeName } from "~/features/characters/types.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { NumberInputField } from "../forms/fields.tsx"
import { Form } from "../forms/Form.tsx"
import { useFields, useForm, valibotAction } from "../forms/useForm.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { getAttributeDie } from "./helpers.ts"

export function CharacterAttributeButton({
	characters,
	attribute,
	icon: iconOverride,
}: {
	characters: {
		_id: Id<"characters">
		name: string
		race: string | undefined
		attributes: Record<CharacterAttributeName, number>
		resolve: number
	}[]
	attribute: CharacterAttributeName
	icon?: React.ReactNode
}) {
	const roomId = useRoomContext()._id
	const createMessage = useMutation(api.messages.create)
	const updateCharacters = useMutation(api.characters.updateMany)

	const [open, setOpen] = useState(false)

	const getCharacterDice = (character: {
		race: string | undefined
		attributes: Record<CharacterAttributeName, number>
	}) => {
		const attributeDieFaces = getAttributeDie(character.attributes[attribute])

		const dice = [
			{ faces: attributeDieFaces },
			{ faces: attributeDieFaces },
			...Iterator.range(
				form.values.boost + (form.values.pushYourself ? 1 : 0),
			).map(() => ({
				faces: 6,
				color: "green",
			})),
			...Iterator.range(form.values.snag).map(() => ({
				faces: 6,
				color: "red",
				operation: "subtract",
			})),
		]

		return match({
			race: character.race,
			attribute,
			pushYourself: form.values.pushYourself,
		})
			.with(
				P.union(
					{ race: "Arctana", attribute: "intellect" },
					{ race: "Cetacian", attribute: "sense" },
					{ race: "Macridian", pushYourself: true },
					{ race: "Myrmadon", attribute: "strength" },
					{ race: "Sylvanix", attribute: "mobility" },
					{ race: "Umbraleth", attribute: "wit" },
				),
				() => [...dice, { faces: 6, color: "green" }],
			)
			.otherwise(() => dice)
	}

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
				if (values.pushYourself) {
					await updateCharacters({
						updates: characters.map((it) => ({
							characterId: it._id,
							resolve: it.resolve - 2,
						})),
					})
				}
				await createMessage({
					roomId,
					content: characters.flatMap((it) => [
						{
							type: "text",
							text: `<@${it._id}> rolled ${startCase(attribute)}:`,
						},
						{
							type: "dice",
							dice: getCharacterDice(it),
						},
					]),
				})
				setOpen(false)
			},
		),
	})

	const fields = useFields(form)

	const dicePowerValues = new Set(
		characters.map((it) => getAttributeDie(it.attributes[attribute])),
	)

	const icon =
		iconOverride ??
		{
			strength: <Lucide.BicepsFlexed />,
			sense: <Lucide.Eye />,
			mobility: <Lucide.Wind />,
			intellect: <Lucide.Lightbulb />,
			wit: <Lucide.Sparkle />,
		}[attribute]

	return (
		<Popover.Root placement="bottom-start" open={open} setOpen={setOpen}>
			<div className="flex flex-col items-center gap-0.5">
				<Popover.Button
					render={
						<Button
							appearance="clear"
							square
							icon={icon}
							type="button"
							tooltip={`Roll ${startCase(attribute)}`}
						/>
					}
				/>

				{dicePowerValues.size > 0 && (
					<p className="text-[12px] font-semibold leading-3 text-primary-200">
						{dicePowerValues.size === 1
							? `d${[...dicePowerValues][0]}`
							: `mixed`}
					</p>
				)}
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
					{/* TODO: show preview of dice that will be rolled */}
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
