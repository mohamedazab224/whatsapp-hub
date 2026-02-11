import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const dirs = ["node_modules", ".next", ".turbo"]
const files = ["pnpm-lock.yaml"]

console.log("[v0] Cleaning up build artifacts and node_modules...")

// Remove directories
for (const dir of dirs) {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`[v0] Removing ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
}

// Remove lockfiles
for (const file of files) {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`[v0] Removing ${file}...`)
    fs.unlinkSync(filePath)
  }
}

console.log("[v0] Cleanup complete! Now run: pnpm install")
