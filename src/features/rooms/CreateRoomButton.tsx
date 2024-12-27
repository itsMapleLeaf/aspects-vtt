import { useMutation } from "convex/react"
import { Grid2x2Plus, LucideWand2, LucideX } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import * as v from "valibot"
import { api } from "~/convex/_generated/api.js"
import { useForm } from "~/lib/useForm.ts"
import { textInput } from "~/styles/input.ts"
import { Button } from "../../components/Button.tsx"
import * as Dialog from "../../components/Dialog.tsx"
import { Field, getFieldProps } from "../../components/Field.tsx"

export function CreateRoomButton() {
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button icon={<Grid2x2Plus />} onClick={() => setOpen(true)}>
				New room
			</Button>
			<Dialog.Root open={open} setOpen={setOpen}>
				<Dialog.Content title="Create New Room">
					<CreateRoomForm>
						<Dialog.Actions>
							<Dialog.Close
								render={<Button appearance="outline" icon={<LucideX />} />}
							>
								Cancel
							</Dialog.Close>
							<Button type="submit" icon={<LucideWand2 />}>
								Create room
							</Button>
						</Dialog.Actions>
					</CreateRoomForm>
				</Dialog.Content>
			</Dialog.Root>
		</>
	)
}

function CreateRoomForm({ children }: { children?: ReactNode }) {
	const navigate = useNavigate()
	const create = useMutation(api.rooms.create)

	const form = useForm({
		schema: v.object({
			name: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(100)),
			slug: v.union([
				v.literal(""),
				v.pipe(
					v.string(),
					v.trim(),
					v.nonEmpty(),
					v.maxLength(100),
					v.regex(
						/^[a-z0-9-]+$/,
						"Only lowercase letters, numbers, and hyphens are allowed",
					),
				),
			]),
		}),
		defaults: {
			name: "",
			slug: "",
		},
	})

	const fallbackSlug = slugify(form.values.name)
	const slug = form.values.slug || fallbackSlug

	return (
		<form
			action={form.action(async (data) => {
				await create({ name: data.name, slug })
				navigate(`/rooms/${slug}`)
			})}
			className="space-y-4"
		>
			<Field {...getFieldProps(form, "name")} label="Room name">
				<input {...form.getInputProps("name")} className={textInput()} />
			</Field>

			<Field
				label="URL slug"
				description={`Your room will be at ${window.location.host}/rooms/${slug}`}
				{...getFieldProps(form, "slug")}
			>
				<input
					{...form.getInputProps("slug")}
					className={textInput()}
					placeholder={fallbackSlug}
				/>
			</Field>
			{children}
		</form>
	)
}

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-+/g, "-")
}
