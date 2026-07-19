'use client'

import { InputHTMLAttributes } from 'react'

export type CheckboxAccent = 'primary' | 'secondary' | 'tertiary' | 'error' | 'primary-container' | 'inverse-primary'
export type CheckboxSize = 'sm' | 'md' | 'lg'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  accent?: CheckboxAccent
  size?: CheckboxSize
}

// Case à cocher unique pour tous les checklists du projet — forme, taille et couleurs
// standardisées, pour que l'utilisateur retrouve toujours la même interaction visuelle
// (checklist OMS, protocole opératoire, vérification veille, salle de réveil, médicaments...).
const ACCENT_CLASSES: Record<CheckboxAccent, string> = {
  primary: 'accent-primary focus-visible:ring-primary/30',
  secondary: 'accent-secondary focus-visible:ring-secondary/30',
  tertiary: 'accent-tertiary focus-visible:ring-tertiary/30',
  error: 'accent-error focus-visible:ring-error/30',
  'primary-container': 'accent-primary-container focus-visible:ring-primary-container/30',
  'inverse-primary': 'accent-inverse-primary focus-visible:ring-inverse-primary/30',
}

const SIZE_CLASSES: Record<CheckboxSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export default function Checkbox({ accent = 'primary', size = 'md', className = '', ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`${SIZE_CLASSES[size]} shrink-0 rounded-md border-2 border-outline-variant bg-white cursor-pointer transition-all duration-150 hover:border-on-surface-variant focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${ACCENT_CLASSES[accent]} ${className}`}
      {...props}
    />
  )
}
