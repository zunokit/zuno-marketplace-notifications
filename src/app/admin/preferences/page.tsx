import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PreferencesTable } from '@/components/features/preferences-table'
import { prisma } from '@/infrastructure/database/prisma'

export default async function PreferencesPage() {
  const preferences = await prisma.userPreference.findMany({
    take: 100,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  // Group preferences by user
  const userPrefs = preferences.reduce(
    (acc, pref) => {
      const userId = pref.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: pref.user,
          channels: {},
          frequency: pref.frequency,
          timezone: pref.timezone,
        }
      }
      acc[userId].channels[pref.channel] = pref.enabled
      return acc
    },
    {} as Record<
      string,
      {
        user: { email: string; name: string | null }
        channels: Record<string, boolean>
        frequency: string
        timezone: string | null
      }
    >
  )

  const userPrefsArray = Object.values(userPrefs)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Preferences</h1>
        <p className="text-muted-foreground">
          Manage notification preferences for all users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All User Preferences</CardTitle>
          <CardDescription>
            Channel settings and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesTable data={userPrefsArray} />
        </CardContent>
      </Card>
    </div>
  )
}
