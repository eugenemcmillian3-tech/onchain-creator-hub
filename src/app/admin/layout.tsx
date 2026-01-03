import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isAdminWallet } from '@/lib/auth'
import { AdminSidebar } from './components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check for admin session
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin-session')

  if (!sessionCookie?.value) {
    redirect('/admin/login')
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    if (!isAdminWallet(sessionData.address)) {
      redirect('/admin/login?error=unauthorized')
    }
  } catch {
    redirect('/admin/login?error=invalid_session')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
