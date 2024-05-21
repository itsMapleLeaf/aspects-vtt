
export def with_color [color ...children] {
	{color:$color children:$children}
}

export def colored_to_text [input] {
	match $input {
		{color:$color children:$children} => {
			$children | each {$color + (colored_to_text $in)} | str join " "
		}
		$text => $text
	}
}

export def print_colored [input] {
	print (colored_to_text $input)
}

export def dim [...args] { with_color (ansi dark_gray) ...$args }
export def bright [...args] { with_color (ansi light_blue_bold) ...$args }
export def success [...args] { with_color (ansi green) ...$args }
export def error [...args] { with_color (ansi red) ...$args }
