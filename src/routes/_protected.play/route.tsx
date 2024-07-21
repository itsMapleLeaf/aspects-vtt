import { Link } from "@remix-run/react"
import { AppLogo } from "../../ui/app-logo.tsx"
import { Button } from "../../ui/button.tsx"
import { Heading } from "../../ui/heading.tsx"
import { Column, Row } from "../../ui/layout.tsx"
import { UserButton } from "./user-button.tsx"

export default function PlayRoute() {
	return (
		<Column className="items-stretch p-4">
			<Row className="items-center justify-between">
				<Button
					element={<Link to="/" />}
					icon={null}
					appearance="clear"
					className="h-12"
				>
					<Heading className="text-2xl">
						<AppLogo />
					</Heading>
				</Button>
				<UserButton />
			</Row>
		</Column>
	)
}
