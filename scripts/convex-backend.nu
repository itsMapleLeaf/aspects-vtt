#!/usr/bin/env -S nu --stdin

let convex_backend_dir = $env.CURRENT_FILE | path dirname --num-levels 2 | path join convex-backend

def main [] {}

def "main download" [] {
	let version = "precompiled-2024-05-20-997fa59"

	let release_url = match ((sys).host.name | str downcase) {
		"windows" => {
			$"https://github.com/get-convex/convex-backend/releases/download/($version)/convex-local-backend-x86_64-pc-windows-msvc.zip"
		}
		"macos" => {
			$"https://github.com/get-convex/convex-backend/releases/download/($version)/convex-local-backend-x86_64-apple-darwin.zip"
		}
		_ => {
			$"https://github.com/get-convex/convex-backend/releases/download/($version)/convex-local-backend-x86_64-unknown-linux-gnu.zip"
		}
	}

	let download_path = mktemp
	let unzip_destination = $convex_backend_dir

	print $"Release URL: ($release_url)"
	print "Downloading..."
	try {
		wget $release_url -O $download_path -q
	} catch {
		print Failed to download
		exit 1
	}

	print $"Downloaded to ($download_path)"
	print $"Unpacking to ($unzip_destination)"
	try {
		unzip $download_path -d $unzip_destination -oq
		print "Done"
	} catch {
		print "Unpacking failed"
	}

	rm $download_path
}

def "main start" [] {
	cd $convex_backend_dir
	^convex-local-backend
}

def "main setup" [] {
	let variables = open .env.convex | from env
	for name in ($variables | columns) {
		convex-local env set $name ($variables | get $name)
	}
	convex-local deploy
}

def "main dev" [] {
	convex-local dev
}

def convex-local [...args: string] {
	const url = "http://127.0.0.1:3210"
	const admin_key = "0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd"

	# nushell interprets true/false strings as booleans, so we need to convert them manually
	let args = $args | each {
		match $in {
			true => "true"
			false => "false"
			_ => $in
		}
	}

	^bunx convex ...$args --url $url --admin-key $admin_key
}

def "from env" []: string -> record {
	$in | lines | each { parse '{name}={value}' } | flatten | transpose --header-row --as-record
}
