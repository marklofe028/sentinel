import { readdir, readFile } from 'fs/promises'
import { join, relative } from 'path'

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', '.turbo',
  '.next', 'build', 'coverage', '.cache',
  '__pycache__', '.venv', 'venv', 'vendor',
  'target', '.gradle',
])

const ALLOWED_EXTENSIONS = new Set([
  // source files
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.java', '.rs', '.rb', '.php',
  // config and dependency files
  '.json', '.toml', '.yaml', '.yml', '.xml',
  '.mod', '.sum',
  // env files
  '.env', '.example',
  // docs
  '.md', '.html', '.css',
])

// specific filenames to always include regardless of extension
const INCLUDE_FILENAMES = new Set([
  'requirements.txt',
  'requirements-dev.txt',
  'Pipfile',
  'Cargo.toml',
  'Cargo.lock',
  'go.mod',
  'go.sum',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'composer.json',
])

const IGNORE_PATTERNS = [
  /\.test\.(ts|js)x?$/,
  /\.spec\.(ts|js)x?$/,
  /__tests__/,
  /\/rules\//,
  /\/dist\//,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
]

async function walk(
  dir: string,
  root: string,
  files: Record<string, string> = {}
): Promise<Record<string, string>> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue
    const fullPath = join(dir, entry.name)
    const relPath  = relative(root, fullPath)

    if (entry.isDirectory()) {
      await walk(fullPath, root, files)
    } else {
      const ext = entry.name.includes('.')
        ? '.' + entry.name.split('.').pop()
        : ''
      const isAllowedExt      = ALLOWED_EXTENSIONS.has(ext)
      const isIncludedFilename = INCLUDE_FILENAMES.has(entry.name)
      const isIgnored          = IGNORE_PATTERNS.some(p => p.test(relPath))

      if ((isAllowedExt || isIncludedFilename) && !isIgnored) {
        try {
          files[relPath] = await readFile(fullPath, 'utf-8')
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  return files
}

export async function readProjectFiles(
  dir: string
): Promise<Record<string, string>> {
  return walk(dir, dir)
}

export async function readGitignore(dir: string): Promise<string[]> {
  try {
    const content = await readFile(join(dir, '.gitignore'), 'utf-8')
    return content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  } catch {
    return []
  }
}

export async function readPackageJson(
  dir: string
): Promise<Record<string, unknown> | undefined> {
  try {
    const content = await readFile(join(dir, 'package.json'), 'utf-8')
    return JSON.parse(content)
  } catch {
    return undefined
  }
}
