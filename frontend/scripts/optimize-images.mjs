import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '..', 'src', 'assets', 'services')

for (const file of readdirSync(dir)) {
  const ext = path.extname(file).toLowerCase()
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue

  const srcPath = path.join(dir, file)
  const outPath = path.join(dir, path.basename(file, ext) + '.webp')
  const beforeSize = statSync(srcPath).size

  await sharp(srcPath)
    .resize({ width: 1000, height: 1000, fit: 'cover' })
    .webp({ quality: 78 })
    .toFile(outPath)

  const afterSize = statSync(outPath).size
  console.log(
    `${file} -> ${path.basename(outPath)}: ${(beforeSize / 1e6).toFixed(1)}MB -> ${(afterSize / 1e6).toFixed(2)}MB`,
  )
  unlinkSync(srcPath)
}
