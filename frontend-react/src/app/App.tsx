import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { TermsPage, PrivacyPage } from '@/features/legal/pages/LegalPage'
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
import { NotFoundPage } from '@/routes/NotFoundPage'
import { RoleRoute } from '@/routes/RoleRoute'
import { LegacyBookingRedirect } from '@/routes/LegacyBookingRedirect'
import { CircuitBookingPage } from '@/features/booking/pages/CircuitBookingPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AdminContentPage } from '@/features/admin/pages/AdminContentPage'
import { AdminMarketingPage } from '@/features/admin/pages/AdminMarketingPage'
import { AdminReviewsPage } from '@/features/admin/pages/AdminReviewsPage'
import { AdminSettingsPage } from '@/features/admin/pages/AdminSettingsPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { AdminRolesPage } from '@/features/admin/pages/AdminRolesPage'
import { AdminHomeContentPage } from '@/features/admin/pages/AdminHomeContentPage'
// Importez votre page de contact (ajustez le chemin selon l'emplacement de votre fichier)
import { ContactPage } from '@/features/contact/pages/ContactPage'

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
      <Route path="/catalog" element={<CatalogIndexRedirect />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:destinationId" element={<DestinationDetailsPage />} />
      <Route path="/booking.html" element={<LegacyBookingRedirect />} />
      
      {/* Route Contact corrigée avec le composant Route */}
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Route des CGU */}
      <Route 
        path="/cgu" 
        element={
          <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1">
              <TermsPage />
            </main>
            <SiteFooter />
          </div>
        } 
      />

      {/* Route de la Politique de Confidentialité */}
      <Route 
        path="/privacy" 
        element={
          <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1">
              <PrivacyPage />
            </main>
            <SiteFooter />
          </div>
        } 
      />

      {/* Redirection de sécurité si un lien pointe vers /terms */}
      <Route path="/terms" element={<Navigate to="/cgu" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/bookings/new" element={<NewBookingPage />} />
          <Route path="/booking/:tourId" element={<CircuitBookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="circuits" element={<Navigate to="/admin/catalog/circuits" replace />} />
              <Route path="destinations" element={<AdminDestinationsPage />} />
              <Route path="catalog/:entity" element={<AdminCatalogPage />} />
              <Route path="catalog" element={<Navigate to="/admin/catalog/circuits" replace />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="content/home" element={<AdminHomeContentPage />} />
              <Route path="marketing" element={<AdminMarketingPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="users/roles" element={<AdminRolesPage />} />
              <Route path="access" element={<Navigate to="/admin/users" replace />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function CatalogIndexRedirect() {
  const location = useLocation()
  return <Navigate to={`/catalog/circuits${location.search}`} replace />
}