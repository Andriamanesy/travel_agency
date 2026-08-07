import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DestinationsPage } from '@/features/destinations/pages/DestinationsPage'
import { DestinationDetailsPage } from '@/features/destinations/pages/DestinationDetailsPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { NewBookingPage } from '@/features/bookings/pages/NewBookingPage'
import { MyBookingsPage } from '@/features/bookings/pages/MyBookingsPage'
import { CatalogPage } from '@/features/catalog/pages/CatalogPage'
import { CatalogDetailPage } from '@/features/catalog/pages/CatalogDetailPage'
import { AdminBookingsPage } from '@/features/admin/pages/AdminBookingsPage'
import { AdminDestinationsPage } from '@/features/admin/pages/AdminDestinationsPage'
import { AdminCatalogPage } from '@/features/admin/pages/AdminCatalogPage'
import { AdminAccessPage } from '@/features/admin/pages/AdminAccessPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { RoleRoute } from '@/routes/RoleRoute'
import { LegacyBookingRedirect } from '@/routes/LegacyBookingRedirect'
import { CircuitBookingPage } from '@/features/booking/pages/CircuitBookingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/catalog/:entity" element={<CatalogPage />} />
      <Route path="/catalog/:entity/:itemId" element={<CatalogDetailPage />} />
      <Route path="/catalog" element={<Navigate to="/catalog/circuits" replace />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:destinationId" element={<DestinationDetailsPage />} />
      <Route path="/booking.html" element={<LegacyBookingRedirect />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/bookings/new" element={<NewBookingPage />} />
          <Route path="/booking/:tourId" element={<CircuitBookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
            <Route path="/admin/catalog/:entity" element={<AdminCatalogPage />} />
            <Route path="/admin/catalog" element={<Navigate to="/admin/catalog/circuits" replace />} />
            <Route path="/admin/access" element={<AdminAccessPage />} />
            <Route path="/admin" element={<Navigate to="/admin/access" replace />} />
          </Route>
        </Route>
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
