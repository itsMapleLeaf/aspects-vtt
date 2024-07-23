#!/usr/bin/env nu

const commands = [
	"bun run --silent typecheck",
	"bun run --silent test",
	"bun run --silent format", # also runs eslint --fix
]

def main [] {
	print $"Running ($commands | length) scripts..."
	
	let results = $commands | par-each {|cmd|
		mut result = {}

		let time = (
			timeit { $result = (do { nu -c $cmd } | complete) }
			| format duration pretty
		)
		
		print (match $result.exit_code {
			0 => $"(ansi light_green)✓ ($cmd) \(($time))(ansi reset)"
			_ => $"(ansi light_red)✕ ($cmd) \(($time))(ansi reset)"
		})

		{...$result, cmd: $cmd}
	}

	let failed_results = $results | where { $in.exit_code != 0 }

	if ($failed_results | is-empty) {
		print $"(ansi light_green)Everything looks good!(ansi reset)"
	} else {
		print --stderr (
			| each {|result| [
				$"\n(ansi default_dimmed)($result.cmd):(ansi reset)"
				...([$result.stdout $result.stderr] | str trim | where { is-not-empty })
			]}
			| flatten
			| str join "\n"
		)
	}
}

def "format duration pretty" []: [duration -> string] {
	format duration (
		match $in {
			$t if $t < 1ms => 'ns'
			$t if $t < 1sec => 'ms'
			$t if $t < 1min => 'sec'
			$t if $t < 1hr => 'min'
			_ => 'hr' # god help you if you reach this
		}
	)
}
