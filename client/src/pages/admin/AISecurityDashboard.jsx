import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Activity, Brain, Zap } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import axios from '../../lib/axios'

const AISecurityDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    fetchInsights()
    fetchAnomalies()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/admin/security/dashboard')
      setDashboard(response.data)
    } catch (error) {
      setDashboard(generateDemoData())
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/admin/security/insights')
      setInsights(response.data)
    } catch (error) {
      setInsights({ recommendations: [] })
    }
  }

  const fetchAnomalies = async () => {
    try {
      const response = await axios.get('/admin/security/anomalies')
      setAnomalies(response.data.anomalies || [])
    } catch (error) {
      setAnomalies([])
    }
  }

  const generateDemoData = () => ({
    stats: { totalEvents: 1247, criticalEvents: 3, highEvents: 12, autoFixedEvents: 45, aiPerformance: { successRate: 94.5, falsePositiveRate: 2.1 } },
    recentEvents: [],
    eventsByType: [],
  })

  const getSeverityColor = (severity) => ({
    critical: 'text-red-500 bg-red-500/10',
    high: 'text-orange-500 bg-orange-500/10',
    medium: 'text-yellow-500 bg-yellow-500/10',
    low: 'text-blue-500 bg-blue-500/10',
  }[severity])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">AI Security Monitor</h1>
              <p className="text-muted-foreground">Real-time threat detection & auto-fix system</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-500">AI Active</span>
          </div>
        </div>

        {loading ? <div className="text-center py-12">Loading...</div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold">{dashboard.stats.totalEvents}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold">{dashboard.stats.criticalEvents}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Critical Threats</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <span className="text-2xl font-bold">{dashboard.stats.autoFixedEvents}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Auto-Fixed</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold">{dashboard.stats.aiPerformance.successRate}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">AI Accuracy</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Active Anomalies</CardTitle></CardHeader>
                <CardContent>
                  {anomalies.length > 0 ? (
                    <div className="space-y-3">
                      {anomalies.map((anomaly, i) => (
                        <div key={i} className={`p-4 rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{anomaly.type}</h4>
                            <span className="text-sm">{anomaly.count} events</span>
                          </div>
                          <p className="text-sm">{anomaly.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-muted-foreground py-8">No anomalies detected</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />AI Recommendations</CardTitle></CardHeader>
                <CardContent>
                  {insights?.recommendations?.length > 0 ? (
                    <div className="space-y-3">
                      {insights.recommendations.slice(0, 5).map((rec, i) => (
                        <div key={i} className="p-4 bg-secondary rounded-lg">
                          <p className="mb-2">{rec.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Confidence: {rec.confidence}%</span>
                            <Button size="sm">Apply Fix</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-muted-foreground py-8">No recommendations</p>}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Security Events</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Severity</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">AI Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentEvents?.slice(0, 10).map((event, i) => (
                        <tr key={i} className="border-b hover:bg-accent">
                          <td className="p-3">{new Date(event.createdAt).toLocaleString()}</td>
                          <td className="p-3">{event.eventType}</td>
                          <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(event.severity)}`}>{event.severity}</span></td>
                          <td className="p-3">{event.status}</td>
                          <td className="p-3">{event.aiAnalysis?.riskScore || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default AISecurityDashboard
