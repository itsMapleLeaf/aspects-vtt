import { Project } from "ts-morph"

const project = new Project({
	tsConfigFilePath: "./tsconfig.json",
	skipAddingFilesFromTsConfig: true,
	skipFileDependencyResolution: true,
})

project.addSourceFilesAtPaths("app/**")
project.addSourceFilesAtPaths("convex/**")

for (const sourceFile of project.getSourceFiles("**/*.{ts,tsx}")) {
	for (const importDeclaration of sourceFile.getImportDeclarations()) {
		const currentSpecifier = importDeclaration
			.getModuleSpecifier()
			.getLiteralText()
		if (!currentSpecifier.startsWith("#")) continue

		const specifierSourceFile =
			importDeclaration.getModuleSpecifierSourceFileOrThrow()
		let extension = specifierSourceFile.getExtension()
		if (extension === ".d.ts") {
			extension = ".js"
		}

		const relativeSpecifier =
			sourceFile.getRelativePathAsModuleSpecifierTo(
				specifierSourceFile.getFilePath(),
			) + extension

		console.info(
			sourceFile.getFilePath(),
			currentSpecifier,
			`->`,
			relativeSpecifier,
		)
		importDeclaration.setModuleSpecifier(relativeSpecifier)
	}
}

await project.save()
