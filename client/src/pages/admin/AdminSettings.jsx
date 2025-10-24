import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Admin Settings</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Name</label>
              <Input defaultValue="CinemaFlix" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <Input type="email" defaultValue="support@cinemaflix.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enable maintenance mode to prevent users from accessing the platform
            </p>
            <Button variant="destructive">Enable Maintenance Mode</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings
