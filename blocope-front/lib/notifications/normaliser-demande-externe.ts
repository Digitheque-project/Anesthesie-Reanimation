// Les demandes de CPA/VPA émises par des services externes (ex: Endoscopie) sont un modèle
// distinct des prescriptions internes — normalisées ici au même format que les notifications
// pour pouvoir être affichées dans le même fil (bell TopBar, page Notification CPA).
export const normaliserDemandeExterne = (d: any) => ({
  id: d.id,
  origineExterne: true,
  patientId: d.patientId,
  patientNom: d.patientId,
  intervention: d.motif || d.typeAnesthesie,
  motif: d.motif,
  prescripteur: d.sourceServiceName || d.sourceServiceId,
  sourceServiceName: d.sourceServiceName || d.sourceServiceId,
  heure: d.createdAt ? new Date(d.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
  dateIntervention: d.dateExamenSouhaitee,
  urgence: d.urgence,
  estUrgent: (d.urgence ?? 0) >= 4,
  statut: 'EN_ATTENTE',
})
