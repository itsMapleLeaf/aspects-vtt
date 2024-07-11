#!/usr/bin/env nu

def main [...args] {
	for var in (open .env.convex.local | lines | parse '{name}={value}') {
		bunx convex env ...$args set $var.name $var.value
	}
}
