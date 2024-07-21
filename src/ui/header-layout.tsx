import { Link } from "@remix-run/react"
import { UserButton } from "../auth/user-button.tsx"
import { AppLogo } from "./app-logo.tsx"
import { Button } from "./button.tsx"
import { Heading } from "./heading.tsx"
import { Column, Row } from "./layout.tsx"

export function HeaderLayout({ children }: { children: React.ReactNode }) {
	return (
		<Column className="items-stretch p-3">
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
			{children}
		</Column>
	)
}
