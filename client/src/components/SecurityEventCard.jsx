import { AlertTriangle, Shield, CheckCircle, Clock, Brain } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'

const SecurityEventCard = ({ event, onResolve }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'border-red-500 bg-red-500/5',
      high: 'border-orange-500 bg-orange-500/5',
      medium: 'border-yellow-500 bg-yellow-500/5',
      low: 'border-blue-500 bg-blue-500/5',
    }
    return colors[severity] || colors.low
  }

  const getStatusIcon = (status) => {
    const icons = {
      detected: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      investigating: <Clock className="w-5 h-5 text-blue-500" />,
      resolved: <CheckCircle className="w-5 h-5 text-green-500" />,
      auto_fixed: <Brain className="w-5 h-5 text-purple-500" />,
      false_positive: <Shield className="w-5 h-5 text-gray-500" />,
    }
    return icons[status] || icons.detected
  }

  return (
    <Card className={`border-2 ${getSeverityColor(event.severity)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(event.status)}
            <div>
              <h3 className="font-semibold text-lg">{event.eventType.replace(/_/g, ' ').toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            event.severity === 'critical' ? 'bg-red-500 text-white' :
            event.severity === 'high' ? 'bg-orange-500 text-white' :
            event.severity === 'medium' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
          }`}>
            {event.severity.toUpperCase()}
          </span>
        </div>

        {event.description && (
          <p className="text-sm mb-4">{event.description}</p>
        )}

        {event.aiAnalysis && (
          <div className="bg-secondary rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">AI Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Risk Score:</span>
                <span className="ml-2 font-semibold">{event.aiAnalysis.riskScore}/100</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-semibold">{event.aiAnalysis.confidence}%</span>
              </div>
            </div>
            {event.aiAnalysis.recommendations?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold mb-2">Recommendations:</p>
                <ul className="text-sm space-y-1">
                  {event.aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {event.aiAnalysis.autoFixApplied && (
              <div className="mt-3 p-3 bg-green-500/10 rounded border border-green-500/20">
                <p className="text-sm text-green-500 font-semibold">
                  ✓ Auto-Fix Applied: {event.aiAnalysis.autoFixDetails}
                </p>
              </div>
            )}
          </div>
        )}

        {event.status !== 'resolved' && event.status !== 'auto_fixed' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onResolve(event._id)}>
              Mark as Resolved
            </Button>
            <Button size="sm" variant="outline">
              Investigate
            </Button>
          </div>
        )}

        {event.resolution && (
          <div className="mt-4 p-3 bg-green-500/10 rounded">
            <p className="text-sm font-semibold text-green-500 mb-1">Resolved</p>
            <p className="text-sm">{event.resolution.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SecurityEventCard
