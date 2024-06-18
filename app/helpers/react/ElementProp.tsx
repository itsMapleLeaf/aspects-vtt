import { Fragment, cloneElement, isValidElement } from "react"

export type ElementProp<T> = React.ReactNode | ((props: T) => React.ReactNode)

export function renderElementProp<T>(
	element: ElementProp<T>,
	props: T & React.Attributes,
	plainContentWrapper = <Fragment />,
): React.ReactNode {
	if (typeof element === "function") {
		return element(props)
	}
	if (isValidElement<T>(element)) {
		return cloneElement(element, props)
	}
	return cloneElement(plainContentWrapper, props, element)
}
