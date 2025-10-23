import { useState, useEffect } from 'react'
import { TrendingUp, Users, Film, DollarSign, Eye, Calendar, BarChart3, Activity, Target } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: {
      current: 45231,
      previous: 40123,
      growth: 12.5,
    },
    movieStats: {
      totalMovies: 1247,
      newThisMonth: 45,
      topGenres: [
        { name: 'Action', count: 320, percentage: 25.7 },
        { name: 'Comedy', count: 280, percentage: 22.5 },
        { name: 'Drama', count: 245, percentage: 19.7 },
        { name: 'Thriller', count: 198, percentage: 15.9 },
        { name: 'Romance', count: 204, percentage: 16.2 },
      ],
    },
    engagement: {
      totalViews: 3456789,
      avgWatchTime: 45,
      completionRate: 78.5,
      bounceRate: 12.3,
    },
    revenue: {
      total: 892450,
      monthly: 125000,
      subscriptions: 68000,
      ads: 57000,
      growth: 8.2,
    },
    activity: {
      dailyActive: 23456,
      weeklyActive: 89012,
      monthlyActive: 156789,
      peakHours: ['8PM-10PM', '2PM-4PM', '7PM-9PM'],
    },
  })

  const timeRanges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ]

  const [selectedRange, setSelectedRange] = useState('30d')

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your platform performance.</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-8">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+{analytics.userGrowth.growth}%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{analytics.userGrowth.current.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+15%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{(analytics.engagement.totalViews / 1000000).toFixed(1)}M</div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+{analytics.revenue.growth}%</span>
              </div>
              <div className="text-2xl font-bold mb-1">${analytics.revenue.total.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+8%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{analytics.activity.dailyActive.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Daily Active Users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Period</span>
                  <span className="font-semibold">{analytics.userGrowth.current.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Previous Period</span>
                  <span className="font-semibold">{analytics.userGrowth.previous.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      +{analytics.userGrowth.growth}% growth this month
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movie Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                Top Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.movieStats.topGenres.map((genre, index) => (
                  <div key={genre.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-8">#{index + 1}</span>
                      <span className="font-medium">{genre.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{genre.count}</div>
                      <div className="text-xs text-muted-foreground">{genre.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Watch Time</span>
                  <span className="font-semibold">{analytics.engagement.avgWatchTime}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold text-green-500">{analytics.engagement.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  <span className="font-semibold text-red-500">{analytics.engagement.bounceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subscriptions</span>
                  <span className="font-semibold">${analytics.revenue.subscriptions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ads & Other</span>
                  <span className="font-semibold">${analytics.revenue.ads.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Monthly Total</span>
                  <span className="font-bold text-green-500">${analytics.revenue.monthly.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Hours</span>
                  <span className="font-semibold text-xs">{analytics.activity.peakHours.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Active</span>
                  <span className="font-semibold">{analytics.activity.weeklyActive.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Active</span>
                  <span className="font-semibold">{analytics.activity.monthlyActive.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="w-full" variant="outline">
                <BarChart3 className="w-5 h-5 mr-2" />
                Export Report
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Report
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-5 h-5 mr-2" />
                User Insights
              </Button>
              <Button className="w-full" variant="outline">
                <Film className="w-5 h-5 mr-2" />
                Content Performance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminAnalytics
