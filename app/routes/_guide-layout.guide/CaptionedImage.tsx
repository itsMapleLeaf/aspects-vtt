export default function CaptionedImage({
	src,
	alt,
	children,
}: {
	src: string
	alt: string
	children: React.ReactNode
}) {
	return (
		<figure>
			<img src={src} alt={alt} />
			<figcaption>{children}</figcaption>
		</figure>
	)
}
