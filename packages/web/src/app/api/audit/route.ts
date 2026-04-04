import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@assay-dev/core'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { files = {}, env = {}, gitignore = [], packageJson } = body
    const result = await runAudit({ files, env, gitignore, packageJson })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: 'Audit failed', detail: String(err) },
      { status: 500 }
    )
  }
}
