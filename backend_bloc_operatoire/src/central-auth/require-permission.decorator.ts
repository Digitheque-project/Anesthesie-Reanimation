import { SetMetadata } from '@nestjs/common';

// Exige une permission du catalogue central (format `ressource:action`) sur une route.
//
// Deux effets, appliques par CentralAuthGuard :
//  1. Un membre du service Bloc Operatoire passe toujours (l'appartenance au service reste
//     suffisante, comportement historique inchange).
//  2. Un utilisateur d'un AUTRE service du CHU (pediatrie, neurologie, consultation externe...)
//     est accepte si l'un de ses services porte cette permission. C'est ce qui permet la
//     consultation transversale du programme operatoire sans rattacher artificiellement le
//     compte au bloc.
//
// Les routes sans ce decorateur restent reservees aux membres du service Bloc Operatoire.
// A n'utiliser que sur des routes de LECTURE : l'ecriture doit rester protegee par
// @RequireRoleClinique, que le garde refuse aux acces externes.
export const REQUIRE_PERMISSION_KEY = 'requirePermission';
export const RequirePermission = (permission: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
