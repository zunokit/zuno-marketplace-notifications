import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from './better-auth'

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login' as any)
  }

  return session
}

export async function requireRole(_allowedRoles: string[]) {
  const session = await requireAuth()

  // Check organization role (placeholder for now)
  // TODO: Implement proper role checking once Better-Auth org structure is finalized
  return session
}

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}
