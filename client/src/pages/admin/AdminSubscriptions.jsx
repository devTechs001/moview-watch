import { useState, useEffect } from 'react'
import { Crown, Users, DollarSign, TrendingUp, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/subscriptions/admin/all')
      setSubscriptions(response.data.subscriptions)
      setStats(response.data.stats)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const userName = sub.user?.name?.toLowerCase() || ''
    const userEmail = sub.user?.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return userName.includes(search) || userEmail.includes(search)
  })

  const getPlanColor = (plan) => {
    const colors = {
      free: 'bg-gray-500',
      basic: 'bg-blue-500',
      premium: 'bg-purple-500',
      vip: 'bg-yellow-500',
    }
    return colors[plan] || colors.free
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      cancelled: 'bg-orange-500',
      expired: 'bg-red-500',
      inactive: 'bg-gray-500',
    }
    return colors[status] || colors.inactive
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">All subscription plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Crown className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.premium || 0) + (stats.vip || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Premium + VIP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(
                  (stats.basic || 0) * 9.99 +
                  (stats.premium || 0) * 14.99 +
                  (stats.vip || 0) * 19.99
                ).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Estimated MRR</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">End Date</th>
                      <th className="text-left py-3 px-4">Auto Renew</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub._id} className="border-b hover:bg-accent">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{sub.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{sub.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getPlanColor(
                              sub.plan
                            )}`}
                          >
                            {sub.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                              sub.status
                            )}`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">${sub.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {sub.endDate
                            ? new Date(sub.endDate).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {sub.autoRenew ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSubscriptions.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminSubscriptions
