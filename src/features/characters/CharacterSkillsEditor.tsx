import { useMutation } from "convex/react"
import { sum } from "lodash-es"
import {
	LucideCheckCircle2,
	LucideDroplets,
	LucideFlame,
	LucideGraduationCap,
	LucideMoon,
	LucideSparkles,
	LucideSun,
	LucideWind,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { startTransition, useState } from "react"
import { twMerge } from "tailwind-merge"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { Button } from "~/components/Button.tsx"
import { EmptyState } from "~/components/EmptyState.tsx"
import { Heading, HeadingLevel } from "~/components/Heading.tsx"
import { ListCard } from "~/components/ListCard.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { List } from "~/shared/list.ts"
import { formatTitle } from "~/shared/string.ts"
import { textInput } from "~/styles/input.ts"
import { primaryHeading, secondaryHeading } from "~/styles/text.ts"
import { type Aspect } from "./aspects.ts"
import { ASPECT_SKILLS, AspectSkill } from "./aspectSkills.ts"

const aspectOrder = List.of<Aspect["id"]>(
	"fire",
	"water",
	"wind",
	"light",
	"darkness",
)

const allSkills = List.values(ASPECT_SKILLS).compact()

const totalExperience = 150

const trace = <T,>(it: T) => {
	console.log(it)
	return it
}

export function CharacterSkillsEditor({
	character,
}: {
	character: NormalizedCharacter
}) {
	const update = useMutation(api.characters.updateMany)
	const [searchInput, setSearchInput] = useState("")
	const [search, setSearch] = useState("")

	const addedSkillIds = new Set(Object.keys(character.aspectSkills ?? {}))

	const isAdded = (skill: AspectSkill): boolean =>
		addedSkillIds.has(skill.id) &&
		// since players can remove other skills, we need to check the requirements again,
		// and only truly consider it added if it's met
		// TODO: add recursion safeguard, somehow
		skill.requires.every(isAdded)

	const usedExperience = sum(
		List.of(...addedSkillIds)
			.map((id) => ASPECT_SKILLS[id])
			.filter(Boolean)
			.filter(isAdded)
			.map((skill) => skill.price),
	)

	const remainingExperience = totalExperience - usedExperience

	const isAvailable = (skill: AspectSkill) =>
		character.type === "npc" ||
		(skill.price <= remainingExperience && skill.requires.every(isAdded))

	const sections = new Map<
		string,
		{ title: string; items: List<AspectSkill> }
	>()

	const [statusFilter, setStatusFilter] = useLocalStorage(
		"characterSkills:statusFilter",
		"all",
		v.parser(
			v.union([v.literal("all"), v.literal("learned"), v.literal("available")]),
		),
	)

	const [aspectFilter, setAspectFilter] = useLocalStorage<Aspect["id"][]>(
		"characterSkills:aspectFilter",
		[],
		v.parser(v.array(v.union(aspectOrder.map((it) => v.literal(it))))),
	)

	for (const skill of allSkills) {
		if (statusFilter === "learned" && !isAdded(skill)) continue
		if (statusFilter === "available" && !isAvailable(skill)) continue

		const sectionId = `${skill.aspectId}-${skill.category}`
		let section = sections.get(sectionId)
		if (!section) {
			section = {
				title: formatTitle(skill.category),
				items: List.of(),
			}
			sections.set(sectionId, section)
		}
		section.items.push(skill)
	}

	const filteredSections = [...sections.entries()]
		.map(([id, section]) => ({
			...section,
			id,
			items: search.trim()
				? matchSorter(section.items.array(), search, {
						keys: ["name", "description", "category", "aspectId", "price"],
					})
				: [...section.items]
						.sort((a, b) => a.name.localeCompare(b.name))
						.sort((a, b) => a.price - b.price)
						.sort((a, b) => a.requires.length - b.requires.length)
						.sort(
							(a, b) =>
								aspectOrder.indexOf(a.aspectId) -
								aspectOrder.indexOf(b.aspectId),
						),
		}))
		.filter((section) => section.items.length > 0)

	const skillAddAction = async (
		skill: AspectSkill,
		action: "add" | "remove",
	) => {
		await update({
			characterId: character._id,
			aspectSkills: { [action]: skill.id },
		})
	}

	return (
		<div className="flex h-full flex-col p-3 gap-3">
			{character.type === "npc" ? (
				<p className={secondaryHeading("text-center")}>
					Character power: {usedExperience} / {totalExperience}
				</p>
			) : (
				<p className={secondaryHeading("text-center")}>
					Experience: {remainingExperience} / {totalExperience}
				</p>
			)}

			<div className="flex gap-2">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={searchInput}
					onChange={(event) => {
						setSearchInput(event.currentTarget.value)
						startTransition(() => {
							setSearch(event.currentTarget.value)
						})
					}}
				/>
				<Button
					appearance={statusFilter === "learned" ? "solid" : "clear"}
					onClick={() =>
						setStatusFilter((f) => (f === "learned" ? "all" : "learned"))
					}
					icon={<LucideGraduationCap />}
					aria-role="checkbox"
					aria-checked={statusFilter === "learned"}
				>
					<span className="sr-only">Only show learned skills</span>
				</Button>
				<Button
					appearance={statusFilter === "available" ? "solid" : "clear"}
					onClick={() =>
						setStatusFilter((f) => (f === "available" ? "all" : "available"))
					}
					icon={<LucideSparkles />}
					aria-role="checkbox"
					aria-checked={statusFilter === "available"}
				>
					<span className="sr-only">Only show available skills</span>
				</Button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-6">
				{filteredSections.length === 0 ? (
					<EmptyState
						text="No skills found."
						icon={<LucideFlame />}
						className="py-24"
					/>
				) : (
					filteredSections.map((section) => (
						<SkillCategorySection key={section.id} title={section.title}>
							{section.items.map((skill) => (
								<SkillCard
									key={skill.id}
									skill={skill}
									added={isAdded(skill)}
									disabled={!isAdded(skill) && !isAvailable(skill)}
									action={() =>
										skillAddAction(skill, isAdded(skill) ? "remove" : "add")
									}
								/>
							))}
						</SkillCategorySection>
					))
				)}
			</div>
		</div>
	)
}

function SkillCategorySection({
	title,
	children,
}: {
	title: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-2">
			<HeadingLevel>
				<Heading className={primaryHeading()}>{title}</Heading>
				{children}
			</HeadingLevel>
		</section>
	)
}

function SkillCard({
	skill,
	added,
	disabled,
	action,
}: {
	skill: AspectSkill
	added: boolean
	disabled: boolean
	action: () => unknown
}) {
	const [, submit, pending] = useToastAction(async () => {
		await action()
	})

	const classes = {
		fire: {
			card: twMerge("border-red-900/50 bg-red-950/50 text-red-100"),
			aside: twMerge("text-red-200"),
		},
		water: {
			card: twMerge("border-blue-900/50 bg-blue-950/50 text-blue-100"),
			aside: twMerge("text-blue-200"),
		},
		wind: {
			card: twMerge("border-green-900/50 bg-green-950/50 text-green-100"),
			aside: twMerge("text-green-200"),
		},
		light: {
			card: twMerge("border-yellow-900/50 bg-yellow-950/50 text-yellow-100"),
			aside: twMerge("text-yellow-200"),
		},
		darkness: {
			card: twMerge("border-violet-900/25 bg-violet-950/25 text-violet-100"),
			aside: twMerge("text-violet-200"),
		},
	}[skill.aspectId]

	return (
		<form action={submit} className="contents">
			<button
				type="submit"
				className="relative flex w-full items-center transition gap disabled:cursor-not-allowed disabled:opacity-60 data-[pending]:opacity-50"
				data-pending={pending || undefined}
				disabled={disabled}
			>
				<ListCard
					title={
						<div className="flex items-center gap-2">
							<span>{skill.name}</span>
							{added && <LucideCheckCircle2 />}
						</div>
					}
					description={
						<div className="-my-1">
							{skill.description.split("\n").map((line, index) => (
								<div key={index} className="my-2">
									{line}
								</div>
							))}
						</div>
					}
					aside={
						<span className={classes.aside}>
							{[
								skill.aspect.name,
								skill.price + " exp",
								skill.requires.length > 0 &&
									`requires ${new Intl.ListFormat(undefined, {
										type: "conjunction",
									}).format(skill.requires.map((it) => it.name))}`,
							]
								.filter(Boolean)
								.join(" • ")}
						</span>
					}
					className={twMerge(classes.card, "transition hover:brightness-110")}
				/>
				<div
					className={twMerge(
						"absolute inset-y-0 right-0 flex w-24 items-center justify-center px-3 opacity-5",
					)}
				>
					{skill.aspectId === "fire" ? (
						<LucideFlame className="size-full" />
					) : skill.aspectId === "water" ? (
						<LucideDroplets className="size-full" />
					) : skill.aspectId === "wind" ? (
						<LucideWind className="size-full" />
					) : skill.aspectId === "light" ? (
						<LucideSun className="size-full" />
					) : skill.aspectId === "darkness" ? (
						<LucideMoon className="size-full" />
					) : null}
				</div>
				<div
					className="pointer-events-none invisible absolute inset-0 grid place-content-center opacity-0 transition-all data-[visible]:visible data-[visible]:opacity-100"
					data-visible={pending || undefined}
				>
					<LoadingIcon className="size-12" />
				</div>
			</button>
		</form>
	)
}
