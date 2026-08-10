// src/middlewares/requireSudo.ts
import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'

export async function requireSudoMode(req: Request, res: Response, next: NextFunction) {
  const sudoPassword = req.headers['x-sudopassword'] as string
  const currentUser = req.user // Issu de votre middleware d'authentification existant

  if (!sudoPassword) {
    return res.status(403).json({ 
      error: 'SUDO_REQUIRED', 
      message: 'Confirmation du mot de passe requise pour effectuer cette action.' 
    })
  }

  const isPasswordValid = await bcrypt.compare(sudoPassword, currentUser.passwordHash)
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Mot de passe de confirmation incorrect.' })
  }

  next()
}