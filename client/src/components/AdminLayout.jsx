import Navbar from './Navbar'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdminSidebar />
      
      {/* Main Content with sidebar offset */}
      <div className="ml-64 pt-16">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
