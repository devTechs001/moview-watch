import { useState, useEffect } from 'react'
import { FileText, AlertTriangle, Flag, CheckCircle, XCircle, Eye, MessageCircle } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import axios from '../../lib/axios'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, resolved

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/admin/reports?status=${filter}`)
      setReports(response.data.reports || generateDemoReports())
    } catch (error) {
      console.error(error)
      setReports(generateDemoReports())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoReports = () => {
    return [
      {
        _id: '1',
        type: 'content',
        status: 'pending',
        reporter: { name: 'User A', avatar: '' },
        reported: { name: 'User B', avatar: '' },
        reason: 'Inappropriate content',
        description: 'This post contains offensive material',
        createdAt: new Date(),
      },
      {
        _id: '2',
        type: 'spam',
        status: 'resolved',
        reporter: { name: 'User C', avatar: '' },
        reported: { name: 'User D', avatar: '' },
        reason: 'Spam posting',
        description: 'Multiple spam posts in short time',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        _id: '3',
        type: 'harassment',
        status: 'pending',
        reporter: { name: 'User E', avatar: '' },
        reported: { name: 'User F', avatar: '' },
        reason: 'Harassment',
        description: 'Repeated harassment in comments',
        createdAt: new Date(Date.now() - 172800000),
      },
    ]
  }

  const handleResolve = async (reportId) => {
    try {
      await axios.put(`/admin/reports/${reportId}/resolve`)
      toast.success('Report resolved')
      fetchReports()
    } catch (error) {
      toast.error('Failed to resolve report')
    }
  }

  const handleDismiss = async (reportId) => {
    try {
      await axios.put(`/admin/reports/${reportId}/dismiss`)
      toast.success('Report dismissed')
      fetchReports()
    } catch (error) {
      toast.error('Failed to dismiss report')
    }
  }

  const getReportIcon = (type) => {
    const icons = {
      content: <FileText className="w-5 h-5 text-red-500" />,
      spam: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      harassment: <Flag className="w-5 h-5 text-purple-500" />,
      other: <MessageCircle className="w-5 h-5 text-blue-500" />,
    }
    return icons[type] || icons.other
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      resolved: 'success',
      dismissed: 'secondary',
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">Manage user reports and violations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {reports.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {reports.filter(r => r.status === 'dismissed').length}
              </div>
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading reports...</p>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No reports found</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {getReportIcon(report.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{report.reason}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Reported by <span className="font-medium">{report.reporter?.name}</span> against{' '}
                          <span className="font-medium">{report.reported?.name}</span>
                        </p>
                        <p className="text-sm mb-2">{report.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(report._id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(report._id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminReports
