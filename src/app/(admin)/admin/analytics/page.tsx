'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MessageSquare, Users, TrendingUp } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">אנליטיקס כללי</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">עסקים פעילים</CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">12</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">שיחות החודש</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">2,847</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">לקוחות ייחודיים</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">1,203</div></CardContent>
        </Card>
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-500">שביעות רצון ממוצעת</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">4.5</div></CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-none">
        <CardContent className="flex items-center justify-center py-12 text-gray-400">
          <p>גרפים וניתוחים מפורטים יתווספו בהמשך</p>
        </CardContent>
      </Card>
    </div>
  )
}
