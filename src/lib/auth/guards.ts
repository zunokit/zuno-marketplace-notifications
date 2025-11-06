import { redirect } from 'next/navigation'

import { auth, Session } from './better-auth'

export async function requireAuth(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: (await import('next/headers')).headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  return session
}

export async function requireRole(allowedRoles: string[]): Promise<Session> {
  const session = await requireAuth()

  // Check organization role
  const orgMembership = session.user.organizations?.[0]
  if (!orgMembership || !allowedRoles.includes(orgMembership.role)) {
    throw new Error('Insufficient permissions')
  }

  return session
}
