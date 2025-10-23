import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <MobileNav />
      
      {/* Main Content with sidebar offset */}
      <div className="lg:ml-64 pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  )
}

export default Layout
