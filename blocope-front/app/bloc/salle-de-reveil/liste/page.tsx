'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salleReveilService } from '@/lib/api/salle-reveil.service';

interface PatientReveil {
  id: string;
  nom: string;
  prenom: string;
  intervention: string;
  statut: 'stable' | 'instable' | 'critique';
  dureeOperation: string;
  heureArrivee: string;
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
      const patients = await salleReveilService.getPatientsEnReveil();
      setPatients(patients);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setPatients([
        { id: '1', nom: 'Dupont', prenom: 'Jean', intervention: 'Appendicectomie', statut: 'stable', dureeOperation: '45min', heureArrivee: '14:25' },
        { id: '2', nom: 'Martin', prenom: 'Sophie', intervention: 'Cholécystectomie', statut: 'instable', dureeOperation: '1h20', heureArrivee: '15:10' },
        { id: '3', nom: 'Bernard', prenom: 'Pierre', intervention: 'Hernie', statut: 'stable', dureeOperation: '30min', heureArrivee: '16:00' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'stable': return '🟢 Stable';
      case 'instable': return '🟠 Instable';
      case 'critique': return '🔴 Critique';
      default: return '⚪ Inconnu';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'instable': return 'bg-orange-100 text-orange-800';
      case 'critique': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure arrivée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun patient en salle de réveil
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{patient.prenom} {patient.nom}</p>
                      <p className="text-xs text-gray-500">ID: {patient.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{patient.intervention}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{patient.heureArrivee}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{patient.dureeOperation}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(patient.statut)}`}>
                        {getStatutBadge(patient.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => router.push(`/bloc/salle-de-reveil/suivi?patientId=${patient.id}&patientNom=${patient.prenom}%20${patient.nom}&intervention=${patient.intervention}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition shadow-md hover:shadow-lg"
                      >
                        📋 Surveiller
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
