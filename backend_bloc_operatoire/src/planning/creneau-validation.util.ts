import { BadRequestException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import {
  CreneauBloc,
  StatutCreneau,
  TypeRDV,
} from '../entities/creneau-bloc.entity';

// Partagé entre PlanningService.reserverCreneau et DemandeCpaExterneService.planifier — les deux
// créent un CreneauBloc par des chemins de code séparés et doivent respecter les mêmes règles :
//
//  1. Jamais une date passée (vaut pour tous les types de rendez-vous).
//  2. Un seul rendez-vous par horaire — mais UNIQUEMENT pour la CPA.
//
// La vérification la veille est exclue de la règle d'unicité, dans les deux sens : on n'empêche
// plus d'en planifier une sur un horaire déjà pris, et une vérification veille existante
// n'empêche plus d'y planifier quoi que ce soit. Ce n'est pas une consultation individuelle
// occupant une salle : l'anesthésiste passe voir plusieurs patients au même moment, la veille de
// leur intervention. Refuser deux patients au même horaire n'avait donc aucun sens clinique et
// obligeait à inventer des heures fictives pour contourner le blocage.
export async function verifierCreneauValide(
  creneauRepo: Repository<CreneauBloc>,
  date: string,
  heureDebut: string,
  type: TypeRDV = TypeRDV.CPA,
): Promise<void> {
  if (!date) return;
  const aujourdhui = new Date().toISOString().split('T')[0];
  const dateSeule = new Date(date).toISOString().split('T')[0];
  if (dateSeule < aujourdhui) {
    throw new BadRequestException(
      "Impossible de planifier un rendez-vous à une date passée.",
    );
  }

  // Une vérification veille ne réserve pas l'horaire : rien à contrôler.
  if (type === TypeRDV.VERIFICATION_VEILLE) return;

  if (!heureDebut) return;
  const conflit = await creneauRepo.findOne({
    where: {
      date: date as any,
      heureDebut,
      statut: Not(StatutCreneau.ANNULE),
      // Les vérifications veille déjà posées sur cet horaire ne le bloquent pas.
      type: Not(TypeRDV.VERIFICATION_VEILLE),
    },
  });
  if (conflit) {
    throw new BadRequestException(
      `Un rendez-vous est déjà planifié le ${dateSeule} à ${heureDebut} — choisissez un autre horaire.`,
    );
  }
}
