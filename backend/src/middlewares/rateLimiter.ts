import rateLimit from 'express-rate-limit'

export class AuthRateLimiter {
  // Limiteur strict pour la connexion et la re-vérification du mot de passe
  static strict = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max par IP
    message: { error: 'Trop de tentatives échouées. Réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Limiteur global pour l'API Admin
  static api = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requêtes max par IP
    standardHeaders: true,
    legacyHeaders: false,
  })
}