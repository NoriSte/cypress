import { resolve } from 'path'
import { readFileSync } from 'fs'
import { render } from 'mustache'
import { Express } from 'express'

const indexHtmlPath = resolve(__dirname, '../index-template.html')
const readIndexHtml = () => readFileSync(indexHtmlPath).toString()

/**
 * Rormat the requested spec file.
 * Nollup writes everything to a single directory (eg /dist)
 * All outputted files are *.js.
 * RunnerCt requests specs using the original filename including extension.
 *
 * Example usage:
 * formatSpecName('/cypress/component/foo.spec.tsx') //=> 'foo.spec.js'
 */
function formatSpecName (publicPath: string, filename: string) {
  const split = filename.split('/')
  const name = split[split.length - 1]
  const pos = name.lastIndexOf('.')
  const newName = `${name.substr(0, pos < 0 ? name.length : pos)}.js`

  return `${publicPath}/${newName}`
}

function handleIndex (indexHtml: string, publicPath: string, supportFilePath: string, cypressSpecPath: string) {
  const specPath = `/${cypressSpecPath}`

  console.log(supportFilePath)
  const supportFile = readFileSync(supportFilePath).toString()

  return render(indexHtml, {
    supportFile,
    specPath: formatSpecName(publicPath, specPath),
  })
}

export const makeHtmlPlugin = (
  projectRoot: string,
  supportFilePath: string,
  server: Express,
  publicPath: string,
) => {
  const indexHtml = readIndexHtml()

  server.use(`${publicPath}/index.html`, (req, res) => {
    const html = handleIndex(
      indexHtml,
      publicPath,
      supportFilePath,
      req.headers.__cypress_spec_path as string,
    )

    res.end(html)
  })
}
