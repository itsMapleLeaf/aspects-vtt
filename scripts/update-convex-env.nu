let vars = open .env.convex | lines | split column '=' name value

for var in $vars {
	pnpm convex env set $var.name $var.value
	pnpm convex env set $var.name $var.value --prod
	null
}
