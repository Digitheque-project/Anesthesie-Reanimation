# Faire entrer un patient au Bloc Opératoire (Anesthésie-Réanimation)

Tout service du CHU — Chirurgie, Pédiatrie, Endoscopie, Imagerie/Radiologie, Urgence,
Consultation externe, ou tout autre — peut adresser un patient au bloc. Aucun identifiant de
service n'est codé en dur : le service demandeur est identifié par le `serviceId` qu'il transmet,
et son nom est résolu auprès du registre central des services.

Quatre portes d'entrée, toutes menant au même circuit interne (fiche patient `patients_bloc` en
`EN_ATTENTE_CPA` + notification dans la cloche + alerte temps réel + son) :

| Canal | Qui l'utilise | Déclenchement |
|---|---|---|
| Prescription bloc | Services qui prescrivent une intervention (Chirurgie, Pédiatrie…) | Poll du service central Prescriptions toutes les 15 s, plus immédiat sur évènement temps réel |
| Prescription imagerie | Services qui prescrivent un examen sous anesthésie | Évènement temps réel, puis lecture du contenu par GET |
| Demande de CPA externe | Tout service voulant une CPA/VPA avant son acte | `POST /bloc/api/demandes-cpa-externes/receive` |
| Webhook générique | Tout autre service | `POST /bloc/api/webhook-notification` |

## 1. Prescription de bloc (via le service central Prescriptions)

Le bloc interroge `GET {PRESCRIPTION_API_URL}/prescriptions/bloc?serviceIdDest={SERVICE_ID}` et
ingère tout ce qui lui est destiné, puis passe la prescription en `RECU_BLOC`. Rien à faire côté
service demandeur au-delà de la création de la prescription.

Champs exploités : `patientId`, `chuId`, `urgence`, `serviceIdSource`, `consignes`, `alertes`,
`prescripteurId`, `chirurgien`, `dateIntervention`, et les actes (`actes[]` ou `ActeBloc[]` :
`libelle`, `typeChirurgie`, `risqueHemorragique`, `dateIntervention`, `heureIntervention`,
`nomChirurgien`).

- La date d'intervention est lue sur l'acte **ou**, à défaut, à la racine de la prescription.
- **Tous** les actes sont repris dans le libellé (`Acte A + Acte B`), pas seulement le premier.
- Une prescription sans acte détaillé est acceptée.

## 2. Demande de CPA/VPA externe

`POST /bloc/api/demandes-cpa-externes/receive` — route publique, sans jeton SSO.

```json
{
  "patientId": "CHU-2026-00099",
  "sourceServiceId": "a6ae8016-678c-4e13-b9d7-0afd735702d8",
  "sourceReferenceType": "examen",
  "sourceReferenceId": "EXM-2026-0456",
  "typeAnesthesie": "Sédation",
  "motif": "Coloscopie sous sédation",
  "urgence": 3,
  "dateExamenSouhaitee": "2026-08-20",
  "sourceCallbackUrl": "https://mon-service.chu/notifications/receive"
}
```

Idempotent sur `(patientId, sourceReferenceType, sourceReferenceId)` : re-poster la même demande
ne crée pas de doublon. Le résultat (APTE / INAPTE / REPORT, motif, date) revient par le service
Notification et, si fournie, sur `sourceCallbackUrl`. Repli de consultation :
`GET /bloc/api/demandes-cpa-externes/{id}/statut` (public).

## 3. Webhook générique

`POST /bloc/api/webhook-notification` — route publique, pour un service qui n'émet ni prescription
bloc ni prescription imagerie et ne veut pas du contrat CPA complet.

```json
{
  "type": "DEMANDE_PRISE_EN_CHARGE",
  "patientId": "CHU-2026-00099",
  "sourceServiceId": "…",
  "sourceServiceName": "Consultation externe",
  "motif": "Ponction sous anesthésie",
  "urgence": 4,
  "referenceId": "CE-2026-0087"
}
```

`patientId` est le seul champ réellement indispensable. `urgence` accepte l'échelle numérique
(1-5) comme le libellé (`URGENT`, `TRES_URGENT`). `referenceId` (ou `entiteRefId`,
`sourceReferenceId`, `id`) sert à la déduplication : sans lui, seul l'état courant du patient
protège des doublons.

Les notifications que le bloc **émet** (`CPA_APTE`, `CPA_INAPTE`, `CPA_RESULTAT`, `VPA_REALISEE`,
`RDV_CPA_PLANIFIE`, `RETOUR_SERVICE_ORIGINE`, `DATE_OPERATION_MODIFIEE`, `patient_statut_change`)
sont ignorées par ce canal : un service qui nous répond ne réadmet pas son patient.

## Échelle d'urgence

Commune à tous les canaux (`src/common/urgence.ts`, et `lib/urgence.ts` côté frontend) :

| Valeur transmise | Niveau au bloc | Effet |
|---|---|---|
| 1-2, `NORMAL` | `NORMAL` | CPA planifiée, puis vérification la veille |
| 3-4, `URGENT` | `URGENT` | Badge urgent, son d'alerte, créneau d'urgence, pas de vérification veille |
| 5, `TRES_URGENT`, `STAT` | `TRES_URGENT` | Idem, affiché en rouge |

## Retour vers le service demandeur

Le bloc renotifie le service d'origine (identifié par son seul `serviceId`) à chaque étape :
RDV CPA planifié, CPA inapte, date d'opération modifiée, résultat de CPA/VPA, retour du patient
après l'acte.

## Configuration

| Variable | Rôle |
|---|---|
| `SERVICE_ID`, `CHU_ID` | Identité du bloc dans l'écosystème |
| `PRESCRIPTION_API_URL`, `PRESCRIPTION_IMAGERIE_API_URL` | Sources de prescriptions |
| `NOTIFICATION_API_URL` | Canal temps réel entrant et sortant |
| `CENTRAL_SERVICE_REGISTRY_URL` | Résolution des noms de service |
| `SERVICES_NON_OPERATOIRES` | Mots-clés supplémentaires de services non opératoires (séparés par des virgules) |
| `SERVICES_AVEC_SALLE_REVEIL` | Idem pour les services disposant de leur propre salle de réveil |
