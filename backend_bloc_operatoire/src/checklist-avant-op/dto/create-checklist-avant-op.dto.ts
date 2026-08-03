import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

// Absent jusqu'ici (le contrôleur acceptait `any`) : une requête malformée (ex. dateCreation
// manquant, colonne NOT NULL) remontait tel quel comme une erreur SQL non gérée (500) au lieu
// d'un 400 clair — ValidationPipe (global, main.ts) ne s'applique qu'aux paramètres typés par une
// classe DTO, jamais à `any`.
export class CreateChecklistAvantOpDto {
  @IsString() patientId: string;
  @IsDateString() dateCreation: string;
  // Tri-state en pratique (null tant que l'item n'est pas activement répondu, voir
  // verifierChecklistComplete ci-dessous dans le contrôleur) — typé `boolean` simple ici comme
  // les DTO des checklists sœurs (checklist-pendant-op, checklist-apres-op) : la vérification du
  // null se fait avant l'appel à repo.create(), qui lui exige le type exact de l'entité.
  @IsOptional() @IsBoolean() identiteConfirmee?: boolean;
  @IsOptional() @IsBoolean() interventionSiteConfirmes?: boolean;
  @IsOptional() @IsBoolean() documentationDisponible?: boolean;
  @IsOptional() @IsBoolean() installationConnue?: boolean;
  @IsOptional() @IsBoolean() materielChirurgicalVerifie?: boolean;
  @IsOptional() @IsBoolean() materielAnesthesiqueVerifie?: boolean;
  @IsOptional() @IsBoolean() allergiePatient?: boolean;
  @IsOptional() @IsBoolean() risqueIntubation?: boolean;
  @IsOptional() @IsBoolean() risqueSaignement?: boolean;
  @IsOptional() @IsString() notesChirurgicales?: string;
  @IsOptional() @IsString() notesAnesthesiques?: string;
  @IsOptional() @IsString() notesIdeIbode?: string;
}
