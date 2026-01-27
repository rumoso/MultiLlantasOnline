-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_multillantas_dev
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actions` (
  `idAction` bigint NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `idActionSection` smallint NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `nameHtml` varchar(50) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idAction`),
  KEY `fk_actions_actionsection1_idx` (`idActionSection`),
  CONSTRAINT `fk_actions_actionsection1` FOREIGN KEY (`idActionSection`) REFERENCES `actionsection` (`idActionSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actionsconf`
--

DROP TABLE IF EXISTS `actionsconf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actionsconf` (
  `idActionsConf` bigint NOT NULL,
  `createDate` datetime DEFAULT NULL,
  `relationType` varchar(2) DEFAULT NULL,
  `idRelation` bigint DEFAULT NULL,
  `idAction` bigint NOT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idActionsConf`),
  KEY `fk_actionsconf_actions1_idx` (`idAction`),
  CONSTRAINT `fk_actionsconf_actions1` FOREIGN KEY (`idAction`) REFERENCES `actions` (`idAction`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actionsconf`
--

LOCK TABLES `actionsconf` WRITE;
/*!40000 ALTER TABLE `actionsconf` DISABLE KEYS */;
/*!40000 ALTER TABLE `actionsconf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actionsection`
--

DROP TABLE IF EXISTS `actionsection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actionsection` (
  `idActionSection` smallint NOT NULL AUTO_INCREMENT,
  `sectionName` varchar(500) DEFAULT NULL,
  `iLugar` smallint DEFAULT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idActionSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actionsection`
--

LOCK TABLES `actionsection` WRITE;
/*!40000 ALTER TABLE `actionsection` DISABLE KEYS */;
/*!40000 ALTER TABLE `actionsection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `idAddress` int NOT NULL,
  `idUser` int NOT NULL,
  `calle` varchar(500) DEFAULT NULL,
  `numInt` varchar(45) DEFAULT NULL,
  `numExt` varchar(45) DEFAULT NULL,
  `entreCalles` varchar(500) DEFAULT NULL,
  `codigoColonia` int DEFAULT NULL,
  `lat` varchar(45) DEFAULT NULL,
  `long` varchar(45) DEFAULT NULL,
  `bPrincipal` tinyint DEFAULT NULL,
  PRIMARY KEY (`idAddress`),
  KEY `fk_addresses_users1_idx` (`idUser`),
  CONSTRAINT `fk_addresses_users1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `keyx` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `idCart` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `precio` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`keyx`),
  KEY `fk_cart_items_carts1_idx` (`idCart`),
  KEY `fk_cart_items_productos1_idx` (`idProducto`),
  CONSTRAINT `fk_cart_items_carts1` FOREIGN KEY (`idCart`) REFERENCES `carts` (`idCart`),
  CONSTRAINT `fk_cart_items_productos1` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (18,'2026-01-24 02:06:48','2026-01-24 02:06:48',3,7,1,4800.00),(19,'2026-01-24 02:06:48','2026-01-24 02:06:48',3,8,1,1950.00),(20,'2026-01-24 02:06:49','2026-01-24 02:06:49',3,6,1,6500.00),(21,'2026-01-24 02:06:52','2026-01-24 02:06:52',3,5,1,3100.00),(22,'2026-01-24 02:06:52','2026-01-24 02:06:52',3,15,1,4900.00),(23,'2026-01-24 02:06:53','2026-01-24 02:06:53',3,13,1,3600.00),(24,'2026-01-24 02:06:53','2026-01-24 02:06:53',3,14,1,7200.00),(25,'2026-01-24 02:06:55','2026-01-24 02:06:55',3,10,1,2400.00),(26,'2026-01-24 02:06:55','2026-01-24 02:06:55',3,25,1,2100.00),(27,'2026-01-24 02:06:56','2026-01-24 02:06:56',3,26,1,3400.00),(28,'2026-01-24 02:06:57','2026-01-24 02:06:57',3,29,1,3500.00),(44,'2026-01-26 21:15:53','2026-01-26 21:15:53',5,1,2,2850.00),(46,'2026-01-26 21:18:50','2026-01-26 21:18:50',4,1,2,NULL);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `idCart` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `idUser` int DEFAULT NULL,
  `guest_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idCart`),
  KEY `fk_carts_users1_idx` (`idUser`),
  CONSTRAINT `fk_carts_users1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (2,'2026-01-24 01:27:22','2026-01-27 01:08:25',2,NULL),(3,'2026-01-24 02:06:48','2026-01-24 02:06:57',NULL,'49404205-85b5-4a9d-8d50-413fc0bac534'),(4,'2026-01-26 20:35:18','2026-01-26 20:35:18',1,NULL),(5,'2026-01-26 21:15:53','2026-01-26 21:15:53',NULL,'test-cart-guest-1769462153554');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cat_status_ordenes`
--

DROP TABLE IF EXISTS `cat_status_ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_status_ordenes` (
  `idStatusOrden` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del status',
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código único del status (PENDIENTE, PAGADA, etc.)',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del status en español',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada del status',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'gray' COMMENT 'Color para UI (yellow, blue, green, red, etc.)',
  `orden` int DEFAULT '0' COMMENT 'Orden de visualización',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si el status está activo',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  PRIMARY KEY (`idStatusOrden`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_cat_status_ordenes_codigo` (`codigo`),
  KEY `idx_cat_status_ordenes_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para órdenes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cat_status_ordenes`
--

LOCK TABLES `cat_status_ordenes` WRITE;
/*!40000 ALTER TABLE `cat_status_ordenes` DISABLE KEYS */;
INSERT INTO `cat_status_ordenes` VALUES (1,'PENDIENTE','Pendiente','Orden creada, esperando confirmación de pago','yellow',1,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(2,'PAGADA','Pagada','Pago confirmado y procesado exitosamente','blue',2,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(3,'EN_PROCESO','En Proceso','Orden en preparación para envío','orange',3,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(4,'ENVIADA','Enviada','Orden despachada y en tránsito','purple',4,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(5,'ENTREGADA','Entregada','Orden entregada al cliente','green',5,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(6,'CANCELADA','Cancelada','Orden cancelada por el cliente o sistema','red',6,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(7,'DEVUELTA','Devuelta','Orden devuelta por el cliente','gray',7,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(8,'REEMBOLSADA','Reembolsada','Orden con reembolso procesado','cyan',8,1,'2026-01-20 22:46:34','2026-01-20 22:46:34');
/*!40000 ALTER TABLE `cat_status_ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cat_status_pagos`
--

DROP TABLE IF EXISTS `cat_status_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_status_pagos` (
  `idStatusPago` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del status de pago',
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código único del status (PENDIENTE, APROBADO, etc.)',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del status en español',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada del status',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'gray' COMMENT 'Color para UI (yellow, green, red, etc.)',
  `orden` int DEFAULT '0' COMMENT 'Orden de visualización',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si el status está activo',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  PRIMARY KEY (`idStatusPago`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_cat_status_pagos_codigo` (`codigo`),
  KEY `idx_cat_status_pagos_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para pagos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cat_status_pagos`
--

LOCK TABLES `cat_status_pagos` WRITE;
/*!40000 ALTER TABLE `cat_status_pagos` DISABLE KEYS */;
INSERT INTO `cat_status_pagos` VALUES (1,'PENDIENTE','Pendiente','Pago iniciado, esperando confirmación','yellow',1,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(2,'APROBADO','Aprobado','Pago aprobado y confirmado','green',2,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(3,'EN_PROCESO','En Proceso','Pago en proceso de verificación','blue',3,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(4,'RECHAZADO','Rechazado','Pago rechazado por la entidad financiera','red',4,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(5,'CANCELADO','Cancelado','Pago cancelado por el usuario o sistema','orange',5,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(6,'REEMBOLSADO','Reembolsado','Pago reembolsado al cliente','purple',6,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(7,'EXPIRADO','Expirado','Pago expirado por tiempo de espera','gray',7,1,'2026-01-20 22:46:34','2026-01-20 22:46:34'),(8,'EN_MEDIACION','En Mediación','Pago en proceso de mediación o disputa','cyan',8,1,'2026-01-20 22:46:34','2026-01-20 22:46:34');
/*!40000 ALTER TABLE `cat_status_pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cat_status_payment`
--

DROP TABLE IF EXISTS `cat_status_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_status_payment` (
  `idStatusPayment` int NOT NULL COMMENT 'ID ??nico del status de pago',
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'C??digo ??nico del status (PENDIENTE, APROBADO, etc.)',
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del status en espa??ol',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripci??n detallada del status',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color para UI (yellow, green, red, etc.)',
  `orden` int DEFAULT NULL COMMENT 'Orden de visualizaci??n',
  `activo` tinyint(1) DEFAULT NULL COMMENT 'Indica si el status est?? activo',
  `createDate` datetime DEFAULT NULL COMMENT 'Fecha de creaci??n',
  `updateDate` datetime DEFAULT NULL COMMENT 'Fecha de actualizaci??n',
  PRIMARY KEY (`idStatusPayment`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_cat_status_pagos_codigo` (`codigo`),
  KEY `idx_cat_status_pagos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cat??logo de status para pagos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cat_status_payment`
--

LOCK TABLES `cat_status_payment` WRITE;
/*!40000 ALTER TABLE `cat_status_payment` DISABLE KEYS */;
INSERT INTO `cat_status_payment` VALUES (1,'PENDIENTE','Pendiente','Pago iniciado, esperando confirmaci??n','yellow',1,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(2,'APROBADO','Aprobado','Pago aprobado y confirmado','green',2,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(3,'EN_PROCESO','En Proceso','Pago en proceso de verificaci??n','blue',3,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(4,'RECHAZADO','Rechazado','Pago rechazado por la entidad financiera','red',4,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(5,'CANCELADO','Cancelado','Pago cancelado por el usuario o sistema','orange',5,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(6,'REEMBOLSADO','Reembolsado','Pago reembolsado al cliente','purple',6,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(7,'EXPIRADO','Expirado','Pago expirado por tiempo de espera','gray',7,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(8,'EN_MEDIACION','En Mediaci??n','Pago en proceso de mediaci??n o disputa','cyan',8,1,'2026-01-04 17:20:12','2026-01-04 17:20:12');
/*!40000 ALTER TABLE `cat_status_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `idFavorite` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `guest_id` varchar(255) DEFAULT NULL,
  `idProducto` int NOT NULL,
  `createDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFavorite`),
  UNIQUE KEY `unique_user_product` (`idUser`,`idProducto`),
  UNIQUE KEY `unique_guest_product` (`guest_id`,`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (4,2,NULL,6,'2026-01-26 21:22:42'),(5,2,NULL,5,'2026-01-26 21:22:43'),(6,2,NULL,15,'2026-01-26 21:22:44'),(7,2,NULL,13,'2026-01-26 21:22:45'),(8,2,NULL,14,'2026-01-26 21:22:45');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menupermisos`
--

DROP TABLE IF EXISTS `menupermisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menupermisos` (
  `idMenuPermiso` bigint NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `typeRelation` varchar(2) DEFAULT NULL,
  `idRelation` bigint DEFAULT NULL,
  `idMenu` bigint NOT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idMenuPermiso`),
  KEY `fk_menupermisos_menus1_idx` (`idMenu`),
  CONSTRAINT `fk_menupermisos_menus1` FOREIGN KEY (`idMenu`) REFERENCES `menus` (`idMenu`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menupermisos`
--

LOCK TABLES `menupermisos` WRITE;
/*!40000 ALTER TABLE `menupermisos` DISABLE KEYS */;
INSERT INTO `menupermisos` VALUES (1,'2026-01-12 00:00:00','R',1,1,1),(2,'2026-01-12 00:00:00','R',1,2,1),(3,'2026-01-12 00:00:00','R',1,3,1);
/*!40000 ALTER TABLE `menupermisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `idMenu` bigint NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `idMenuPadre` bigint DEFAULT NULL,
  `lugar` float DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `icon` varchar(500) DEFAULT NULL,
  `linkCat` varchar(1000) DEFAULT NULL,
  `linkList` varchar(1000) DEFAULT NULL,
  `imgDash` varchar(1000) DEFAULT NULL,
  `imgDashSize` float DEFAULT NULL,
  `idAplication` int DEFAULT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idMenu`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'2026-01-12 00:00:00',0,50,'Seguridad','En esta secci??n se maneja la seguridad del sitio','','','','',0,1,1),(2,'2026-01-12 00:00:00',1,1,'Usuarios','Catalogo de usuarios y asignaci??n de permisos','','','userList','people',50,1,1),(3,'2026-01-12 00:00:00',1,2,'Roles','Catalogo de roles y asignaci??n de permisos','','','roleList','lock_person',50,1,1);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `idOrderDetail` int NOT NULL AUTO_INCREMENT,
  `idOrder` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idOrderDetail`),
  KEY `idOrder` (`idOrder`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`idOrder`) REFERENCES `orders` (`idOrder`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,1,8,1,1950.00,1950.00),(2,2,8,1,1950.00,1950.00),(3,2,7,1,4800.00,4800.00),(4,2,13,1,3600.00,3600.00),(5,2,15,1,4900.00,4900.00),(6,2,5,1,3100.00,3100.00),(7,2,14,1,7200.00,7200.00),(9,4,7,20,4800.00,96000.00),(10,5,7,6,4800.00,28800.00),(11,6,8,2,1950.00,3900.00),(12,7,7,1,4800.00,4800.00),(13,7,8,1,1950.00,1950.00),(14,7,6,1,6500.00,6500.00),(15,7,5,1,3100.00,3100.00),(16,7,15,1,4900.00,4900.00),(17,7,13,1,3600.00,3600.00),(19,8,28,1,3200.00,3200.00),(20,8,15,1,4900.00,4900.00),(21,8,7,2,4800.00,9600.00),(22,8,8,1,1950.00,1950.00);
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `idOrder` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `idStatusOrden` int NOT NULL DEFAULT '1',
  `idStatusPago` int NOT NULL DEFAULT '1',
  `createDate` datetime NOT NULL,
  `updateDate` datetime NOT NULL,
  PRIMARY KEY (`idOrder`),
  KEY `idStatusOrden` (`idStatusOrden`),
  KEY `idStatusPago` (`idStatusPago`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`idStatusOrden`) REFERENCES `cat_status_ordenes` (`idStatusOrden`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`idStatusPago`) REFERENCES `cat_status_pagos` (`idStatusPago`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,1950.00,2,2,'2026-01-21 00:15:55','2026-01-21 00:15:55'),(2,2,25550.00,2,2,'2026-01-21 00:17:19','2026-01-21 00:17:19'),(3,2,0.00,2,2,'2026-01-21 05:08:53','2026-01-21 05:08:53'),(4,2,96000.00,2,2,'2026-01-21 05:45:14','2026-01-21 05:45:14'),(5,2,28800.00,2,2,'2026-01-21 05:54:46','2026-01-21 05:54:46'),(6,2,3900.00,2,2,'2026-01-21 18:20:01','2026-01-21 18:20:01'),(7,2,24850.00,2,2,'2026-01-23 23:40:35','2026-01-23 23:40:35'),(8,2,19650.00,2,2,'2026-01-27 01:08:25','2026-01-27 01:08:25');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `idProducto` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `activo` tinyint DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(5000) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `ancho` varchar(45) DEFAULT NULL,
  `perfil` varchar(45) DEFAULT NULL,
  `rin` varchar(45) DEFAULT NULL,
  `precio` decimal(18,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,NULL,NULL,1,'Michelin Primacy 4 195/55 R16','Llanta de alto rendimiento con excelente agarre en mojado y seco. Ideal para sedanes compactos.','Michelin','Primacy 4','195','55','16',2850.00,25,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(2,NULL,NULL,1,'Michelin Pilot Sport 4 225/45 R17','Llanta deportiva de alta performance con tecnología híbrida. Para autos deportivos y sedanes premium.','Michelin','Pilot Sport 4','225','45','17',4200.00,18,'https://via.placeholder.https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpgcom/400x400?text=Michelin+Pilot+Sport+4'),(3,NULL,NULL,1,'Michelin Latitude Sport 3 235/55 R19','Llanta SUV de alto rendimiento con excelente estabilidad y confort.','Michelin','Latitude Sport 3','235','55','19',5800.00,12,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(4,NULL,NULL,1,'Michelin Energy XM2+ 185/65 R15','Llanta económica con bajo consumo de combustible y larga duración.','Michelin','Energy XM2+','185','65','15',2150.00,40,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(5,NULL,NULL,1,'Bridgestone Turanza T005 205/55 R16','Llanta premium con excelente frenado en mojado y bajo nivel de ruido.','Bridgestone','Turanza T005','205','55','16',3100.00,30,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(6,NULL,NULL,1,'Bridgestone Potenza RE-71RS 245/40 R18','Llanta de competición para máximo agarre en pista. Compuesto ultra adherente.','Bridgestone','Potenza RE-71RS','245','40','18',6500.00,8,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(7,NULL,NULL,1,'Bridgestone Dueler H/T 684 II 265/65 R17','Llanta para camionetas y SUVs con excelente tracción en terracería.','Bridgestone','Dueler H/T 684 II','265','65','17',4800.00,15,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(8,NULL,NULL,1,'Bridgestone Ecopia EP150 175/65 R14','Llanta ecológica con bajo consumo de combustible para autos compactos.','Bridgestone','Ecopia EP150','175','65','14',1950.00,50,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(9,NULL,NULL,1,'Goodyear Eagle F1 Asymmetric 5 225/50 R17','Llanta deportiva con tecnología de frenado mejorado en mojado.','Goodyear','Eagle F1 Asymmetric 5','225','50','17',3850.00,22,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(10,NULL,NULL,1,'Goodyear Assurance MaxLife 195/60 R15','Llanta de larga duración con garantía extendida de kilometraje.','Goodyear','Assurance MaxLife','195','60','15',2400.00,35,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(11,NULL,NULL,1,'Goodyear Wrangler AT Adventure 255/70 R16','Llanta todo terreno para pickup y SUVs aventureros.','Goodyear','Wrangler AT Adventure','255','70','16',4200.00,20,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(12,NULL,NULL,1,'Goodyear EfficientGrip Performance 185/60 R15','Llanta eficiente con bajo consumo y buen agarre.','Goodyear','EfficientGrip Performance','185','60','15',2250.00,45,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(13,NULL,NULL,1,'Continental PremiumContact 6 215/55 R17','Llanta premium con excelente confort y seguridad en altas velocidades.','Continental','PremiumContact 6','215','55','17',3600.00,28,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(14,NULL,NULL,1,'Continental SportContact 6 255/35 R19','Llanta ultra deportiva para autos de alto desempeño.','Continental','SportContact 6','255','35','19',7200.00,10,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(15,NULL,NULL,1,'Continental CrossContact LX25 235/60 R18','Llanta SUV con excelente tracción y confort de marcha.','Continental','CrossContact LX25','235','60','18',4900.00,16,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(16,NULL,NULL,1,'Pirelli Cinturato P7 205/60 R16','Llanta verde con bajo consumo de combustible y alta eficiencia.','Pirelli','Cinturato P7','205','60','16',3200.00,25,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(17,NULL,NULL,1,'Pirelli P Zero 245/40 R18','Llanta de alta performance para autos deportivos y premium.','Pirelli','P Zero','245','40','18',6800.00,12,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(18,NULL,NULL,1,'Pirelli Scorpion Verde All Season 225/65 R17','Llanta SUV ecológica para uso todo el año.','Pirelli','Scorpion Verde','225','65','17',4500.00,18,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(19,NULL,NULL,1,'Yokohama BluEarth-GT AE51 195/65 R15','Llanta ecológica con excelente rendimiento de combustible.','Yokohama','BluEarth-GT AE51','195','65','15',2300.00,32,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(20,NULL,NULL,1,'Yokohama Advan Fleva V701 215/45 R17','Llanta deportiva con tecnología avanzada para máximo control.','Yokohama','Advan Fleva V701','215','45','17',4100.00,15,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(21,NULL,NULL,1,'Yokohama Geolandar G055 265/70 R17','Llanta off-road para aventuras extremas y terracería.','Yokohama','Geolandar G055','265','70','17',5200.00,10,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(22,NULL,NULL,1,'Hankook Ventus V12 evo2 225/45 R17','Llanta deportiva de alto rendimiento a precio competitivo.','Hankook','Ventus V12 evo2','225','45','17',2950.00,26,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(23,NULL,NULL,1,'Hankook Kinergy Eco 185/65 R15','Llanta económica con baja resistencia al rodamiento.','Hankook','Kinergy Eco','185','65','15',1850.00,48,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(24,NULL,NULL,1,'Hankook Dynapro AT2 RF11 245/70 R16','Llanta todo terreno robusta para pickup y SUV.','Hankook','Dynapro AT2 RF11','245','70','16',3800.00,20,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(25,NULL,NULL,1,'Firestone Firehawk AS V2 205/55 R16','Llanta all-season con excelente balance entre comfort y agarre.','Firestone','Firehawk AS V2','205','55','16',2100.00,35,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(26,NULL,NULL,1,'Firestone Destination LE3 235/65 R17','Llanta SUV con tecnología de larga duración.','Firestone','Destination LE3','235','65','17',3400.00,22,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(27,NULL,NULL,1,'Michelin Pilot Sport Cup 2 265/35 R19','Llanta semi-slick para pista y competición.','Michelin','Pilot Sport Cup 2','265','35','19',9500.00,3,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(28,NULL,NULL,1,'Bridgestone Blizzak WS90 195/65 R15','Llanta de invierno para condiciones extremas.','Bridgestone','Blizzak WS90','195','65','15',3200.00,0,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(29,NULL,NULL,1,'Continental WinterContact TS870 205/55 R16','Llanta de invierno discontinuada.','Continental','WinterContact TS870','205','55','16',3500.00,5,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `idRol` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `active` smallint DEFAULT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'2026-01-12 00:00:00','Admin','Es el usuario administrador',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `keyx` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `idUser` int NOT NULL,
  `idRol` int NOT NULL,
  PRIMARY KEY (`keyx`),
  KEY `fk_user_roles_users_idx` (`idUser`),
  KEY `fk_user_roles_roles1_idx` (`idRol`),
  CONSTRAINT `fk_user_roles_roles1` FOREIGN KEY (`idRol`) REFERENCES `roles` (`idRol`),
  CONSTRAINT `fk_user_roles_users` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,'2026-01-12 00:00:00',1,1);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `pwd` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `active` tinyint DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-01-12 00:00:00','2026-01-12 00:00:00','RUBEN MORENO SOTO','userRuben','$2a$10$AL/zF9lNZ1v5IrL2JBqJAOFtUNhXIgUH1B01GXa.Wq2PHLJaMLeTq',NULL,NULL,1),(2,'2026-01-20 14:34:05','2026-01-20 14:34:05','ALAN ALEXIS GOMEZ MORENO','Alan','$2a$10$jZaem0seNQ6hOBGDoJxpoetuP/kgYpv0JjomIlIxQi.a2W2f1I8Um','alan@example.com','6871946044',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'db_multillantas_dev'
--

--
-- Dumping routines for database 'db_multillantas_dev'
--
/*!50003 DROP PROCEDURE IF EXISTS `agregarAlCarrito` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `agregarAlCarrito`(
    IN p_createDate DATETIME,
    IN p_idProducto INT,
    IN p_cantidad INT,
    IN p_idUser INT,
    IN p_guest_id VARCHAR(255)
)
BEGIN
    DECLARE v_idCart INT;
    DECLARE v_count INT;
    
    
    SET v_idCart = NULL;

    
    IF p_idUser IS NOT NULL AND p_idUser > 0 THEN
        SELECT idCart INTO v_idCart FROM carts WHERE idUser = p_idUser LIMIT 1;
    
    ELSEIF p_guest_id IS NOT NULL AND p_guest_id != '' THEN
        SELECT idCart INTO v_idCart FROM carts WHERE guest_id = p_guest_id LIMIT 1;
    END IF;

    
    IF v_idCart IS NULL THEN
        INSERT INTO carts (createDate, updateDate, idUser, guest_id)
        VALUES (p_createDate, p_createDate, p_idUser, p_guest_id);
        
        SET v_idCart = LAST_INSERT_ID();
    ELSE
        
        UPDATE carts SET updateDate = p_createDate WHERE idCart = v_idCart;
    END IF;

    
    SELECT COUNT(*) INTO v_count FROM cart_items WHERE idCart = v_idCart AND idProducto = p_idProducto;

    IF v_count > 0 THEN
        UPDATE cart_items 
        SET cantidad = cantidad + p_cantidad, updateDate = p_createDate
        WHERE idCart = v_idCart AND idProducto = p_idProducto;
    ELSE
        INSERT INTO cart_items (createDate, updateDate, idCart, idProducto, cantidad, precio)
        SELECT p_createDate, p_createDate, v_idCart, p_idProducto, p_cantidad, precio
        FROM productos WHERE idProducto = p_idProducto;
    END IF;

    SELECT 'Producto agregado al carrito' as message, v_idCart as idCart;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `fromGuestToUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `fromGuestToUser`(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255)
)
BEGIN
    DECLARE v_userCartId INT;
    DECLARE v_guestCartId INT;

    -- 1. Obtener o crear carrito del Usuario
    SELECT idCart INTO v_userCartId FROM carts WHERE idUser = p_idUser LIMIT 1;
    
    IF v_userCartId IS NULL THEN
        INSERT INTO carts (idUser, createDate, updateDate) VALUES (p_idUser, NOW(), NOW());
        SET v_userCartId = LAST_INSERT_ID();
    END IF;

    -- 2. Obtener carrito del Invitado
    SELECT idCart INTO v_guestCartId FROM carts WHERE guest_id = p_guestId LIMIT 1;

    IF v_guestCartId IS NOT NULL THEN
        -- 3. Mover items del carrito invitado al usuario
        -- Usamos INSERT ... SELECT ... ON DUPLICATE KEY UPDATE para manejar duplicados
        INSERT INTO cart_items (idCart, idProducto, cantidad, createDate, updateDate)
        SELECT v_userCartId, src.idProducto, src.cantidad, NOW(), NOW()
        FROM cart_items src WHERE src.idCart = v_guestCartId
        ON DUPLICATE KEY UPDATE cantidad = cart_items.cantidad + VALUES(cantidad);

        -- Borrar los items viejos del carrito invitado
        DELETE FROM cart_items WHERE idCart = v_guestCartId;
        
        -- Opcional: Borrar el carrito vacío del invitado
        DELETE FROM carts WHERE idCart = v_guestCartId;
    END IF;

    -- 4. Mover Favoritos
    -- Actualizamos el idUser y quitamos el guest_id. 
    -- Si ya existe el favorito para ese usuario, se hace un "ignore" (o borramos el del guest para evitar error duplicate entry)
    -- Asumiendo UNIQUE(idUser, idProducto)
    
    -- Primero borramos duplicados que causarían conflicto (si el usuario ya lo tiene, borramos el del guest)
    DELETE gf FROM favorites gf
    INNER JOIN favorites uf ON gf.idProducto = uf.idProducto AND uf.idUser = p_idUser
    WHERE gf.guest_id = p_guestId;

    -- Ahora movemos los restantes
    UPDATE favorites 
    SET idUser = p_idUser, guest_id = NULL 
    WHERE guest_id = p_guestId;

    SELECT 'Data merging complete' AS result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getActionsPermissionByUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getActionsPermissionByUser`(
	IN p_idUser BIGINT
)
BEGIN

SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED ;

	SET @iRows = 0;
	
	CREATE TEMPORARY TABLE actionsList (
		id BIGINT AUTO_INCREMENT,
		idAction BIGINT,
		PRIMARY KEY(id)
	) ENGINE=InnoDB;
	
	INSERT INTO actionsList( idAction )
	SELECT DISTINCT
	A.idAction
	FROM actions AS A
	INNER JOIN actionsconf AS AC ON AC.active = 1 AND relationType = 'R' AND A.idAction = AC.idAction
	INNER JOIN user_roles AS RC ON AC.idRelation = RC.idRol
	INNER JOIN users AS U ON RC.idUser = U.idUser
	WHERE A.active = 1
	AND U.idUser = p_idUser
	;
	
	INSERT INTO actionsList( idAction )
	SELECT DISTINCT
	A.idAction
	FROM actions AS A
	INNER JOIN actionsconf AS AC ON AC.active = 1 AND AC.relationType = 'U' AND A.idAction = AC.idAction
	INNER JOIN users AS U ON AC.idRelation = U.idUser
	WHERE A.active = 1
	AND U.idUser = p_idUser
	;
	
	SELECT DISTINCT
	A.idAction
	,A.name
	FROM actions AS A
	INNER JOIN actionsList AS AL ON A.idAction = AL.idAction;
    
    DROP TABLE actionsList;

SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ ;
 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getCart` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getCart`(
    IN p_idUsuario INT,
    IN p_guest_id VARCHAR(255)
)
BEGIN
    SELECT 
        ci.keyx AS idItem,
        ci.idCart,
        ci.idProducto,
        p.nombre AS descripcion,
        p.imagen_url,
        ci.cantidad,
        ci.precio,
        (ci.cantidad * ci.precio) AS subtotal
    FROM cart_items ci
    INNER JOIN carts c ON ci.idCart = c.idCart
    INNER JOIN productos p ON ci.idProducto = p.idProducto
    WHERE 
        -- Busca por ID de Usuario
        (p_idUsuario IS NOT NULL AND p_idUsuario <> 0 AND c.idUser = p_idUsuario)
        OR 
        -- O busca por Guest ID (incluso si está logueado, queremos ver lo que agregó como invitado)
        (c.guest_id = p_guest_id AND p_guest_id <> '')
    ORDER BY ci.keyx DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMenuDetailsByPermission` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMenuDetailsByPermission`(
IN p_idUser BIGINT
, IN p_idMenuPadre BIGINT
)
BEGIN
	
	SELECT *
	FROM
	(
		SELECT
		M.idMenu
		,M.idMenuPadre
		,M.lugar
		,M.name
		,M.description
		,M.icon
		,M.linkCat
		,M.linkList
		,M.imgDash
		,M.imgDashSize
		FROM menus AS M
		INNER JOIN menupermisos AS MP
			ON
				M.idMenu = MP.idMenu
				AND MP.typeRelation = 'R'
                
        INNER JOIN user_roles AS UR
			ON
				UR.idRol = MP.idRelation
				
		INNER JOIN users AS U
			ON
				U.idUser = UR.idUser
                
		WHERE
			M.active = 1
			AND M.idAplication = 1
			AND M.idMenuPadre > 0
			AND MP.active = 1
			AND U.idUser = p_idUser
			AND M.idMenuPadre = p_idMenuPadre
		
		UNION
		
		SELECT
		M.idMenu
		,M.idMenuPadre
		,M.lugar
		,M.name
		,M.description
		,M.icon
		,M.linkCat
		,M.linkList
		,M.imgDash
		,M.imgDashSize
		FROM menus AS M
		INNER JOIN menupermisos AS MP
			ON
				M.idMenu = MP.idMenu
                AND MP.typeRelation = 'U'
                
		WHERE
			M.active = 1
			AND M.idAplication = 1
			AND M.idMenuPadre > 0
			AND MP.active = 1
			AND MP.idRelation = p_idUser
			AND M.idMenuPadre = p_idMenuPadre
		
	) AS subquery
	ORDER BY idMenuPadre, lugar ASC;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMenuDetailsForPermission` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMenuDetailsForPermission`(
IN p_idMenuPadre BIGINT
, IN p_relationType VARCHAR(5)
, IN p_idRelation BIGINT
)
BEGIN

SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED ;
	
	SELECT
	M.idMenu
	,M.idMenuPadre
	,M.lugar
	,M.name
	,M.description
	,M.icon
	,M.linkCat
	,M.linkList
	,M.imgDash
	,M.imgDashSize
	,IFNULL(
	(
		SELECT
		1
		FROM menupermisos AS MP
		WHERE
			MP.active = 1
			AND MP.typeRelation = p_relationType
			AND MP.idRelation = p_idRelation
			AND MP.idMenu = M.idMenu
	), 0) AS bPermissionMenu
	FROM menus AS M
	WHERE
		M.active = 1
		AND M.idAplication = 1
		AND M.idMenuPadre > 0
		AND M.idMenuPadre = p_idMenuPadre
	ORDER BY idMenuPadre, lugar ASC;

 SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ ;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMenuFathersByPermission` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMenuFathersByPermission`(
IN p_idUser BIGINT
)
BEGIN
	
	SELECT DISTINCT *
	FROM
	(
		SELECT
		MPadre.idMenu
		,MPadre.lugar
		,MPadre.name
		,MPadre.icon
		FROM menus AS MPadre
		INNER JOIN menus AS M
			ON
				MPadre.idMenu = M.idMenuPadre
				
		INNER JOIN menupermisos AS MP
			ON
				M.idMenu = MP.idMenu
				AND MP.typeRelation = 'R'
				
		INNER JOIN user_roles AS UR
			ON
				UR.idRol = MP.idRelation
				
		INNER JOIN users AS U
			ON
				U.idUser = UR.idUser
				
		WHERE
			M.active = 1
			AND M.idAplication = 1
			AND MPadre.idMenuPadre = 0
			AND MP.active = 1
			AND U.idUser = p_idUser
		
		UNION
		
		SELECT
		MPadre.idMenu
		,MPadre.lugar
		,MPadre.name
		,MPadre.icon
		FROM menus AS MPadre
		INNER JOIN menus AS M
			ON
				MPadre.idMenu = M.idMenuPadre
				
		INNER JOIN menupermisos AS MP
			ON
				M.idMenu = MP.idMenu
				AND MP.typeRelation = 'U'
				
		WHERE
			M.active = 1
			AND M.idAplication = 1
			AND MPadre.idMenuPadre = 0
			AND MP.active = 1
			AND MP.idRelation = p_idUser
	) AS subquery
	ORDER BY lugar;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMenuFathersForPermission` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMenuFathersForPermission`()
BEGIN

SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED ;
	
	SELECT DISTINCT
	MPadre.idMenu
	,MPadre.lugar
	,MPadre.name
	,MPadre.icon
	FROM menus AS MPadre
	WHERE
		MPadre.active = 1
		AND MPadre.idAplication = 1
		AND MPadre.idMenuPadre = 0
    ORDER BY MPadre.lugar ASC
	;

SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ ;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMyFavorites` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMyFavorites`(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255)
)
BEGIN
    SELECT 
        f.idFavorite,
        f.idProducto,
        f.createDate,
        p.nombre,
        p.marca,
        p.modelo,
        p.precio,
        p.stock,
        p.imagen_url
    FROM `favorites` f
    INNER JOIN `productos` p ON f.idProducto = p.idProducto
    WHERE (p_idUser IS NOT NULL AND f.idUser = p_idUser)
       OR (p_idUser IS NULL AND p_guestId IS NOT NULL AND f.guest_id = p_guestId)
    ORDER BY f.createDate DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMyPurchases` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getMyPurchases`(
    IN p_idUser INT
)
BEGIN
    SELECT 
        o.idOrder,
        o.total,
        o.createDate,
        s.nombre AS statusOrden,
        s.color AS colorOrden,
        p.nombre AS statusPago,
        p.color AS colorPago,
        (SELECT COUNT(*) FROM order_details od WHERE od.idOrder = o.idOrder) as itemsCount
    FROM `orders` o
    INNER JOIN `cat_status_ordenes` s ON o.idStatusOrden = s.idStatusOrden
    INNER JOIN `cat_status_pagos` p ON o.idStatusPago = p.idStatusPago
    WHERE o.idUser = p_idUser
    ORDER BY o.createDate DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getOrderDetails` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getOrderDetails`(
    IN p_idOrder INT
)
BEGIN
    SELECT 
        od.idOrderDetail,
        od.idProducto,
        od.cantidad,
        od.precio,
        od.subtotal,
        p.nombre,
        p.imagen_url as imagen
    FROM `order_details` od
    INNER JOIN `productos` p ON od.idProducto = p.idProducto
    WHERE od.idOrder = p_idOrder;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getProductsPag` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getProductsPag`(
    IN p_search VARCHAR(500),
    IN p_start INT,
    IN p_limiter INT
)
BEGIN

	SET @iRows = 0;

    SET @iRows = (
					WITH RECURSIVE words AS (
					SELECT
						SUBSTRING_INDEX(p_search, ' ', 1) AS palabra,
						SUBSTRING(p_search, LOCATE(' ', p_search) + 1) AS rest
					UNION ALL
					SELECT
						SUBSTRING_INDEX(rest, ' ', 1) AS palabra,
						SUBSTRING(rest, LOCATE(' ', rest) + 1) AS rest
					FROM words
					WHERE rest <> '' AND LOCATE(' ', rest) > 0
					UNION ALL
					SELECT
						rest AS palabra,
						'' AS rest
					FROM words
					WHERE rest <> '' AND LOCATE(' ', rest) = 0
				)
				SELECT
					COUNT( * )
				FROM productos AS P
				WHERE
					P.activo = 1
					AND (
						p_search = ''
						OR (
							SELECT COUNT(*) 
							FROM words w
							WHERE CONCAT(
								IFNULL(P.nombre, ''),
								' ', IFNULL(P.marca, ''),
								' ', IFNULL(P.modelo, ''),
								' ', IFNULL(P.descripcion, ''),
								' ', IFNULL(P.ancho, ''),
								'/', IFNULL(P.perfil, ''),
								' R', IFNULL(P.rin, '')
							) LIKE CONCAT('%', w.palabra, '%')
						) > 0
					)
				  );
    
    
    WITH RECURSIVE words AS (
        SELECT
            SUBSTRING_INDEX(p_search, ' ', 1) AS palabra,
            SUBSTRING(p_search, LOCATE(' ', p_search) + 1) AS rest
        UNION ALL
        SELECT
            SUBSTRING_INDEX(rest, ' ', 1) AS palabra,
            SUBSTRING(rest, LOCATE(' ', rest) + 1) AS rest
        FROM words
        WHERE rest <> '' AND LOCATE(' ', rest) > 0
        UNION ALL
        SELECT
            rest AS palabra,
            '' AS rest
        FROM words
        WHERE rest <> '' AND LOCATE(' ', rest) = 0
    )
    SELECT
		@iRows AS iRows,
        P.idProducto,
        P.nombre,
        P.descripcion,
        P.marca,
        P.modelo,
        P.ancho,
        P.perfil,
        P.rin,
        P.precio,
        P.stock,
        P.imagen_url,
        P.activo,
        P.createDate AS fecha_creacion,
        
        
        (
            SELECT COUNT(*) 
            FROM words w
            WHERE CONCAT(
                IFNULL(P.nombre, ''),
                ' ', IFNULL(P.marca, ''),
                ' ', IFNULL(P.modelo, ''),
                ' ', IFNULL(P.descripcion, ''),
                ' ', IFNULL(P.ancho, ''),
                '/', IFNULL(P.perfil, ''),
                ' R', IFNULL(P.rin, '')
            ) LIKE CONCAT('%', w.palabra, '%')
        ) AS iCountWords
        
    FROM productos AS P
    WHERE
        P.activo = 1
        AND (
            p_search = ''
            OR (
                SELECT COUNT(*) 
                FROM words w
                WHERE CONCAT(
                    IFNULL(P.nombre, ''),
                    ' ', IFNULL(P.marca, ''),
                    ' ', IFNULL(P.modelo, ''),
                    ' ', IFNULL(P.descripcion, ''),
                    ' ', IFNULL(P.ancho, ''),
                    '/', IFNULL(P.perfil, ''),
                    ' R', IFNULL(P.rin, '')
                ) LIKE CONCAT('%', w.palabra, '%')
            ) > 0
        )
    ORDER BY iCountWords DESC, P.marca ASC, P.nombre ASC
    LIMIT p_start, p_limiter;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getUserByUserName` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getUserByUserName`(
IN `p_userName` VARCHAR(45)
)
BEGIN
	
	SELECT
	U.idUser
	, U.createDate
	, U.name
	, U.username
	, U.pwd
	, U.active
	FROM users AS U
	WHERE
		active = 1
		AND username = p_userName;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `processPurchase` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `processPurchase`(
    IN p_idUser INT
)
BEGIN
    DECLARE v_idCart INT;
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_idOrder INT;
    DECLARE v_idStatusOrden INT;
    DECLARE v_idStatusPago INT;

    -- 1. Obtener ID del carrito para el usuario
    SELECT idCart INTO v_idCart 
    FROM carts 
    WHERE idUser = p_idUser 
    LIMIT 1;

    -- Validar si existe el carrito con items
    IF v_idCart IS NOT NULL THEN
        -- Calcular el total
        SELECT SUM(cantidad * precio) INTO v_total
        FROM cart_items
        WHERE idCart = v_idCart;

        IF v_total IS NULL THEN
            SET v_total = 0;
        END IF;

        -- Obtener IDs de status "PAGADA" y "APROBADO" para simular compra
        -- Asumimos que existen, sino fallback a 1
        SELECT idStatusOrden INTO v_idStatusOrden FROM cat_status_ordenes WHERE codigo = 'PAGADA' LIMIT 1;
        IF v_idStatusOrden IS NULL THEN SET v_idStatusOrden = 2; END IF;

        SELECT idStatusPago INTO v_idStatusPago FROM cat_status_pagos WHERE codigo = 'APROBADO' LIMIT 1;
        IF v_idStatusPago IS NULL THEN SET v_idStatusPago = 2; END IF;

        -- 2. Crear la Orden (Header)
        INSERT INTO `orders` (idUser, total, idStatusOrden, idStatusPago, createDate, updateDate)
        VALUES (p_idUser, v_total, v_idStatusOrden, v_idStatusPago, NOW(), NOW());

        SET v_idOrder = LAST_INSERT_ID();

        -- 3. Mover items del carrito a order_details (Detail)
        INSERT INTO `order_details` (idOrder, idProducto, cantidad, precio, subtotal)
        SELECT 
            v_idOrder, 
            idProducto, 
            cantidad, 
            precio, 
            (cantidad * precio)
        FROM cart_items
        WHERE idCart = v_idCart;

        -- 4. Limpiar el carrito
        DELETE FROM cart_items WHERE idCart = v_idCart;
        -- Opcional: Eliminar la entrada de carts o actualizarla
        UPDATE carts SET updateDate = NOW() WHERE idCart = v_idCart;

        -- Retornar éxito
        SELECT 'Compra procesada exitosamente' AS message, v_idOrder AS idOrder;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se encontró un carrito activo para este usuario';
    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `toggleFavorite` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `toggleFavorite`(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255),
    IN p_idProducto INT
)
BEGIN
    DECLARE v_exists INT;
    
    SELECT COUNT(*) INTO v_exists 
    FROM favorites 
    WHERE (p_idUser IS NOT NULL AND idUser = p_idUser AND idProducto = p_idProducto)
       OR (p_idUser IS NULL AND p_guestId IS NOT NULL AND guest_id = p_guestId AND idProducto = p_idProducto);
    
    IF v_exists > 0 THEN
        -- Si existe, borrar (Remove)
        DELETE FROM favorites 
        WHERE (p_idUser IS NOT NULL AND idUser = p_idUser AND idProducto = p_idProducto)
           OR (p_idUser IS NULL AND guest_id = p_guestId AND idProducto = p_idProducto);
           
        SELECT 'Eliminado de favoritos' AS message, 0 AS isFavorite;
    ELSE
        -- Si no existe, insertar (Add)
        INSERT INTO favorites (idUser, guest_id, idProducto) VALUES (p_idUser, p_guestId, p_idProducto);
        SELECT 'Agregado a favoritos' AS message, 1 AS isFavorite;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-26 18:18:28
