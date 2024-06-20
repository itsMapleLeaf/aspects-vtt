#!/usr/bin/env nu

use "./colors.nu" *

let convex_backend_dir = $env.CURRENT_FILE | path dirname --num-levels 2 | path join convex-backend

def main [...args] {
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

def "main start" [] {
	cd $convex_backend_dir
	^convex-local-backend
}

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

	let destination_root = $env.CURRENT_FILE | path dirname --num-levels 2
	let download_path = mktemp
	let unzip_destination = $convex_backend_dir

	print_colored (dim 📡 Release URL: (bright $release_url))
	print_colored (dim 📥 Downloading...)
	try {
		wget $release_url -O $download_path -q
	} catch {
		print_colored (error ❌ Failed to download)
		exit 1
	}

	print_colored (success ✅ Downloaded to (bright $download_path))
	print_colored (dim 📦 Unpacking to (bright $unzip_destination))
	try {
		unzip $download_path -d $unzip_destination -oq
	} catch {
		print_colored (error ❌ Unpacking failed)
		exit 1
	}

	rm $download_path

	print_colored (success ✅ Done)
}
