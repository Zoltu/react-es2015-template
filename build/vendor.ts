import * as path from 'path'
import { promises as fs } from 'fs'
// import * as fsCallback from 'fs'
import { recursiveDirectoryCopy } from '@zoltu/file-copier'

const dependencyPaths = [
	[ 'es-module-shims', 'dist', 'es-module-shims.min.js' ],
	[ 'react', 'umd', 'react.production.min.js' ],
	[ 'react-dom', 'umd', 'react-dom.production.min.js' ],
]

async function vendorDependencies() {
	for (const [name, subfolder] of dependencyPaths) {
		const sourceDirectoryPath = path.join(__dirname, '..', 'node_modules', name, subfolder)
		const destinationDirectoryPath = path.join(__dirname, '..', 'app', 'vendor', name)
		await recursiveDirectoryCopy(sourceDirectoryPath, destinationDirectoryPath, undefined, fixSourceMap)
	}

	const indexHtmlPath = path.join(__dirname, '..', 'app', 'index.html')
	const oldIndexHtml = await fs.readFile(indexHtmlPath, 'utf8')
	const importmap = dependencyPaths.reduce((importmap, [name, , file]) => {
		importmap.imports[name] = `./${path.join('.', 'vendor', name, file).replace(/\\/g, '/')}`
		return importmap
	}, { imports: {} as Record<string, string> })
	const importmapJson = JSON.stringify(importmap, undefined, '\t')
		.replace(/^/mg, '\t\t')
	const newIndexHtml = oldIndexHtml.replace(/<script type='importmap-shim'>[\s\S]*?<\/script>/m, `<script type='importmap-shim'>\n${importmapJson}\n\t</script>`)
	await fs.writeFile(indexHtmlPath, newIndexHtml)
}

// https://bugs.chromium.org/p/chromium/issues/detail?id=979000
async function fixSourceMap(filePath: string) {
	const fileExtension = path.extname(filePath)
	if (fileExtension !== '.map') return
	const fileDirectoryName = path.basename(path.dirname(path.dirname(filePath)))
	const fileName = path.parse(path.parse(filePath).name).name
	const fileContents = JSON.parse(await fs.readFile(filePath, 'utf-8')) as { sources: Array<string> }
	for (let i = 0; i < fileContents.sources.length; ++i) {
		fileContents.sources[i] = (fileName === 'index')
			? `./${fileDirectoryName}.ts`
			: `./${fileName}.ts`
	}
	await fs.writeFile(filePath, JSON.stringify(fileContents))
}

if (require.main === module) {
	vendorDependencies().catch(error => {
		console.error(error.message)
		console.error(error)
		process.exit(1)
	})
}
