import TextAreaAutosize, { type TextareaAutosizeProps } from "react-textarea-autosize"
import { useField } from "./Form.tsx"
import { Input, type InputStyleProps } from "./Input.tsx"

export interface TextAreaProps extends TextareaAutosizeProps, InputStyleProps {}

export function TextArea({ className, ...props }: TextAreaProps) {
	const [inputStyleProps, elementProps] = Input.extractStyleProps(props)
	const field = useField()
	return (
		<TextAreaAutosize
			id={field.inputId}
			minRows={3}
			{...elementProps}
			className={Input.style(inputStyleProps, "py-1.5 leading-7")}
		/>
	)
}
