import bannerUrl from "~/assets/banner.webp"
import { ImageUploader } from "~/modules/api-images/ImageUploader.tsx"
import { PageSection } from "../PageSection.tsx"

export default function ImageUploaderTest() {
	return (
		<div className="flex flex-wrap gap-4 *:w-72">
			<PageSection title="No image">
				<ImageUploader.View
					src={undefined}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "idle" }}
					pending={false}
				/>
			</PageSection>
			<PageSection title="Image">
				<ImageUploader.View
					src={bannerUrl}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "idle" }}
					pending={false}
				/>
			</PageSection>
			<PageSection title="Using fallback">
				<ImageUploader.View
					src={undefined}
					fallbackUrl={bannerUrl}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "idle" }}
					pending={false}
				/>
			</PageSection>
			<PageSection title="Pending">
				<ImageUploader.View
					src={bannerUrl}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "success", value: undefined }}
					pending={true}
				/>
			</PageSection>
			<PageSection title="Upload succeeded">
				<ImageUploader.View
					src={bannerUrl}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "success", value: undefined }}
					pending={false}
				/>
			</PageSection>
			<PageSection title="Upload failed (no image)">
				<ImageUploader.View
					src={undefined}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "error", value: undefined, error: new Error("Upload failed") }}
					pending={false}
				/>
			</PageSection>
			<PageSection title="Upload failed (image)">
				<ImageUploader.View
					src={bannerUrl}
					fallbackUrl={undefined}
					onFileAdded={async () => {}}
					onRemove={async () => {}}
					state={{ type: "error", value: undefined, error: new Error("Upload failed") }}
					pending={false}
				/>
			</PageSection>
		</div>
	)
}
