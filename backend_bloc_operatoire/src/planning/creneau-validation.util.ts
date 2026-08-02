import { BadRequestException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { CreneauBloc, StatutCreneau } from '../entities/creneau-bloc.entity';

// Partagé entre PlanningService.reserverCreneau et DemandeCpaExterneService.planifier — les deux
// créent un CreneauBloc par des chemins de code séparés, mais doivent respecter les mêmes deux
// règles : jamais une date passée, jamais deux créneaux au même horaire (même date + même heure
// de début, quel que soit le type ou la salle — un seul créneau clinique par horaire).
export async function verifierCreneauValide(
  creneauRepo: Repository<CreneauBloc>,
  date: string,
  heureDebut: string,
): Promise<void> {
  if (!date) return;
  const aujourdhui = new Date().toISOString().split('T')[0];
  const dateSeule = new Date(date).toISOString().split('T')[0];
  if (dateSeule < aujourdhui) {
    throw new BadRequestException(
      "Impossible de planifier un rendez-vous à une date passée.",
    );
  }

  if (!heureDebut) return;
  const conflit = await creneauRepo.findOne({
    where: { date: date as any, heureDebut, statut: Not(StatutCreneau.ANNULE) },
  });
  if (conflit) {
    throw new BadRequestException(
      `Un rendez-vous est déjà planifié le ${dateSeule} à ${heureDebut} — choisissez un autre horaire.`,
    );
  }
}
