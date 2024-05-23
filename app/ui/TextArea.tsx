import TextAreaAutosize, { type TextareaAutosizeProps } from "react-textarea-autosize"
import { useField } from "./Form.tsx"
import { type InputStyleProps, extractInputStyleProps, inputStyle } from "./Input.tsx"

export interface TextAreaProps extends TextareaAutosizeProps, InputStyleProps {}

export function TextArea({ className, ...props }: TextAreaProps) {
	const [inputStyleProps, elementProps] = extractInputStyleProps(props)
	const field = useField()
	return (
		<TextAreaAutosize
			id={field.inputId}
			minRows={3}
			{...elementProps}
			className={inputStyle(inputStyleProps, "py-1.5 leading-7")}
		/>
	)
}
