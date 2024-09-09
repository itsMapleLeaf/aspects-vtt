import * as Ariakit from "@ariakit/react"
import { NavLink } from "@remix-run/react"
import { To } from "@remix-run/router"
import { ClassNameValue } from "tailwind-merge"
import { FormButton } from "./FormButton.tsx"
import { clearButton, panel } from "./styles.ts"
import { ToastActionForm } from "./toast.tsx"

export function Menu(props: Ariakit.MenuProviderProps) {
	return <Ariakit.MenuProvider {...props} />
}

export const MenuButton = Ariakit.MenuButton

export function MenuPanel(props: Ariakit.MenuProps) {
	return (
		<Ariakit.Menu
			modal
			gutter={8}
			unmountOnHide
			{...props}
			className={menuPanelStyle(props.className)}
		/>
	)
}

export function MenuItem(props: Ariakit.MenuItemProps) {
	return (
		<Ariakit.MenuItem {...props} className={menuItemStyle(props.className)} />
	)
}

export function MenuLinkItem({
	to,
	...props
}: Ariakit.MenuItemProps & {
	to: To
}) {
	return (
		<MenuItem
			render={(props) => <NavLink to={to} prefetch="intent" {...props} />}
			{...props}
			className={menuItemStyle(props.className)}
		/>
	)
}

export function MenuFormItem({
	action,
	message,
	...props
}: Ariakit.MenuItemProps & {
	action: (formData: FormData) => Promise<unknown>
	message: string
}) {
	return (
		<MenuItem
			render={(props) => (
				<ToastActionForm action={action} message={message} className="contents">
					<FormButton {...props} type="submit" />
				</ToastActionForm>
			)}
			{...props}
			className={menuItemStyle(props.className)}
		/>
	)
}

export function menuPanelStyle(...classes: ClassNameValue[]) {
	return panel(
		"grid min-w-40 max-w-64 translate-y-2 p-1 opacity-0 transition gap-1 data-[enter]:translate-y-0 data-[enter]:opacity-100 shadow",
		classes,
	)
}

export function menuItemStyle(...classes: ClassNameValue[]) {
	return clearButton(
		"cursor-default justify-start text-left text-base",
		classes,
	)
}
