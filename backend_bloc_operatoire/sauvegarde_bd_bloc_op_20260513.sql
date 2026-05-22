-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: bd_bloc_op
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activites_per_op`
--

DROP TABLE IF EXISTS `activites_per_op`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activites_per_op` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `chirurgienId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `dateOperation` date NOT NULL,
  `perfusions` text DEFAULT NULL,
  `transfusions` text DEFAULT NULL,
  `journalSorties` text DEFAULT NULL,
  `intubationOT` tinyint(4) NOT NULL DEFAULT 0,
  `sArme` tinyint(4) NOT NULL DEFAULT 0,
  `masqueLarynge` tinyint(4) NOT NULL DEFAULT 0,
  `ventilation` text DEFAULT NULL,
  `etatArrivee` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites_per_op`
--

LOCK TABLES `activites_per_op` WRITE;
/*!40000 ALTER TABLE `activites_per_op` DISABLE KEYS */;
/*!40000 ALTER TABLE `activites_per_op` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bloc_patient`
--

DROP TABLE IF EXISTS `bloc_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bloc_patient` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `patient_id` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `intervention` text NOT NULL,
  `heure` time DEFAULT NULL,
  `duree_prevue` varchar(20) DEFAULT NULL,
  `depart_bloc` varchar(20) DEFAULT NULL,
  `priorite` enum('STAT','URGENT','NORMAL') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_bloc_patient_priorite` (`priorite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloc_patient`
--

LOCK TABLES `bloc_patient` WRITE;
/*!40000 ALTER TABLE `bloc_patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `bloc_patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bons_commande`
--

DROP TABLE IF EXISTS `bons_commande`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bons_commande` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `vpaId` varchar(255) NOT NULL,
  `chirurgienId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `dateCreation` date NOT NULL,
  `consommables` text NOT NULL,
  `statut` enum('EN_ATTENTE','VALIDE') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bons_commande`
--

LOCK TABLES `bons_commande` WRITE;
/*!40000 ALTER TABLE `bons_commande` DISABLE KEYS */;
/*!40000 ALTER TABLE `bons_commande` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklists_oms`
--

DROP TABLE IF EXISTS `checklists_oms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `checklists_oms` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `dateCreation` date NOT NULL,
  `avantInduction` text NOT NULL,
  `avantIncision` text NOT NULL,
  `sortiBloc` text NOT NULL,
  `statut` enum('EN_COURS','PHASE1_VALIDEE','PHASE2_VALIDEE','COMPLETE') NOT NULL DEFAULT 'EN_COURS',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklists_oms`
--

LOCK TABLES `checklists_oms` WRITE;
/*!40000 ALTER TABLE `checklists_oms` DISABLE KEYS */;
/*!40000 ALTER TABLE `checklists_oms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `constantes_per_op`
--

DROP TABLE IF EXISTS `constantes_per_op`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `constantes_per_op` (
  `id` varchar(36) NOT NULL,
  `heure` varchar(255) NOT NULL,
  `fc` int(11) NOT NULL,
  `ta` varchar(255) NOT NULL,
  `spo2` float NOT NULL,
  `temperature` float NOT NULL,
  `capnie` float NOT NULL,
  `score` int(11) NOT NULL,
  `activitePerOpId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constantes_per_op`
--

LOCK TABLES `constantes_per_op` WRITE;
/*!40000 ALTER TABLE `constantes_per_op` DISABLE KEYS */;
/*!40000 ALTER TABLE `constantes_per_op` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpa`
--

DROP TABLE IF EXISTS `cpa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cpa` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `dateConsultation` date NOT NULL,
  `antecedentsAnesthesie` tinyint(4) NOT NULL DEFAULT 0,
  `notesIncidents` text DEFAULT NULL,
  `frequenceCardiaque` int(11) NOT NULL,
  `tensionArterielle` text NOT NULL,
  `taille` float NOT NULL,
  `poids` float NOT NULL,
  `examenCardiovasculaire` text NOT NULL,
  `examenPulmonaire` text NOT NULL,
  `examenNeurologique` text NOT NULL,
  `colorationConjonctivale` text NOT NULL,
  `abordVeineux` text NOT NULL,
  `rachis` text NOT NULL,
  `mallampati` int(11) NOT NULL,
  `ouvertureBuccale` float NOT NULL,
  `distanceMentoThyroidienne` float NOT NULL,
  `dents` text NOT NULL,
  `tabac` text NOT NULL,
  `alcool` text NOT NULL,
  `scoreASA` enum('1','2','3','4','5','6','E') NOT NULL,
  `decision` enum('APTE','INAPTE','REPORT') NOT NULL,
  `typeAnesthesie` varchar(255) NOT NULL,
  `techniqueIntubation` varchar(255) NOT NULL,
  `jeune` varchar(255) NOT NULL,
  `preparationPhysique` text NOT NULL,
  `tachesInfirmieres` text NOT NULL,
  `dateVPA` date DEFAULT NULL,
  `statut` enum('EN_ATTENTE','REALISE') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpa`
--

LOCK TABLES `cpa` WRITE;
/*!40000 ALTER TABLE `cpa` DISABLE KEYS */;
/*!40000 ALTER TABLE `cpa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creneaux_bloc`
--

DROP TABLE IF EXISTS `creneaux_bloc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creneaux_bloc` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `heureDebut` time NOT NULL,
  `heureFin` time NOT NULL,
  `salle` varchar(50) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `chirurgienId` varchar(255) NOT NULL,
  `statut` enum('PLANIFIE','EN_COURS','TERMINE','ANNULE') NOT NULL DEFAULT 'PLANIFIE',
  `estUrgence` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creneaux_bloc`
--

LOCK TABLES `creneaux_bloc` WRITE;
/*!40000 ALTER TABLE `creneaux_bloc` DISABLE KEYS */;
/*!40000 ALTER TABLE `creneaux_bloc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drainages`
--

DROP TABLE IF EXISTS `drainages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `drainages` (
  `id` varchar(36) NOT NULL,
  `type` enum('SONDE_NASO_GASTRIQUE','DRAIN_CRANE','DRAIN_THORAX','DRAIN_ABDOMEN') NOT NULL,
  `mode` enum('SIPHON','ASPIRATION','REDON') NOT NULL,
  `cote` enum('GAUCHE','DROITE') DEFAULT NULL,
  `protocoleId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drainages`
--

LOCK TABLES `drainages` WRITE;
/*!40000 ALTER TABLE `drainages` DISABLE KEYS */;
/*!40000 ALTER TABLE `drainages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historique_modifications`
--

DROP TABLE IF EXISTS `historique_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historique_modifications` (
  `id` varchar(36) NOT NULL,
  `entite` varchar(255) NOT NULL,
  `entiteId` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `utilisateurId` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historique_modifications`
--

LOCK TABLES `historique_modifications` WRITE;
/*!40000 ALTER TABLE `historique_modifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `historique_modifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items_commande`
--

DROP TABLE IF EXISTS `items_commande`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_commande` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `selectionne` tinyint(4) NOT NULL DEFAULT 0,
  `quantite` varchar(255) DEFAULT NULL,
  `dosage` varchar(255) DEFAULT NULL,
  `observation` varchar(255) DEFAULT NULL,
  `bonCommandeId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items_commande`
--

LOCK TABLES `items_commande` WRITE;
/*!40000 ALTER TABLE `items_commande` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_commande` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medecins`
--

DROP TABLE IF EXISTS `medecins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medecins` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `initiales` varchar(10) NOT NULL,
  `role` enum('CHIRURGIEN','ANESTHESISTE','MEDECIN_RESPONSABLE','INFIRMIER','TECHNICIEN','DIRECTEUR_MEDICAL') NOT NULL,
  `numeroOrdre` varchar(50) NOT NULL,
  `ordre` enum('ONM','ONIM','ONSFM','ONPM','AUTRE') NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `matricule` varchar(50) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_4c507bd2867925e813df90cc30` (`numeroOrdre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medecins`
--

LOCK TABLES `medecins` WRITE;
/*!40000 ALTER TABLE `medecins` DISABLE KEYS */;
/*!40000 ALTER TABLE `medecins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_cpa`
--

DROP TABLE IF EXISTS `notifications_cpa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications_cpa` (
  `id` varchar(36) NOT NULL,
  `heurePrescription` varchar(255) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `intervention` varchar(255) NOT NULL,
  `chirurgienId` varchar(255) NOT NULL,
  `professeurCPA` varchar(255) NOT NULL,
  `estUrgent` tinyint(4) NOT NULL DEFAULT 0,
  `statut` enum('EN_ATTENTE','RDV_PLANIFIE','REALISE') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_cpa`
--

LOCK TABLES `notifications_cpa` WRITE;
/*!40000 ALTER TABLE `notifications_cpa` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications_cpa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_destination_service`
--

DROP TABLE IF EXISTS `patient_destination_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_destination_service` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `sortie_patient_id` char(36) NOT NULL,
  `service_destination_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `service_destination_id` (`service_destination_id`),
  KEY `idx_patient_destination_sortie` (`sortie_patient_id`),
  CONSTRAINT `patient_destination_service_ibfk_1` FOREIGN KEY (`sortie_patient_id`) REFERENCES `sortie_patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_destination_service_ibfk_2` FOREIGN KEY (`service_destination_id`) REFERENCES `service_destination` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_destination_service`
--

LOCK TABLES `patient_destination_service` WRITE;
/*!40000 ALTER TABLE `patient_destination_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_destination_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `dateNaissance` date NOT NULL,
  `sexe` enum('M','F') NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` text NOT NULL,
  `idDossier` varchar(50) NOT NULL,
  `groupeSanguin` varchar(20) NOT NULL,
  `statut` enum('EN_ATTENTE_CPA','CPA_REALISE','EN_ATTENTE_VPA','VPA_REALISE','PRET_POUR_BLOC','EN_COURS_OPERATION','EN_SALLE_REVEIL','SORTI') NOT NULL DEFAULT 'EN_ATTENTE_CPA',
  `niveauUrgence` enum('STAT','URGENT','NORMAL') NOT NULL DEFAULT 'NORMAL',
  `chambre` varchar(20) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78f94d0264c60761cbeb787d58` (`idDossier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premedicaments`
--

DROP TABLE IF EXISTS `premedicaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `premedicaments` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `dose` varchar(255) NOT NULL,
  `voieAdministration` varchar(255) NOT NULL,
  `debut` varchar(255) NOT NULL,
  `frequence` varchar(255) NOT NULL,
  `cpaId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premedicaments`
--

LOCK TABLES `premedicaments` WRITE;
/*!40000 ALTER TABLE `premedicaments` DISABLE KEYS */;
/*!40000 ALTER TABLE `premedicaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `protocoles_operatoires`
--

DROP TABLE IF EXISTS `protocoles_operatoires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `protocoles_operatoires` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `dateOperation` date NOT NULL,
  `chirurgienId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `infirmiereId` varchar(255) NOT NULL,
  `aideOperatoireId` varchar(255) NOT NULL,
  `compteRenduIntervention` text NOT NULL,
  `surveillance` text NOT NULL,
  `prescriptions` text NOT NULL,
  `prescriptionsConjointes` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `protocoles_operatoires`
--

LOCK TABLES `protocoles_operatoires` WRITE;
/*!40000 ALTER TABLE `protocoles_operatoires` DISABLE KEYS */;
/*!40000 ALTER TABLE `protocoles_operatoires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salle_reveil_patient`
--

DROP TABLE IF EXISTS `salle_reveil_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salle_reveil_patient` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `patient_id` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `intervention` text NOT NULL,
  `salle_lit` varchar(20) DEFAULT NULL,
  `duree_prevue` varchar(20) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_salle_reveil_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salle_reveil_patient`
--

LOCK TABLES `salle_reveil_patient` WRITE;
/*!40000 ALTER TABLE `salle_reveil_patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `salle_reveil_patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score_sccre`
--

DROP TABLE IF EXISTS `score_sccre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `score_sccre` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `patient_reveil_id` char(36) NOT NULL,
  `motricite` tinyint(4) NOT NULL CHECK (`motricite` between 0 and 2),
  `respiration` tinyint(4) NOT NULL CHECK (`respiration` between 0 and 2),
  `pression` tinyint(4) NOT NULL CHECK (`pression` between 0 and 2),
  `conscience` tinyint(4) NOT NULL CHECK (`conscience` between 0 and 2),
  `coloration` tinyint(4) NOT NULL CHECK (`coloration` between 0 and 2),
  `total` tinyint(4) GENERATED ALWAYS AS (`motricite` + `respiration` + `pression` + `conscience` + `coloration`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_score_sccre_patient` (`patient_reveil_id`),
  CONSTRAINT `score_sccre_ibfk_1` FOREIGN KEY (`patient_reveil_id`) REFERENCES `salle_reveil_patient` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_sccre`
--

LOCK TABLES `score_sccre` WRITE;
/*!40000 ALTER TABLE `score_sccre` DISABLE KEYS */;
/*!40000 ALTER TABLE `score_sccre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores_sccre`
--

DROP TABLE IF EXISTS `scores_sccre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `scores_sccre` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `heureArrivee` varchar(255) NOT NULL,
  `dateEvaluation` date NOT NULL,
  `motricite` int(11) NOT NULL,
  `respiration` int(11) NOT NULL,
  `pressionArterielle` int(11) NOT NULL,
  `etatConscience` int(11) NOT NULL,
  `coloration` int(11) NOT NULL,
  `scoreTotal` int(11) NOT NULL,
  `evs` int(11) NOT NULL,
  `eqa` int(11) NOT NULL,
  `eva` int(11) NOT NULL,
  `etatInitial` text NOT NULL,
  `reponse` text NOT NULL,
  `sortieAutorisee` tinyint(4) NOT NULL DEFAULT 0,
  `statut` enum('EN_COURS','VALIDE') NOT NULL DEFAULT 'EN_COURS',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores_sccre`
--

LOCK TABLES `scores_sccre` WRITE;
/*!40000 ALTER TABLE `scores_sccre` DISABLE KEYS */;
/*!40000 ALTER TABLE `scores_sccre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_destination`
--

DROP TABLE IF EXISTS `service_destination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_destination` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `label` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_destination`
--

LOCK TABLES `service_destination` WRITE;
/*!40000 ALTER TABLE `service_destination` DISABLE KEYS */;
INSERT INTO `service_destination` VALUES ('aababe91-4cb7-11f1-afee-40b03409a8c5','Médecine Interne','2026-05-10 21:31:55'),('aabac14f-4cb7-11f1-afee-40b03409a8c5','Chirurgie','2026-05-10 21:31:55'),('aabacbe8-4cb7-11f1-afee-40b03409a8c5','Réanimation','2026-05-10 21:31:55'),('aabacc7a-4cb7-11f1-afee-40b03409a8c5','Soins Intensifs','2026-05-10 21:31:55'),('aabacdad-4cb7-11f1-afee-40b03409a8c5','Unité de Surveillance Continue','2026-05-10 21:31:55'),('aabace98-4cb7-11f1-afee-40b03409a8c5','Médecine d\'Urgence','2026-05-10 21:31:55'),('aabacf43-4cb7-11f1-afee-40b03409a8c5','Cardiologie','2026-05-10 21:31:55'),('aabacf90-4cb7-11f1-afee-40b03409a8c5','Pneumologie','2026-05-10 21:31:55'),('aabacfd0-4cb7-11f1-afee-40b03409a8c5','Neurologie','2026-05-10 21:31:55'),('aabad00b-4cb7-11f1-afee-40b03409a8c5','Gastro-entérologie','2026-05-10 21:31:55');
/*!40000 ALTER TABLE `service_destination` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sortie_checklist`
--

DROP TABLE IF EXISTS `sortie_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sortie_checklist` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `sortie_patient_id` char(36) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sortie_patient_id` (`sortie_patient_id`),
  CONSTRAINT `sortie_checklist_ibfk_1` FOREIGN KEY (`sortie_patient_id`) REFERENCES `sortie_patient` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sortie_checklist`
--

LOCK TABLES `sortie_checklist` WRITE;
/*!40000 ALTER TABLE `sortie_checklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `sortie_checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sortie_patient`
--

DROP TABLE IF EXISTS `sortie_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sortie_patient` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `patient_id` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `id_dossier` varchar(50) NOT NULL,
  `chambre` varchar(20) DEFAULT NULL,
  `intervention` text NOT NULL,
  `statut` enum('stable','instable','critique') NOT NULL,
  `score_sccre` tinyint(4) NOT NULL,
  `heure_validation` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_sortie_patient_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sortie_patient`
--

LOCK TABLES `sortie_patient` WRITE;
/*!40000 ALTER TABLE `sortie_patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `sortie_patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sorties_reveil`
--

DROP TABLE IF EXISTS `sorties_reveil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sorties_reveil` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `scoreSCCREId` varchar(255) NOT NULL,
  `medecinId` varchar(255) NOT NULL,
  `dateHeureSortie` datetime NOT NULL,
  `versServiceOrigine` tinyint(4) NOT NULL DEFAULT 0,
  `autresServicesDestination` text DEFAULT NULL,
  `checklistSortie` text NOT NULL,
  `statut` enum('EN_ATTENTE','VALIDE') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sorties_reveil`
--

LOCK TABLES `sorties_reveil` WRITE;
/*!40000 ALTER TABLE `sorties_reveil` DISABLE KEYS */;
/*!40000 ALTER TABLE `sorties_reveil` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vpa`
--

DROP TABLE IF EXISTS `vpa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vpa` (
  `id` varchar(36) NOT NULL,
  `patientId` varchar(255) NOT NULL,
  `cpaId` varchar(255) NOT NULL,
  `anesthesisteId` varchar(255) NOT NULL,
  `dateVisite` date NOT NULL,
  `identiteConfirmee` tinyint(4) NOT NULL DEFAULT 0,
  `jeuneRespected` tinyint(4) NOT NULL DEFAULT 0,
  `instructionsRespectees` tinyint(4) NOT NULL DEFAULT 0,
  `premedicationFaite` tinyint(4) NOT NULL DEFAULT 0,
  `jeune` text NOT NULL,
  `examensComplementaires` text NOT NULL,
  `commandeSang` text NOT NULL,
  `heureDepart` varchar(20) NOT NULL,
  `statut` enum('EN_ATTENTE','VALIDE') NOT NULL DEFAULT 'EN_ATTENTE',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vpa`
--

LOCK TABLES `vpa` WRITE;
/*!40000 ALTER TABLE `vpa` DISABLE KEYS */;
/*!40000 ALTER TABLE `vpa` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 21:47:28
