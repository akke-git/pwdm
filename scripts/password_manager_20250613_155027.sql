-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: password_manager
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#3498db',
  `icon` varchar(50) DEFAULT 'folder',
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_user_name_unique` (`user_id`,`name`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,2,'bank','#3498db','finance','은행 증권 카드','2025-06-09 02:04:12','2025-06-09 02:04:12'),(2,2,'Portal','#f39c12','social','포타를','2025-06-09 06:28:41','2025-06-09 06:28:41'),(3,2,'Media','#9b59b6','entertainment','유툽 등','2025-06-09 07:20:37','2025-06-09 07:20:37'),(4,2,'Golf','#f1c40f','golf','골프','2025-06-09 07:50:25','2025-06-09 07:50:25'),(5,2,'PC','#2ecc71','computer','PC & DIGITAL','2025-06-12 01:49:09','2025-06-12 01:49:09');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_history`
--

DROP TABLE IF EXISTS `password_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `password_item_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `action` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `password_item_id` (`password_item_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_history_ibfk_69` FOREIGN KEY (`password_item_id`) REFERENCES `password_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `password_history_ibfk_70` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_history`
--

LOCK TABLES `password_history` WRITE;
/*!40000 ALTER TABLE `password_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_items`
--

DROP TABLE IF EXISTS `password_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` text NOT NULL COMMENT '암호화된 비밀번호',
  `category` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `notes` text,
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `last_used` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_items`
--

LOCK TABLES `password_items` WRITE;
/*!40000 ALTER TABLE `password_items` DISABLE KEYS */;
INSERT INTO `password_items` VALUES (1,1,'테스트 계정','https://example.com','testuser','8924c4377936bce73c0319908db371e0:f9580712ca9d37155a17270790931456bf261689129c77df50ee0a23c1938105','웹사이트','[]','테스트용 계정입니다.',0,'2025-06-05 05:38:33',NULL,'2025-06-05 05:38:33','2025-06-05 05:38:33'),(2,2,'naver','http://naver.com','maser@naver.com','98168bd1ce798e652f54ffd11c198b73:bbe4b7bda0dc4b44d599a2299381033a','bank','[]','네이년',0,'2025-06-09 02:05:01',NULL,'2025-06-09 02:05:01','2025-06-09 02:05:01'),(4,2,'소피아그린cc','https://www.sophiagreen.co.kr/main','akkeiiii','164b395e758f8a3747b4668e15447021:b2ce327a206fcc46d44cc5f1bb50044d','Golf','[]','골프코스 코스코스',0,'2025-06-09 07:51:56',NULL,'2025-06-09 07:51:56','2025-06-10 07:38:08'),(5,2,'clien','http://clien.com','akkeii','1e0112699871b39b9d13da12c839752e:a90cb6d486a919354b4da81366cfad8d','Portal','[]','클리앙\n클리아앙',0,'2025-06-10 08:11:33',NULL,'2025-06-10 08:11:33','2025-06-10 08:11:33'),(6,2,'Quasar','http://quasarzone.co.kr','akkeii@gmail.com','ca94f84a509d3988a21c5c3fce36eece:5d72043155aa4608572f746ef13d8c1e','PC','[]','네이버 연동',0,'2025-06-12 01:17:04',NULL,'2025-06-12 01:17:04','2025-06-12 01:49:20');
/*!40000 ALTER TABLE `password_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `device_info` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `last_active` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `token_2` (`token`),
  UNIQUE KEY `token_3` (`token`),
  UNIQUE KEY `token_4` (`token`),
  UNIQUE KEY `token_5` (`token`),
  UNIQUE KEY `token_6` (`token`),
  UNIQUE KEY `token_7` (`token`),
  UNIQUE KEY `token_8` (`token`),
  UNIQUE KEY `token_9` (`token`),
  UNIQUE KEY `token_10` (`token`),
  UNIQUE KEY `token_11` (`token`),
  UNIQUE KEY `token_12` (`token`),
  UNIQUE KEY `token_13` (`token`),
  UNIQUE KEY `token_14` (`token`),
  UNIQUE KEY `token_15` (`token`),
  UNIQUE KEY `token_16` (`token`),
  UNIQUE KEY `token_17` (`token`),
  UNIQUE KEY `token_18` (`token`),
  UNIQUE KEY `token_19` (`token`),
  UNIQUE KEY `token_20` (`token`),
  UNIQUE KEY `token_21` (`token`),
  UNIQUE KEY `token_22` (`token`),
  UNIQUE KEY `token_23` (`token`),
  UNIQUE KEY `token_24` (`token`),
  UNIQUE KEY `token_25` (`token`),
  UNIQUE KEY `token_26` (`token`),
  UNIQUE KEY `token_27` (`token`),
  UNIQUE KEY `token_28` (`token`),
  UNIQUE KEY `token_29` (`token`),
  UNIQUE KEY `token_30` (`token`),
  UNIQUE KEY `token_31` (`token`),
  UNIQUE KEY `token_32` (`token`),
  UNIQUE KEY `token_33` (`token`),
  KEY `sessions_user_id` (`user_id`),
  KEY `sessions_token` (`token`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (1,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwiaWF0IjoxNzQ5NDM0NTk2fQ.lzGhn7nuCPVbHSLyl69_-lAYgqUvlswtysNXuhOzmIk','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-09 02:03:16','2025-06-16 02:03:16',0,'2025-06-09 02:03:16','2025-06-09 02:03:16'),(2,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwiaWF0IjoxNzQ5NDQ2MDU4fQ.eS0yOIajBnJuI4_4WHjEcdmnd3E_c3sxUeG_aEnASFk','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-09 05:14:18','2025-06-16 05:14:18',0,'2025-06-09 05:14:18','2025-06-09 05:14:18'),(3,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NDUwMDY4fQ.FiduajiyZ3-Doypw1pvWcguFBf2XmB4yR6Vo6aIh8XA','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-09 06:21:08','2025-06-16 06:21:08',0,'2025-06-09 06:21:08','2025-06-09 06:21:08'),(4,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NDUwNzUxfQ.hSELJwmcYq2a7kPUdEnuIWdY_fMIJ73HUdoqTyGAX4M','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-09 06:32:31','2025-06-16 06:32:31',0,'2025-06-09 06:32:31','2025-06-09 06:32:31'),(5,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NTE2NTkxfQ.1IgX-WcjZ6gRUjbgdGSGltQtMvPo6EsJKNSqTc_GfCY','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-10 00:49:51','2025-06-17 00:49:51',0,'2025-06-10 00:49:51','2025-06-10 00:49:51'),(6,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NjAyOTY5fQ.bNVkB8w6VBrRD2F5uavwFwtWdztVgzJvzzMlL-3y6E0','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-11 00:49:29','2025-06-18 00:49:29',0,'2025-06-11 00:49:29','2025-06-11 00:49:29'),(7,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NjMwMjA2fQ.F5-6cjzxV9lL0B_DdaW1ac2CjfBMPdOnHLOVa6APIbQ','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-11 08:23:26','2025-06-18 08:23:26',0,'2025-06-11 08:23:26','2025-06-11 08:23:26'),(8,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NjMwMzcwfQ.FGLPCwUlED6TleJPI7efl9ZAJaCrGQgXCrKBx5ugwlI','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36','::1','2025-06-11 08:26:10','2025-06-18 08:26:10',0,'2025-06-11 08:26:10','2025-06-11 08:26:10'),(9,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NjMwNzgwfQ.AyG5tOmOjvbHmDbQDWAnBEz1a8JC2jr-JZgPuWqykmM','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36','::1','2025-06-11 08:33:00','2025-06-18 08:33:00',0,'2025-06-11 08:33:00','2025-06-11 08:33:00'),(10,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5Njg5MzcxfQ.5TdIUMjoDpxl_FQopw9FZ-Fg3N-Xq8KuPRH0x2S2L5Y','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-12 00:49:31','2025-06-19 00:49:31',0,'2025-06-12 00:49:31','2025-06-12 00:49:31'),(11,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NjkwNTQ3fQ.Dq-UYQLkoGh1gtFAPMn5Pb_OI8n-5Dc6Js_NPG7XAOI','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-12 01:09:07','2025-06-19 01:09:07',0,'2025-06-12 01:09:07','2025-06-12 01:09:07'),(12,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NzY5NjIyfQ.rj8LoslPOdkn9FpG5iPmDNaWwuXvdcOUcX0AewTRlEM','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-12 23:07:02','2025-06-19 23:07:02',0,'2025-06-12 23:07:02','2025-06-12 23:07:02'),(13,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NzcwMjE2fQ.sakaaiBKjownIuoB5e5glsJ6GikFiwD04J1VdkuXEgA','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-12 23:16:56','2025-06-19 23:16:56',0,'2025-06-12 23:16:56','2025-06-12 23:16:56'),(14,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NzcxMzQzfQ.XKr2gj7ZDihD1irT0HDTOSLc0yH2wTqPu781Klcm7a0','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-12 23:35:43','2025-06-19 23:35:43',0,'2025-06-12 23:35:43','2025-06-12 23:35:43'),(15,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5Nzc3ODc1fQ.1hiy3keVII0OnGG5KL-fyRSldL82jJSjGNLBCbBR_Rk','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-13 01:24:35','2025-06-20 01:24:35',0,'2025-06-13 01:24:35','2025-06-13 01:24:35'),(16,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5Nzg4MDQ5fQ.bTJ5MBQdaT7yASKYs2GmEvw5kqDtApO4-NvVbvKEH94','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-13 04:14:09','2025-06-20 04:14:09',0,'2025-06-13 04:14:09','2025-06-13 04:14:09'),(17,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5Nzg4OTA1fQ.fTv7vRQWfi7ba5pD5PqGZdF5LNsiibkEMd_mTkfs-2M','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-13 04:28:25','2025-06-20 04:28:25',0,'2025-06-13 04:28:25','2025-06-13 04:28:25'),(18,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJha2tlaWlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhZG1pbiEhIiwiaWF0IjoxNzQ5NzkxMDc5fQ.vTW-QnR678IKVRYNOXRXpjee8YCZDa9_YdICOl0NI1o','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0','::1','2025-06-13 05:04:39','2025-06-20 05:04:39',0,'2025-06-13 05:04:39','2025-06-13 05:04:39');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag_items`
--

DROP TABLE IF EXISTS `tag_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tag_id` int unsigned NOT NULL,
  `password_item_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tag_items_passwordItemId_tagId_unique` (`tag_id`,`password_item_id`),
  UNIQUE KEY `tag_item_unique` (`tag_id`,`password_item_id`),
  KEY `password_item_id` (`password_item_id`),
  CONSTRAINT `tag_items_ibfk_67` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tag_items_ibfk_68` FOREIGN KEY (`password_item_id`) REFERENCES `password_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_items`
--

LOCK TABLES `tag_items` WRITE;
/*!40000 ALTER TABLE `tag_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `tag_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(30) NOT NULL,
  `color` varchar(20) DEFAULT '#2ecc71',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_user_name_unique` (`user_id`,`name`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `master_password_hash` varchar(100) NOT NULL,
  `encryption_key` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `key_salt` varchar(255) DEFAULT NULL,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `backup_codes` text,
  `is_google_user` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'테스트사용자','test@example.com','$2b$10$yDXqFW8Y9FSajGSYwyJRF.mVPKkHgkDdjfdcNXZNG7jrqyd8uNWrG','$2b$10$F/RPi0j3MrL4T6cZV6XeUOSgHnBF6C8aAG7teqCIcD5/8RaA.rjv6','75782bccca949bef1f493179ae5b750b:5cb565d8ac11ed048ed71aa8a24a58c6','2025-06-05 05:38:33','2025-06-05 05:38:02','2025-06-05 05:38:33',NULL,NULL,0,NULL,0),(2,'admin!!','akkeii@gmail.com','$2b$10$7914h6teXcIUWIROLn3qtehI6OI0p88onBLdB4DMntqc57a10OyLq','$2b$10$b2Dxu6/0fM/fjSEw/bWJC.q.StTY/M43XFugUkccP/Rd98j/Xqviq','0bdbe6dc01f4c76b8c66f93b7c10a22e8bdf457c5bd436d4ab10391afbd0360e','2025-06-13 05:04:39','2025-06-09 02:03:04','2025-06-13 05:04:39','ce30914d164b5d97f75cfd74547f115755f54851d6290d74d4fb39e5bfb913f2',NULL,0,NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-13 15:50:27
