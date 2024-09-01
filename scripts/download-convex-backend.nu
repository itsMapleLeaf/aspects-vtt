let os = (uname | get operating-system | str downcase)

let release_tag = (
	gh --repo get-convex/convex-backend release list --limit 1 --json tagName
	| from json
	| first
	| get tagName
	| into string
)

let release_url = $"https://github.com/get-convex/convex-backend/releases/download/($release_tag)/convex-local-backend-x86_64-unknown-linux-gnu.zip"

mkdir convex-backend
wget $release_url -O convex-backend/convex-local-backend.zip
unzip -o convex-backend/convex-local-backend.zip -d convex-backend
