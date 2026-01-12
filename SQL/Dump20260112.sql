-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: db_multillantas
-- ------------------------------------------------------
-- Server version	8.0.42

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
  `keyx` int NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
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
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color para UI (yellow, blue, green, red, etc.)',
  `orden` int DEFAULT NULL COMMENT 'Orden de visualización',
  `activo` tinyint(1) DEFAULT NULL COMMENT 'Indica si el status está activo',
  `createDate` datetime DEFAULT NULL COMMENT 'Fecha de creación',
  `updateDate` datetime DEFAULT NULL COMMENT 'Fecha de actualización',
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
INSERT INTO `cat_status_ordenes` VALUES (1,'PENDIENTE','Pendiente','Orden creada, esperando confirmación de pago','yellow',1,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(2,'PAGADA','Pagada','Pago confirmado y procesado exitosamente','blue',2,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(3,'EN_PROCESO','En Proceso','Orden en preparación para envío','orange',3,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(4,'ENVIADA','Enviada','Orden despachada y en tránsito','purple',4,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(5,'ENTREGADA','Entregada','Orden entregada al cliente','green',5,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(6,'CANCELADA','Cancelada','Orden cancelada por el cliente o sistema','red',6,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(7,'DEVUELTA','Devuelta','Orden devuelta por el cliente','gray',7,1,'2026-01-04 17:20:11','2026-01-04 17:20:11'),(8,'REEMBOLSADA','Reembolsada','Orden con reembolso procesado','cyan',8,1,'2026-01-04 17:20:11','2026-01-04 17:20:11');
/*!40000 ALTER TABLE `cat_status_ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cat_status_payment`
--

DROP TABLE IF EXISTS `cat_status_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_status_payment` (
  `idStatusPayment` int NOT NULL COMMENT 'ID único del status de pago',
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código único del status (PENDIENTE, APROBADO, etc.)',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del status en español',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada del status',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color para UI (yellow, green, red, etc.)',
  `orden` int DEFAULT NULL COMMENT 'Orden de visualización',
  `activo` tinyint(1) DEFAULT NULL COMMENT 'Indica si el status está activo',
  `createDate` datetime DEFAULT NULL COMMENT 'Fecha de creación',
  `updateDate` datetime DEFAULT NULL COMMENT 'Fecha de actualización',
  PRIMARY KEY (`idStatusPayment`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_cat_status_pagos_codigo` (`codigo`),
  KEY `idx_cat_status_pagos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para pagos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cat_status_payment`
--

LOCK TABLES `cat_status_payment` WRITE;
/*!40000 ALTER TABLE `cat_status_payment` DISABLE KEYS */;
INSERT INTO `cat_status_payment` VALUES (1,'PENDIENTE','Pendiente','Pago iniciado, esperando confirmación','yellow',1,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(2,'APROBADO','Aprobado','Pago aprobado y confirmado','green',2,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(3,'EN_PROCESO','En Proceso','Pago en proceso de verificación','blue',3,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(4,'RECHAZADO','Rechazado','Pago rechazado por la entidad financiera','red',4,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(5,'CANCELADO','Cancelado','Pago cancelado por el usuario o sistema','orange',5,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(6,'REEMBOLSADO','Reembolsado','Pago reembolsado al cliente','purple',6,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(7,'EXPIRADO','Expirado','Pago expirado por tiempo de espera','gray',7,1,'2026-01-04 17:20:12','2026-01-04 17:20:12'),(8,'EN_MEDIACION','En Mediación','Pago en proceso de mediación o disputa','cyan',8,1,'2026-01-04 17:20:12','2026-01-04 17:20:12');
/*!40000 ALTER TABLE `cat_status_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `keyx` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `idOrder` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `precio` decimal(18,2) DEFAULT NULL,
  `subtotal` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`keyx`),
  KEY `idOrder` (`idOrder`),
  KEY `idProducto` (`idProducto`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`idOrder`) REFERENCES `orders` (`idOrder`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `idOrder` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `idUser` int NOT NULL,
  `total` decimal(18,2) DEFAULT NULL,
  `idStatusOrden` int NOT NULL,
  `payment_id` int DEFAULT NULL,
  `external_reference` varchar(255) DEFAULT NULL,
  `notas` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`idOrder`),
  KEY `idUser` (`idUser`),
  KEY `fk_orders_cat_status_ordenes1_idx` (`idStatusOrden`),
  CONSTRAINT `fk_orders_cat_status_ordenes1` FOREIGN KEY (`idStatusOrden`) REFERENCES `cat_status_ordenes` (`idStatusOrden`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `idPayment` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `idOrder` int NOT NULL,
  `amount` decimal(18,2) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `idStatusPayment` int NOT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `external_reference` varchar(255) DEFAULT NULL,
  `payment_data` text,
  PRIMARY KEY (`idPayment`),
  KEY `idOrder` (`idOrder`),
  KEY `fk_payments_cat_status_pagos1_idx` (`idStatusPayment`),
  CONSTRAINT `fk_payments_cat_status_pagos1` FOREIGN KEY (`idStatusPayment`) REFERENCES `cat_status_payment` (`idStatusPayment`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`idOrder`) REFERENCES `orders` (`idOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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
INSERT INTO `productos` VALUES (1,NULL,NULL,1,'Michelin Primacy 4 195/55 R16','Llanta de alto rendimiento con excelente agarre en mojado y seco. Ideal para sedanes compactos.','Michelin','Primacy 4','195','55','16',2850.00,25,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(2,NULL,NULL,1,'Michelin Pilot Sport 4 225/45 R17','Llanta deportiva de alta performance con tecnología híbrida. Para autos deportivos y sedanes premium.','Michelin','Pilot Sport 4','225','45','17',4200.00,18,'https://via.placeholder.https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpgcom/400x400?text=Michelin+Pilot+Sport+4'),(3,NULL,NULL,1,'Michelin Latitude Sport 3 235/55 R19','Llanta SUV de alto rendimiento con excelente estabilidad y confort.','Michelin','Latitude Sport 3','235','55','19',5800.00,12,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(4,NULL,NULL,1,'Michelin Energy XM2+ 185/65 R15','Llanta económica con bajo consumo de combustible y larga duración.','Michelin','Energy XM2+','185','65','15',2150.00,40,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(5,NULL,NULL,1,'Bridgestone Turanza T005 205/55 R16','Llanta premium con excelente frenado en mojado y bajo nivel de ruido.','Bridgestone','Turanza T005','205','55','16',3100.00,30,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(6,NULL,NULL,1,'Bridgestone Potenza RE-71RS 245/40 R18','Llanta de competición para máximo agarre en pista. Compuesto ultra adherente.','Bridgestone','Potenza RE-71RS','245','40','18',6500.00,8,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(7,NULL,NULL,1,'Bridgestone Dueler H/T 684 II 265/65 R17','Llanta para camionetas y SUVs con excelente tracción en terracería.','Bridgestone','Dueler H/T 684 II','265','65','17',4800.00,15,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(8,NULL,NULL,1,'Bridgestone Ecopia EP150 175/65 R14','Llanta ecológica con bajo consumo de combustible para autos compactos.','Bridgestone','Ecopia EP150','175','65','14',1950.00,50,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(9,NULL,NULL,1,'Goodyear Eagle F1 Asymmetric 5 225/50 R17','Llanta deportiva con tecnología de frenado mejorado en mojado.','Goodyear','Eagle F1 Asymmetric 5','225','50','17',3850.00,22,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(10,NULL,NULL,1,'Goodyear Assurance MaxLife 195/60 R15','Llanta de larga duración con garantía extendida de kilometraje.','Goodyear','Assurance MaxLife','195','60','15',2400.00,35,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(11,NULL,NULL,1,'Goodyear Wrangler AT Adventure 255/70 R16','Llanta todo terreno para pickup y SUVs aventureros.','Goodyear','Wrangler AT Adventure','255','70','16',4200.00,20,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(12,NULL,NULL,1,'Goodyear EfficientGrip Performance 185/60 R15','Llanta eficiente con bajo consumo y buen agarre.','Goodyear','EfficientGrip Performance','185','60','15',2250.00,45,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(13,NULL,NULL,1,'Continental PremiumContact 6 215/55 R17','Llanta premium con excelente confort y seguridad en altas velocidades.','Continental','PremiumContact 6','215','55','17',3600.00,28,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(14,NULL,NULL,1,'Continental SportContact 6 255/35 R19','Llanta ultra deportiva para autos de alto desempeño.','Continental','SportContact 6','255','35','19',7200.00,10,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(15,NULL,NULL,1,'Continental CrossContact LX25 235/60 R18','Llanta SUV con excelente tracción y confort de marcha.','Continental','CrossContact LX25','235','60','18',4900.00,16,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(16,NULL,NULL,1,'Pirelli Cinturato P7 205/60 R16','Llanta verde con bajo consumo de combustible y alta eficiencia.','Pirelli','Cinturato P7','205','60','16',3200.00,25,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(17,NULL,NULL,1,'Pirelli P Zero 245/40 R18','Llanta de alta performance para autos deportivos y premium.','Pirelli','P Zero','245','40','18',6800.00,12,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(18,NULL,NULL,1,'Pirelli Scorpion Verde All Season 225/65 R17','Llanta SUV ecológica para uso todo el año.','Pirelli','Scorpion Verde','225','65','17',4500.00,18,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(19,NULL,NULL,1,'Yokohama BluEarth-GT AE51 195/65 R15','Llanta ecológica con excelente rendimiento de combustible.','Yokohama','BluEarth-GT AE51','195','65','15',2300.00,32,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(20,NULL,NULL,1,'Yokohama Advan Fleva V701 215/45 R17','Llanta deportiva con tecnología avanzada para máximo control.','Yokohama','Advan Fleva V701','215','45','17',4100.00,15,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(21,NULL,NULL,1,'Yokohama Geolandar G055 265/70 R17','Llanta off-road para aventuras extremas y terracería.','Yokohama','Geolandar G055','265','70','17',5200.00,10,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(22,NULL,NULL,1,'Hankook Ventus V12 evo2 225/45 R17','Llanta deportiva de alto rendimiento a precio competitivo.','Hankook','Ventus V12 evo2','225','45','17',2950.00,26,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(23,NULL,NULL,1,'Hankook Kinergy Eco 185/65 R15','Llanta económica con baja resistencia al rodamiento.','Hankook','Kinergy Eco','185','65','15',1850.00,48,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(24,NULL,NULL,1,'Hankook Dynapro AT2 RF11 245/70 R16','Llanta todo terreno robusta para pickup y SUV.','Hankook','Dynapro AT2 RF11','245','70','16',3800.00,20,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(25,NULL,NULL,1,'Firestone Firehawk AS V2 205/55 R16','Llanta all-season con excelente balance entre comfort y agarre.','Firestone','Firehawk AS V2','205','55','16',2100.00,35,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(26,NULL,NULL,1,'Firestone Destination LE3 235/65 R17','Llanta SUV con tecnología de larga duración.','Firestone','Destination LE3','235','65','17',3400.00,22,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(27,NULL,NULL,1,'Michelin Pilot Sport Cup 2 265/35 R19','Llanta semi-slick para pista y competición. Stock limitado.','Michelin','Pilot Sport Cup 2','265','35','19',9500.00,3,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(28,NULL,NULL,1,'Bridgestone Blizzak WS90 195/65 R15','Llanta de invierno para condiciones extremas. Temporalmente agotado.','Bridgestone','Blizzak WS90','195','65','15',3200.00,0,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg'),(29,NULL,NULL,0,'Continental WinterContact TS870 205/55 R16','Llanta de invierno discontinuada.','Continental','WinterContact TS870','205','55','16',3500.00,5,'https://mitsubishi-motors.com.co/blog/wp-content/uploads/2021/12/rin-mitsubishi-1.jpg');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `idRole` int NOT NULL AUTO_INCREMENT,
  `createDate` datetime DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idRole`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
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
  `idRole` int NOT NULL,
  PRIMARY KEY (`keyx`),
  KEY `fk_user_roles_users_idx` (`idUser`),
  KEY `fk_user_roles_roles1_idx` (`idRole`),
  CONSTRAINT `fk_user_roles_roles1` FOREIGN KEY (`idRole`) REFERENCES `roles` (`idRole`),
  CONSTRAINT `fk_user_roles_users` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
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
  `nombre` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `pwd` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'db_multillantas'
--

--
-- Dumping routines for database 'db_multillantas'
--
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
    
    -- Tabla temporal para dividir el search en palabras individuales
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
        
        -- Contar cuántas palabras del search coinciden
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 16:33:30
