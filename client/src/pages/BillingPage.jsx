import { useState, useEffect } from 'react'
import { CreditCard, Download, FileText, Calendar } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const BillingPage = () => {
  const [billingHistory, setBillingHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingHistory()
  }, [])

  const fetchBillingHistory = async () => {
    try {
      const response = await axios.get('/subscriptions/billing-history')
      setBillingHistory(response.data.billingHistory || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load billing history')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = (invoiceId) => {
    toast.success(`Downloading invoice ${invoiceId}...`)
    // In a real app, this would trigger a PDF download
  }

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-500 bg-green-500/10',
      pending: 'text-yellow-500 bg-yellow-500/10',
      failed: 'text-red-500 bg-red-500/10',
    }
    return colors[status] || colors.pending
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Billing History</h1>
          <p className="text-muted-foreground">View and manage your payment history</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading billing history...</p>
            </CardContent>
          </Card>
        ) : billingHistory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                You haven't made any payments yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((payment, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invoice: {payment.invoiceId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment.invoiceId)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Methods */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                + Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default BillingPage
