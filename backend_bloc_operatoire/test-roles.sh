#!/bin/bash

API="http://localhost:3000/api"

# Fonction login
login() {
  local email=$1
  local pass=$2
  local nom=$3
  echo ""
  echo "========================================"
  echo " TEST : $nom ($email)"
  echo "========================================"
  TOKEN=$(curl -s -X POST $API/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"motDePasse\":\"$pass\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Connecté"
}

# Test 1 : Admin peut voir les rapports
test_admin() {
  login "admin@chu.fr" "admin123" "ADMIN"
  echo "→ Test rapports (ADMIN doit OK) :"
  curl -s $API/rapports/statistiques -H "Authorization: Bearer $TOKEN" | head -c 200
  echo ""
}

# Test 2 : Anesthésiste peut créer CPA
test_anesthesiste() {
  login "anesthesiste@chu.fr" "anesthesiste123" "ANESTHESISTE"
  echo "→ Test POST CPA (ANESTHESISTE doit OK) :"
  curl -s -X POST $API/cpa \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"patientId":"","anesthesisteId":"","dateConsultation":"2026-05-14","frequenceCardiaque":72,"tensionArterielle":{"systolique":120,"diastolique":80},"taille":170,"poids":70,"examenCardiovasculaire":"Normal","examenPulmonaire":"Normal","examenNeurologique":"Normal","colorationConjonctivale":"Normale","abordVeineux":"Bon","rachis":"Normal","mallampati":2,"ouvertureBuccale":4,"distanceMentoThyroidienne":6,"dents":"Saines","tabac":"Non fumeur","alcool":"Occasionnel","scoreASA":1,"decision":"APTE","typeAnesthesie":"AG","techniqueIntubation":"Sonde Endotrachéale","jeune":"À partir de minuit","preparationPhysique":"Douche bétadinée","tachesInfirmieres":"Constantes toutes les heures","antecedentsAnesthesie":false}' | head -c 200
  echo ""
}

# Test 3 : Chirurgien NE PEUT PAS créer CPA
test_chirurgien_cpa_refuse() {
  login "chirurgien@chu.fr" "chirurgien123" "CHIRURGIEN"
  echo "→ Test POST CPA (CHIRURGIEN doit REFUSER - 403) :"
  curl -s -X POST $API/cpa \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"patientId":"","anesthesisteId":"","dateConsultation":"2026-05-14","frequenceCardiaque":72,"tensionArterielle":{"systolique":120,"diastolique":80},"taille":170,"poids":70,"examenCardiovasculaire":"Normal","examenPulmonaire":"Normal","examenNeurologique":"Normal","colorationConjonctivale":"Normale","abordVeineux":"Bon","rachis":"Normal","mallampati":2,"ouvertureBuccale":4,"distanceMentoThyroidienne":6,"dents":"Saines","tabac":"Non fumeur","alcool":"Occasionnel","scoreASA":1,"decision":"APTE","typeAnesthesie":"AG","techniqueIntubation":"Sonde Endotrachéale","jeune":"À partir de minuit","preparationPhysique":"Douche bétadinée","tachesInfirmieres":"Constantes toutes les heures","antecedentsAnesthesie":false}' | head -c 200
  echo ""
}

# Test 4 : Infirmière peut créer Score SCCRE
test_infirmiere() {
  login "infirmiere@chu.fr" "infirmiere123" "INFIRMIERE_BLOC"
  echo "→ Test POST Score SCCRE (INFIRMIERE doit OK) :"
  curl -s -X POST $API/scores-sccre \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"patientId":"","anesthesisteId":"","heureArrivee":"14:00","dateEvaluation":"2026-05-14","motricite":2,"respiration":2,"pressionArterielle":2,"etatConscience":2,"coloration":2,"evs":1,"eqa":1,"eva":2,"sortieAutorisee":true}' | head -c 200
  echo ""
}

# Test 5 : Aide-Soignant NE PEUT PAS créer Score
test_aide_soignant_refuse() {
  login "aide-soignant@chu.fr" "aide123" "AIDE_SOIGNANT"
  echo "→ Test POST Score SCCRE (AIDE-SOIGNANT doit REFUSER - 403) :"
  curl -s -X POST $API/scores-sccre \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"patientId":"","anesthesisteId":"","heureArrivee":"14:00","dateEvaluation":"2026-05-14","motricite":2,"respiration":2,"pressionArterielle":2,"etatConscience":2,"coloration":2,"evs":1,"eqa":1,"eva":2,"sortieAutorisee":true}' | head -c 200
  echo ""
}

# Exécuter tous les tests
echo "🚀 DÉMARRAGE DES TESTS DE RÔLES"
test_admin
test_anesthesiste
test_chirurgien_cpa_refuse
test_infirmiere
test_aide_soignant_refuse
echo ""
echo "✅ TESTS TERMINÉS"
