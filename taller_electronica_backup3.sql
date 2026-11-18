-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: taller_electronica
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `categorias_equipo`
--

DROP TABLE IF EXISTS `categorias_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_equipo` (
  `categoria_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`categoria_id`),
  KEY `fk_cateq_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_cateq_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_equipo`
--

LOCK TABLES `categorias_equipo` WRITE;
/*!40000 ALTER TABLE `categorias_equipo` DISABLE KEYS */;
INSERT INTO `categorias_equipo` VALUES (1,'Notebook',1),(2,'PC Escritorio',1),(3,'Consola',1),(4,'Celular',1),(5,'Placa de Video (GPU)',1);
/*!40000 ALTER TABLE `categorias_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_productos`
--

DROP TABLE IF EXISTS `categorias_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_productos` (
  `categoria_productos_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`categoria_productos_id`),
  KEY `fk_catprod_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_catprod_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_productos`
--

LOCK TABLES `categorias_productos` WRITE;
/*!40000 ALTER TABLE `categorias_productos` DISABLE KEYS */;
INSERT INTO `categorias_productos` VALUES (1,'Periféricos & Audio / Pantallas',1),(2,'Placas de Video / Fundas',1),(3,'Procesadores / Llaveros',1),(4,'Memorias & SSD / Teclados',1),(5,'Módulos y Pantallas / Mandos',1),(6,'Accesorios & Carga / Cargadores',1),(7,'Cables de Conectividad',1),(8,'Vidrios Templados',1),(9,'Mouse',1),(10,'Baterías',1),(11,'Tarjetas de Memoria',1),(12,'Pines de Carga',1),(13,'Memorias RAM',1),(14,'Placas Madre',1),(15,'Discos de Almacenamiento',1),(16,'Procesadores',1),(17,'Coolers',1),(18,'Flex de Pantalla',1),(19,'Pasta Térmica',1),(20,'Herramientas de Soldadura',1),(21,'Fuentes de Alimentación',1),(22,'Teclados',1),(23,'Mandos',1),(24,'Cargadores',1),(25,'Cables de Conectividad',1),(26,'Vidrios Templados',1),(27,'Mouse',1),(28,'Baterías',1),(29,'Tarjetas de Memoria',1),(30,'Pines de Carga',1),(31,'Memorias RAM',1),(32,'Placas Madre',1),(33,'Discos de Almacenamiento',1),(34,'Procesadores',1),(35,'Coolers',1),(36,'Flex de Pantalla',1),(37,'Módulos de Display Completos',1),(38,'Carcasas y Chasis',1),(39,'Pasta Térmica',1),(40,'Herramientas de Soldadura',1),(41,'Fuentes de Alimentación',1);
/*!40000 ALTER TABLE `categorias_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_servicios`
--

DROP TABLE IF EXISTS `categorias_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_servicios` (
  `categorias_servicios_id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(60) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`categorias_servicios_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_cat_servicios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_servicios`
--

LOCK TABLES `categorias_servicios` WRITE;
/*!40000 ALTER TABLE `categorias_servicios` DISABLE KEYS */;
INSERT INTO `categorias_servicios` VALUES (1,'Mantenimiento / Microelectrónica',1),(2,'Reparación / Mantenimiento Térmico',1),(3,'Módulos, Pantallas & Baterías',1),(4,'Diagnóstico y Software',1);
/*!40000 ALTER TABLE `categorias_servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudades`
--

DROP TABLE IF EXISTS `ciudades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudades` (
  `ciudad_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`ciudad_id`),
  KEY `fk_ciudades_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_ciudades_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudades`
--

LOCK TABLES `ciudades` WRITE;
/*!40000 ALTER TABLE `ciudades` DISABLE KEYS */;
INSERT INTO `ciudades` VALUES (1,'Formosa Capital',1),(2,'Clorinda',1),(3,'Pirané',1),(4,'El Colorado',1);
/*!40000 ALTER TABLE `ciudades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_area`
--

DROP TABLE IF EXISTS `codigo_area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigo_area` (
  `codigo_area_id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(11) NOT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`codigo_area_id`),
  KEY `fk_carea_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_carea_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_area`
--

LOCK TABLES `codigo_area` WRITE;
/*!40000 ALTER TABLE `codigo_area` DISABLE KEYS */;
INSERT INTO `codigo_area` VALUES (1,370,1),(2,11,1),(3,362,1),(4,379,1);
/*!40000 ALTER TABLE `codigo_area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_pais`
--

DROP TABLE IF EXISTS `codigo_pais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigo_pais` (
  `codigo_pais_id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` int(11) NOT NULL,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  `pais_id` int(11) DEFAULT 1,
  PRIMARY KEY (`codigo_pais_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_codigopais_paises` (`pais_id`),
  CONSTRAINT `estado_general_id` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_codigopais_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_pais`
--

LOCK TABLES `codigo_pais` WRITE;
/*!40000 ALTER TABLE `codigo_pais` DISABLE KEYS */;
INSERT INTO `codigo_pais` VALUES (1,54,1,1),(2,595,1,2),(3,55,1,3),(4,598,1,4),(5,56,1,5);
/*!40000 ALTER TABLE `codigo_pais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_postal`
--

DROP TABLE IF EXISTS `codigo_postal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigo_postal` (
  `codigo_postal_id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_postal` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`codigo_postal_id`),
  KEY `fk_cp_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_cp_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_postal`
--

LOCK TABLES `codigo_postal` WRITE;
/*!40000 ALTER TABLE `codigo_postal` DISABLE KEYS */;
INSERT INTO `codigo_postal` VALUES (1,'3600',1),(2,'3610',1),(3,'3606',1);
/*!40000 ALTER TABLE `codigo_postal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_productos`
--

DROP TABLE IF EXISTS `codigo_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigo_productos` (
  `codigo_producto_id` int(13) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`codigo_producto_id`),
  KEY `fk_codprod_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_codprod_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_productos`
--

LOCK TABLES `codigo_productos` WRITE;
/*!40000 ALTER TABLE `codigo_productos` DISABLE KEYS */;
INSERT INTO `codigo_productos` VALUES (1,'7791234567890',1),(2,'7798765432109',1),(3,'7791111222333',1),(4,'7794444555666',1),(5,'7797777888999',1),(6,'7790000111222',1),(7,'7793333444555',1),(8,'7796666777888',1),(9,'7799999000111',2),(10,'7792222333444',2),(21,'7793888555444',1),(22,'7794999666111',1),(23,'7795111222333',1),(24,'7796222333444',1),(25,'7797333444555',1),(26,'7798444555666',1),(27,'7799555666777',1),(28,'7790666777888',1),(29,'7791777888999',1),(30,'7792888999000',1);
/*!40000 ALTER TABLE `codigo_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra_proveedor`
--

DROP TABLE IF EXISTS `compra_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_proveedor` (
  `compra_proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `proveedor_id` int(11) DEFAULT NULL,
  `fecha_compra` datetime DEFAULT current_timestamp(),
  `total` decimal(15,2) DEFAULT 0.00,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`compra_proveedor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra_proveedor`
--

LOCK TABLES `compra_proveedor` WRITE;
/*!40000 ALTER TABLE `compra_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras_tienda`
--

DROP TABLE IF EXISTS `compras_tienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras_tienda` (
  `id_compra` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_compra` varchar(40) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `items_json` text NOT NULL,
  `resumen_productos` text NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cupon_codigo` varchar(40) DEFAULT NULL,
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `puntos_canjeados` int(11) NOT NULL DEFAULT 0,
  `puntos_ganados` int(11) NOT NULL DEFAULT 0,
  `metodo_envio` varchar(80) NOT NULL,
  `direccion_envio` text NOT NULL,
  `distancia_km` decimal(6,2) NOT NULL DEFAULT 0.00,
  `costo_envio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `modalidad_pago` varchar(40) NOT NULL DEFAULT 'Contado',
  `cantidad_cuotas` int(11) NOT NULL DEFAULT 1,
  `porcentaje_interes` decimal(5,2) NOT NULL DEFAULT 0.00,
  `monto_cuota` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_final` decimal(12,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` varchar(80) NOT NULL,
  `tarjeta_usada` varchar(120) DEFAULT NULL,
  `referencia_pago` varchar(120) DEFAULT NULL,
  `comprobante_img` varchar(255) DEFAULT NULL,
  `pin_verificado` tinyint(1) NOT NULL DEFAULT 1,
  `estado_compra` varchar(60) NOT NULL DEFAULT 'Confirmada',
  `motivo_reembolso` text DEFAULT NULL,
  `estado_envio` varchar(80) NOT NULL DEFAULT 'En preparación y despacho FULL (Envío no cancelable)',
  `fecha_compra` datetime DEFAULT current_timestamp(),
  `venta_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `idx_comp_cli` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras_tienda`
--

LOCK TABLES `compras_tienda` WRITE;
/*!40000 ALTER TABLE `compras_tienda` DISABLE KEYS */;
INSERT INTO `compras_tienda` VALUES (1,'FX-COMP-C49009',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Rojo Carmin\",\"angulo\":\"trasero\",\"cantidad\":1}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Rojo Carmin]',49900.00,'FENIX10',4990.00,0,499,'Envío a Domicilio por Cadete GPS (Formosa)','Vial, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, P3600IDK, Argentina',2.45,2302.00,'Cuotas',1,0.00,47212.00,47212.00,'Tarjeta de Crédito','Credito Mastercard (BANCO) •••• 6666','AUTH-7483F6',NULL,1,'Confirmada',NULL,'En preparación y despacho FULL por Cadete GPS (Envío no cancelable)','2026-11-10 20:24:07',60),(3,'FX-VTA-00011',4,'[{\"id\":2,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1 + Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6\",\"precio\":324.00,\"img\":\"logo.png\",\"puntos\":3,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1, 1x Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6',324.00,NULL,0.00,0,3,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,324.00,324.00,'Debito',NULL,'VTA-APP-11',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-13 23:44:48',11),(4,'FX-VTA-00012',4,'[{\"id\":2,\"nombre\":\"Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6\",\"precio\":12.00,\"img\":\"logo.png\",\"puntos\":0,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6',12.00,NULL,0.00,0,0,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,12.00,12.00,'Debito',NULL,'VTA-APP-12',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-13 23:49:40',12),(5,'FX-VTA-00013',3,'[{\"id\":2,\"nombre\":\"Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6\",\"precio\":12.00,\"img\":\"logo.png\",\"puntos\":0,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6',12.00,NULL,0.00,0,0,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,12.00,12.00,'Debito',NULL,'VTA-APP-13',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-13 23:51:25',13),(6,'FX-VTA-00014',4,'[{\"id\":3,\"nombre\":\"Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz\",\"precio\":12.00,\"img\":\"logo.png\",\"puntos\":0,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz',12.00,NULL,0.00,0,0,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,12.00,12.00,'Debito',NULL,'VTA-APP-14',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-13 23:53:47',14),(7,'FX-VTA-00015',4,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":312.00,\"img\":\"logo.png\",\"puntos\":3,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',312.00,NULL,0.00,0,3,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,312.00,312.00,'Debito',NULL,'VTA-APP-15',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-13 23:56:35',15),(8,'FX-VTA-00016',4,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":312.00,\"img\":\"logo.png\",\"puntos\":3,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',312.00,NULL,0.00,0,3,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,312.00,312.00,'Debito',NULL,'VTA-APP-16',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-14 00:06:04',16),(9,'FX-VTA-00024',4,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Debito',NULL,'VTA-APP-24',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-14 17:47:11',24),(10,'FX-VTA-00025',4,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":1000.00,\"img\":\"logo.png\",\"puntos\":10,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','2x Auriculares Gamer HyperX Cloud II Wireless 7.1',1000.00,NULL,0.00,0,10,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,1000.00,1000.00,'Debito',NULL,'VTA-APP-25',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-14 21:46:01',25),(11,'FX-VTA-00026',3,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Debito',NULL,'VTA-APP-26',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-09-14 22:22:24',26),(12,'FX-VTA-00027',5,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":5500.00,\"img\":\"logo.png\",\"puntos\":55,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":11}]','11x Auriculares Gamer HyperX Cloud II Wireless 7.1',5500.00,NULL,0.00,0,55,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,5500.00,5500.00,'Efectivo',NULL,'VTA-APP-27',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-05 23:39:11',27),(13,'FX-VTA-00028',5,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":1500.00,\"img\":\"logo.png\",\"puntos\":15,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":3}]','3x Auriculares Gamer HyperX Cloud II Wireless 7.1',1500.00,NULL,0.00,0,15,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,1500.00,1500.00,'Efectivo',NULL,'VTA-APP-28',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-05 23:44:31',28),(14,'FX-VTA-00029',3,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Efectivo',NULL,'VTA-APP-29',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:21:15',29),(15,'FX-VTA-00030',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Efectivo',NULL,'VTA-APP-30',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:43:44',30),(16,'FX-VTA-00031',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":1500.00,\"img\":\"logo.png\",\"puntos\":15,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":3}]','3x Auriculares Gamer HyperX Cloud II Wireless 7.1',1500.00,NULL,0.00,0,15,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,1500.00,1500.00,'Efectivo',NULL,'VTA-APP-31',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:49:48',31),(17,'FX-VTA-00032',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Efectivo',NULL,'VTA-APP-32',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:50:39',32),(18,'FX-VTA-00033',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":2500.00,\"img\":\"logo.png\",\"puntos\":25,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":5}]','5x Auriculares Gamer HyperX Cloud II Wireless 7.1',2500.00,NULL,0.00,0,25,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,2500.00,2500.00,'Efectivo',NULL,'VTA-APP-33',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:51:02',33),(19,'FX-VTA-00034',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":5000.00,\"img\":\"logo.png\",\"puntos\":50,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":10}]','10x Auriculares Gamer HyperX Cloud II Wireless 7.1',5000.00,NULL,0.00,0,50,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,5000.00,5000.00,'Efectivo',NULL,'VTA-APP-34',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-06 08:55:48',34),(20,'FX-VTA-00035',5,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":50000.00,\"img\":\"logo.png\",\"puntos\":500,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',50000.00,NULL,0.00,0,500,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,50000.00,50000.00,'Debito',NULL,'VTA-APP-35',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-09 20:34:53',35),(21,'FX-VTA-00036',16,'[{\"id\":1,\"nombre\":\"Reparación de Módulo de Pantalla OLED + Hidrogel\",\"precio\":50000.00,\"img\":\"logo.png\",\"puntos\":500,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Reparación de Módulo de Pantalla OLED + Hidrogel',50000.00,NULL,0.00,0,500,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,50000.00,50000.00,'Debito',NULL,'VTA-APP-36',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-09 21:26:26',36),(22,'FX-VTA-00037',3,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":500.00,\"img\":\"logo.png\",\"puntos\":5,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',500.00,NULL,0.00,0,5,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,500.00,500.00,'Debito',NULL,'VTA-APP-37',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-12 17:38:49',37),(23,'FX-VTA-00038',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":1000.00,\"img\":\"logo.png\",\"puntos\":10,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','2x Auriculares Gamer HyperX Cloud II Wireless 7.1',1000.00,NULL,0.00,0,10,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,1000.00,1000.00,'Efectivo',NULL,'VTA-APP-38',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-13 01:08:59',38),(24,'FX-VTA-00051',16,'[{\"id\":1,\"nombre\":\"Reparación de Módulo de Pantalla OLED + Hidrogel\",\"precio\":50000.00,\"img\":\"logo.png\",\"puntos\":500,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Reparación de Módulo de Pantalla OLED + Hidrogel',50000.00,NULL,0.00,0,500,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,50000.00,50000.00,'Efectivo',NULL,'VTA-APP-51',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-13 04:00:08',51),(25,'FX-VTA-00055',3,'[{\"id\":78,\"nombre\":\"Pantalla Completa Samsung A04e\",\"precio\":25000.00,\"img\":\"logo.png\",\"puntos\":250,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Pantalla Completa Samsung A04e',25000.00,NULL,0.00,0,250,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,25000.00,25000.00,'Debito',NULL,'VTA-APP-55',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-14 14:55:39',55),(26,'FX-VTA-00056',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":47212.00,\"img\":\"logo.png\",\"puntos\":472,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2',47212.00,NULL,0.00,0,472,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,47212.00,47212.00,'Debito',NULL,'VTA-APP-56',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-10 17:24:07',56),(27,'FX-VTA-00057',1,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":92000.00,\"img\":\"logo.png\",\"puntos\":920,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',92000.00,NULL,0.00,0,920,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,92000.00,92000.00,'Debito',NULL,'VTA-APP-57',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-15 16:00:44',57),(28,'FX-VTA-00058',16,'[{\"id\":2,\"nombre\":\"Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6\",\"precio\":485000.00,\"img\":\"logo.png\",\"puntos\":4850,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6',485000.00,NULL,0.00,0,4850,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,485000.00,485000.00,'Efectivo',NULL,'VTA-APP-58',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-15 16:12:43',58),(29,'FX-VTA-00059',16,'[{\"id\":3,\"nombre\":\"Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz\",\"precio\":265000.00,\"img\":\"logo.png\",\"puntos\":2650,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz',265000.00,NULL,0.00,0,2650,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,265000.00,265000.00,'Efectivo',NULL,'VTA-APP-59',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-15 16:17:49',59),(34,'FX-VTA-00061',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":92000.00,\"img\":\"uploads/productos/auriculares_negro_frontal.png\",\"puntos\":920,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',92000.00,NULL,0.00,0,920,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,92000.00,92000.00,'Efectivo',NULL,'VTA-APP-61',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-15 17:00:16',61),(35,'FX-VTA-00062',5,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":92000.00,\"img\":\"uploads/productos/auriculares_negro_frontal.png\",\"puntos\":920,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',92000.00,NULL,0.00,0,920,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,92000.00,92000.00,'Efectivo',NULL,'VTA-APP-62',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-16 15:42:38',62),(36,'FX-VTA-00063',16,'[{\"id\":4,\"nombre\":\"Mouse Gamer Logitech G Pro X Superlight Wireless 25K DPI\",\"precio\":84500.00,\"img\":\"uploads/productos/mouse_negro_frontal.png\",\"puntos\":845,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1, 1x Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6, 1x Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz, 1x Mouse Gamer Logitech G Pro X Superlight Wireless 25K DPI',926500.00,NULL,0.00,0,9265,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,926500.00,926500.00,'Debito',NULL,'VTA-APP-63',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-16 16:23:05',63),(37,'FX-COMP-4B0A50',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb7112a7076.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:09:39',64),(38,'FX-COMP-7FDEED',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb7115f270b.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:09:42',65),(39,'FX-COMP-667175',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb7119a9eb1.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:09:46',66),(40,'FX-COMP-A6D846',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb7127978d7.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:00',67),(41,'FX-COMP-73C7FC',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb712b05404.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:03',68),(42,'FX-COMP-4C795B',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71463ab73.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:30',69),(43,'FX-COMP-263DE9',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb714c4e38a.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:36',70),(44,'FX-COMP-2CCB2A',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71526d78c.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:42',71),(45,'FX-COMP-29F3D6',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','AUTH-8A237B',NULL,1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:10:49',72),(46,'FX-COMP-309726',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb716a1940f.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:06',73),(47,'FX-COMP-F72599',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb7172dce32.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:15',74),(48,'FX-COMP-F36A84',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71794bcf7.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:21',75),(49,'FX-COMP-493A87',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb717f99c53.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:28',76),(50,'FX-COMP-888E3C',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','AUTH-FD83C2',NULL,1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:44',77),(51,'FX-COMP-A984E6',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71992217f.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:11:53',78),(52,'FX-COMP-AC5621',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71ac2c617.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:12',79),(53,'FX-COMP-61E45F',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','AUTH-FE3119',NULL,1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:16',80),(54,'FX-COMP-6C770F',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71c0e44ad.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:33',81),(55,'FX-COMP-73A733',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71c4b1be3.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:37',82),(56,'FX-COMP-AAC75A',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71c810fd9.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:40',83),(57,'FX-COMP-11D8C9',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71cc5d825.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:44',84),(58,'FX-COMP-5A6EDB',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71d00b168.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:48',85),(59,'FX-COMP-823E9D',2,'[{\"id\":106,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"https:\\/\\/images.unsplash.com\\/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=85\",\"puntos\":499,\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":101,\"nombre\":\"Auriculares Inalámbricos HyperX Cloud III 7.1 Studio\",\"precio\":92000,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Negro Onyx\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":6,\"nombre\":\"Estación de Carga Rápida 3 en 1 Magnética 15W Qi2\",\"precio\":49900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1},{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900,\"img\":\"http:\\/\\/localhost\\/fenix\\/logo.png\",\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX Cloud III 7.1 Studio [Color: Negro Onyx] | 1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Original] | 2x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid [Color: Original]',241600.00,'FENIX10',24160.00,0,242,'Envío a Domicilio por Cadete GPS (Formosa)','E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina',4.76,3342.00,'Cuotas',6,0.00,36797.00,220782.00,'Transferencia / Binance','Credito Mastercard (BANCO) •••• 6666','223332','uploads/dispositivos/compra_6afb71d33c390.jpg',1,'Confirmada',NULL,'En preparación y despacho por Paquetería GPS','2026-11-16 18:12:51',86),(61,'FX-VTA-00091',16,'[{\"id\":1,\"nombre\":\"Auriculares Gamer HyperX Cloud II Wireless 7.1\",\"precio\":92000.00,\"img\":\"uploads/productos/auriculares_negro_frontal.png\",\"puntos\":920,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Auriculares Gamer HyperX Cloud II Wireless 7.1',92000.00,NULL,0.00,0,920,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,92000.00,92000.00,'Transferencia / Mercado Pago API',NULL,'VTA-APP-91',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 08:36:18',91),(62,'FX-VTA-00092',1,'[{\"id\":15,\"nombre\":\"Cargador GaN 65W Ultra Rápido 3 Puertos USB-C PD + Cable Trenzado\",\"precio\":73000.00,\"img\":\"uploads/productos/cargador65w_negro_frontal.png\",\"puntos\":730,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":2}]','2x Cargador GaN 65W Ultra Rápido 3 Puertos USB-C PD + Cable Trenzado',73000.00,NULL,0.00,0,730,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,73000.00,73000.00,'Debito',NULL,'VTA-APP-92',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 08:45:48',92),(63,'FX-VTA-00093',2,'[{\"id\":89,\"nombre\":\"Pantalla Completa Moto G52 OLED\",\"precio\":42000.00,\"img\":\"logo.png\",\"puntos\":420,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Pantalla Completa Moto G52 OLED',42000.00,NULL,0.00,0,420,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,42000.00,42000.00,'Transferencia / Mercado Pago API',NULL,'VTA-APP-93',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 08:46:42',93),(64,'FX-VTA-00094',1,'[{\"id\":16,\"nombre\":\"Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid\",\"precio\":24900.00,\"img\":\"uploads/productos/kit_termico_frontal.png\",\"puntos\":249,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid',24900.00,NULL,0.00,0,249,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,24900.00,24900.00,'Debito',NULL,'VTA-APP-94',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 08:47:29',94),(65,'FX-VTA-00095',337,'[{\"id\":1,\"nombre\":\"Mantenimiento de Notebook / GPU / Consola\",\"precio\":60000.00,\"img\":\"logo.png\",\"puntos\":600,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":1}]','1x Mantenimiento de Notebook / GPU / Consola',60000.00,NULL,0.00,0,600,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,60000.00,60000.00,'Transferencia / Mercado Pago API',NULL,'VTA-APP-95',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 08:58:55',95),(70,'FX-VTA-00100',16,'[{\"id\":9,\"nombre\":\"Disco Sólido SSD NVMe M.2 Kingston Fury Renegade 1TB PCIe 4.0\",\"precio\":590000.00,\"img\":\"prod_1794957525_666.jpeg\",\"puntos\":5900,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":5}]','5x Disco Sólido SSD NVMe M.2 Kingston Fury Renegade 1TB PCIe 4.0',590000.00,NULL,0.00,0,5900,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,590000.00,590000.00,'Debito',NULL,'VTA-APP-100',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 22:27:06',100),(73,'FX-VTA-00103',16,'[{\"id\":9,\"nombre\":\"Disco Sólido SSD NVMe M.2 Kingston Fury Renegade 1TB PCIe 4.0\",\"precio\":472000.00,\"img\":\"prod_1794957525_666.jpeg\",\"puntos\":4720,\"color\":\"Original\",\"angulo\":\"frontal\",\"cantidad\":4}]','4x Disco Sólido SSD NVMe M.2 Kingston Fury Renegade 1TB PCIe 4.0',472000.00,NULL,0.00,0,4720,'Retiro en Sucursal / Mostrador','Sucursal Central Fénix Lab - Formosa',0.00,0.00,'Contado',1,0.00,472000.00,472000.00,'Transferencia / Mercado Pago API',NULL,'VTA-APP-103',NULL,1,'Confirmada',NULL,'Entregado / Registrado en App','2026-11-17 22:32:49',103);
/*!40000 ALTER TABLE `compras_tienda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupones_cliente`
--

DROP TABLE IF EXISTS `cupones_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupones_cliente` (
  `cupon_id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `codigo_cupon` varchar(40) NOT NULL,
  `descripcion` varchar(120) NOT NULL,
  `porcentaje_descuento` int(11) NOT NULL DEFAULT 10,
  `puntos_coste` int(11) NOT NULL DEFAULT 100,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_canje` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`cupon_id`),
  UNIQUE KEY `codigo_cupon` (`codigo_cupon`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones_cliente`
--

LOCK TABLES `cupones_cliente` WRITE;
/*!40000 ALTER TABLE `cupones_cliente` DISABLE KEYS */;
INSERT INTO `cupones_cliente` VALUES (1,2,'FENIX10-F81E','Cupón 10% OFF en Tienda',10,100,0,'2026-11-11 20:20:24');
/*!40000 ALTER TABLE `cupones_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_envios_sucursal`
--

DROP TABLE IF EXISTS `detalle_envios_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_envios_sucursal` (
  `detalle_envios_sucursal_id` int(11) NOT NULL AUTO_INCREMENT,
  `productos_id` int(11) NOT NULL DEFAULT 1,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  `calle` varchar(100) DEFAULT NULL,
  `manzana` varchar(100) DEFAULT NULL,
  `casa` varchar(100) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `observarciones` varchar(500) DEFAULT NULL,
  `fecha_hora_pedido` datetime DEFAULT current_timestamp(),
  `reparacion_orden_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`detalle_envios_sucursal_id`),
  KEY `fk_det_envios_producto` (`productos_id`),
  KEY `fk_reparacion_orden_id_idx` (`reparacion_orden_id`),
  CONSTRAINT `fk_det_envios_producto` FOREIGN KEY (`productos_id`) REFERENCES `productos` (`productos_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reparacion_orden_id` FOREIGN KEY (`reparacion_orden_id`) REFERENCES `reparacion_orden` (`reparacion_orden_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_envios_sucursal`
--

LOCK TABLES `detalle_envios_sucursal` WRITE;
/*!40000 ALTER TABLE `detalle_envios_sucursal` DISABLE KEYS */;
INSERT INTO `detalle_envios_sucursal` VALUES (1,1,5,'ejemplo',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,25,'Reposición para Llavero Pou',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,1,'Envío de equipo - Orden #15',1,NULL,NULL,NULL,NULL,NULL,NULL,15),(4,1,1,'Envío de equipo - Orden #16',1,NULL,NULL,NULL,NULL,NULL,NULL,16),(5,1,30,'Reposición para Llavero Pou',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,1,'Envío de equipo - Orden #17',1,NULL,NULL,NULL,NULL,NULL,NULL,17),(7,1,1,'Envío de equipo - Orden #18',1,NULL,NULL,NULL,NULL,NULL,NULL,18),(8,1,1,'Envío de equipo - Orden #19',1,NULL,NULL,NULL,NULL,NULL,NULL,19),(9,1,1,'Envío de equipo - Orden #21',1,NULL,NULL,NULL,NULL,NULL,NULL,21),(10,1,2,'Envío a domicilio - Venta Web: Calle de tierra',1,'Calle 256','','','Las Orquideas',NULL,NULL,NULL),(11,1,1,'Envío de equipo - Orden #29',1,NULL,NULL,NULL,NULL,NULL,'2026-11-13 03:18:56',29),(12,1,1,'Envío de equipo - Orden #30',1,NULL,NULL,NULL,NULL,NULL,'2026-11-13 03:42:13',30),(13,1,1,'Envío de equipo - Orden #35',1,NULL,NULL,NULL,NULL,NULL,'2026-11-14 15:08:03',35),(14,1,1,'Envío de equipo - Orden Web #FX-6EEC01',1,'Vial','','','Formosa','Retiro por Cadete Fenix Lab','2026-11-10 20:31:26',36),(15,1,1,'Envío de equipo - Orden #52',1,'Calle 251','Mz 48','Cs 7','Barrio Las Orquideas',NULL,'2026-11-16 09:01:44',52),(16,1,1,'Envío de equipo - Orden #53',1,NULL,NULL,NULL,NULL,NULL,'2026-11-16 09:09:14',53),(17,1,1,'Envío de equipo - Orden #54 | GPS Coordenadas: -26.13997, -58.15585',1,'Avenida Ana Elías de Cánepa','17','3','República Argentina',NULL,'2026-11-16 10:32:23',54),(18,1,1,'Envío de equipo - Orden #55 | GPS Coordenadas: -26.181591, -58.166528',1,'Rivadavia','2','83','Formosa',NULL,'2026-11-16 10:39:49',55),(19,1,1,'Envío de equipo - Orden #56 | GPS Coordenadas: -26.185488, -58.174445',1,'Jose Maria Uriburu','','','Don Bosco',NULL,'2026-11-16 11:05:33',56),(20,1,1,'ENTREGA DE EQUIPO REPARADO - Orden #56 (Mañana (09:00 a 13:00 hs))',1,'Calle 251','Mz 48','Cs 7','Formosa','Dir: Calle 251, Barrio Formosa (Mz. Mz 48 Cs.Cs 7) | GPS: -26.1443265,-58.157174 ert{} Nota:','2026-11-16 16:38:05',56),(21,1,1,'Envío de equipo - Orden #57 | GPS Coordenadas: -26.177355, -58.168282',1,'Juan José Silva','4','193','Independencia',NULL,'2026-11-16 16:41:41',57),(22,1,1,'RETIRO DE EQUIPO EN DOMICILIO - Orden #57 (Mañana (09:00 a 13:00 hs))',1,'Calle 251','','','Formosa','Dir: Calle 251, Barrio Formosa | GPS: -26.1443275,-58.1571763 ert{} Nota:','2026-11-16 16:42:19',57),(23,1,1,'RETIRO A TALLER SOLICITADO - Orden #38 (Mañana (09:00 a 13:00 hs))',1,'Domicilio registrado en cuenta',NULL,NULL,'Formosa Capital','Retiro por Cadete | GPS: -26.1849, -58.1731 | Franja: Mañana (09:00 a 13:00 hs)','2026-11-16 16:52:56',38),(24,1,1,'Envío de equipo - Orden #70 | GPS Coordenadas: -26.180419, -58.170556',1,'Pringles','21','466','San Martín',' | RETIRADO POR CADETE OK','2026-11-17 20:56:28',70),(25,1,1,'Envío de equipo - Orden #71 | GPS Coordenadas: -26.155647, -58.146398',1,'Calle 251','Mz 48','Cs 7','Las Orquídeas',NULL,'2026-11-17 21:36:29',71),(26,9,4,'Envío a domicilio - Venta Web: GPS Coordenadas: -26.18232, -58.16953',1,'España','72','441','Formosa',NULL,'2026-11-17 22:32:49',NULL);
/*!40000 ALTER TABLE `detalle_envios_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido_sucursal`
--

DROP TABLE IF EXISTS `detalle_pedido_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedido_sucursal` (
  `detalle_pedido_sucursales_id` int(11) NOT NULL AUTO_INCREMENT,
  `productos_id` int(11) DEFAULT NULL,
  `observaciones` varchar(120) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_hora_pedido` datetime DEFAULT current_timestamp(),
  `estado` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`detalle_pedido_sucursales_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `productos_id_idx` (`productos_id`),
  CONSTRAINT `fk_det_pedido_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_pedido_producto` FOREIGN KEY (`productos_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido_sucursal`
--

LOCK TABLES `detalle_pedido_sucursal` WRITE;
/*!40000 ALTER TABLE `detalle_pedido_sucursal` DISABLE KEYS */;
INSERT INTO `detalle_pedido_sucursal` VALUES (4,1,'Reposición para Llavero Pou',30,'2026-11-13 06:39:07','verificado',1),(5,1,'Reposición para Llavero Pou',10,'2026-11-13 06:49:02','verificado',1),(6,1,'Reposición para Auriculares Gamer HyperX Cloud II Wireless 7.1',10,'2026-11-16 09:12:39','verificado',1),(7,1,'Reposición para Auriculares Gamer HyperX Cloud II Wireless 7.1',10,'2026-11-16 15:40:02','verificado',1),(8,16,'Reposición para Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid',5,'2026-11-17 01:32:37','verificado',1),(9,6,'Reposición para Estación de Carga Rápida 3 en 1 Magnética 15W Qi2',10,'2026-11-17 01:36:28','verificado',1),(10,91,'Reposición para Smart TV 32\" LED HD',2,'2026-11-17 01:37:08','verificado',1),(11,101,'Reposición para Auriculares Inalámbricos HyperX Cloud III 7.1 Studio',10,'2026-11-17 02:09:53','verificado',1),(12,3,'Reposición para Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz',10,'2026-11-17 07:55:20','pendiente',1),(13,2,'Reposición para Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6',10,'2026-11-17 08:29:25','verificado',1);
/*!40000 ALTER TABLE `detalle_pedido_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_reparacion`
--

DROP TABLE IF EXISTS `detalle_reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_reparacion` (
  `detalle_reparacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `equipo_id` int(11) DEFAULT NULL,
  `forma_pago_id` int(11) DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT NULL,
  `reparacion_orden_id` int(11) NOT NULL,
  `hora_venta` datetime DEFAULT current_timestamp(),
  `garantia` tinyint(4) DEFAULT 1,
  `estado_general_id` int(11) DEFAULT 1,
  `observaciones` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`detalle_reparacion_id`),
  KEY `equipo_id_idx` (`equipo_id`),
  KEY `forma_pago_id_idx` (`forma_pago_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_det_rep_orden_idx` (`reparacion_orden_id`),
  CONSTRAINT `fk_det_rep_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`equipo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_orden` FOREIGN KEY (`reparacion_orden_id`) REFERENCES `reparacion_orden` (`reparacion_orden_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_det_rep_pago` FOREIGN KEY (`forma_pago_id`) REFERENCES `formas_pago` (`formas_pago_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_reparacion`
--

LOCK TABLES `detalle_reparacion` WRITE;
/*!40000 ALTER TABLE `detalle_reparacion` DISABLE KEYS */;
INSERT INTO `detalle_reparacion` VALUES (1,37,1,50000.00,22,'2026-11-09 20:34:53',1,1,'Reparación Orden #22'),(2,38,1,50000.00,23,'2026-11-09 21:26:26',1,1,'Reparación Orden #23'),(3,74,3,60000.00,58,'2026-11-17 08:58:55',1,1,'Reparación Orden #58');
/*!40000 ALTER TABLE `detalle_reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `detalle_venta_id` int(11) NOT NULL AUTO_INCREMENT,
  `forma_pago_id` int(11) DEFAULT 1,
  `cantidad` int(11) DEFAULT 1,
  `subtotal` decimal(15,2) DEFAULT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  `observaciones` varchar(120) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `servicio_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`detalle_venta_id`),
  KEY `forma_pago_id_idx` (`forma_pago_id`),
  KEY `venta_id_idx` (`venta_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_det_venta_producto_idx` (`producto_id`),
  KEY `fk_detalle_venta_servicio` (`servicio_id`),
  CONSTRAINT `detalledeventa_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_venta_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_venta_pago` FOREIGN KEY (`forma_pago_id`) REFERENCES `formas_pago` (`formas_pago_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_venta_venta` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`venta_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_detalle_venta_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (4,1,1,12.00,11,1,'1',2,NULL),(5,1,1,312.00,11,1,'2',1,NULL),(6,1,1,12.00,12,1,'',2,NULL),(7,1,1,12.00,13,1,'',2,NULL),(8,1,1,12.00,14,1,'',3,NULL),(9,1,1,312.00,15,1,'',1,NULL),(10,1,1,312.00,16,1,'',1,NULL),(11,1,1,500.00,24,1,'',1,NULL),(12,1,2,1000.00,25,1,'',1,NULL),(13,1,1,500.00,26,1,'',1,NULL),(14,2,11,5500.00,27,1,NULL,1,NULL),(15,2,3,1500.00,28,1,NULL,1,NULL),(16,2,1,500.00,29,1,NULL,1,NULL),(17,2,1,500.00,30,1,NULL,1,NULL),(18,2,3,1500.00,31,1,NULL,1,NULL),(19,2,1,500.00,32,1,NULL,1,NULL),(20,2,5,2500.00,33,1,NULL,1,NULL),(21,2,10,5000.00,34,1,NULL,1,NULL),(22,1,1,50000.00,35,1,'Servicio de Reparación N° 22',1,NULL),(23,1,1,50000.00,36,1,'Pago de servicio técnico orden #23',NULL,3),(24,1,1,500.00,37,1,'',1,NULL),(25,2,2,1000.00,38,1,NULL,1,NULL),(26,2,1,50000.00,51,1,'Liquidación total orden #30',NULL,3),(30,1,1,25000.00,55,1,'',78,NULL),(31,1,1,47212.00,56,1,'Compra Tienda Web #FX-COMP-C49009',106,NULL),(32,1,1,92000.00,57,1,'',1,NULL),(33,2,1,485000.00,58,1,NULL,2,NULL),(34,2,1,265000.00,59,1,NULL,3,NULL),(35,1,1,47212.00,60,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Rojo Carmin]',1,NULL),(36,2,1,92000.00,61,1,NULL,1,NULL),(37,2,1,92000.00,62,1,NULL,1,NULL),(38,1,1,92000.00,63,1,NULL,1,NULL),(39,1,1,485000.00,63,1,NULL,2,NULL),(40,1,1,265000.00,63,1,NULL,3,NULL),(41,1,1,84500.00,63,1,NULL,4,NULL),(42,3,1,220782.00,64,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(43,3,1,220782.00,65,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(44,3,1,220782.00,66,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(45,3,1,220782.00,67,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(46,3,1,220782.00,68,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(47,3,1,220782.00,69,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(48,3,1,220782.00,70,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(49,3,1,220782.00,71,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(50,3,1,220782.00,72,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(51,3,1,220782.00,73,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(52,3,1,220782.00,74,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(53,3,1,220782.00,75,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(54,3,1,220782.00,76,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(55,3,1,220782.00,77,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(56,3,1,220782.00,78,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(57,3,1,220782.00,79,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(58,3,1,220782.00,80,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(59,3,1,220782.00,81,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(60,3,1,220782.00,82,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(61,3,1,220782.00,83,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(62,3,1,220782.00,84,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(63,3,1,220782.00,85,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(64,3,1,220782.00,86,1,'1x Estación de Carga Rápida 3 en 1 Magnética 15W Qi2 [Color: Negro Onyx] | 1x Auriculares Inalámbricos HyperX C',1,NULL),(66,3,1,92000.00,91,1,NULL,1,NULL),(67,1,2,73000.00,92,1,'',15,NULL),(68,3,1,42000.00,93,1,'',89,NULL),(69,1,1,24900.00,94,1,'',16,NULL),(70,3,1,60000.00,95,1,'Pago de servicio técnico orden #58',NULL,2),(75,1,5,590000.00,100,1,NULL,9,NULL),(78,3,4,472000.00,103,1,NULL,9,NULL);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direccion`
--

DROP TABLE IF EXISTS `direccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direccion` (
  `direccion_id` int(11) NOT NULL AUTO_INCREMENT,
  `provincia_id` int(11) NOT NULL DEFAULT 1,
  `ciudad_id` int(11) NOT NULL DEFAULT 1,
  `codigo_postal_id` int(11) DEFAULT 1,
  `calle` varchar(100) NOT NULL DEFAULT '',
  `numero` varchar(10) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `manzana` varchar(10) DEFAULT NULL,
  `casa` varchar(10) DEFAULT NULL,
  `piso_dpto` varchar(20) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  `pais_id` int(11) DEFAULT 1,
  PRIMARY KEY (`direccion_id`),
  KEY `fk_direccion_paises` (`pais_id`),
  CONSTRAINT `fk_direccion_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direccion`
--

LOCK TABLES `direccion` WRITE;
/*!40000 ALTER TABLE `direccion` DISABLE KEYS */;
INSERT INTO `direccion` VALUES (1,4,1,1,'Av. 25 de Mayo','850','Las Orquideas','48','7',NULL,'Calle de Tierra / Sucursal Central Fenix Lab',1,1),(2,1,1,1,'Av. 25 de Mayo','850','Centro',NULL,NULL,NULL,'Sucursal Central Fenix Lab',1,1);
/*!40000 ALTER TABLE `direccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones_cliente`
--

DROP TABLE IF EXISTS `direcciones_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones_cliente` (
  `id_direccion` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `etiqueta` varchar(50) NOT NULL DEFAULT 'Casa',
  `direccion_calle` varchar(255) NOT NULL,
  `localidad` varchar(100) NOT NULL DEFAULT 'Formosa Capital',
  `codigo_postal` varchar(20) NOT NULL DEFAULT '3600',
  `referencia` varchar(255) DEFAULT NULL,
  `coordenadas_gps` varchar(100) DEFAULT '-26.1849, -58.1731',
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_direccion`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones_cliente`
--

LOCK TABLES `direcciones_cliente` WRITE;
/*!40000 ALTER TABLE `direcciones_cliente` DISABLE KEYS */;
INSERT INTO `direcciones_cliente` VALUES (1,337,'Domicilio (Formosa)','Calle 251','Formosa Capital','3600','','-26.1443265,-58.157174','2026-11-16 16:38:05');
/*!40000 ALTER TABLE `direcciones_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egreso`
--

DROP TABLE IF EXISTS `egreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egreso` (
  `egreso_id` int(11) NOT NULL AUTO_INCREMENT,
  `egreso` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`egreso_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_egreso_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egreso`
--

LOCK TABLES `egreso` WRITE;
/*!40000 ALTER TABLE `egreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `egreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `envios`
--

DROP TABLE IF EXISTS `envios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `envios` (
  `envios_id` int(11) NOT NULL AUTO_INCREMENT,
  `direccion_id` int(11) DEFAULT NULL,
  `costo` decimal(15,2) DEFAULT 0.00,
  `estado` varchar(50) DEFAULT 'Pendiente',
  `fecha_envio` datetime DEFAULT current_timestamp(),
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`envios_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `envios`
--

LOCK TABLES `envios` WRITE;
/*!40000 ALTER TABLE `envios` DISABLE KEYS */;
/*!40000 ALTER TABLE `envios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `equipo_id` int(11) NOT NULL AUTO_INCREMENT,
  `marca_equipo_id` int(11) DEFAULT 1,
  `categoria_equipo_id` int(11) DEFAULT 1,
  `modelo_equipo_id` int(11) DEFAULT 1,
  `numero_serie` varchar(100) DEFAULT NULL,
  `imei` varchar(50) DEFAULT NULL,
  `fecha_ingreso_sistema` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado_general_id` int(11) DEFAULT 1,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`equipo_id`),
  KEY `idx_numero_serie` (`numero_serie`),
  KEY `idx_imei` (`imei`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `categoria_id_idx` (`categoria_equipo_id`),
  KEY `marca_id_idx` (`marca_equipo_id`),
  KEY `modelo_id_idx` (`modelo_equipo_id`),
  CONSTRAINT `fk_equipos_categoria` FOREIGN KEY (`categoria_equipo_id`) REFERENCES `categorias_equipo` (`categoria_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_equipos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_equipos_marca` FOREIGN KEY (`marca_equipo_id`) REFERENCES `marcas_equipos` (`marca_equipo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_equipos_modelo` FOREIGN KEY (`modelo_equipo_id`) REFERENCES `modelo_equipos` (`modelo_equipo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (1,4,4,1,'41324','4312421','2026-09-14 19:49:17',1,NULL),(4,4,4,2,'123','123','2026-09-14 20:20:48',1,NULL),(5,4,4,2,'3123','3123','2026-09-14 20:32:20',1,NULL),(6,4,1,2,'a','a','2026-09-14 20:46:42',1,NULL),(7,4,4,2,'21312312312312','321312312','2026-11-02 05:50:48',1,NULL),(10,4,4,2,'1233434','1233413241324','2026-11-02 06:00:44',1,NULL),(11,4,4,2,'213123213','43124132423','2026-11-02 06:03:20',1,NULL),(12,4,4,2,'4547376','1131212','2026-11-05 14:45:59',1,NULL),(13,4,4,1,'283818388132','1353165361651','2026-11-05 19:46:45',1,NULL),(14,4,4,1,'173818381','31313132','2026-11-05 19:59:07',1,NULL),(15,4,4,2,'7377271732','313133215','2026-11-05 20:15:29',1,NULL),(16,4,4,1,'7382737182','64619169445','2026-11-05 20:26:25',1,NULL),(17,4,4,2,'83838831','8494884824','2026-11-06 02:03:14',1,NULL),(18,4,4,2,'838381','83938823','2026-11-06 02:20:37',1,NULL),(19,4,4,1,'111111111','11111111','2026-11-06 03:29:26',1,NULL),(21,4,4,1,'7382831','8382823','2026-11-06 11:02:08',1,NULL),(22,4,4,1,'83838142','94092942','2026-11-06 11:05:57',1,NULL),(23,4,4,1,'83828832','8382831','2026-11-06 11:22:57',1,NULL),(26,4,4,1,'8482831','83828316','2026-11-06 11:42:48',1,NULL),(37,4,4,1,'74817371','73817731','2026-11-09 23:04:25',1,NULL),(38,4,4,1,'83818381','40920491','2026-11-09 23:53:30',1,NULL),(39,4,4,2,'748183771','8482842','2026-11-10 00:44:01',1,NULL),(44,4,4,1,'8382','83823','2026-11-13 06:18:56',1,NULL),(46,4,4,1,'12','12384882','2026-11-13 06:42:13',1,NULL),(50,4,4,2,'738273711','773827372','2026-11-14 17:58:27',1,NULL),(51,4,4,2,'838288339131','83918381','2026-11-14 18:08:03',1,NULL),(52,8,2,7,'WEB-FX-6EEC01','SN-123','2026-11-10 23:31:26',1,'uploads/dispositivos/eq_6af3a94e31d54_0.png'),(53,1,2,7,NULL,NULL,'2026-11-15 18:45:43',1,NULL),(54,4,4,1,'73828482831','84928481841','2026-11-15 19:14:19',1,NULL),(55,4,4,1,'WEB-FX-02512B','ID-40','2026-11-15 19:59:06',1,NULL),(58,4,4,4,'431432543','234153451','2026-11-16 04:16:49',1,NULL),(59,4,4,4,'431432543','234153451','2026-11-16 04:16:50',1,NULL),(60,4,4,4,'431432543','234153451','2026-11-16 04:16:50',1,NULL),(61,4,4,4,'431432543','234153451','2026-11-16 04:16:51',1,NULL),(62,4,4,4,'431432543','234153451','2026-11-16 04:16:51',1,NULL),(64,4,4,4,'431432543','234153451','2026-11-16 04:17:04',1,NULL),(65,4,4,4,'431432543','234153451','2026-11-16 04:17:13',1,NULL),(68,7,1,5,NULL,NULL,'2026-11-16 12:01:44',1,NULL),(69,5,1,3,'73818481','7382828822','2026-11-16 12:09:14',1,NULL),(70,7,1,7,'','','2026-11-16 13:32:23',1,NULL),(71,4,1,2,'8382831','7372732','2026-11-16 13:39:49',1,NULL),(72,4,4,1,'8282838183','8391939131','2026-11-16 14:05:33',1,NULL),(73,4,4,1,'8281821','5248193','2026-11-16 19:41:41',1,NULL),(74,7,1,7,'83828831','83928381','2026-11-16 20:24:44',1,NULL),(75,4,3,1,'WEB-FX-B378DD','ID-131','2026-11-16 20:55:40',1,'uploads/dispositivos/eq_6afb6dcc1bea0_0.png'),(76,4,3,1,'WEB-FX-B74A47','ID-132','2026-11-16 20:55:43',1,'uploads/dispositivos/eq_6afb6dcf7ae86_0.png'),(77,4,1,1,'WEB-FX-AEE107','ID-133','2026-11-16 21:01:28',1,'uploads/dispositivos/eq_6afb6f27ae4d8_0.png'),(78,4,1,1,'WEB-FX-7079A7','ID-134','2026-11-16 21:01:31',1,'uploads/dispositivos/eq_6afb6f2b2f4aa_0.png'),(79,4,4,1,'','','2026-11-16 21:03:03',1,NULL),(80,7,1,7,NULL,NULL,'2026-11-17 05:00:31',1,NULL),(83,4,4,2,'73717372','73817372','2026-11-17 11:01:08',1,NULL),(84,8,5,5,NULL,NULL,'2026-11-17 11:52:06',1,NULL),(85,8,5,5,NULL,NULL,'2026-11-17 11:54:25',1,NULL),(86,7,1,7,'','','2026-11-17 23:56:28',1,NULL),(87,8,5,5,NULL,NULL,'2026-11-18 00:36:29',1,NULL);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_general`
--

DROP TABLE IF EXISTS `estado_general`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_general` (
  `estado_general_id` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`estado_general_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_general`
--

LOCK TABLES `estado_general` WRITE;
/*!40000 ALTER TABLE `estado_general` DISABLE KEYS */;
INSERT INTO `estado_general` VALUES (1,'Activo'),(2,'Inhabilitado'),(3,'Pendiente'),(4,'En Proceso'),(5,'Finalizado');
/*!40000 ALTER TABLE `estado_general` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_or`
--

DROP TABLE IF EXISTS `estados_or`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_or` (
  `estados_or_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`estados_or_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_or`
--

LOCK TABLES `estados_or` WRITE;
/*!40000 ALTER TABLE `estados_or` DISABLE KEYS */;
INSERT INTO `estados_or` VALUES (1,'Pendiente',1),(2,'En Proceso',1),(3,'Finalizado',1),(4,'Cancelado',1),(5,'Entregado',1),(6,'Entregado al Cliente',1);
/*!40000 ALTER TABLE `estados_or` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fallas_equipos`
--

DROP TABLE IF EXISTS `fallas_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fallas_equipos` (
  `id_falla` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_nombre` varchar(100) NOT NULL DEFAULT 'General',
  `titulo_falla` varchar(180) NOT NULL,
  `descripcion_tecnica` text DEFAULT NULL,
  `tiempo_reparacion` varchar(60) DEFAULT 'En el día / 24 hs',
  `garantia` varchar(60) DEFAULT '90 días escrita',
  `costo_estimado` decimal(12,2) NOT NULL DEFAULT 18000.00,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_falla`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fallas_equipos`
--

LOCK TABLES `fallas_equipos` WRITE;
/*!40000 ALTER TABLE `fallas_equipos` DISABLE KEYS */;
INSERT INTO `fallas_equipos` VALUES (1,'Smartphone / Celular','No enciende / Cortocircuito en línea principal VDD_MAIN','Búsqueda de corto con cámara térmica e inyección de tensión, reemplazo de IC Tristar/PMIC o capacitores en fuga.','24 a 48 hs','90 días escrita',28000.00,1),(2,'Smartphone / Celular','Cambio de Módulo / Pantalla rota o sin imagen táctil','Instalación de pantalla original con calibración de color, sellado impermeable y film hidrogel de regalo.','En el día (3 hs)','120 días escrita',32000.00,1),(3,'Smartphone / Celular','No carga / Falla de Pin USB-C o IC de Carga','Microsoldadura de conector USB-C / FPC o reemplazo de circuito integrado administrador de carga.','En el día (2 hs)','90 días escrita',19500.00,1),(4,'Placa de Video (GPU)','Mantenimiento Full Térmico (Pads Gelid + Pasta Pro)','Limpieza ultrasónica completa, recambio de thermal pads en memorias VRAM/VRM y pasta térmica de alta conductividad.','En el día (4 hs)','90 días escrita',27000.00,1),(5,'Placa de Video (GPU)','Enciende sin dar video / Artefactos / Reballing VRAM','Diagnóstico de fases DrMOS, reballing de módulos GDDR6 o núcleo gráfico en estación BGA.','48 a 72 hs','180 días escrita',45000.00,1),(6,'Notebook / Laptop Gamer','Reparación de Placa Madre / No da video / Enciende y apaga','Reprogramación de chip BIOS SPI, reparación de fuentes primarias 3V/5V y recambio de EC/KBC.','24 a 48 hs','120 días escrita',36000.00,1),(7,'Consola (PS4 / PS5 / Xbox)','Cambio de Metal Líquido + Puerto HDMI 2.1 + Limpieza Pro','Reemplazo de conector HDMI dañado bajo microscopio y renovación de metal líquido térmico en APU.','24 hs','120 días escrita',29000.00,1),(8,'PC de Escritorio','Diagnóstico Integral de Hardware + Optimización Extrema','Testeo de fuente con carga electrónica, memorias RAM, salud NVMe y actualización de microcódigo BIOS.','En el día','90 días escrita',15000.00,1),(9,'Consola (PS4 / PS5 / Xbox)','Mantenimiento de Notebook / GPU / Consola',NULL,'En el día / 24 hs','90 días escrita',60000.00,1);
/*!40000 ALTER TABLE `fallas_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `formas_pago`
--

DROP TABLE IF EXISTS `formas_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formas_pago` (
  `formas_pago_id` int(11) NOT NULL AUTO_INCREMENT,
  `forma` varchar(45) NOT NULL,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`formas_pago_id`),
  KEY `formas_pago_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `formas_pago_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formas_pago`
--

LOCK TABLES `formas_pago` WRITE;
/*!40000 ALTER TABLE `formas_pago` DISABLE KEYS */;
INSERT INTO `formas_pago` VALUES (1,'Debito',1),(2,'Efectivo',1),(3,'Transferencia / Mercado Pago API',1),(4,'Binance Pay QR',1);
/*!40000 ALTER TABLE `formas_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garantias`
--

DROP TABLE IF EXISTS `garantias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garantias` (
  `garantias_id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `tipo_garantia` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `compra_proveedor_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`garantias_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_garantias_venta_idx` (`venta_id`),
  KEY `fk_garantias_reparacion_idx` (`reparacion_id`),
  KEY `fk_garantias_compra_prov_idx` (`compra_proveedor_id`),
  KEY `fk_garantias_tipo_garantia_idx` (`tipo_garantia`),
  CONSTRAINT `fk_garantias_compra_prov` FOREIGN KEY (`compra_proveedor_id`) REFERENCES `compra_proveedor` (`compra_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_garantias_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_garantias_reparacion` FOREIGN KEY (`reparacion_id`) REFERENCES `reparacion` (`reparacion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_garantias_tipo_garantia` FOREIGN KEY (`tipo_garantia`) REFERENCES `tipo_garantia` (`garantia_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_garantias_venta` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`venta_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garantias`
--

LOCK TABLES `garantias` WRITE;
/*!40000 ALTER TABLE `garantias` DISABLE KEYS */;
/*!40000 ALTER TABLE `garantias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genero`
--

DROP TABLE IF EXISTS `genero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genero` (
  `genero_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`genero_id`),
  KEY `fk_genero_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_genero_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genero`
--

LOCK TABLES `genero` WRITE;
/*!40000 ALTER TABLE `genero` DISABLE KEYS */;
INSERT INTO `genero` VALUES (1,'Masculino',1),(2,'Femenino',1),(3,'Otro / Prefiero no decirlo',1);
/*!40000 ALTER TABLE `genero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `marca_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`marca_id`),
  KEY `fk_marca_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_marca_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'Samsung / HyperX',1),(2,'Apple / MSI NVIDIA',1),(3,'Redragon / Logitech G',1),(4,'Xiaomi / AMD',1),(5,'Motorola / Samsung',1),(6,'Sony / Apple',1),(7,'Nintendo',1),(8,'Microsoft',1),(9,'LG',1),(10,'Asus',1),(11,'Lenovo',1),(12,'HP',1),(13,'Dell',1),(14,'Kingston',1),(15,'Western Digital',1),(16,'Logitech',1),(17,'AMD',1),(18,'Intel',1),(19,'NVIDIA',1),(20,'Huawei',1),(21,'JBL',1),(22,'Xiaomi',1),(23,'Motorola',1),(24,'Sony',1),(25,'Nintendo',1),(26,'Microsoft',1),(27,'LG',1),(28,'Asus',1),(29,'Lenovo',1),(30,'HP',1),(31,'Dell',1),(32,'Kingston',1),(33,'Western Digital',1),(34,'Logitech',1),(35,'AMD',1),(36,'Intel',1),(37,'NVIDIA',1),(38,'Huawei',1),(39,'JBL',1);
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (6,'AMD Radeon'),(1,'Apple / iPhone'),(7,'ASUS ROG'),(9,'Gigabyte'),(3,'Motorola'),(8,'MSI'),(5,'NVIDIA GeForce'),(2,'Samsung'),(10,'Sony PlayStation'),(4,'Xiaomi');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas_equipos`
--

DROP TABLE IF EXISTS `marcas_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas_equipos` (
  `marca_equipo_id` int(11) NOT NULL AUTO_INCREMENT,
  `marcas_equipos` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`marca_equipo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_marcas_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas_equipos`
--

LOCK TABLES `marcas_equipos` WRITE;
/*!40000 ALTER TABLE `marcas_equipos` DISABLE KEYS */;
INSERT INTO `marcas_equipos` VALUES (1,'HP',1),(2,'Lenovo',1),(3,'PlayStation',1),(4,'Samsung',1),(5,'Apple / iPhone',1),(6,'Motorola',1),(7,'ASUS ROG / MSI',1),(8,'AMD / NVIDIA',1);
/*!40000 ALTER TABLE `marcas_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas_proveedor`
--

DROP TABLE IF EXISTS `marcas_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas_proveedor` (
  `marcas_proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `marcas` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`marcas_proveedor_id`),
  KEY `fk_mprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_mprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas_proveedor`
--

LOCK TABLES `marcas_proveedor` WRITE;
/*!40000 ALTER TABLE `marcas_proveedor` DISABLE KEYS */;
INSERT INTO `marcas_proveedor` VALUES (1,'Samsung',1),(2,'Apple',1),(3,'Kingston',1),(4,'Redragon',1),(5,'Motorola',1),(6,'Xiaomi',1);
/*!40000 ALTER TABLE `marcas_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matricula` (
  `matricula_id` int(11) NOT NULL AUTO_INCREMENT,
  `matricula` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`matricula_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_matricula_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matricula`
--

LOCK TABLES `matricula` WRITE;
/*!40000 ALTER TABLE `matricula` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_taller`
--

DROP TABLE IF EXISTS `mensajes_taller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_taller` (
  `id_mensaje` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_orden` varchar(40) NOT NULL,
  `id_cliente` int(11) NOT NULL DEFAULT 2,
  `remitente` varchar(40) NOT NULL DEFAULT 'Cliente',
  `nombre_autor` varchar(100) NOT NULL DEFAULT 'Usuario Fenix Lab',
  `mensaje` text NOT NULL,
  `fecha_envio` datetime DEFAULT current_timestamp(),
  `nota_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_mensaje`),
  KEY `idx_msg_orden` (`codigo_orden`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_taller`
--

LOCK TABLES `mensajes_taller` WRITE;
/*!40000 ALTER TABLE `mensajes_taller` DISABLE KEYS */;
INSERT INTO `mensajes_taller` VALUES (1,'FX-6EEC01',2,'Tecnico','Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208)','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-6EEC01 para tu PC de Escritorio AMD Radeon (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Diagnóstico Integral de Hardware + Optimización Extrema\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','2026-11-10 20:31:26',29),(2,'FX-6EEC01',2,'Cliente','Johan Daniel Gauna','hola','2026-11-13 19:27:22',30),(3,'FX-6EEC01',2,'Tecnico','Ing. Marcos Villalba (Técnico)','Hola Johan Daniel Gauna, recibí tu mensaje sobre la orden #FX-6EEC01 en la terminal del laboratorio. Estoy revisando los parámetros de tu equipo en bancada y te actualizo el informe por este mismo chat.','2026-11-13 19:27:22',31),(4,'OR-00030',16,'Tecnico','Juan Mbappe (Técnico)','Che vi q tu problema es el pin de carga','2026-11-13 23:07:53',32),(5,'OR-00035',16,'Cliente','Sebastián Nicolás Gomez','Pago registrado por $50.000,00 vía [Efectivo]. Acumulado: $50.000,00 / $50.000,00','2026-11-14 18:08:41',33),(6,'327070',4,'Tecnico','Técnico Fénix Lab','hola amigo','2026-11-01 17:03:24',1),(7,'991935',6,'Tecnico','Técnico Fénix Lab','Hola wachin','2026-11-05 11:28:28',2),(8,'700800',5,'Tecnico','Técnico Fénix Lab','Holaaa','2026-11-05 23:22:40',3),(9,'700800',5,'Tecnico','Técnico Fénix Lab','Prueba','2026-11-05 23:27:37',4),(10,'700800',5,'Cliente','Karen Martinez','Holaaa','2026-11-05 23:28:07',5),(11,'378733',16,'Tecnico','Técnico Fénix Lab','Holaaa','2026-11-06 09:19:32',6),(12,'378733',16,'Cliente','Sebastián Nicolás Gomez','Holaa','2026-11-06 09:21:36',7),(13,'378733',16,'Tecnico','Técnico Fénix Lab','Holis','2026-11-08 22:55:27',8),(14,'378733',16,'Tecnico','Técnico Fénix Lab','.','2026-11-08 23:04:16',9),(15,'378733',16,'Tecnico','Técnico Fénix Lab','.','2026-11-08 23:17:42',10),(16,'378733',16,'Tecnico','Técnico Fénix Lab','Archivo adjunto','2026-11-08 23:20:59',11),(17,'378733',16,'Tecnico','Técnico Fénix Lab','Archivo adjunto','2026-11-08 23:21:24',12),(18,'378733',16,'Tecnico','Técnico Fénix Lab','Archivo adjunto','2026-11-08 23:35:09',13),(19,'378733',16,'Tecnico','Técnico Fénix Lab','Archivo adjunto','2026-11-08 23:35:39',14),(20,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $25.000,00. Acumulado pagado: $25.000,00','2026-11-13 03:35:09',15),(21,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','2026-11-13 03:35:16',16),(22,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','2026-11-13 03:35:19',17),(23,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','2026-11-13 03:35:21',18),(24,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','2026-11-13 03:35:23',19),(25,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','2026-11-13 03:35:46',20),(26,'OR-00029',16,'Cliente','Sebastián Nicolás Gomez','Pago registrado por $49.873,00 vía [Debito]. Acumulado: $50.000,00 / $50.000,00','2026-11-13 03:51:45',21),(27,'OR-00030',16,'Cliente','Sebastián Nicolás Gomez','Pago registrado por $50.000,00 vía [Debito]. Acumulado: $50.000,00 / $50.000,00','2026-11-13 03:54:49',22),(28,'812434',16,'Tecnico','Técnico Fénix Lab','Holaaa','2026-11-13 18:57:28',23),(29,'OR-00030',16,'Tecnico','Técnico Fénix Lab','Che vi q tu problema es el pin de carga','2026-11-13 20:07:53',24),(30,'OR-00035',16,'Cliente','Sebastián Nicolás Gomez','Pago registrado por $50.000,00 vía [Efectivo]. Acumulado: $50.000,00 / $50.000,00','2026-11-14 15:08:41',25),(31,'FX-6EEC01',2,'Tecnico','Técnico Fénix Lab','¡Hola! Soy Ing. Lucas Benítez (Mat. #FX-208). Recibí tu orden #FX-6EEC01 para tu PC de Escritorio AMD Radeon. Escribime por aquí cualquier consulta.','2026-11-10 17:31:26',26),(32,'FX-6EEC01',2,'Cliente','Johan Daniel Gauna','hola','2026-11-13 16:27:22',27),(33,'FX-6EEC01',2,'Tecnico','Técnico Fénix Lab','Hola Johan Daniel Gauna, recibí tu mensaje sobre la orden #FX-6EEC01 en la terminal del laboratorio. Estoy revisando los parámetros de tu equipo en bancada.','2026-11-13 16:27:22',28),(34,'FX-02512B',18,'Tecnico','Técnico Fénix Lab','Hola buenos dias','2026-11-16 09:03:00',34),(35,'104544',16,'Cliente','Cliente Fénix Lab','Holaa','2026-11-16 09:38:20',35),(36,'104544',16,'Cliente','Cliente Fénix Lab','Como esta mi celular','2026-11-16 09:38:34',36),(37,'104544',16,'Tecnico','Técnico Fénix Lab','Bien, ya lo estamos reparando','2026-11-16 09:39:10',37),(38,'104544',16,'Cliente','Cliente Fénix Lab','???? Pago registrado por $15.000,00 vía [Binance Pay QR]. Acumulado: $15.000,00 / $50.000,00','2026-11-16 09:39:38',38),(39,'556981',16,'Cliente','Cliente Fénix Lab','? Pago registrado por $60.000,00 vía [Transferencia Bancaria]. Acumulado: $60.000,00 / $60.000,00','2026-11-16 16:20:33',39),(40,'FX-B378DD',2,'Tecnico','Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312)','¡Hola! Soy Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312). Recibí tu orden #FX-B378DD para tu Consola (PS4 / PS5 / Xbox) Sony PlayStation (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','2026-11-16 17:55:40',40),(41,'FX-B74A47',2,'Tecnico','Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312)','¡Hola! Soy Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312). Recibí tu orden #FX-B74A47 para tu Consola (PS4 / PS5 / Xbox) Sony PlayStation (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','2026-11-16 17:55:43',41),(42,'FX-AEE107',2,'Tecnico','Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208)','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-AEE107 para tu Notebook / Laptop Gamer Apple / iPhone (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','2026-11-16 18:01:28',42),(43,'FX-7079A7',2,'Tecnico','Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208)','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-7079A7 para tu Notebook / Laptop Gamer Apple / iPhone (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','2026-11-16 18:01:31',43),(44,'415178',4,'Tecnico','Técnico Fénix Lab','Buenos dias','2026-11-17 08:04:21',44),(45,'104544',16,'Cliente','Cliente Fénix Lab','? Pago registrado por $1,00 vía [Transferencia Bancaria]. Acumulado: $15.001,00 / $50.000,00','2026-11-17 21:37:29',45),(46,'104544',16,'Cliente','Cliente Fénix Lab','? Pago registrado por $1,00 vía [Binance Pay] (Ref: Tarjeta terminada en 6484). Acumulado: $15.002,00 / $50.000,00','2026-11-17 21:38:29',46),(47,'104544',16,'Cliente','Cliente Fénix Lab','? Pago registrado por $1,00 vía [Mercado Pago]. Acumulado: $15.003,00 / $50.000,00','2026-11-17 21:38:50',47);
/*!40000 ALTER TABLE `mensajes_taller` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo`
--

DROP TABLE IF EXISTS `modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo` (
  `modelo_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`modelo_id`),
  KEY `fk_modelo_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_modelo_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo`
--

LOCK TABLES `modelo` WRITE;
/*!40000 ALTER TABLE `modelo` DISABLE KEYS */;
INSERT INTO `modelo` VALUES (1,'Galaxy A04e / Cloud III Wireless',1),(2,'Galaxy A12 / RTX 4060 Ventus 2X',1),(3,'Galaxy A54 5G / G Pro X Superlight',1),(4,'Moto G22 / Ryzen 7 5700X',1),(5,'Moto G52 / 990 PRO NVMe M.2',1),(6,'Redmi Note 12 / MagSafe 3-in-1',1),(7,'iPhone 11',1),(8,'iPhone 13',1),(9,'PlayStation 4 Slim',1),(10,'PlayStation 5',1),(11,'Nintendo Switch V2',1),(12,'Xbox Series S',1),(13,'Inspiron 3515',1),(14,'ThinkPad E14',1),(15,'GeForce RTX 3060',1),(16,'Radeon RX 6700 XT',1),(17,'Smart TV 32\" HD',1),(18,'Smart TV 50\" 4K UHD',1);
/*!40000 ALTER TABLE `modelo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_equipos`
--

DROP TABLE IF EXISTS `modelo_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo_equipos` (
  `modelo_equipo_id` int(11) NOT NULL AUTO_INCREMENT,
  `modelo_equipos` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`modelo_equipo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_modelos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_equipos`
--

LOCK TABLES `modelo_equipos` WRITE;
/*!40000 ALTER TABLE `modelo_equipos` DISABLE KEYS */;
INSERT INTO `modelo_equipos` VALUES (1,'Galaxy A04e',1),(2,'Galaxy A11',1),(3,'iPhone 15 Pro Max',1),(4,'Galaxy S24 Ultra',1),(5,'GeForce RTX 4060',1),(6,'PlayStation 5',1),(7,'ROG Strix / TUF Gaming / Legion',1);
/*!40000 ALTER TABLE `modelo_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_proveedor`
--

DROP TABLE IF EXISTS `modelo_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo_proveedor` (
  `modelos_proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `modelo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`modelos_proveedor_id`),
  KEY `fk_modprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_modprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_proveedor`
--

LOCK TABLES `modelo_proveedor` WRITE;
/*!40000 ALTER TABLE `modelo_proveedor` DISABLE KEYS */;
INSERT INTO `modelo_proveedor` VALUES (1,'Pantalla OLED iPhone 13 Pro',1),(2,'Pantalla Redmi Note 11 4G',1),(3,'Módulo Display Moto G84 5G',1),(4,'Módulo Display Completo Galaxy A54 5G',1);
/*!40000 ALTER TABLE `modelo_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelos_equipo`
--

DROP TABLE IF EXISTS `modelos_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelos_equipo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_nombre` varchar(100) NOT NULL DEFAULT 'General',
  `marca_nombre` varchar(100) NOT NULL DEFAULT 'General',
  `nombre` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelos_equipo`
--

LOCK TABLES `modelos_equipo` WRITE;
/*!40000 ALTER TABLE `modelos_equipo` DISABLE KEYS */;
INSERT INTO `modelos_equipo` VALUES (1,'Smartphone / Celular','Apple / iPhone','iPhone 13 / 14 / 15 Pro Max'),(2,'Smartphone / Celular','Samsung','Galaxy S23 / S24 Ultra / Serie A'),(3,'Smartphone / Celular','Motorola','Moto Edge 40 / Moto G84'),(4,'Placa de Video (GPU)','NVIDIA GeForce','GeForce RTX 3060 / 3070 / 4060 / 4070'),(5,'Notebook / Laptop Gamer','ASUS ROG','ROG Strix / TUF Gaming / Lenovo Legion'),(6,'Consola (PS4 / PS5 / Xbox)','Sony PlayStation','PlayStation 5 / PlayStation 4 Pro / Xbox Series X'),(7,'PC de Escritorio','AMD Radeon','ROG Strix / TUF Gaming / Lenovo Legion'),(8,'Consola (PS4 / PS5 / Xbox)','Sony PlayStation','ROG Strix / TUF Gaming / Lenovo Legion'),(9,'Consola (PS4 / PS5 / Xbox)','Sony PlayStation','ROG Strix / TUF Gaming / Lenovo Legion'),(10,'Notebook / Laptop Gamer','Apple / iPhone','ROG Strix / TUF Gaming / Lenovo Legion'),(11,'Notebook / Laptop Gamer','Apple / iPhone','ROG Strix / TUF Gaming / Lenovo Legion');
/*!40000 ALTER TABLE `modelos_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_reparacion`
--

DROP TABLE IF EXISTS `notas_reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_reparacion` (
  `nota_id` int(11) NOT NULL AUTO_INCREMENT,
  `reparacion_orden_id` int(11) NOT NULL,
  `remitente` enum('tecnico','cliente','recepcion','comercio') NOT NULL DEFAULT 'tecnico',
  `mensaje` text NOT NULL,
  `tipo` varchar(20) DEFAULT 'texto',
  `archivo` varchar(255) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`nota_id`),
  KEY `fk_notas_reparacion_orden` (`reparacion_orden_id`),
  CONSTRAINT `fk_notas_reparacion_orden` FOREIGN KEY (`reparacion_orden_id`) REFERENCES `reparacion_orden` (`reparacion_orden_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_reparacion`
--

LOCK TABLES `notas_reparacion` WRITE;
/*!40000 ALTER TABLE `notas_reparacion` DISABLE KEYS */;
INSERT INTO `notas_reparacion` VALUES (1,1,'tecnico','hola amigo','texto',NULL,'2026-11-01 20:03:24'),(2,9,'tecnico','Hola wachin','texto',NULL,'2026-11-05 14:28:28'),(3,8,'tecnico','Holaaa','texto',NULL,'2026-11-06 02:22:40'),(4,8,'tecnico','Prueba','texto',NULL,'2026-11-06 02:27:37'),(5,8,'cliente','Holaaa','texto',NULL,'2026-11-06 02:28:07'),(6,21,'tecnico','Holaaa','texto',NULL,'2026-11-06 12:19:32'),(7,21,'cliente','Holaa','texto',NULL,'2026-11-06 12:21:36'),(8,21,'tecnico','Holis','texto',NULL,'2026-11-09 01:55:27'),(9,21,'tecnico','.','texto',NULL,'2026-11-09 02:04:16'),(10,21,'tecnico','.','texto',NULL,'2026-11-09 02:17:42'),(11,21,'tecnico','Archivo adjunto','imagen','chat_21_1794190859_3660.jpeg','2026-11-09 02:20:59'),(12,21,'tecnico','Archivo adjunto','video','chat_21_1794190884_3783.mp4','2026-11-09 02:21:24'),(13,21,'tecnico','Archivo adjunto','imagen','chat_21_1794191709_1314.jpeg','2026-11-09 02:35:09'),(14,21,'tecnico','Archivo adjunto','video','chat_21_1794191739_7121.mp4','2026-11-09 02:35:39'),(15,29,'cliente','El cliente ha realizado un pago de $25.000,00. Acumulado pagado: $25.000,00','texto',NULL,'2026-11-13 06:35:09'),(16,29,'cliente','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','texto',NULL,'2026-11-13 06:35:16'),(17,29,'cliente','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','texto',NULL,'2026-11-13 06:35:19'),(18,29,'cliente','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','texto',NULL,'2026-11-13 06:35:21'),(19,29,'cliente','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','texto',NULL,'2026-11-13 06:35:23'),(20,29,'cliente','El cliente ha realizado un pago de $49.873,00. Acumulado pagado: $50.000,00','texto',NULL,'2026-11-13 06:35:46'),(21,29,'cliente','Pago registrado por $49.873,00 vía [Debito]. Acumulado: $50.000,00 / $50.000,00','texto',NULL,'2026-11-13 06:51:45'),(22,30,'cliente','Pago registrado por $50.000,00 vía [Debito]. Acumulado: $50.000,00 / $50.000,00','texto',NULL,'2026-11-13 06:54:49'),(23,23,'tecnico','Holaaa','texto',NULL,'2026-11-13 21:57:28'),(24,30,'tecnico','Che vi q tu problema es el pin de carga','texto',NULL,'2026-11-13 23:07:53'),(25,35,'cliente','Pago registrado por $50.000,00 vía [Efectivo]. Acumulado: $50.000,00 / $50.000,00','texto',NULL,'2026-11-14 18:08:41'),(26,36,'tecnico','¡Hola! Soy Ing. Lucas Benítez (Mat. #FX-208). Recibí tu orden #FX-6EEC01 para tu PC de Escritorio AMD Radeon. Escribime por aquí cualquier consulta.','texto',NULL,'2026-11-10 20:31:26'),(27,36,'cliente','hola','texto',NULL,'2026-11-13 19:27:22'),(28,36,'tecnico','Hola Johan Daniel Gauna, recibí tu mensaje sobre la orden #FX-6EEC01 en la terminal del laboratorio. Estoy revisando los parámetros de tu equipo en bancada.','texto',NULL,'2026-11-13 19:27:22'),(29,36,'tecnico','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-6EEC01 para tu PC de Escritorio AMD Radeon (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Diagnóstico Integral de Hardware + Optimización Extrema\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','texto',NULL,'2026-11-10 23:31:26'),(30,36,'cliente','hola','texto',NULL,'2026-11-13 22:27:22'),(31,36,'tecnico','Hola Johan Daniel Gauna, recibí tu mensaje sobre la orden #FX-6EEC01 en la terminal del laboratorio. Estoy revisando los parámetros de tu equipo en bancada y te actualizo el informe por este mismo chat.','texto',NULL,'2026-11-13 22:27:22'),(32,30,'tecnico','Che vi q tu problema es el pin de carga','texto',NULL,'2026-11-14 02:07:53'),(33,35,'cliente','Pago registrado por $50.000,00 vía [Efectivo]. Acumulado: $50.000,00 / $50.000,00','texto',NULL,'2026-11-14 21:08:41'),(34,39,'tecnico','Hola buenos dias','texto',NULL,'2026-11-16 12:03:00'),(35,53,'cliente','Holaa','texto',NULL,'2026-11-16 12:38:20'),(36,53,'cliente','Como esta mi celular','texto',NULL,'2026-11-16 12:38:34'),(37,53,'tecnico','Bien, ya lo estamos reparando','texto',NULL,'2026-11-16 12:39:10'),(38,53,'cliente','???? Pago registrado por $15.000,00 vía [Binance Pay QR]. Acumulado: $15.000,00 / $50.000,00','texto',NULL,'2026-11-16 12:39:38'),(39,54,'cliente','? Pago registrado por $60.000,00 vía [Transferencia Bancaria]. Acumulado: $60.000,00 / $60.000,00','texto',NULL,'2026-11-16 19:20:33'),(40,59,'tecnico','¡Hola! Soy Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312). Recibí tu orden #FX-B378DD para tu Consola (PS4 / PS5 / Xbox) Sony PlayStation (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','texto',NULL,'2026-11-16 20:55:40'),(41,60,'tecnico','¡Hola! Soy Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312). Recibí tu orden #FX-B74A47 para tu Consola (PS4 / PS5 / Xbox) Sony PlayStation (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','texto',NULL,'2026-11-16 20:55:43'),(42,61,'tecnico','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-AEE107 para tu Notebook / Laptop Gamer Apple / iPhone (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','texto',NULL,'2026-11-16 21:01:28'),(43,62,'tecnico','¡Hola! Soy Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208). Recibí tu orden #FX-7079A7 para tu Notebook / Laptop Gamer Apple / iPhone (ROG Strix / TUF Gaming / Lenovo Legion). Ya tengo registrada la falla (\'Mantenimiento de Notebook / GPU / Consola\'). Escribime por aquí cualquier consulta sobre la reparación o el envío.','texto',NULL,'2026-11-16 21:01:31'),(44,67,'tecnico','Buenos dias','texto',NULL,'2026-11-17 11:04:21'),(45,53,'cliente','? Pago registrado por $1,00 vía [Transferencia Bancaria]. Acumulado: $15.001,00 / $50.000,00','texto',NULL,'2026-11-18 00:37:29'),(46,53,'cliente','? Pago registrado por $1,00 vía [Binance Pay] (Ref: Tarjeta terminada en 6484). Acumulado: $15.002,00 / $50.000,00','texto',NULL,'2026-11-18 00:38:29'),(47,53,'cliente','? Pago registrado por $1,00 vía [Mercado Pago]. Acumulado: $15.003,00 / $50.000,00','texto',NULL,'2026-11-18 00:38:50');
/*!40000 ALTER TABLE `notas_reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_cliente`
--

DROP TABLE IF EXISTS `notificaciones_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_cliente` (
  `notificacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `reparacion_orden_id` int(11) DEFAULT NULL,
  `tipo` varchar(40) NOT NULL DEFAULT 'mensaje',
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notificacion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_cliente`
--

LOCK TABLES `notificaciones_cliente` WRITE;
/*!40000 ALTER TABLE `notificaciones_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_leidas_usuario`
--

DROP TABLE IF EXISTS `notificaciones_leidas_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_leidas_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `notif_clave` varchar(140) NOT NULL,
  `fecha_leida` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_notif` (`usuario_id`,`notif_clave`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_leidas_usuario`
--

LOCK TABLES `notificaciones_leidas_usuario` WRITE;
/*!40000 ALTER TABLE `notificaciones_leidas_usuario` DISABLE KEYS */;
INSERT INTO `notificaciones_leidas_usuario` VALUES (1,16,'ord-diag-19','2026-11-17 21:28:57'),(2,16,'ord-envio-19','2026-11-17 21:29:06'),(3,16,'ord-sena-19-15000','2026-11-17 21:29:07'),(4,337,'ord-envio-55','2026-11-17 21:29:31'),(5,337,'ord-diag-55','2026-11-17 21:29:31'),(6,337,'ord-presup-55-50000','2026-11-17 21:29:32');
/*!40000 ALTER TABLE `notificaciones_leidas_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paises`
--

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paises` (
  `pais_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `codigo_iso` varchar(5) DEFAULT 'AR',
  `prefijo_tel` varchar(10) DEFAULT '+54',
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`pais_id`),
  KEY `fk_paises_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_paises_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paises`
--

LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
INSERT INTO `paises` VALUES (1,'Argentina','AR','+54',1),(2,'Paraguay','PY','+595',1),(3,'Brasil','BR','+55',1),(4,'Uruguay','UY','+598',1),(5,'Chile','CL','+56',1),(6,'Estados Unidos','US','+1',1),(7,'España','ES','+34',1);
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos_sucursales`
--

DROP TABLE IF EXISTS `pedidos_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos_sucursales` (
  `pedidos_sucursales_id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_nombre` varchar(120) DEFAULT 'Repuesto / Componente General',
  `cantidad_solicitada` int(11) NOT NULL DEFAULT 5,
  `sucursal_destino` varchar(100) DEFAULT 'Sucursal Central Av. 25 de Mayo',
  `solicitado_por` varchar(80) DEFAULT 'Comercio / Taller',
  `estado_pedido` varchar(40) NOT NULL DEFAULT 'Pendiente de Paquetería',
  `codigo_seguridad_paquete` varchar(20) DEFAULT NULL,
  `fecha_pedido` date DEFAULT NULL,
  `hora_pedido` datetime DEFAULT current_timestamp(),
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`pedidos_sucursales_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_pedidos_suc_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_sucursales`
--

LOCK TABLES `pedidos_sucursales` WRITE;
/*!40000 ALTER TABLE `pedidos_sucursales` DISABLE KEYS */;
INSERT INTO `pedidos_sucursales` VALUES (1,'Módulo OLED Original iPhone 14 Pro Max',4,'Sucursal Central Av. 25 de Mayo','Comercio','En Despacho Paquetería','PKG-9041','2026-11-01','2026-11-01 23:27:32',1),(2,'Pads Térmicos Gelid Extreme 12W/mK (Pack)',10,'Laboratorio Microelectrónica','Técnico','Pendiente de Paquetería','PKG-3812','2026-11-10','2026-11-10 22:16:03',1),(5,'Reposición General Sucursal',5,'Sucursal Central Av. 25 de Mayo','Comercio','Verificado','PKG-5001','2026-11-01','2026-11-01 23:41:23',1),(18,'Reposición para Llavero Pou',30,'Sucursal Central Av. 25 de Mayo','Comercio','Verificado','PKG-1801','2026-11-13','2026-11-13 06:39:07',1),(21,'Reposición para Llavero Pou',10,'Sucursal Central Av. 25 de Mayo','Comercio','Verificado','PKG-2101','2026-11-13','2026-11-13 06:49:02',1);
/*!40000 ALTER TABLE `pedidos_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_variantes_color`
--

DROP TABLE IF EXISTS `producto_variantes_color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_variantes_color` (
  `variante_id` int(11) NOT NULL AUTO_INCREMENT,
  `productos_id` int(11) NOT NULL,
  `color_nombre` varchar(60) NOT NULL,
  `color_hex` varchar(16) NOT NULL DEFAULT '#1E293B',
  `css_filter` varchar(120) NOT NULL DEFAULT 'none',
  `img_frontal` varchar(255) NOT NULL,
  `img_lateral` varchar(255) NOT NULL,
  `img_trasero` varchar(255) NOT NULL,
  `img_macro` varchar(255) NOT NULL,
  `stock_variante` int(11) NOT NULL DEFAULT 8,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`variante_id`),
  KEY `idx_var_prod` (`productos_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_variantes_color`
--

LOCK TABLES `producto_variantes_color` WRITE;
/*!40000 ALTER TABLE `producto_variantes_color` DISABLE KEYS */;
INSERT INTO `producto_variantes_color` VALUES (31,1,'Negro','#0F172A','none','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png',8,1,1),(32,1,'Rojo','#DC2626','none','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png',5,0,1),(33,1,'Blanco','#F8FAFC','none','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png','prod_1794957634_360.png',3,0,1),(34,2,'Negro','#0F172A','none','prod_1794957584_427.png','prod_1794957584_427.png','prod_1794957584_427.png','prod_1794957584_427.png',5,1,1),(35,2,'Blanco','#F8FAFC','none','prod_1794957584_427.png','prod_1794957584_427.png','prod_1794957584_427.png','prod_1794957584_427.png',3,0,1),(36,3,'Original AMD','#EA580C','none','prod_1794957684_154.jpeg','prod_1794957684_154.jpeg','prod_1794957684_154.jpeg','prod_1794957684_154.jpeg',12,1,1),(37,4,'Negro','#0F172A','none','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg',9,1,1),(38,4,'Blanco','#F8FAFC','none','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg',6,0,1),(39,4,'Rojo','#DC2626','none','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg','prod_1794957653_118.jpeg',5,0,1),(40,5,'Negro','#0F172A','none','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png',7,1,1),(41,5,'Blanco','#F8FAFC','none','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png',5,0,1),(42,5,'Azul','#2563EB','none','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png','prod_1794957619_158.png',3,0,1),(43,6,'Negro','#0F172A','none','prod_1794957601_430.png','prod_1794957601_430.png','prod_1794957601_430.png','prod_1794957601_430.png',14,1,1),(44,6,'Blanco','#F8FAFC','none','prod_1794957601_430.png','prod_1794957601_430.png','prod_1794957601_430.png','prod_1794957601_430.png',8,0,1),(45,7,'Negro','#0F172A','none','prod_1794957665_122.png','prod_1794957665_122.png','prod_1794957665_122.png','prod_1794957665_122.png',5,1,1),(46,8,'Original AMD','#EA580C','none','prod_1794957541_818.jpeg','prod_1794957541_818.jpeg','prod_1794957541_818.jpeg','prod_1794957541_818.jpeg',10,1,1),(47,9,'Negro','#0F172A','none','prod_1794957525_666.jpeg','prod_1794957525_666.jpeg','prod_1794957525_666.jpeg','prod_1794957525_666.jpeg',18,1,1),(48,10,'Negro','#0F172A','none','prod_1794957506_291.png','prod_1794957506_291.png','prod_1794957506_291.png','prod_1794957506_291.png',9,1,1),(49,10,'Blanco','#F8FAFC','none','prod_1794957506_291.png','prod_1794957506_291.png','prod_1794957506_291.png','prod_1794957506_291.png',5,0,1),(50,11,'Negro','#0F172A','none','prod_1794957488_318.png','prod_1794957488_318.png','prod_1794957488_318.png','prod_1794957488_318.png',7,1,1),(51,12,'Negro','#0F172A','none','prod_1794957474_142.png','prod_1794957474_142.png','prod_1794957474_142.png','prod_1794957474_142.png',6,1,1),(52,13,'Negro','#0F172A','none','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png',7,1,1),(53,13,'Blanco','#F8FAFC','none','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png','uploads/productos/microfono_negro_frontal.png',4,0,1),(54,14,'Blanco','#F8FAFC','none','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg',9,1,1),(55,14,'Negro','#0F172A','none','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg',6,0,1),(56,14,'Rojo','#DC2626','none','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg','prod_1794957431_233.jpeg',4,0,1),(57,15,'Negro','#0F172A','none','prod_1794957416_615.png','prod_1794957416_615.png','prod_1794957416_615.png','prod_1794957416_615.png',18,1,1),(58,15,'Blanco','#F8FAFC','none','prod_1794957416_615.png','prod_1794957416_615.png','prod_1794957416_615.png','prod_1794957416_615.png',10,0,1),(59,16,'Original','#0284C7','none','prod_1794957395_319.png','prod_1794957395_319.png','prod_1794957395_319.png','prod_1794957395_319.png',0,1,1);
/*!40000 ALTER TABLE `producto_variantes_color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `productos_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `especificaciones` varchar(180) DEFAULT NULL,
  `categoria_productos_id` int(11) DEFAULT 1,
  `marca_id` int(11) DEFAULT 1,
  `modelo_id` int(11) DEFAULT 1,
  `codigo_producto_id` int(11) DEFAULT NULL,
  `precio_costo` decimal(15,2) DEFAULT 0.00,
  `precio_venta` decimal(15,2) DEFAULT 0.00,
  `descuento_porcentaje` int(11) NOT NULL DEFAULT 20,
  `stock_disponible` int(11) NOT NULL DEFAULT 10,
  `stock_minimo` int(11) NOT NULL DEFAULT 3,
  `puntos_otorgados` int(11) NOT NULL DEFAULT 100,
  `es_destacado` tinyint(1) NOT NULL DEFAULT 1,
  `es_oferta` tinyint(1) NOT NULL DEFAULT 1,
  `vendidos` int(11) NOT NULL DEFAULT 120,
  `estado_general_id` int(11) DEFAULT 1,
  `fecha_ingreso` date DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `garantia` tinyint(4) DEFAULT 12,
  `observaciones` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`productos_id`),
  KEY `categoria_productos_id_idx` (`categoria_productos_id`),
  KEY `marca_id_idx` (`marca_id`),
  KEY `modelo_id_idx` (`modelo_id`),
  KEY `codigo_producto_id_idx` (`codigo_producto_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_prod_cat` FOREIGN KEY (`categoria_productos_id`) REFERENCES `categorias_productos` (`categoria_productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_codigo` FOREIGN KEY (`codigo_producto_id`) REFERENCES `codigo_productos` (`codigo_producto_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`marca_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_modelo` FOREIGN KEY (`modelo_id`) REFERENCES `modelo` (`modelo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Auriculares Gamer HyperX Cloud II Wireless 7.1','Sonido envolvente 7.1 virtual, micrófono desmontable con cancelación de ruido y estructura de aluminio.','7.1 SURROUND · INALÁMBRICO · BATERÍA 30HS',1,1,1,2,0.00,92000.00,20,32,3,920,1,1,210,1,'2026-11-01','prod_1794957634_360.png',12,'Destacado Fenix Lab'),(2,'Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6','Arquitectura NVIDIA Ada Lovelace con DLSS 3, Ray Tracing de 3ra generación y doble cooler Torx Fan 4.0.','8GB GDDR6 · DLSS 3 · RAY TRACING · PCIe 4.0',2,2,2,NULL,0.00,485000.00,15,16,3,4850,1,1,185,1,'2026-11-01','prod_1794957584_427.png',12,''),(3,'Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz','Procesador desbloqueado para gaming y streaming profesional sobre socket AM4 con 36MB de caché.','8 NÚCLEOS · 16 HILOS · 4.6GHZ BOOST · AM4',3,3,3,NULL,0.00,265000.00,0,10,3,2650,1,0,164,1,'2026-11-01','prod_1794957684_154.jpeg',12,''),(4,'Mouse Gamer Logitech G Pro X Superlight Wireless 25K DPI','Ultraligero de menos de 63 gramos con sensor HERO 25K y tecnología inalámbrica LIGHTSPEED.','SENSOR 25K · 63 GRAMOS · LIGHTSPEED',1,1,1,NULL,0.00,84500.00,25,19,3,845,1,1,195,1,'2026-11-01','prod_1794957653_118.jpeg',12,''),(5,'Teclado Mecánico Custom RGB Hot-Swap Aluminio CNC','Switches mecánicos pre-lubricados, keycaps PBT doble inyección y estructura gasket mount.','HOT-SWAP · PBT · 1000HZ POLLING · RGB',1,1,1,NULL,0.00,78500.00,30,15,3,785,1,1,178,1,'2026-11-01','prod_1794957619_158.png',12,''),(6,'Estación de Carga Rápida 3 en 1 Magnética 15W Qi2','Cargador magnético simultáneo para Smartphone, Auriculares y Smartwatch con protección térmica.','CARGA RÁPIDA 15W · MAGSAFE · USB-C',6,6,6,NULL,0.00,49900.00,25,10,3,499,1,1,253,1,'2026-11-01','prod_1794957601_430.png',12,''),(7,'Placa de Video ASUS ROG Strix GeForce RTX 4070 Super 12GB','Triple ventilador Axial-tech, iluminación ARGB Aura Sync y máximo rendimiento en 1440p y 4K.','12GB GDDR6X · TRIPLE FAN · DLSS 3.5',2,2,2,NULL,0.00,890000.00,10,5,3,8900,1,1,95,1,'2026-11-01','prod_1794957665_122.png',12,''),(8,'Procesador AMD Ryzen 5 7600X 5.3GHz Socket AM5 DDR5','Nueva generación Zen 4 de altísima velocidad por núcleo para plataformas DDR5 y PCIe 5.0.','6 NÚCLEOS · 12 HILOS · 5.3GHZ · SOCKET AM5',3,3,3,NULL,0.00,310000.00,15,10,3,3100,1,1,112,1,'2026-11-01','prod_1794957541_818.jpeg',12,''),(9,'Disco Sólido SSD NVMe M.2 Kingston Fury Renegade 1TB PCIe 4.0','Velocidad extrema de lectura de hasta 7.300 MB/s con disipador térmico de grafeno y aluminio.','1TB NVME · 7300 MB/S · PS5 COMPATIBLE',4,4,4,NULL,0.00,118000.00,20,9,3,1180,1,1,160,1,'2026-11-01','prod_1794957525_666.jpeg',12,''),(10,'Memoria RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz','Kit dual channel de baja latencia CL30 con perfiles AMD EXPO e Intel XMP 3.0 e iluminación dinámica.','32GB (2X16GB) · DDR5 6000MHZ · RGB CL30',4,4,4,NULL,0.00,154000.00,0,14,3,1540,1,0,125,1,'2026-11-01','prod_1794957506_291.png',12,''),(11,'Módulo Pantalla Original Samsung Galaxy S23 Ultra Dynamic AMOLED 2X','Repuesto oficial Service Pack con marco incluido, lector ultrasónico de huella y 120Hz.','SERVICE PACK · 120HZ · CON MARCO ORIGINAL',5,5,5,NULL,0.00,215000.00,15,7,3,2150,1,1,88,1,'2026-11-01','prod_1794957488_318.png',12,''),(12,'Pantalla OLED Super Retina XDR para iPhone 14 Pro Max Original','Panel OLED de alta precisión compatible con ProMotion 120Hz, True Tone y Dynamic Island.','OLED XDR · 120HZ PROMOTION · GARANTÍA LAB',5,5,5,NULL,0.00,240000.00,0,6,3,2400,1,0,92,1,'2026-11-01','prod_1794957474_142.png',12,''),(13,'Micrófono Condenser USB HyperX QuadCast S RGB Streaming','Cuatro patrones polares seleccionables, montura antivibración integrada y sensor táctil de mute.','4 PATRONES · FILTRO POP · RGB DINÁMICO',1,1,1,NULL,0.00,132000.00,25,11,3,1320,1,1,145,2,'2026-11-01','uploads/productos/microfono_negro_frontal.png',12,NULL),(14,'Joystick Inalámbrico Sony DualSense PS5 / PC Bluetooth','Respuesta háptica inmersiva, gatillos adaptativos dinámicos y batería recargable por USB-C.','HÁPTICO · GATILLOS ADAPTATIVOS · PS5 & PC',1,1,1,NULL,0.00,98000.00,20,19,3,980,1,1,205,1,'2026-11-01','prod_1794957431_233.jpeg',12,''),(15,'Cargador GaN 65W Ultra Rápido 3 Puertos USB-C PD + Cable Trenzado','Tecnología de nitruro de galio (GaN) apta para notebooks, consolas portátiles, iPhone y Samsung.','65W GAN · 2X USB-C + USB-A · CABLE 2M',6,6,6,NULL,0.00,36500.00,30,28,3,365,1,1,190,1,'2026-11-01','prod_1794957416_615.png',12,''),(16,'Kit Mantenimiento Térmico Pro: Pasta Arctic MX-6 + Pads Gelid','Jeringa de 4g de alta conductividad térmica + set de thermal pads para GPUs, PS4/PS5 y Notebooks.','ARCTIC MX-6 4G · PADS 1.0MM / 1.5MM · NO CONDUCTIVA',6,6,6,NULL,0.00,24900.00,15,5,3,249,1,1,286,1,'2026-11-01','prod_1794957395_319.png',12,''),(78,'Pantalla Completa Samsung A04e','Módulo de display y táctil de alta calidad','DISPLAY + TÁCTIL · SAMSUNG A04E',1,2,1,1,0.00,25000.00,0,5,2,250,1,0,15,1,'2026-01-15','prod_1794957359_701.jpeg',1,'Original'),(79,'Funda Anti-golpes Moto G22','Funda de silicona reforzada en esquinas','SILICONA REFORZADA · MOTO G22',2,2,4,2,0.00,4500.00,0,12,3,45,0,0,20,1,'2026-01-16','prod_1794957329_741.jpeg',0,'Nuevo'),(80,'Memoria RAM 8GB DDR4 Kingston','Memoria para PC de escritorio 3200MHz','8GB DDR4 · 3200MHZ · KINGSTON',10,11,15,3,0.00,130000.00,0,8,2,1300,1,0,10,1,'2026-01-18','prod_1794957312_944.jpeg',1,'Garantía 6 meses'),(81,'Mando Inalámbrico PS4','Control compatible con vibración y batería recargable','INALÁMBRICO · DOBLE VIBRACIÓN · PS4',5,3,9,4,0.00,45000.00,0,4,1,450,1,0,18,1,'2026-01-20','prod_1794957300_300.jpeg',1,'Genérico premium'),(82,'Disco SSD 480GB Western Digital','Unidad de estado sólido SATA III 2.5\"','480GB SSD · SATA III 2.5\"',12,12,16,5,0.00,180000.00,0,10,3,1800,1,0,25,1,'2026-01-22','prod_1794957288_152.jpeg',1,'Sellado en blister'),(83,'Teclado Mecánico RGB Logitech','Teclado gamer con retroiluminación y switches mecánicos','MECÁNICO · RGB · ESPAÑOL LA',4,13,15,6,0.00,65000.00,0,6,2,650,1,0,12,1,'2026-01-23','prod_1794957272_553.jpeg',1,'Español LA'),(84,'Vidrio Templado Xiaomi Redmi Note 12','Protector de pantalla 9H alta resistencia','TEMPLADO 9H · REDMI NOTE 12',8,1,6,7,0.00,3500.00,0,20,5,35,0,0,40,1,'2026-01-24','prod_1794957254_178.jpeg',0,'Incluye kit de limpieza'),(85,'Placa Madre ASUS Prime H510M','Motherboard LGA 1200 para procesadores Intel','LGA 1200 · PCIe 4.0 · HDMI',11,7,15,8,0.00,145000.00,0,3,1,1450,1,0,8,1,'2026-01-25','prod_1794957236_949.jpeg',1,'Caja original'),(86,'Cargador Rápido Tipo C 33W','Cargador de pared de carga rápida universal','33W TURBO · USB TIPO C',6,1,6,9,0.00,22000.00,0,15,4,220,1,0,30,1,'2026-01-26','prod_1794957222_425.jpeg',1,'Incluye cable'),(87,'Procesador Intel Core i3 10100F','CPU de 4 núcleos y 8 hilos LGA 1200','4 NÚCLEOS · 8 HILOS · LGA 1200',13,15,15,10,0.00,115000.00,0,5,2,1150,1,0,14,1,'2026-01-27','prod_1794957204_207.jpeg',1,'Con cooler incluido'),(88,'Mando Inalámbrico Xbox Series X/S','Control ergonómico compatible con PC y consola','XBOX SERIES X/S · BLUETOOTH · PC',5,5,12,1,0.00,78000.00,0,5,2,780,1,0,22,1,'2026-01-28','prod_1794957188_466.jpeg',1,'Color negro original'),(89,'Pantalla Completa Moto G52 OLED','Módulo de pantalla táctil y display alta definición','MÓDULO OLED · MOTO G52',1,2,5,2,0.00,42000.00,0,3,1,420,1,0,9,1,'2026-01-28','prod_1794957170_889.png',1,'Calidad premium'),(90,'Mouse Gamer Inalámbrico Logitech G305','Mouse óptico de alta precisión para gaming','LIGHTSPEED · 12000 DPI · G305',7,13,15,3,0.00,45000.00,0,7,2,450,1,0,19,1,'2026-01-29','prod_1794957146_511.jpeg',1,'Tecnología Lightspeed'),(91,'Smart TV 32\" LED HD','Televisor LED alta definición con sintonizador digital','32 PULGADAS · HD · SMART TV',18,6,17,4,0.00,210000.00,0,4,1,2100,1,0,5,1,'2026-01-29','prod_1794957132_522.jpeg',1,'Incluye control remoto'),(92,'Cable HDMI mallado 2 metros','Cable de alta velocidad compatible con 4K y 60Hz','HDMI 2.0 · 4K 60HZ · 2 METROS',4,3,15,5,0.00,8500.00,0,15,5,85,0,0,35,1,'2026-01-30','prod_1794957118_432.jpeg',0,'Fichas doradas'),(93,'Batería de Repuesto iPhone 13','Batería de alta capacidad para reemplazo interno','CAPACIDAD 100% · IPHONE 13',8,2,8,6,0.00,32000.00,0,4,1,320,1,0,11,1,'2026-01-30','prod_1794957106_429.jpeg',1,'100% salud inicial'),(94,'Llavero Pou','Llaverito del personaje Pou','ACCESORIO COLECCIONABLE',3,1,1,2,0.00,500.00,0,15,5,5,0,0,50,1,'2026-01-10','prod_1794957088_725.jpeg',0,'Re facherito'),(101,'Auriculares Inalámbricos HyperX Cloud III 7.1 Studio','Sonido espacial 7.1 de alta fidelidad con cancelación activa de ruido, chasis de aluminio anodizado y micrófono desmontable con filtro LED.','7.1 SURROUND · ANC · 30H BATERÍA',1,1,1,NULL,0.00,92000.00,30,10,3,920,1,1,143,1,'2026-11-10','prod_1794957076_573.jpeg',12,''),(102,'Placa de Video MSI GeForce RTX 4060 Ventus 2X 8GB GDDR6','Arquitectura NVIDIA Ada Lovelace con Ray Tracing de 3ra generación y DLSS 3. Doble ventilador TORX Fan 4.0 silencioso certificado por Fenix Lab.','RAY TRACING · 8GB GDDR6 · DLSS 3.0',2,1,1,NULL,0.00,485000.00,25,8,3,4850,1,1,120,1,'2026-11-10','prod_1794957057_247.png',12,''),(103,'Mouse Gamer Logitech G Pro X Superlight Wireless 25K DPI','Diseño competitivo ultraligero de 63g con sensor óptico HERO 25K de precisión submicrónica y tecnología inalámbrica LIGHTSPEED 1ms.','SENSOR 25K · 63 GRAMOS · LIGHTSPEED',1,1,1,NULL,0.00,84500.00,20,14,3,845,1,1,120,1,'2026-11-10','prod_1794957039_787.jpeg',12,''),(104,'Procesador AMD Ryzen 7 5700X 8 Núcleos / 16 Hilos 4.6GHz AM4','8 núcleos desbloqueados para gaming competitivo, streaming y renderizado con arquitectura Zen 3 de alta eficiencia térmica.','8 NÚCLEOS · 16 HILOS · SOCKET AM4',3,1,1,NULL,0.00,265000.00,22,10,3,2650,1,1,120,1,'2026-11-10','prod_1794957016_668.jpeg',12,''),(105,'Teclado Mecánico Custom RGB Hot-Swap Aluminio CNC','Switches mecánicos pre-lubricados, keycaps PBT doble inyección y estructura gasket mount con iluminación ARGB direccionable.','HOT-SWAP · PBT · 1000HZ POLLING',1,1,1,NULL,0.00,78500.00,35,12,3,785,1,1,120,1,'2026-11-10','prod_1794956997_190.png',12,''),(106,'Estación de Carga Rápida 3 en 1 Magnética 15W Qi2','Cargador magnético simultáneo para Smartphone, Auriculares y Smartwatch con protección contra sobretensión y LED indicador.','CARGA RÁPIDA 15W · MAGSAFE · USB-C',6,1,1,NULL,0.00,49900.00,30,0,3,499,1,1,144,1,'2026-11-10','prod_1794956978_676.png',12,'');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(100) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `telefono_id` int(11) DEFAULT NULL,
  `tipo_proveedor_id` int(11) DEFAULT NULL,
  `marcas_proveedor_id` int(11) DEFAULT NULL,
  `modelos_proveedor_id` int(11) DEFAULT NULL,
  `sitio_web_id` int(11) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  `pais_id` int(11) DEFAULT 1,
  PRIMARY KEY (`proveedor_id`),
  KEY `direccion_id_idx` (`direccion_id`),
  KEY `telefono_id_idx` (`telefono_id`),
  KEY `tipo_proveedor_id_idx` (`tipo_proveedor_id`),
  KEY `marcas_proveedor_id_idx` (`marcas_proveedor_id`),
  KEY `modelos_proveedor_id_idx` (`modelos_proveedor_id`),
  KEY `sitio_web_id_idx` (`sitio_web_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_proveedores_paises` (`pais_id`),
  CONSTRAINT `fk_prov_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_marca` FOREIGN KEY (`marcas_proveedor_id`) REFERENCES `marcas_proveedor` (`marcas_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_modelo` FOREIGN KEY (`modelos_proveedor_id`) REFERENCES `modelo_proveedor` (`modelos_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_tel` FOREIGN KEY (`telefono_id`) REFERENCES `telefonos` (`telefono_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_tipo` FOREIGN KEY (`tipo_proveedor_id`) REFERENCES `tipo_proveedor` (`tipo_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_web` FOREIGN KEY (`sitio_web_id`) REFERENCES `sitios_web_proveedor` (`sitios_web_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_proveedores_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provincias`
--

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provincias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pais_id` int(11) DEFAULT 1,
  `nombre` varchar(100) NOT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_provincias_estado_general_idx` (`estado_general_id`),
  KEY `fk_provincias_paises` (`pais_id`),
  CONSTRAINT `fk_provincias_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_provincias_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincias`
--

LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
INSERT INTO `provincias` VALUES (1,1,'Formosa',1),(2,1,'Chaco',1),(3,1,'Corrientes',1),(4,1,'Formosa',1),(5,1,'Chaco',1),(6,1,'Misiones',1),(7,1,'Buenos Aires',1),(8,1,'Salta',1),(9,1,'Tucumán',1),(10,1,'Santiago del Estero',1),(11,1,'Córdoba',1);
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puntos_usuario`
--

DROP TABLE IF EXISTS `puntos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntos_usuario` (
  `puntos_usuario_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT 350,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`puntos_usuario_id`),
  KEY `fk_puntos_estado_general_idx` (`estado_general_id`),
  KEY `fk_puntos_usuario_id_idx` (`usuario_id`),
  CONSTRAINT `fk_puntos_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_puntos_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos_usuario`
--

LOCK TABLES `puntos_usuario` WRITE;
/*!40000 ALTER TABLE `puntos_usuario` DISABLE KEYS */;
INSERT INTO `puntos_usuario` VALUES (1,2,5816,1),(2,5,350,1),(3,16,350,1);
/*!40000 ALTER TABLE `puntos_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recuperacion_cuentas`
--

DROP TABLE IF EXISTS `recuperacion_cuentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperacion_cuentas` (
  `recuperacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `destino_contacto` varchar(120) NOT NULL,
  `codigo_seis_digitos` varchar(10) NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`recuperacion_id`),
  KEY `idx_rec_usuario` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperacion_cuentas`
--

LOCK TABLES `recuperacion_cuentas` WRITE;
/*!40000 ALTER TABLE `recuperacion_cuentas` DISABLE KEYS */;
INSERT INTO `recuperacion_cuentas` VALUES (1,2,'johan.cliente@gmail.com','493269','2026-11-11 00:53:06',0,'2026-11-10 23:33:06');
/*!40000 ALTER TABLE `recuperacion_cuentas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reparacion`
--

DROP TABLE IF EXISTS `reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reparacion` (
  `reparacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `reparacion_orden_id` int(11) DEFAULT NULL COMMENT 'Vínculo directo con reparacion_orden de la App Móvil',
  `codigo_seguimiento` varchar(40) NOT NULL,
  `id_cliente` int(11) NOT NULL DEFAULT 2,
  `usuario_id` int(11) DEFAULT NULL,
  `tecnico_id` int(11) DEFAULT NULL,
  `servicios_id` int(11) DEFAULT NULL,
  `id_falla` int(11) DEFAULT NULL,
  `equipo` varchar(100) NOT NULL DEFAULT 'Smartphone / Celular',
  `marca` varchar(100) NOT NULL DEFAULT 'Samsung',
  `modelo` varchar(150) NOT NULL DEFAULT 'Galaxy Serie A',
  `falla_reportada` text NOT NULL,
  `imagenes_dispositivo` text DEFAULT NULL,
  `comprobante_pago_img` varchar(255) DEFAULT NULL,
  `metodo_envio` varchar(80) DEFAULT 'Retiro Cadete GPS',
  `direccion_logistica` text DEFAULT NULL,
  `distancia_km` decimal(6,2) DEFAULT 0.00,
  `coordenadas_gps` varchar(120) DEFAULT NULL,
  `codigo_envio_logistica` varchar(80) DEFAULT NULL,
  `metodo_pago` varchar(60) DEFAULT 'Mercado Pago',
  `referencia_pago` varchar(150) DEFAULT NULL,
  `costo_reparacion_base` decimal(12,2) NOT NULL DEFAULT 15000.00,
  `costo_envio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cupon_codigo` varchar(40) DEFAULT NULL,
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `costo_estimado` decimal(12,2) NOT NULL DEFAULT 15000.00,
  `costo_reparacion` decimal(12,2) NOT NULL DEFAULT 15000.00,
  `modalidad_pago` varchar(40) NOT NULL DEFAULT 'Contado',
  `cantidad_cuotas` int(11) NOT NULL DEFAULT 1,
  `porcentaje_interes` decimal(5,2) NOT NULL DEFAULT 0.00,
  `monto_cuota` decimal(12,2) NOT NULL DEFAULT 15000.00,
  `tarjeta_usada` varchar(120) DEFAULT NULL,
  `estado_pago` varchar(50) NOT NULL DEFAULT 'Pagado / Verificado',
  `estado` varchar(60) NOT NULL DEFAULT 'Pendiente - En Revisión Técnica',
  `estado_envio` varchar(100) NOT NULL DEFAULT 'Logística Activa (No cancelable)',
  `tecnico_asignado` varchar(140) DEFAULT 'Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',
  `diagnostico_tecnico` text DEFAULT NULL,
  `detalles_reparacion` text DEFAULT NULL,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_entrega` date DEFAULT NULL,
  `codigo_seguridad_entrega` varchar(15) DEFAULT 'PIN-8492',
  PRIMARY KEY (`reparacion_id`),
  KEY `idx_rep_codigo` (`codigo_seguimiento`),
  KEY `idx_rep_cliente` (`id_cliente`),
  KEY `idx_rep_orden_id` (`reparacion_orden_id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reparacion`
--

LOCK TABLES `reparacion` WRITE;
/*!40000 ALTER TABLE `reparacion` DISABLE KEYS */;
INSERT INTO `reparacion` VALUES (1,36,'FX-6EEC01',2,2,9,5,NULL,'PC de Escritorio','AMD Radeon','ROG Strix / TUF Gaming / Lenovo Legion (S/N: 123)','Diagnóstico Integral de Hardware + Optimización Extrema — Obs: hola','uploads/dispositivos/eq_6af3a94e31d54_0.png',NULL,'Envío a Domicilio por Paquetería','Retiro por Cadete Fenix Lab en Domicilio | Dir: Vial, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, P3600IDK, Argentina (hola) | Dist: 2.45 km | Horario: Mañana (09:00 a 13:00 hs)',2.45,'-26.169294, -58.190476','ENV-E37A84','Binance Pay','',15000.00,2304.00,'DIAG20',3000.00,1.00,1.00,'Cuotas',6,0.00,0.17,'Credito Mastercard •••• 6666 (JOHAN GAUNA)','Pagado / Verificado','En Revisión en Bancada','Solicitado a Paquetería','Ing. Marcos Villalba (Técnico)','Recepción técnica asignada para: Diagnóstico Integral de Hardware + Optimización Extrema. Medición en bancada electrónica con instrumental de precisión.','1. Inspección bajo microscopio y medición de líneas principales de tensión.\n2. Diagnóstico específico sobre: Diagnóstico Integral de Hardware + Optimización Extrema.\n3. Garantía escrita oficial y seguimiento en vivo.',1,'2026-11-10 20:31:26','2026-11-10 23:31:26',NULL,'PIN-8492'),(2,29,'OR-00029',16,16,9,3,2,'Smartphone / Celular','Samsung','Galaxy A04e (Orden App #29)','C rompio aaa','orden_1794550736_3044.jpeg',NULL,'Envío a Domicilio por Paquetería','Formosa Capital',1.50,'-26.1849, -58.1731','ENV-OR29','Efectivo','',50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,50000.00,NULL,'Pagado / Verificado','En Revisión en Bancada','En preparación Paquetería','Juan Mbappe (Técnico)','Revisión de módulo y pin de carga en progreso.',NULL,1,'2026-11-13 06:18:56','2026-11-13 06:18:56',NULL,'395866'),(3,30,'OR-00030',16,16,9,3,3,'Smartphone / Celular','Samsung','Galaxy A04e (Orden App #30)','Bla',NULL,NULL,'Envío a Domicilio por Paquetería','Formosa Capital',1.50,'-26.1849, -58.1731','ENV-OR30','Efectivo','',50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,50000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Entregado','Juan Mbappe (Técnico)','Pin de carga reparado y entregado.',NULL,1,'2026-11-13 06:42:13','2026-11-13 06:42:13',NULL,'440899'),(4,34,'OR-00034',4,4,9,3,2,'Smartphone / Celular','Samsung','Galaxy A11 (Orden App #34)','Se cayo',NULL,NULL,'Retiro en Sucursal Central','Sucursal Central Fenix Lab',0.00,'-26.1849, -58.1731','SUC-OR34','Efectivo','',50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,50000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','En Sucursal','Ing. Marcos Villalba (Técnico)',NULL,NULL,1,'2026-11-14 17:58:27','2026-11-14 17:58:27',NULL,'766801'),(5,35,'OR-00035',16,16,9,3,2,'Smartphone / Celular','Samsung','Galaxy A11 (Orden App #35)','C cayo',NULL,NULL,'Envío a Domicilio por Paquetería','Formosa Capital',1.50,'-26.1849, -58.1731','ENV-OR35','Efectivo','',50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,50000.00,NULL,'Pagado / Verificado','Pendiente - En Revisión Técnica','Solicitado a Paquetería','Ing. Marcos Villalba (Técnico)',NULL,NULL,1,'2026-11-14 18:08:03','2026-11-14 18:08:03',NULL,'384819'),(37,37,'338230',20,20,9,6,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #37','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,24000.00,0.00,NULL,0.00,24000.00,24000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 15:45:43','2026-11-15 18:45:43',NULL,'338230'),(40,39,'FX-02512B',18,18,NULL,NULL,NULL,'Smartphone / Celular','666','78887','No enciende / Cortocircuito en línea principal VDD_MAIN',NULL,NULL,'Recepción en Sucursal Av. 25 de Mayo','Mostrador Central Av. 25 de Mayo',0.00,NULL,NULL,'Efectivo en Mostrador',NULL,15000.00,0.00,NULL,0.00,28000.00,28000.00,'Contado',1,0.00,15000.00,NULL,'Pagado en Recepción','Pendiente - Sin Técnico Asignado','En Sucursal Av. 25 de Mayo','Sin asignar (Disponible para Técnico)','Recepcionado por Lucía Gómez (Recepción)',NULL,1,'2026-11-15 15:59:25','2026-11-15 18:59:25',NULL,'SEC-7622'),(71,38,'555807',16,16,9,3,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #38','Quiero cambiar mi pantalla rota a una de oled',NULL,NULL,'Retiro a Domicilio por Paquetería',NULL,0.00,'-26.1849, -58.1731','RET-3A7DD2','Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Retiro Solicitado a Paquetería','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Quiero cambiar mi pantalla rota a una de oled',NULL,1,'2026-11-15 16:14:19','2026-11-15 19:14:19',NULL,'555807'),(90,1,'327070',4,4,9,3,NULL,'Celular','Samsung','Galaxy A04e','bla bla',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Cancelado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-09-14 19:49:17',NULL,'327070'),(91,4,'076881',4,4,9,3,NULL,'Celular','Samsung','Galaxy A11',',',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-09-14 20:20:48',NULL,'076881'),(92,5,'403194',4,4,9,3,NULL,'Celular','Samsung','Galaxy A11','afdsafasdfa',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-09-14 20:32:20',NULL,'403194'),(93,6,'785329',4,4,9,3,NULL,'Notebook','Samsung','Galaxy A11','a',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Cancelado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-09-14 20:46:42',NULL,'785329'),(94,7,'012971',3,3,9,3,NULL,'Celular','Samsung','Galaxy A11','Se rompio',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-02 05:50:48',NULL,'012971'),(95,8,'700800',5,5,9,3,NULL,'Celular','Samsung','Galaxy A11','Pantalla rota',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-02 06:00:44',NULL,'700800'),(96,9,'991935',6,6,9,3,NULL,'Celular','Samsung','Galaxy A11','se me cayo',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-02 06:03:20',NULL,'991935'),(97,10,'OR-00010',14,14,9,3,NULL,'Celular','Samsung','Galaxy A11','Prueba',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-05 14:45:59',NULL,'PIN-8492'),(98,11,'OR-00011',15,15,9,3,NULL,'Celular','Samsung','Galaxy A04e','Pantalla rota',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-05 19:46:45',NULL,'PIN-8492'),(99,12,'OR-00012',15,15,9,3,NULL,'Celular','Samsung','Galaxy A04e','Roto',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-05 19:59:07',NULL,'PIN-8492'),(100,13,'OR-00013',15,15,9,3,NULL,'Celular','Samsung','Galaxy A11','Roto',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','En Revisión en Bancada','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-05 20:15:29',NULL,'PIN-8492'),(101,14,'OR-00014',15,15,9,3,NULL,'Celular','Samsung','Galaxy A04e','Roto','orden_16_1793910385_564.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-05 20:26:25',NULL,'PIN-8492'),(102,15,'702652',3,3,9,2,NULL,'Celular','Samsung','Galaxy A11','C cayo','orden_1793930594_8877.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 02:03:14',NULL,'702652'),(103,16,'983931',3,3,9,2,NULL,'Celular','Samsung','Galaxy A11','Se rompio toda la pantalla','orden_1793931637_8032.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 02:20:37',NULL,'983931'),(104,17,'045419',3,3,9,3,NULL,'Celular','Samsung','Galaxy A04e','Hola estoy cambiando el diagnostico para ver que onda como funciona jijis','orden_1793935766_1698.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 03:29:26',NULL,'045419'),(105,18,'493989',3,3,9,3,NULL,'Celular','Samsung','Galaxy A04e','C me cayo y se rompio la pantalla\n',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','En Revisión en Bancada','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 11:02:09',NULL,'493989'),(106,19,'430532',16,16,9,3,NULL,'Celular','Samsung','Galaxy A04e','Aca cambie el diagnostico oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo','orden_1793963157_6467.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,65000.00,0.00,NULL,0.00,65000.00,65000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 11:05:57',NULL,'430532'),(107,20,'073304',16,16,9,3,NULL,'Celular','Samsung','Galaxy A04e','Prueba 1\n\n[Diagnóstico Técnico]: Al caerse tu dispositivo, este se le rompio totalmente el pin de carga','orden_1793964177_9050.jpeg',NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,65000.00,0.00,NULL,0.00,65000.00,65000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Cancelado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Al caerse tu dispositivo, este se le rompio totalmente el pin de carga',NULL,1,'2026-11-15 16:59:06','2026-11-06 11:22:57',NULL,'073304'),(108,21,'378733',16,16,9,3,NULL,'Celular','Samsung','Galaxy A04e','Holaaa','orden_1793965368_6682.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-06 11:42:48',NULL,'378733'),(109,22,'135687',5,5,9,3,NULL,'Celular','Samsung','Galaxy A04e','C me cayo y c rompio',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-09 23:04:25',NULL,'135687'),(110,23,'812434',16,16,9,3,NULL,'Celular','Samsung','Galaxy A04e','Se cayo',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-09 23:53:30',NULL,'812434'),(111,24,'516610',4,4,9,3,NULL,'Celular','Samsung','Galaxy A11','Pal mercado pago',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-15 16:59:06','2026-11-10 00:44:01',NULL,'516610'),(114,42,'654504',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #42','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:16:49','2026-11-16 04:16:49',NULL,'654504'),(115,43,'594769',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #43','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:16:50','2026-11-16 04:16:50',NULL,'594769'),(116,44,'789892',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #44','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:16:50','2026-11-16 04:16:50',NULL,'789892'),(117,45,'629468',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #45','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:16:51','2026-11-16 04:16:51',NULL,'629468'),(118,46,'447400',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #46','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:16:51','2026-11-16 04:16:51',NULL,'447400'),(120,48,'573320',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #48','.',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:17:04','2026-11-16 04:17:04',NULL,'573320'),(121,49,'939928',1,1,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #49','hola',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 01:17:13','2026-11-16 04:17:13',NULL,'939928'),(124,52,'750846',20,20,9,2,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #52','',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','',NULL,1,'2026-11-16 09:01:44','2026-11-16 12:01:44',NULL,'750846'),(125,53,'104544',16,16,9,3,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #53','Quiero hacerle un cambio de pantalla porque se quebró en una esquina',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Quiero hacerle un cambio de pantalla porque se quebró en una esquina',NULL,1,'2026-11-16 09:09:14','2026-11-16 12:09:14',NULL,'104544'),(126,54,'556981',16,16,9,2,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #54','No le hago mantenimiento desde que lo compre hace 6 meses y ya hace ruido su ventilador',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','No le hago mantenimiento desde que lo compre hace 6 meses y ya hace ruido su ventilador',NULL,1,'2026-11-16 10:32:23','2026-11-16 13:32:23',NULL,'556981'),(127,55,'321615',337,337,9,3,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #55','Cambio de mi pantalla',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Cambio de mi pantalla',NULL,1,'2026-11-16 10:39:49','2026-11-16 13:39:49',NULL,'321615'),(128,56,'976987',337,337,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #56','Ya no funciona la bateria, se gasta muy rapido','orden_1794837933_3116.jpeg',NULL,'Envío a Domicilio por Paquetería','ENTREGA DE EQUIPO REPARADO | Calle 251, Barrio Formosa (Mz. Mz 48 Cs.Cs 7) ert{} Horario:Mañana (09:00 a 13:00 hs)',4.78,'-26.1443265,-58.157174','ENV-EF2D06','Mercado Pago',NULL,21500.00,3173.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Entrega Programada con Cadete GPS','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Ya no funciona la bateria, se gasta muy rapido',NULL,1,'2026-11-16 11:05:33','2026-11-16 14:05:33',NULL,'976987'),(129,57,'319650',337,337,9,3,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #57','Quiero cambiar la pantalla',NULL,NULL,'Envío a Domicilio por Paquetería','RETIRO DE EQUIPO EN DOMICILIO | Calle 251, Barrio Formosa ert{} Horario:Mañana (09:00 a 13:00 hs)',4.78,'-26.1443275,-58.1571763','ENV-DEA152','Mercado Pago',NULL,50000.00,3173.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Retiro Solicitado a Paquetería','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Quiero cambiar la pantalla',NULL,1,'2026-11-16 16:41:41','2026-11-16 19:41:41',NULL,'319650'),(130,58,'840607',337,337,9,2,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #58','Quiero hacerle mantenimiento, el ventilador se fuerza mucho por la mugre',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pagado / Verificado','Entregado al Cliente','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','Quiero hacerle mantenimiento, el ventilador se fuerza mucho por la mugre',NULL,1,'2026-11-16 17:24:44','2026-11-16 20:24:44',NULL,'840607'),(131,59,'FX-B378DD',2,2,NULL,NULL,NULL,'Consola (PS4 / PS5 / Xbox)','Sony PlayStation','ROG Strix / TUF Gaming / Lenovo Legion (S/N: 8922332)','Mantenimiento de Notebook / GPU / Consola — Obs: 21','uploads/dispositivos/eq_6afb6dcc1bea0_0.png',NULL,'Retiro por Cadete Fenix Lab en Domicilio','Retiro por Cadete Fenix Lab en Domicilio | Dir: E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina | Dist: 4.76 km | Horario: Mañana (09:00 a 13:00 hs)',4.76,'-26.144501, -58.157368','ENV-C3505C','Binance Pay','',15000.00,3341.00,'ADMIN@MEIVAK.COM',0.00,63341.00,63341.00,'Cuotas',6,0.00,10556.83,'Credito Mastercard •••• 6666 (JOHAN GAUNA)','Pagado / Verificado','Pendiente - En Revisión Técnica','Retiro / Envío Activo (Retiro por Cadete Fenix Lab en Domicilio - Mañana (09:00 a 13:00 hs)) — No ca','Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312)','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.','1. Inspección bajo microscopio y medición de líneas principales de tensión.\n2. Diagnóstico específico sobre: Mantenimiento de Notebook / GPU / Consola.\n3. Garantía escrita oficial y seguimiento en vivo.',1,'2026-11-16 17:55:40','2026-11-16 20:55:40',NULL,'PIN-8492'),(132,60,'FX-B74A47',2,2,NULL,NULL,NULL,'Consola (PS4 / PS5 / Xbox)','Sony PlayStation','ROG Strix / TUF Gaming / Lenovo Legion (S/N: 8922332)','Mantenimiento de Notebook / GPU / Consola — Obs: 21','uploads/dispositivos/eq_6afb6dcf7ae86_0.png',NULL,'Retiro por Cadete Fenix Lab en Domicilio','Retiro por Cadete Fenix Lab en Domicilio | Dir: E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina | Dist: 4.76 km | Horario: Mañana (09:00 a 13:00 hs)',4.76,'-26.144501, -58.157368','ENV-F8FE95','Binance Pay','',15000.00,3341.00,'ADMIN@MEIVAK.COM',0.00,63341.00,63341.00,'Cuotas',6,0.00,10556.83,'Credito Mastercard •••• 6666 (JOHAN GAUNA)','Pagado / Verificado','Pendiente - En Revisión Técnica','Retiro / Envío Activo (Retiro por Cadete Fenix Lab en Domicilio - Mañana (09:00 a 13:00 hs)) — No ca','Téc. Sup. Franco Quiroga — Laboratorio de Consolas & Fuentes (Mat. #FX-312)','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.','1. Inspección bajo microscopio y medición de líneas principales de tensión.\n2. Diagnóstico específico sobre: Mantenimiento de Notebook / GPU / Consola.\n3. Garantía escrita oficial y seguimiento en vivo.',1,'2026-11-16 17:55:43','2026-11-16 20:55:43',NULL,'PIN-8492'),(133,61,'FX-AEE107',2,2,NULL,NULL,NULL,'Notebook / Laptop Gamer','Apple / iPhone','ROG Strix / TUF Gaming / Lenovo Legion (S/N: 2182828)','Mantenimiento de Notebook / GPU / Consola — Obs: aaa c cayooo','uploads/dispositivos/eq_6afb6f27ae4d8_0.png',NULL,'Retiro por Cadete Fenix Lab en Domicilio','Retiro por Cadete Fenix Lab en Domicilio | Dir: E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina (aaaa) | Dist: 4.76 km | Horario: Mañana (09:00 a 13:00 hs)',4.76,'-26.144471, -58.157317','ENV-7BBD9E','Binance Pay','',15000.00,3344.00,'ADMIN@MEIVAK.COM',0.00,63344.00,63344.00,'Cuotas',6,0.00,10557.33,'Credito Mastercard •••• 6666 (JOHAN GAUNA)','Pagado / Verificado','Pendiente - En Revisión Técnica','Retiro / Envío Activo (Retiro por Cadete Fenix Lab en Domicilio - Mañana (09:00 a 13:00 hs)) — No ca','Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208)','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.','1. Inspección bajo microscopio y medición de líneas principales de tensión.\n2. Diagnóstico específico sobre: Mantenimiento de Notebook / GPU / Consola.\n3. Garantía escrita oficial y seguimiento en vivo.',1,'2026-11-16 18:01:28','2026-11-16 21:01:28',NULL,'PIN-8492'),(134,62,'FX-7079A7',2,2,NULL,NULL,NULL,'Notebook / Laptop Gamer','Apple / iPhone','ROG Strix / TUF Gaming / Lenovo Legion (S/N: 2182828)','Mantenimiento de Notebook / GPU / Consola — Obs: aaa c cayooo','uploads/dispositivos/eq_6afb6f2b2f4aa_0.png',NULL,'Retiro por Cadete Fenix Lab en Domicilio','Retiro por Cadete Fenix Lab en Domicilio | Dir: E.P.E.T N° 7 \"Vicente Arcadio Salemi\", Avenida Presidente Doctor Raúl Alfonsín, Eva Perón, Formosa, Municipio de Formosa, Departamento Formosa, Formosa, 3600, Argentina (aaaa) | Dist: 4.76 km | Horario: Mañana (09:00 a 13:00 hs)',4.76,'-26.144471, -58.157317','ENV-B3B323','Binance Pay','',15000.00,3344.00,'ADMIN@MEIVAK.COM',0.00,63344.00,63344.00,'Cuotas',6,0.00,10557.33,'Credito Mastercard •••• 6666 (JOHAN GAUNA)','Pagado / Verificado','Pendiente - En Revisión Técnica','Retiro / Envío Activo (Retiro por Cadete Fenix Lab en Domicilio - Mañana (09:00 a 13:00 hs)) — No ca','Ing. Lucas Benítez — Especialista en Reballing, GPUs & Laptops Gamer (Mat. #FX-208)','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.','1. Inspección bajo microscopio y medición de líneas principales de tensión.\n2. Diagnóstico específico sobre: Mantenimiento de Notebook / GPU / Consola.\n3. Garantía escrita oficial y seguimiento en vivo.',1,'2026-11-16 18:01:31','2026-11-16 21:01:31',NULL,'PIN-8492'),(135,63,'588305',337,337,9,3,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #63','Quiero cambiarle la pantalla y con hidrogel',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,50000.00,0.00,NULL,0.00,50000.00,50000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-16 18:03:03','2026-11-16 21:03:03',NULL,'588305'),(136,64,'412139',337,337,9,2,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #64','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-17 02:00:31','2026-11-17 05:00:31',NULL,'412139'),(137,67,'415178',4,4,9,4,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #67','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,21500.00,0.00,NULL,0.00,21500.00,21500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','En Revisión en Bancada','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','',NULL,1,'2026-11-17 08:01:08','2026-11-17 11:01:08',NULL,'415178'),(138,68,'136433',20,20,9,1,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #68','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,38500.00,0.00,NULL,0.00,38500.00,38500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-17 08:52:06','2026-11-17 11:52:06',NULL,'136433'),(139,69,'936307',20,20,9,1,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #69','',NULL,NULL,'Retiro en Sucursal Central',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,38500.00,0.00,NULL,0.00,38500.00,38500.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-17 08:54:25','2026-11-17 11:54:25',NULL,'936307'),(140,70,'898152',16,16,9,2,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #70','No le hago mantenimiento hace un par de meses','orden_1794959788_8732.jpeg',NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,60000.00,0.00,NULL,0.00,60000.00,60000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Listo para Entrega / Finalizado','Dispositivo Retirado · Ingresado en Taller','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)','No le hago mantenimiento hace un par de meses',NULL,1,'2026-11-17 20:56:28','2026-11-17 23:56:28',NULL,'898152'),(141,71,'445243',4,4,9,5,NULL,'Dispositivo en Taller','Fénix Lab','Orden App #71','',NULL,NULL,'Envío a Domicilio por Paquetería',NULL,0.00,NULL,NULL,'Mercado Pago',NULL,12000.00,0.00,NULL,0.00,12000.00,12000.00,'Contado',1,0.00,15000.00,NULL,'Pendiente','Pendiente - En Revisión Técnica','Logística Activa (No cancelable)','Ing. Marcos Villalba — Especialista Microelectrónica (Mat. #FX-104)',NULL,NULL,1,'2026-11-17 21:36:29','2026-11-18 00:36:29',NULL,'445243');
/*!40000 ALTER TABLE `reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reparacion_orden`
--

DROP TABLE IF EXISTS `reparacion_orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reparacion_orden` (
  `reparacion_orden_id` int(11) NOT NULL AUTO_INCREMENT,
  `equipo_id` int(11) NOT NULL DEFAULT 1 COMMENT 'Relación con el equipo que ingresó a taller',
  `usuario_id` int(11) NOT NULL DEFAULT 1 COMMENT 'Recepcionista/Usuario que registra la orden',
  `empleado_id` int(11) DEFAULT NULL,
  `servicios_id` int(11) NOT NULL DEFAULT 3 COMMENT 'Servicio principal solicitado del catálogo',
  `diagnostico_cliente` text NOT NULL COMMENT 'Descripción inicial del problema reportado',
  `diagnostico_tecnico` text DEFAULT NULL,
  `presupuesto_monto` decimal(15,2) NOT NULL DEFAULT 50000.00,
  `estados_or_id` int(11) NOT NULL DEFAULT 1 COMMENT 'Estado actual de la orden (1: Pendiente, etc.)',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  `formas_pago_id` int(11) NOT NULL DEFAULT 1,
  `total` int(11) NOT NULL DEFAULT 50000,
  `monto_seña` decimal(15,2) DEFAULT 0.00,
  `tipo_entrega` enum('sucursal','envio') DEFAULT 'sucursal',
  `pagado` decimal(15,2) DEFAULT 0.00,
  `codigo_seguridad` varchar(15) DEFAULT NULL,
  `tecnico_id` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`reparacion_orden_id`),
  KEY `equipo_id` (`equipo_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `servicios_id` (`servicios_id`),
  KEY `estados_or_id` (`estados_or_id`),
  KEY `reparacion_orden_ibfk_5_idx` (`estado_general_id`),
  KEY `reparacion_orden_ibfk_6_idx` (`formas_pago_id`),
  KEY `reparacion_orden_ibfk_7_idx` (`tecnico_id`),
  CONSTRAINT `reparacion_orden_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`equipo_id`) ON DELETE CASCADE,
  CONSTRAINT `reparacion_orden_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE,
  CONSTRAINT `reparacion_orden_ibfk_3` FOREIGN KEY (`servicios_id`) REFERENCES `servicios` (`servicios_id`) ON DELETE CASCADE,
  CONSTRAINT `reparacion_orden_ibfk_4` FOREIGN KEY (`estados_or_id`) REFERENCES `estados_or` (`estados_or_id`) ON DELETE CASCADE,
  CONSTRAINT `reparacion_orden_ibfk_5` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `reparacion_orden_ibfk_6` FOREIGN KEY (`formas_pago_id`) REFERENCES `formas_pago` (`formas_pago_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `reparacion_orden_ibfk_7` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reparacion_orden`
--

LOCK TABLES `reparacion_orden` WRITE;
/*!40000 ALTER TABLE `reparacion_orden` DISABLE KEYS */;
INSERT INTO `reparacion_orden` VALUES (1,1,4,1,3,'bla bla',NULL,50000.00,4,'2026-09-14 19:49:17',1,1,50000,0.00,'sucursal',0.00,'327070',NULL,NULL),(4,4,4,1,3,',',NULL,50000.00,1,'2026-09-14 20:20:48',1,2,50000,0.00,'sucursal',0.00,'076881',NULL,NULL),(5,5,4,1,3,'afdsafasdfa',NULL,50000.00,1,'2026-09-14 20:32:20',1,1,50000,0.00,'sucursal',0.00,'403194',9,NULL),(6,6,4,7,3,'a',NULL,50000.00,4,'2026-09-14 20:46:42',1,1,50000,0.00,'sucursal',0.00,'785329',9,NULL),(7,7,3,11,3,'Se rompio',NULL,50000.00,1,'2026-11-02 05:50:48',1,1,50000,0.00,'sucursal',0.00,'012971',9,NULL),(8,10,5,11,3,'Pantalla rota',NULL,50000.00,5,'2026-11-02 06:00:44',1,1,50000,0.00,'sucursal',1.00,'700800',9,NULL),(9,11,6,11,3,'se me cayo',NULL,50000.00,5,'2026-11-02 06:03:20',1,1,50000,0.00,'envio',1.00,'991935',9,NULL),(10,12,14,11,3,'Prueba',NULL,50000.00,1,'2026-11-05 14:45:59',1,1,50000,0.00,'sucursal',0.00,NULL,9,NULL),(11,13,15,11,3,'Pantalla rota',NULL,50000.00,1,'2026-11-05 19:46:45',1,1,50000,0.00,'envio',0.00,NULL,9,NULL),(12,14,15,11,3,'Roto',NULL,50000.00,1,'2026-11-05 19:59:07',1,2,50000,0.00,'envio',0.00,NULL,9,NULL),(13,15,15,11,3,'Roto',NULL,50000.00,2,'2026-11-05 20:15:29',1,1,50000,0.00,'envio',0.00,NULL,9,NULL),(14,16,15,11,3,'Roto',NULL,50000.00,1,'2026-11-05 20:26:25',1,1,50000,0.00,'envio',0.00,NULL,NULL,'orden_16_1793910385_564.jpeg'),(15,17,3,9,2,'C cayo',NULL,60000.00,1,'2026-11-06 02:03:14',1,2,60000,0.00,'envio',0.00,'702652',9,'orden_1793930594_8877.jpeg'),(16,18,3,9,2,'Se rompio toda la pantalla',NULL,50000.00,3,'2026-11-06 02:20:37',1,2,50000,0.00,'envio',0.00,'983931',9,'orden_1793931637_8032.jpeg'),(17,19,3,9,3,'Hola estoy cambiando el diagnostico para ver que onda como funciona jijis',NULL,60000.00,3,'2026-11-06 03:29:26',1,2,60000,10000.00,'envio',0.00,'045419',9,'orden_1793935766_1698.jpeg'),(18,21,3,NULL,3,'C me cayo y se rompio la pantalla\n',NULL,50000.00,2,'2026-11-06 11:02:09',1,2,50000,0.00,'envio',0.00,'493989',9,NULL),(19,22,16,NULL,3,'Aca cambie el diagnostico oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',NULL,65000.00,3,'2026-11-06 11:05:57',1,2,65000,15000.00,'envio',0.00,'430532',9,'orden_1793963157_6467.jpeg'),(20,23,16,NULL,3,'Prueba 1\n\n[Diagnóstico Técnico]: Al caerse tu dispositivo, este se le rompio totalmente el pin de carga','Al caerse tu dispositivo, este se le rompio totalmente el pin de carga',65000.00,4,'2026-11-06 11:22:57',1,2,65000,15000.00,'sucursal',0.00,'073304',9,'orden_1793964177_9050.jpeg'),(21,26,16,NULL,3,'Holaaa',NULL,50000.00,5,'2026-11-06 11:42:48',1,2,50000,0.00,'envio',1.00,'378733',9,'orden_1793965368_6682.jpeg'),(22,37,5,NULL,3,'C me cayo y c rompio',NULL,50000.00,5,'2026-11-09 23:04:25',1,2,50000,0.00,'sucursal',1.00,'135687',9,NULL),(23,38,16,11,3,'Se cayo',NULL,50000.00,5,'2026-11-09 23:53:30',1,2,50000,0.00,'sucursal',1.00,'812434',9,NULL),(24,39,4,NULL,3,'Pal mercado pago',NULL,50000.00,3,'2026-11-10 00:44:01',1,2,50000,0.00,'sucursal',0.00,'516610',9,NULL),(29,44,16,NULL,3,'C rompio aaa','Revisión de módulo y pin de carga en progreso.',50000.00,2,'2026-11-13 06:18:56',1,2,50000,0.00,'envio',50000.00,'395866',9,'orden_1794550736_3044.jpeg'),(30,46,16,NULL,3,'Bla','Pin de carga reparado y entregado.',50000.00,5,'2026-11-13 06:42:13',1,2,50000,0.00,'envio',50000.00,'440899',9,NULL),(34,50,4,NULL,3,'Se cayo',NULL,50000.00,1,'2026-11-14 17:58:27',1,2,50000,0.00,'sucursal',0.00,'766801',NULL,NULL),(35,51,16,NULL,3,'C cayo',NULL,50000.00,1,'2026-11-14 18:08:03',1,2,50000,0.00,'envio',50000.00,'384819',NULL,NULL),(36,52,2,11,5,'[PC de Escritorio AMD Radeon ROG Strix / TUF Gaming / Lenovo Legion (S/N: 123)] Diagnóstico Integral de Hardware + Optimización Extrema — Obs: hola','Recepción técnica asignada para: Diagnóstico Integral de Hardware + Optimización Extrema. Medición en bancada electrónica con instrumental de precisión.',15000.00,2,'2026-11-10 23:31:26',1,4,15000,0.00,'envio',15000.00,'FX-6EEC01',9,'uploads/dispositivos/eq_6af3a94e31d54_0.png'),(37,53,20,NULL,6,'',NULL,50000.00,1,'2026-11-15 18:45:43',1,2,24000,0.00,'sucursal',0.00,'338230',NULL,NULL),(38,54,16,NULL,3,'Quiero cambiar mi pantalla rota a una de oled','Quiero cambiar mi pantalla rota a una de oled',50000.00,1,'2026-11-15 19:14:19',1,2,50000,0.00,'envio',0.00,'555807',NULL,NULL),(39,55,18,11,3,'[Smartphone / Celular 666 78887] No enciende / Cortocircuito en línea principal VDD_MAIN','Recepcionado por Lucía Gómez (Recepción)',28000.00,1,'2026-11-15 19:59:07',1,1,28000,0.00,'sucursal',28000.00,'FX-02512B',9,NULL),(42,58,1,NULL,4,'',NULL,50000.00,1,'2026-11-16 04:16:49',1,2,21500,0.00,'sucursal',0.00,'654504',NULL,NULL),(43,59,1,NULL,4,'',NULL,50000.00,1,'2026-11-16 04:16:50',1,2,21500,0.00,'sucursal',0.00,'594769',NULL,NULL),(44,60,1,NULL,4,'',NULL,50000.00,1,'2026-11-16 04:16:50',1,2,21500,0.00,'sucursal',0.00,'789892',NULL,NULL),(45,61,1,NULL,4,'',NULL,50000.00,1,'2026-11-16 04:16:51',1,2,21500,0.00,'sucursal',0.00,'629468',NULL,NULL),(46,62,1,NULL,4,'',NULL,50000.00,1,'2026-11-16 04:16:51',1,2,21500,0.00,'sucursal',0.00,'447400',NULL,NULL),(48,64,1,NULL,4,'.',NULL,50000.00,1,'2026-11-16 04:17:04',1,2,21500,0.00,'sucursal',0.00,'573320',NULL,NULL),(49,65,1,NULL,4,'hola',NULL,50000.00,1,'2026-11-16 04:17:13',1,2,21500,0.00,'sucursal',0.00,'939928',NULL,NULL),(52,68,20,11,2,'','',50000.00,1,'2026-11-16 12:01:44',1,2,60000,0.00,'envio',0.00,'750846',9,NULL),(53,69,16,NULL,3,'Quiero hacerle un cambio de pantalla porque se quebró en una esquina','Quiero hacerle un cambio de pantalla porque se quebró en una esquina',50000.00,3,'2026-11-16 12:09:14',1,2,50000,15000.00,'envio',15003.00,'104544',9,NULL),(54,70,16,NULL,2,'No le hago mantenimiento desde que lo compre hace 6 meses y ya hace ruido su ventilador','No le hago mantenimiento desde que lo compre hace 6 meses y ya hace ruido su ventilador',50000.00,3,'2026-11-16 13:32:23',1,2,60000,0.00,'envio',60000.00,'556981',9,NULL),(55,71,337,NULL,3,'Cambio de mi pantalla','Cambio de mi pantalla',50000.00,3,'2026-11-16 13:39:49',1,2,50000,0.00,'envio',0.00,'321615',9,NULL),(56,72,337,11,4,'Ya no funciona la bateria, se gasta muy rapido','Ya no funciona la bateria, se gasta muy rapido',50000.00,3,'2026-11-16 14:05:33',1,2,21500,0.00,'envio',0.00,'976987',9,'orden_1794837933_3116.jpeg'),(57,73,337,NULL,3,'Quiero cambiar la pantalla','Quiero cambiar la pantalla',50000.00,1,'2026-11-16 19:41:41',1,2,50000,0.00,'envio',0.00,'319650',9,NULL),(58,74,337,11,2,'Quiero hacerle mantenimiento, el ventilador se fuerza mucho por la mugre','Quiero hacerle mantenimiento, el ventilador se fuerza mucho por la mugre',50000.00,5,'2026-11-16 20:24:44',1,2,60000,0.00,'sucursal',1.00,'840607',9,NULL),(59,75,2,11,3,'[Consola (PS4 / PS5 / Xbox) Sony PlayStation ROG Strix / TUF Gaming / Lenovo Legion (S/N: 8922332)] Mantenimiento de Notebook / GPU / Consola — Obs: 21','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.',63341.00,1,'2026-11-16 20:55:40',1,1,63341,0.00,'envio',63341.00,'FX-B378DD',9,'uploads/dispositivos/eq_6afb6dcc1bea0_0.png'),(60,76,2,11,3,'[Consola (PS4 / PS5 / Xbox) Sony PlayStation ROG Strix / TUF Gaming / Lenovo Legion (S/N: 8922332)] Mantenimiento de Notebook / GPU / Consola — Obs: 21','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.',63341.00,1,'2026-11-16 20:55:43',1,1,63341,0.00,'envio',63341.00,'FX-B74A47',9,'uploads/dispositivos/eq_6afb6dcf7ae86_0.png'),(61,77,2,11,3,'[Notebook / Laptop Gamer Apple / iPhone ROG Strix / TUF Gaming / Lenovo Legion (S/N: 2182828)] Mantenimiento de Notebook / GPU / Consola — Obs: aaa c cayooo','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.',63344.00,1,'2026-11-16 21:01:28',1,1,63344,0.00,'envio',63344.00,'FX-AEE107',9,'uploads/dispositivos/eq_6afb6f27ae4d8_0.png'),(62,78,2,11,3,'[Notebook / Laptop Gamer Apple / iPhone ROG Strix / TUF Gaming / Lenovo Legion (S/N: 2182828)] Mantenimiento de Notebook / GPU / Consola — Obs: aaa c cayooo','Recepción técnica asignada para: Mantenimiento de Notebook / GPU / Consola. Medición en bancada electrónica con instrumental de precisión.',63344.00,1,'2026-11-16 21:01:31',1,1,63344,0.00,'envio',63344.00,'FX-7079A7',9,'uploads/dispositivos/eq_6afb6f2b2f4aa_0.png'),(63,79,337,NULL,3,'Quiero cambiarle la pantalla y con hidrogel',NULL,50000.00,1,'2026-11-16 21:03:03',1,2,50000,0.00,'sucursal',0.00,'588305',NULL,NULL),(64,80,337,11,2,'',NULL,50000.00,1,'2026-11-17 05:00:31',1,2,60000,0.00,'sucursal',0.00,'412139',NULL,NULL),(67,83,4,11,4,'',NULL,50000.00,2,'2026-11-17 11:01:08',1,2,21500,0.00,'sucursal',0.00,'415178',9,NULL),(68,84,20,1,1,'',NULL,50000.00,1,'2026-11-17 11:52:06',1,2,38500,0.00,'sucursal',0.00,'136433',NULL,NULL),(69,85,20,1,1,'',NULL,50000.00,1,'2026-11-17 11:54:25',1,2,38500,0.00,'sucursal',0.00,'936307',NULL,NULL),(70,86,16,NULL,2,'No le hago mantenimiento hace un par de meses',NULL,50000.00,3,'2026-11-17 23:56:28',1,2,60000,0.00,'envio',0.00,'898152',9,'orden_1794959788_8732.jpeg'),(71,87,4,11,5,'',NULL,50000.00,1,'2026-11-18 00:36:29',1,2,12000,0.00,'envio',0.00,'445243',NULL,NULL);
/*!40000 ALTER TABLE `reparacion_orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resenas_clientes`
--

DROP TABLE IF EXISTS `resenas_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resenas_clientes` (
  `id_resena` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) DEFAULT NULL,
  `nombre_cliente` varchar(120) NOT NULL,
  `avatar_cliente` varchar(255) DEFAULT NULL,
  `calificacion` int(11) NOT NULL DEFAULT 5,
  `comentario` text NOT NULL,
  `fecha_resena` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_resena`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resenas_clientes`
--

LOCK TABLES `resenas_clientes` WRITE;
/*!40000 ALTER TABLE `resenas_clientes` DISABLE KEYS */;
INSERT INTO `resenas_clientes` VALUES (1,NULL,'Fiama Campana',NULL,5,'¡Excelente atención! Llevé mi placa de video para un mantenimiento preventivo (cambio de pads térmicos y pasta) y las temperaturas bajaron 15 grados. Súper recomendables y transparentes.','2026-09-11 00:05:14'),(2,NULL,'Matias Toledo',NULL,5,'Quedé muy conforme con la compra. Me asesoraron perfecto para armar mi PC Gamer. Fueron rápidos, profesionales y los precios de los componentes son los mejores de Formosa.','2026-08-11 00:05:14'),(3,NULL,'Lorenzo Araujo',NULL,5,'Llevé un iPhone que no cargaba ni encendía. En otros lugares me dijeron que no servía más. Acá le hicieron una reparación en la placa y quedó como nuevo. Genios totales de la electrónica.','2026-06-11 00:05:14'),(4,2,'Johan Daniel Gauna','uploads/perfiles/avatar_2_6af4f8c6486cd.jpg',5,'HOLA','2026-11-13 19:09:29');
/*!40000 ALTER TABLE `resenas_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `roles_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`roles_id`),
  KEY `fk_roles_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_roles_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin',1),(2,'recepcionista',1),(3,'tecnico',1),(4,'cliente',1),(5,'comercio',1),(6,'paqueteria',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `servicios_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `tiempo_estimado` varchar(60) DEFAULT '24 a 48 hs',
  `garantia_escrita` varchar(60) DEFAULT '90 días de garantía escrita',
  `categorias_servicios_id` int(11) DEFAULT 1,
  `fecha_registro` date DEFAULT NULL,
  `costo` decimal(15,2) DEFAULT 15000.00,
  `estado_general_id` int(11) DEFAULT 1,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`servicios_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `categorias_servicios_id_idx` (`categorias_servicios_id`),
  CONSTRAINT `fk_servicios_categoria` FOREIGN KEY (`categorias_servicios_id`) REFERENCES `categorias_servicios` (`categorias_servicios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_servicios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Microelectrónica & Reballing de Placa Madre / GPU','Diagnóstico con cámara térmica e inyección de tensión, recambio de circuitos integrados SMD, MOSFETs y reballing BGA profesional.','48 a 72 hs','180 días escrita',1,'2026-11-10',38500.00,1,'serv_1794958445_678.jpeg'),(2,'Mantenimiento de Notebook / GPU / Consola','Limpieza ultrasónica de placa, cambio de pads térmicos Gelid/Arctic de alta conductividad y pasta térmica extrema.','En el día (4 hs)','90 días escrita',1,'2026-09-14',60000.00,1,'serv_1794958434_482.jpeg'),(3,'Reparación de Módulo de Pantalla OLED + Hidrogel','Cambio de pantalla completa a dispositivo móvil con sellado contra polvo/humedad y templado de regalo.','En el día (2 a 3 hs)','120 días escrita',2,'2026-09-14',50000.00,1,'serv_1794958463_820.jpeg'),(4,'Reemplazo de Batería Certificada + Pin de Carga USB-C','Instalación de batería nueva de capacidad real 100% y reconstrucción de pistas de puerto de carga rápida USB-C / Lightning.','En el día (2 hs)','90 días escrita',3,'2026-11-10',21500.00,1,'serv_1794958454_976.jpeg'),(5,'Diagnóstico Electrónico en Bancada + Presupuesto Oficial','Medición completa en fuente regulada de laboratorio, osciloscopio e informe escrito detallado (bonificable al reparar).','2 a 6 hs','Garantía de taller',4,'2026-11-10',12000.00,1,'serv_1794958425_462.jpeg'),(6,'Armado Profesional de PC Gamer + Cable Management + BIOS','Ensamblaje en laboratorio, actualización de BIOS, perfiles EXPO/XMP, test de estrés OCCT y sistema operativo optimizado.','24 hs','1 año escrita',2,'2026-11-10',24000.00,1,'serv_1794958412_916.jpeg');
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sitios_web_proveedor`
--

DROP TABLE IF EXISTS `sitios_web_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sitios_web_proveedor` (
  `sitios_web_proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`sitios_web_proveedor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sitios_web_proveedor`
--

LOCK TABLES `sitios_web_proveedor` WRITE;
/*!40000 ALTER TABLE `sitios_web_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `sitios_web_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarjetas_cliente`
--

DROP TABLE IF EXISTS `tarjetas_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjetas_cliente` (
  `id_tarjeta` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `tipo_tarjeta` enum('Credito','Debito') NOT NULL DEFAULT 'Credito',
  `marca_tarjeta` varchar(40) NOT NULL,
  `ultimos_cuatro` varchar(4) NOT NULL,
  `titular` varchar(120) NOT NULL,
  `dni_titular` varchar(30) DEFAULT NULL,
  `vencimiento` varchar(10) NOT NULL,
  `banco_emisor` varchar(80) DEFAULT 'Banco Verificado',
  `token_mp` varchar(120) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tarjeta`),
  KEY `idx_card_cli` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjetas_cliente`
--

LOCK TABLES `tarjetas_cliente` WRITE;
/*!40000 ALTER TABLE `tarjetas_cliente` DISABLE KEYS */;
INSERT INTO `tarjetas_cliente` VALUES (1,2,'Credito','Mastercard','6666','JOHAN GAUNA','','10/10','BANCO',NULL,'2026-11-10 20:24:07');
/*!40000 ALTER TABLE `tarjetas_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telefonos`
--

DROP TABLE IF EXISTS `telefonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telefonos` (
  `telefono_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `tipo` varchar(20) NOT NULL DEFAULT 'Celular / WhatsApp',
  `codigo_pais_id` int(11) NOT NULL DEFAULT 1,
  `codigo_area_id` int(11) NOT NULL DEFAULT 1,
  `estado_general_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`telefono_id`),
  KEY `fk_tel_estado_general_idx` (`estado_general_id`),
  KEY `fk_tel_codigo_area_idx` (`codigo_area_id`),
  KEY `fk_telefonos_usuario` (`usuario_id`),
  KEY `fk_telefonos_codigo_pais_idx` (`codigo_pais_id`),
  CONSTRAINT `fk_tel_codigo_area` FOREIGN KEY (`codigo_area_id`) REFERENCES `codigo_area` (`codigo_area_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tel_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_telefonos_codigo_pais` FOREIGN KEY (`codigo_pais_id`) REFERENCES `codigo_pais` (`codigo_pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_telefonos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telefonos`
--

LOCK TABLES `telefonos` WRITE;
/*!40000 ALTER TABLE `telefonos` DISABLE KEYS */;
INSERT INTO `telefonos` VALUES (1,1,'3704100001','Corporativo Admin',1,1,1),(2,2,'3704100002','Guardia Laboratorio',1,1,1),(3,3,'4384748','Móvil',1,1,1),(4,4,'3704100004','Celular Cliente',1,1,1);
/*!40000 ALTER TABLE `telefonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_comprobante`
--

DROP TABLE IF EXISTS `tipo_comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_comprobante` (
  `tipo_comprobante_id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_comprobante` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`tipo_comprobante_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_comprobante`
--

LOCK TABLES `tipo_comprobante` WRITE;
/*!40000 ALTER TABLE `tipo_comprobante` DISABLE KEYS */;
INSERT INTO `tipo_comprobante` VALUES (1,'Factura A',1),(2,'Factura B',1),(3,'Factura C / Recibo X',1),(4,'Orden de Trabajo',1);
/*!40000 ALTER TABLE `tipo_comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_garantia`
--

DROP TABLE IF EXISTS `tipo_garantia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_garantia` (
  `garantia_id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) DEFAULT 'Garantía Oficial 90 días',
  `dias_cobertura` int(11) DEFAULT 90,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`garantia_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_garantia`
--

LOCK TABLES `tipo_garantia` WRITE;
/*!40000 ALTER TABLE `tipo_garantia` DISABLE KEYS */;
INSERT INTO `tipo_garantia` VALUES (1,'Garantía Taller 90 Días',90,1),(2,'Garantía Fábrica 12 Meses',365,1);
/*!40000 ALTER TABLE `tipo_garantia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_proveedor`
--

DROP TABLE IF EXISTS `tipo_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_proveedor` (
  `tipo_proveedor_id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`tipo_proveedor_id`),
  KEY `fk_tprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_tprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_proveedor`
--

LOCK TABLES `tipo_proveedor` WRITE;
/*!40000 ALTER TABLE `tipo_proveedor` DISABLE KEYS */;
INSERT INTO `tipo_proveedor` VALUES (1,'Modulo de RAM / Importador Mayorista',1),(2,'Modulo de Pantalla / Distribuidor Oficial',1),(3,'Fábrica de Repuestos',1);
/*!40000 ALTER TABLE `tipo_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_equipo`
--

DROP TABLE IF EXISTS `tipos_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_equipo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `icono_fa` varchar(50) DEFAULT 'fa-microchip',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_equipo`
--

LOCK TABLES `tipos_equipo` WRITE;
/*!40000 ALTER TABLE `tipos_equipo` DISABLE KEYS */;
INSERT INTO `tipos_equipo` VALUES (1,'Smartphone / Celular','fa-microchip'),(2,'Placa de Video (GPU)','fa-microchip'),(3,'Notebook / Laptop Gamer','fa-microchip'),(4,'PC de Escritorio','fa-microchip'),(5,'Consola (PS4 / PS5 / Xbox)','fa-microchip'),(6,'Placa Madre (Motherboard)','fa-microchip');
/*!40000 ALTER TABLE `tipos_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `telefono_alt` varchar(30) DEFAULT NULL,
  `codigo_pais_prefijo` varchar(10) NOT NULL DEFAULT '+54',
  `tipo_documento` enum('DNI','CUIT','Pasaporte','Cedula') NOT NULL DEFAULT 'DNI',
  `dni_cuit` varchar(30) DEFAULT NULL,
  `nombre` varchar(60) DEFAULT NULL,
  `apellido` varchar(60) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `pin_seguridad` varchar(255) DEFAULT NULL,
  `pin_configurado` tinyint(1) NOT NULL DEFAULT 0,
  `webauthn_credential_id` text DEFAULT NULL,
  `webauthn_public_key` text DEFAULT NULL,
  `huella_habilitada` tinyint(1) NOT NULL DEFAULT 0,
  `google_sub` varchar(120) DEFAULT NULL,
  `primer_ingreso_completado` tinyint(1) NOT NULL DEFAULT 1,
  `direccion_principal` varchar(255) DEFAULT NULL,
  `localidad` varchar(100) DEFAULT 'Formosa Capital',
  `codigo_postal` varchar(20) DEFAULT '3600',
  `direccion_id` int(11) DEFAULT NULL,
  `rol_id` int(11) DEFAULT 4,
  `rol` varchar(30) DEFAULT 'Cliente',
  `genero_id` int(11) DEFAULT 1,
  `fecha_nacimiento` date DEFAULT NULL,
  `pais_id` int(11) DEFAULT 1,
  `estado_general_id` int(11) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id_idx` (`rol_id`),
  KEY `genero_id_idx` (`genero_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_usuarios_direccion` (`direccion_id`),
  KEY `fk_usuarios_paises` (`pais_id`),
  CONSTRAINT `fk_user_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_gen` FOREIGN KEY (`genero_id`) REFERENCES `genero` (`genero_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`roles_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuarios_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuarios_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=992 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'johan_admin','$2y$10$ARpBT0GK3ONLcXYdTlv9rewDbEtGNVF3CVbW7mz8pxLwQb3NPUYwm','$2y$10$ARpBT0GK3ONLcXYdTlv9rewDbEtGNVF3CVbW7mz8pxLwQb3NPUYwm','soportefenixlab@gmail.com','3704123456',NULL,'+54','DNI','48123456','Johan Daniel','Gauna',NULL,'$2y$10$q9dcvnkg7QEB4.F06ASg4OPxO8PePujUF/2gpXipY0Oa3m/Fsirjq',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,1,'Administrador',1,'2008-03-03',1,1,'2026-11-10 23:05:13'),(2,'g_johancliente_46','$2y$10$vs12BZ43D0kt1xfIs71pMeB1bQtwb7z5v94N7okzhAq/9rWyUcQxi','$2y$10$vs12BZ43D0kt1xfIs71pMeB1bQtwb7z5v94N7okzhAq/9rWyUcQxi','johan.cliente@gmail.com','3704030356','','+54','DNI','324226','Johan Daniel','Gauna','uploads/perfiles/avatar_2_6af4f8c6486cd.jpg','$2y$10$Mogi43.2Ykc3Qd3000LM7e2uRxx30iWCwqF1PJpFVPlFYRsMQhAPy',1,'BIO-FIRST-1794352918252',NULL,1,'G-3d1648f9c5e8',1,'','Formosa Capital','3600',1,4,'Cliente',1,'2008-03-03',1,1,'2026-11-10 23:21:52'),(3,'Sebastiangmez08','$2y$10$J.DcONtIUKOyRPav8w97Uen1VV3WQx943SEnW/hurU/m/U32ZxNHe','$2y$10$J.DcONtIUKOyRPav8w97Uen1VV3WQx943SEnW/hurU/m/U32ZxNHe','sebastiangmez08@gmail.com','3704384748',NULL,'+54','DNI','47715113','Sebastian','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,1,'Administrador',1,'2007-09-15',1,1,'2026-08-10 12:07:00'),(4,'materiagris','$2y$10$6xNsa/Ot9RdglEWclOu3Q.h0Frb3I7Fwv2nhCVLcouaDRM5me2dpm','$2y$10$6xNsa/Ot9RdglEWclOu3Q.h0Frb3I7Fwv2nhCVLcouaDRM5me2dpm','velazquemanuel@gmail.com','3704100004',NULL,'+54','DNI','48059789','Emanuel','Velazque',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',2,NULL,1,1,'2026-08-10 12:15:42'),(5,'Karen','$2y$10$FDoNCi.SCK/Ax22rPsKXHu0GVgCyl3g92L4fARxgFBI4cqlpfAEPa','$2y$10$FDoNCi.SCK/Ax22rPsKXHu0GVgCyl3g92L4fARxgFBI4cqlpfAEPa','karen@gmail.com',NULL,NULL,'+54','DNI','47717090','Karen','Martinez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,1,'Cliente',2,'2007-12-17',1,1,'2026-09-04 11:28:39'),(6,'Oliveiramarina','$2y$10$nQF61ffcNCqeLjnp2SWiEOy2pSLbKbcU8Fx2T0TbgcQQ3bdOHQQL2','$2y$10$nQF61ffcNCqeLjnp2SWiEOy2pSLbKbcU8Fx2T0TbgcQQ3bdOHQQL2','martina@gmail.com',NULL,NULL,'+54','DNI','35673146','Marina Isabel','Olivera',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,2,'Recepcionista',2,'1977-03-10',1,1,'2026-09-12 23:04:56'),(7,'sebuta','$2y$10$n3kDeiONtEKu4hc6K18Ek.hc3tWgj7loNPuxoVsbUqqipaYwSCUlq','$2y$10$n3kDeiONtEKu4hc6K18Ek.hc3tWgj7loNPuxoVsbUqqipaYwSCUlq','seba@gmail.com',NULL,NULL,'+54','DNI','47715113','Sebastian','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,2,'Recepcionista',1,'2007-09-15',1,2,'2026-09-13 21:09:14'),(9,'tecnico','$2y$10$sa78wVEPPfLs95eGuXNF5ObClth835GE0GnaV0hja8p01aZoEU8Qm','$2y$10$sa78wVEPPfLs95eGuXNF5ObClth835GE0GnaV0hja8p01aZoEU8Qm','tecnico@gmail.com','3704100002',NULL,'+54','DNI','12831592','Juan','Mbappe',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,3,'Tecnico',1,'1998-01-12',1,1,'2026-09-14 21:09:24'),(10,'habibi','$2y$10$IiP5Ra.PuwfFDj0My3FRjeRZHKhXZOYfUeKR/CaQpvvFSYwhu6RWi','$2y$10$IiP5Ra.PuwfFDj0My3FRjeRZHKhXZOYfUeKR/CaQpvvFSYwhu6RWi','habibi@gmail.com',NULL,NULL,'+54','DNI','36610178','Pepe','Martinez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',1,NULL,1,1,'2026-09-15 01:08:58'),(11,'recepcionista','$2y$12$eLSWRgLNoZAR/gTqXni9GONZu3fm52GSCpacl4jgjjxxHZmTlf6ii','$2y$12$eLSWRgLNoZAR/gTqXni9GONZu3fm52GSCpacl4jgjjxxHZmTlf6ii','recepcionista@gmail.com','3704100003',NULL,'+54','DNI','47715113','Sebastian','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,2,'Recepcionista',1,'2007-09-15',1,1,'2026-11-01 19:39:44'),(12,'comercio','$2y$12$ENieRwahJooMiYm9V9iYou2FGaT4W8znaqU6nreep5a9N9SMc78ea','$2y$12$ENieRwahJooMiYm9V9iYou2FGaT4W8znaqU6nreep5a9N9SMc78ea','comercio@gmail.com','3704100005',NULL,'+54','DNI','47715113','Sebastian','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,5,'Comercio',1,'2007-09-15',1,1,'2026-11-02 02:11:09'),(13,'paqueteria','$2y$12$UkTjC4sIjCN388s6JqdG3O4hgdiK5qN7AYZzOXNrpprdD7OLpPpdy','$2y$12$UkTjC4sIjCN388s6JqdG3O4hgdiK5qN7AYZzOXNrpprdD7OLpPpdy','paqueteria@gmail.com','3704100006',NULL,'+54','DNI','47715113','Sebastian','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',1,6,'Paqueteria',1,'2007-09-15',1,1,'2026-11-02 05:00:53'),(14,'prueba','$2y$10$K7HyA4KFZcgPoritlW/Aa.b2bZd9qwl3NegqOrFjdL91ihvifazLW','$2y$10$K7HyA4KFZcgPoritlW/Aa.b2bZd9qwl3NegqOrFjdL91ihvifazLW','prueba@gmail.com',NULL,NULL,'+54','DNI','37649134','PRUEBA','Prueba',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',1,NULL,1,1,'2026-11-05 13:38:25'),(15,'Felipe','$2y$10$67vdjVNF9WROOMWeqwcOtuFXjpZ1mMTYobCf5bEVjSu5XI1NABU0a','$2y$10$67vdjVNF9WROOMWeqwcOtuFXjpZ1mMTYobCf5bEVjSu5XI1NABU0a','felipe@gmail.com',NULL,NULL,'+54','DNI','34673194','Felipe','Vergara',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',1,NULL,1,1,'2026-11-05 18:08:31'),(16,'Sebuta1','$2y$10$gsXwHqAoeWb.zYDvjqCl1.674MmfvPKl6mDum8a8pacSuzI1TIfMa','$2y$10$gsXwHqAoeWb.zYDvjqCl1.674MmfvPKl6mDum8a8pacSuzI1TIfMa','sebaa@gmail.com',NULL,NULL,'+54','DNI','48137546','Sebastián Nicolás','Gomez',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',1,NULL,1,1,'2026-11-06 10:54:01'),(17,'recepcion','$2y$10$SUB5DbuBki72.K.Ws9pvquScmEsin8btlbTrI.3SuuenHlto5NS8W','$2y$10$SUB5DbuBki72.K.Ws9pvquScmEsin8btlbTrI.3SuuenHlto5NS8W','recepcion@fenixlab.com','3704100003',NULL,'+54','DNI','48000003','Lucía','Gómez (Recepción)',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,2,'Recepcionista',2,NULL,1,1,'2026-11-11 01:09:58'),(18,'cliente','$2y$10$htEI0aNrhAVMM87z0s/gbO2AFZgxxJWXLh5pw/jpM2SjrV/2RbIia','$2y$10$htEI0aNrhAVMM87z0s/gbO2AFZgxxJWXLh5pw/jpM2SjrV/2RbIia','cliente@fenixlab.com','3704100004',NULL,'+54','DNI','48000004','Matías','Toledo (Cliente)',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',1,NULL,1,1,'2026-11-11 01:09:58'),(19,'tecnico_web','$2y$10$sFYw.OqOinoAzVHui/sra.BqtDq.a0.hTap588E3Jj8EHBY9vEzra','$2y$10$sFYw.OqOinoAzVHui/sra.BqtDq.a0.hTap588E3Jj8EHBY9vEzra','tecnico@fenixlab.com','3704100002',NULL,'+54','DNI','48000002','Ing. Marcos','Villalba (Técnico)',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,3,'Tecnico',1,NULL,1,1,'2026-11-11 01:09:58'),(20,'comercio_web','$2y$10$L.oDGp83jWqlMGLEegTPR.xP7.LNTmdX5rSUv.PZVjtIDcKzh0tZ2','$2y$10$L.oDGp83jWqlMGLEegTPR.xP7.LNTmdX5rSUv.PZVjtIDcKzh0tZ2','comercio@fenixlab.com','3704100005',NULL,'+54','DNI','48000005','Carlos','Ruiz (Comercio)',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,5,'Comercio',1,NULL,1,1,'2026-11-11 01:09:58'),(21,'paqueteria_web','$2y$10$pUT9EU3NDeYt5Tn8/Pk71unH3j1G02pFceY8IpRQPw7GTXu39unwy','$2y$10$pUT9EU3NDeYt5Tn8/Pk71unH3j1G02pFceY8IpRQPw7GTXu39unwy','paqueteria@fenixlab.com','3704100006',NULL,'+54','DNI','48000006','Franco','Quiroga (Logística)',NULL,'1234',1,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,6,'Paqueteria',1,NULL,1,1,'2026-11-11 01:09:58'),(337,'Marcos','$2y$10$I/ZBh835S1Pihdp/RIBwKOtydch2fkrwqiR3zAJjfiPtc3xBVJjnS','$2y$10$I/ZBh835S1Pihdp/RIBwKOtydch2fkrwqiR3zAJjfiPtc3xBVJjnS','marcos@gmail.com',NULL,NULL,'+54','DNI','27346107','Marcos Andres','Gomez',NULL,NULL,0,NULL,NULL,0,NULL,1,NULL,'Formosa Capital','3600',NULL,4,'Cliente',2,'0000-00-00',1,1,'2026-11-16 13:38:16');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `venta_id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(15,2) DEFAULT NULL,
  `envio_id` int(11) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT 1,
  PRIMARY KEY (`venta_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  KEY `usuario_id_idx` (`usuario_id`),
  KEY `fk_venta_envios_idx` (`envio_id`),
  CONSTRAINT `fk_venta_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_venta_envios` FOREIGN KEY (`envio_id`) REFERENCES `envios` (`envios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_venta_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (11,'2026-09-14 02:44:48',324.00,NULL,7,4,1),(12,'2026-09-14 02:49:40',12.00,NULL,7,4,1),(13,'2026-09-14 02:51:25',12.00,NULL,7,3,1),(14,'2026-09-14 02:53:47',12.00,NULL,7,4,1),(15,'2026-09-14 02:56:35',312.00,NULL,7,4,1),(16,'2026-09-14 03:06:04',312.00,NULL,7,4,1),(24,'2026-09-14 20:47:11',500.00,NULL,7,4,1),(25,'2026-09-15 00:46:01',1000.00,NULL,7,4,1),(26,'2026-09-15 01:22:24',500.00,NULL,7,3,1),(27,'2026-11-06 02:39:11',5500.00,NULL,9,5,1),(28,'2026-11-06 02:44:31',1500.00,NULL,NULL,5,1),(29,'2026-11-06 11:21:15',500.00,NULL,NULL,3,1),(30,'2026-11-06 11:43:44',500.00,NULL,NULL,16,1),(31,'2026-11-06 11:49:48',1500.00,NULL,NULL,16,1),(32,'2026-11-06 11:50:39',500.00,NULL,NULL,16,1),(33,'2026-11-06 11:51:02',2500.00,NULL,NULL,16,1),(34,'2026-11-06 11:55:48',5000.00,NULL,NULL,16,1),(35,'2026-11-09 23:34:53',50000.00,NULL,NULL,5,1),(36,'2026-11-10 00:26:26',50000.00,NULL,11,16,1),(37,'2026-11-12 20:38:49',500.00,NULL,11,3,1),(38,'2026-11-13 04:08:59',1000.00,NULL,NULL,16,1),(51,'2026-11-13 07:00:08',50000.00,NULL,NULL,16,1),(55,'2026-11-14 17:55:39',25000.00,NULL,11,3,1),(56,'2026-11-10 20:24:07',47212.00,NULL,1,2,1),(57,'2026-11-15 19:00:44',92000.00,NULL,11,1,1),(58,'2026-11-15 19:12:43',485000.00,NULL,NULL,16,1),(59,'2026-11-15 19:17:49',265000.00,NULL,NULL,16,1),(60,'2026-11-10 23:24:07',47212.00,NULL,1,2,1),(61,'2026-11-15 20:00:16',92000.00,NULL,NULL,16,1),(62,'2026-11-16 18:42:38',92000.00,NULL,NULL,5,1),(63,'2026-11-16 19:23:05',926500.00,NULL,NULL,16,1),(64,'2026-11-16 21:09:39',220782.00,NULL,1,2,1),(65,'2026-11-16 21:09:42',220782.00,NULL,1,2,1),(66,'2026-11-16 21:09:46',220782.00,NULL,1,2,1),(67,'2026-11-16 21:10:00',220782.00,NULL,1,2,1),(68,'2026-11-16 21:10:03',220782.00,NULL,1,2,1),(69,'2026-11-16 21:10:30',220782.00,NULL,1,2,1),(70,'2026-11-16 21:10:36',220782.00,NULL,1,2,1),(71,'2026-11-16 21:10:42',220782.00,NULL,1,2,1),(72,'2026-11-16 21:10:49',220782.00,NULL,1,2,1),(73,'2026-11-16 21:11:06',220782.00,NULL,1,2,1),(74,'2026-11-16 21:11:15',220782.00,NULL,1,2,1),(75,'2026-11-16 21:11:21',220782.00,NULL,1,2,1),(76,'2026-11-16 21:11:28',220782.00,NULL,1,2,1),(77,'2026-11-16 21:11:44',220782.00,NULL,1,2,1),(78,'2026-11-16 21:11:53',220782.00,NULL,1,2,1),(79,'2026-11-16 21:12:12',220782.00,NULL,1,2,1),(80,'2026-11-16 21:12:16',220782.00,NULL,1,2,1),(81,'2026-11-16 21:12:33',220782.00,NULL,1,2,1),(82,'2026-11-16 21:12:37',220782.00,NULL,1,2,1),(83,'2026-11-16 21:12:40',220782.00,NULL,1,2,1),(84,'2026-11-16 21:12:44',220782.00,NULL,1,2,1),(85,'2026-11-16 21:12:48',220782.00,NULL,1,2,1),(86,'2026-11-16 21:12:51',220782.00,NULL,1,2,1),(91,'2026-11-17 11:36:18',92000.00,NULL,NULL,16,1),(92,'2026-11-17 11:45:48',73000.00,NULL,11,1,1),(93,'2026-11-17 11:46:42',42000.00,NULL,11,2,1),(94,'2026-11-17 11:47:29',24900.00,NULL,1,1,1),(95,'2026-11-17 11:58:55',60000.00,NULL,11,337,1),(100,'2026-11-18 01:27:06',590000.00,NULL,NULL,16,1),(103,'2026-11-18 01:32:49',472000.00,NULL,NULL,16,1);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 23:02:13
