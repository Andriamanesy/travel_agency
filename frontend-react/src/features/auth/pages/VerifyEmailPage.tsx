import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { AuthCard } from './RegisterPage'

export function VerifyEmailPage() {
  const [params] = useSearchParams(); const token = params.get('token')
  const verification = useQuery({ queryKey: ['verify-email', token], queryFn: () => authService.verifyEmail(token ?? ''), enabled: Boolean(token), retry: false })
  if (!token) return <AuthCard title="Lien invalide"><p>Le lien de vérification est incomplet.</p></AuthCard>
  if (verification.isPending) return <AuthCard title="Vérification en cours"><p>Veuillez patienter pendant la validation de votre adresse e-mail.</p></AuthCard>
  if (verification.isError) return <AuthCard title="Échec de la vérification"><p>Le lien est invalide ou a expiré.</p><Link to="/login" className="action">Se connecter</Link></AuthCard>
  return <AuthCard title={verification.data.status === 'already_verified' ? 'E-mail déjà vérifié' : 'E-mail vérifié !'}><p>Votre compte est actif. Vous pouvez désormais accéder à votre espace TravelMS.</p><Link to="/login" className="action">Se connecter</Link></AuthCard>
}
