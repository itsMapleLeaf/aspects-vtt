#!/usr/bin/env nu

def main [...args] {
	for line in (open .env.convex.local | lines | filter {str contains "="}) {
		bunx convex env set ...$args $line
	}
}
