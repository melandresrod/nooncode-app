import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AuthGuardError } from '@/lib/server/auth/guards'

export function toErrorResponse(error: unknown) {
  if (error instanceof AuthGuardError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request payload.',
        code: 'INVALID_REQUEST',
        issues: error.flatten(),
      },
      { status: 400 }
    )
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error.'

  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}
