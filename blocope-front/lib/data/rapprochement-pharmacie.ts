import type { ArticlePharmacie } from '@/lib/api/pharmacie.service'

// Nom de base d'un article du catalogue interne (avant la première parenthèse/deux-points qui
// introduit les variantes de dosage) — c'est cette partie qu'on rapproche du `dci` Pharmacie.
const nomBase = (label: string) => label.split(/[(:]/)[0]

const DIACRITIQUES = /[̀-ͯ]/g

const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(DIACRITIQUES, '').toLowerCase().trim()

// Rapprochement par nom, tolérant : le nom de base du médicament interne doit contenir le dci
// Pharmacie ou en être contenu (ex. "Perfalgan" ⊂ "Perfalgan 1g", "Sévoflurane" ⊃ "sevoflurane").
// Pas de correspondance exacte exigée — les catalogues ne sont pas garantis alignés mot pour mot.
export function trouverArticlePharmacie(label: string, catalogue: ArticlePharmacie[]): ArticlePharmacie | null {
  const cible = normaliser(nomBase(label))
  if (!cible) return null
  return (
    catalogue.find((a) => {
      const dci = normaliser(a.dci)
      return dci.length > 2 && (cible.includes(dci) || dci.includes(cible))
    }) || null
  )
}
