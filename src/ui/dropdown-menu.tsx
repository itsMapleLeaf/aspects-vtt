import * as Ariakit from "@ariakit/react"
import { Check, Circle } from "lucide-react"
import * as React from "react"

import { cn } from "./helpers"

export const DropdownMenu = Ariakit.MenuProvider

export const DropdownMenuTrigger = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof Ariakit.MenuButton>) => (
	<Ariakit.MenuButton
		className={cn("flex items-center justify-between", className)}
		{...props}
	>
		{children}
	</Ariakit.MenuButton>
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export const DropdownMenuContent = ({
	className,
	...props
}: React.ComponentProps<typeof Ariakit.Menu>) => (
	<Ariakit.Menu
		className={cn(
			"bg-popover text-popover-foreground flex min-w-40 scale-90 flex-col overflow-hidden rounded-md border p-1 opacity-0 shadow transition gap-1 data-[enter]:scale-100 data-[enter]:opacity-100",
			className,
		)}
		gutter={8}
		unmountOnHide
		{...props}
	/>
)
DropdownMenuContent.displayName = "DropdownMenuContent"

export const DropdownMenuItem = ({
	className,
	inset,
	...props
}: React.ComponentProps<typeof Ariakit.MenuItem> & { inset?: boolean }) => (
	<Ariakit.MenuItem
		className={cn(
			"data-[active-item]:bg-accent data-[active-item]:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-5",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export const DropdownMenuCheckboxItem = ({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof Ariakit.MenuItemCheckbox>) => (
	<Ariakit.MenuItemCheckbox
		className={cn(
			"focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			{checked && <Check className="h-4 w-4" />}
		</span>
		{children}
	</Ariakit.MenuItemCheckbox>
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

export const DropdownMenuRadioItem = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof Ariakit.MenuItemRadio>) => (
	<Ariakit.MenuItemRadio
		className={cn(
			"focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<Circle className="h-2 w-2 fill-current" />
		</span>
		{children}
	</Ariakit.MenuItemRadio>
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

export const DropdownMenuLabel = ({
	className,
	inset,
	...props
}: React.ComponentProps<typeof Ariakit.MenuHeading> & { inset?: boolean }) => (
	<Ariakit.MenuHeading
		className={cn(
			"px-2 py-1.5 text-sm font-semibold",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export const DropdownMenuSeparator = ({
	className,
	...props
}: React.ComponentProps<typeof Ariakit.MenuSeparator>) => (
	<Ariakit.MenuSeparator
		className={cn("bg-muted -mx-1 h-px", className)}
		{...props}
	/>
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export const DropdownMenuShortcut = ({
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
			{...props}
		/>
	)
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Note: Some components like DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuSub,
// DropdownMenuSubContent, and DropdownMenuSubTrigger are not directly available in Ariakit.
// You might need to implement these differently or use alternative Ariakit components.
