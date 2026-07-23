'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salleReveilService } from '@/lib/api/salle-reveil.service';
import { libelleUrgence, styleUrgence } from '@/lib/urgence';
import { formaterNomPatient } from '@/lib/patient';
import RoleGate from '@/components/bloc/auth/RoleGate';
import { RoleClinique } from '@/lib/auth/role-clinique';

interface PatientReveil {
  id: string;
  nom: string;
  prenom: string;
  idDossier: string;
  intervention: string;
  niveauUrgence: 'TRES_URGENT' | 'URGENT' | 'NORMAL' | string;
  depuis: string;
}

export default function ListeSalleReveil() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientReveil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerPatients();
  }, []);

  const chargerPatients = async () => {
    try {
      setLoading(true);
      const data = await salleReveilService.getPatientsEnReveil();
      setPatients((data || []).map((p: any) => ({
        id: p.patientId || p.id,
        nom: p.nom || '',
        prenom: p.prenom || '',
        idDossier: p.idDossier || '—',
        intervention: p.libelle || p.typeChirurgie || 'Non spécifiée',
        niveauUrgence: p.niveauUrgence || 'NORMAL',
        depuis: p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
      })));
    } catch (err) {
      console.error('Erreur chargement:', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgenceBadge = (niveau: string) => libelleUrgence(niveau);

  const getUrgenceColor = (niveau: string) => styleUrgence(niveau).badge;

  return (
    <RoleGate allowedRoles={[RoleClinique.ANESTHESISTE]} message="Seul l'anesthésiste a accès à la salle de réveil.">
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🛏️ Tous les patients en salle de réveil</h1>
        <button
          onClick={chargerPatients}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          🔄 Actualiser
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des patients...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intervention</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depuis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgence</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun patient en salle de réveil
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formaterNomPatient(patient)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{patient.intervention}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{patient.depuis}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getUrgenceColor(patient.niveauUrgence)}`}>
                        {getUrgenceBadge(patient.niveauUrgence)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/bloc/salle-de-reveil/suivi?patientId=${patient.id}&patientNom=${encodeURIComponent(formaterNomPatient(patient))}&intervention=${encodeURIComponent(patient.intervention)}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition shadow-md hover:shadow-lg"
                        >
                          📋 Surveiller
                        </button>
                        {/* Point d'entrée indépendant pour le chirurgien : il ne suit pas les mêmes
                            écrans que l'anesthésiste, il doit pouvoir retrouver le patient ici pour
                            remplir le protocole opératoire, quel que soit qui a fait le reste. */}
                        <button
                          onClick={() => router.push(`/bloc/protocole-operatoire?patientId=${patient.id}&patientNom=${encodeURIComponent(formaterNomPatient(patient))}&intervention=${encodeURIComponent(patient.intervention)}`)}
                          className="px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-bold rounded-lg transition"
                        >
                          🖋️ Protocole opératoire
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </RoleGate>
  );
}
