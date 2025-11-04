import Navbar from '@/components/Navbar'
import { ToastContainer } from '@/components/Toast'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}
