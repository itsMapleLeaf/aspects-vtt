import { Image, type ImageProps } from "~/ui/Image.tsx"
import type { Nullish } from "../../../common/types.ts"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { getApiImageUrl } from "./helpers.ts"

export interface UploadedImageProps extends Omit<ImageProps, "src"> {
	imageId: Nullish<Id<"_storage">>
	fallbackUrl?: string
}

export function UploadedImage({
	imageId,
	fallbackUrl,
	...props
}: UploadedImageProps) {
	const imageUrl = imageId ? getApiImageUrl(imageId) : fallbackUrl
	return <Image {...props} src={imageUrl} />
}
