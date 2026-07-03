-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: taller_electronica
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `barrios`
--

DROP TABLE IF EXISTS `barrios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `barrios` (
  `barrios_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`barrios_id`),
  KEY `fk_barrios_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_barrios_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barrios`
--

LOCK TABLES `barrios` WRITE;
/*!40000 ALTER TABLE `barrios` DISABLE KEYS */;
/*!40000 ALTER TABLE `barrios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caja_diaria`
--

DROP TABLE IF EXISTS `caja_diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `caja_diaria` (
  `caja_diaria_id` int(11) NOT NULL,
  `monto_inicial` int(11) DEFAULT NULL,
  `ventas_id` int(11) DEFAULT NULL,
  `egreso_id` int(11) DEFAULT NULL,
  `hora` datetime DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `obervaciones` varchar(45) DEFAULT NULL,
  `sucursal_id` int(11) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`caja_diaria_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `egreso_id_idx` (`egreso_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  KEY `sucursal_id_idx` (`sucursal_id`),
  CONSTRAINT `fk_caja_egreso` FOREIGN KEY (`egreso_id`) REFERENCES `egreso` (`egreso_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_caja_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleados_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_caja_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_caja_sucursal` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`sucursales_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja_diaria`
--

LOCK TABLES `caja_diaria` WRITE;
/*!40000 ALTER TABLE `caja_diaria` DISABLE KEYS */;
/*!40000 ALTER TABLE `caja_diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cajas_diarias`
--

DROP TABLE IF EXISTS `cajas_diarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cajas_diarias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_apertura_id` int(11) DEFAULT NULL,
  `fecha_apertura` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `monto_inicial` decimal(15,2) DEFAULT NULL,
  `monto_final_real` decimal(15,2) DEFAULT NULL,
  `diferencia` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_apertura_id` (`usuario_apertura_id`),
  CONSTRAINT `cajas_diarias_ibfk_1` FOREIGN KEY (`usuario_apertura_id`) REFERENCES `usuarios` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas_diarias`
--

LOCK TABLES `cajas_diarias` WRITE;
/*!40000 ALTER TABLE `cajas_diarias` DISABLE KEYS */;
/*!40000 ALTER TABLE `cajas_diarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calle`
--

DROP TABLE IF EXISTS `calle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calle` (
  `calle_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`calle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calle`
--

LOCK TABLES `calle` WRITE;
/*!40000 ALTER TABLE `calle` DISABLE KEYS */;
/*!40000 ALTER TABLE `calle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `casa`
--

DROP TABLE IF EXISTS `casa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `casa` (
  `casa_id` int(11) NOT NULL,
  `numero` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`casa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `casa`
--

LOCK TABLES `casa` WRITE;
/*!40000 ALTER TABLE `casa` DISABLE KEYS */;
/*!40000 ALTER TABLE `casa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_equipo`
--

DROP TABLE IF EXISTS `categorias_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_equipo` (
  `categoria_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`categoria_id`),
  KEY `fk_cateq_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_cateq_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_equipo`
--

LOCK TABLES `categorias_equipo` WRITE;
/*!40000 ALTER TABLE `categorias_equipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_productos`
--

DROP TABLE IF EXISTS `categorias_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_productos` (
  `categoria_productos_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`categoria_productos_id`),
  KEY `fk_catprod_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_catprod_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_productos`
--

LOCK TABLES `categorias_productos` WRITE;
/*!40000 ALTER TABLE `categorias_productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_servicios`
--

DROP TABLE IF EXISTS `categorias_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_servicios` (
  `categorias_servicios_id` int(11) NOT NULL,
  `categoria` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`categorias_servicios_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_cat_servicios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_servicios`
--

LOCK TABLES `categorias_servicios` WRITE;
/*!40000 ALTER TABLE `categorias_servicios` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudades`
--

DROP TABLE IF EXISTS `ciudades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ciudades` (
  `ciudad_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`ciudad_id`),
  KEY `fk_ciudades_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_ciudades_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudades`
--

LOCK TABLES `ciudades` WRITE;
/*!40000 ALTER TABLE `ciudades` DISABLE KEYS */;
/*!40000 ALTER TABLE `ciudades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clasificacion_usuario`
--

DROP TABLE IF EXISTS `clasificacion_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clasificacion_usuario` (
  `clasificacion_usuario_id` int(11) NOT NULL,
  `clasificacion_usuario` varchar(45) DEFAULT NULL,
  `historial_usuario_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`clasificacion_usuario_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `historial_puntos_usuario_id_idx` (`historial_usuario_id`),
  CONSTRAINT `fk_clasificacion_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_clasificacion_historial` FOREIGN KEY (`historial_usuario_id`) REFERENCES `historial_usuario` (`historial_usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clasificacion_usuario`
--

LOCK TABLES `clasificacion_usuario` WRITE;
/*!40000 ALTER TABLE `clasificacion_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `clasificacion_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_telefonos`
--

DROP TABLE IF EXISTS `clientes_telefonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes_telefonos` (
  `cliente_id` int(11) NOT NULL,
  `telefono_id` int(11) NOT NULL,
  KEY `telefono_id` (`telefono_id`),
  CONSTRAINT `clientes_telefonos_ibfk_2` FOREIGN KEY (`telefono_id`) REFERENCES `telefonos` (`telefono_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_telefonos`
--

LOCK TABLES `clientes_telefonos` WRITE;
/*!40000 ALTER TABLE `clientes_telefonos` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes_telefonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_area`
--

DROP TABLE IF EXISTS `codigo_area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `codigo_area` (
  `codigo_area_id` int(11) NOT NULL,
  `codigo` int(11) NOT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`codigo_area_id`),
  KEY `fk_carea_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_carea_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_area`
--

LOCK TABLES `codigo_area` WRITE;
/*!40000 ALTER TABLE `codigo_area` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigo_area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_postal`
--

DROP TABLE IF EXISTS `codigo_postal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `codigo_postal` (
  `codigo_postal_id` int(11) NOT NULL,
  `codigo_postal` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`codigo_postal_id`),
  KEY `fk_cp_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_cp_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_postal`
--

LOCK TABLES `codigo_postal` WRITE;
/*!40000 ALTER TABLE `codigo_postal` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigo_postal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigo_productos`
--

DROP TABLE IF EXISTS `codigo_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `codigo_productos` (
  `codigo_producto_id` int(11) NOT NULL,
  `codigo` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`codigo_producto_id`),
  KEY `fk_codprod_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_codprod_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigo_productos`
--

LOCK TABLES `codigo_productos` WRITE;
/*!40000 ALTER TABLE `codigo_productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigo_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comision`
--

DROP TABLE IF EXISTS `comision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comision` (
  `comision_id` int(11) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `comision_fija_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`comision_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `comision_fija_id_idx` (`comision_fija_id`),
  CONSTRAINT `fk_comision_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_comision_fija_rel` FOREIGN KEY (`comision_fija_id`) REFERENCES `comision_fija` (`comision_fija_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comision`
--

LOCK TABLES `comision` WRITE;
/*!40000 ALTER TABLE `comision` DISABLE KEYS */;
/*!40000 ALTER TABLE `comision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comision_fija`
--

DROP TABLE IF EXISTS `comision_fija`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comision_fija` (
  `comision_fija_id` int(11) NOT NULL,
  `amount` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`comision_fija_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_comision_fija_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comision_fija`
--

LOCK TABLES `comision_fija` WRITE;
/*!40000 ALTER TABLE `comision_fija` DISABLE KEYS */;
/*!40000 ALTER TABLE `comision_fija` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comprobantes`
--

DROP TABLE IF EXISTS `comprobantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comprobantes` (
  `numero_comprobante` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `comprobante_id` int(11) NOT NULL,
  `tipo_comprobante_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`comprobante_id`),
  KEY `tipo_comprobante_id_idx` (`tipo_comprobante_id`),
  CONSTRAINT `fk_comprobantes_tipo` FOREIGN KEY (`tipo_comprobante_id`) REFERENCES `tipo_comprobante` (`tipo_comprobante_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprobantes`
--

LOCK TABLES `comprobantes` WRITE;
/*!40000 ALTER TABLE `comprobantes` DISABLE KEYS */;
/*!40000 ALTER TABLE `comprobantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_envio`
--

DROP TABLE IF EXISTS `detalle_envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_envio` (
  `detalle_envio_id` int(11) NOT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `tipo_envio_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`detalle_envio_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `direccion_id_idx` (`direccion_id`),
  KEY `tipo_envio_id_idx` (`tipo_envio_id`),
  CONSTRAINT `fk_det_envio_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_envio_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_envio_tipo` FOREIGN KEY (`tipo_envio_id`) REFERENCES `tipo_envio` (`tipo_envio_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_envio`
--

LOCK TABLES `detalle_envio` WRITE;
/*!40000 ALTER TABLE `detalle_envio` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_envio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido_sucursales`
--

DROP TABLE IF EXISTS `detalle_pedido_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_pedido_sucursales` (
  `detalle_pedido_sucursales_id` int(11) NOT NULL,
  `productos_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  `envios_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`detalle_pedido_sucursales_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `envios_id_idx` (`envios_id`),
  KEY `productos_id_idx` (`productos_id`),
  CONSTRAINT `fk_det_pedido_envio` FOREIGN KEY (`envios_id`) REFERENCES `envios` (`envios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_pedido_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_pedido_producto` FOREIGN KEY (`productos_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido_sucursales`
--

LOCK TABLES `detalle_pedido_sucursales` WRITE;
/*!40000 ALTER TABLE `detalle_pedido_sucursales` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_pedido_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_reparacion`
--

DROP TABLE IF EXISTS `detalle_reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_reparacion` (
  `detalle_reparacion_id` int(11) NOT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `diagnostico_id` int(11) DEFAULT NULL,
  `forma_pago_id` int(11) DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT NULL,
  `hora_venta` datetime DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `garantia` tinyint(4) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`detalle_reparacion_id`),
  KEY `equipo_id_idx` (`equipo_id`),
  KEY `diagnostico_id_idx` (`diagnostico_id`),
  KEY `forma_pago_id_idx` (`forma_pago_id`),
  KEY `reparacion_id_idx` (`reparacion_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_det_rep_diagnostico` FOREIGN KEY (`diagnostico_id`) REFERENCES `diagnostico` (`diagnostico_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`equipo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_pago` FOREIGN KEY (`forma_pago_id`) REFERENCES `formas_pago` (`formas_pago_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_rep_reparacion` FOREIGN KEY (`reparacion_id`) REFERENCES `reparacion` (`reparacion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_reparacion`
--

LOCK TABLES `detalle_reparacion` WRITE;
/*!40000 ALTER TABLE `detalle_reparacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_venta` (
  `detalle_venta_id` int(11) NOT NULL,
  `forma_pago_id` int(11) DEFAULT NULL,
  `amount_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT NULL,
  `hora_venta` int(11) DEFAULT NULL,
  `garantia_id` int(11) DEFAULT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`detalle_venta_id`),
  KEY `forma_pago_id_idx` (`forma_pago_id`),
  KEY `venta_id_idx` (`venta_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_det_venta_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_venta_pago` FOREIGN KEY (`forma_pago_id`) REFERENCES `formas_pago` (`formas_pago_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_det_venta_venta` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`venta_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostico`
--

DROP TABLE IF EXISTS `diagnostico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `diagnostico` (
  `diagnostico_id` int(11) NOT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  `foto_diagnostico_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`diagnostico_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `foto_diagnostico_id_idx` (`foto_diagnostico_id`),
  CONSTRAINT `fk_diagnostico_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_diagnostico_foto` FOREIGN KEY (`foto_diagnostico_id`) REFERENCES `fotos_diagnostico` (`foto_diagnostico_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostico`
--

LOCK TABLES `diagnostico` WRITE;
/*!40000 ALTER TABLE `diagnostico` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnostico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direccion`
--

DROP TABLE IF EXISTS `direccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direccion` (
  `direccion_id` int(11) NOT NULL,
  `pais_id` int(11) DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `ciudad_id` int(11) DEFAULT NULL,
  `codigo_postal_id` int(11) DEFAULT NULL,
  `calle_id` int(11) DEFAULT NULL,
  `nro_calle_id` int(11) DEFAULT NULL,
  `barrio_id` int(11) DEFAULT NULL,
  `manzana_id` int(11) DEFAULT NULL,
  `casa_id` int(11) DEFAULT NULL,
  `provincia_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`direccion_id`),
  KEY `pais_id_idx` (`pais_id`),
  KEY `estado_id_idx` (`estado_id`),
  KEY `ciudad_id_idx` (`ciudad_id`),
  KEY `codigo_postal_id_idx` (`codigo_postal_id`),
  KEY `calle_id_idx` (`calle_id`),
  KEY `nro_calle_id_idx` (`nro_calle_id`),
  KEY `barrio_id_idx` (`barrio_id`),
  KEY `manazana_id_idx` (`manzana_id`),
  KEY `casa_id_idx` (`casa_id`),
  KEY `provincia_id_idx` (`provincia_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_dir_barrio` FOREIGN KEY (`barrio_id`) REFERENCES `barrios` (`barrios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_calle` FOREIGN KEY (`calle_id`) REFERENCES `calle` (`calle_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_casa` FOREIGN KEY (`casa_id`) REFERENCES `casa` (`casa_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_ciudad` FOREIGN KEY (`ciudad_id`) REFERENCES `ciudades` (`ciudad_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_cp` FOREIGN KEY (`codigo_postal_id`) REFERENCES `codigo_postal` (`codigo_postal_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_estado` FOREIGN KEY (`estado_id`) REFERENCES `estado` (`estado_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_manzana` FOREIGN KEY (`manzana_id`) REFERENCES `manzana` (`manzana_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_nro_calle` FOREIGN KEY (`nro_calle_id`) REFERENCES `nro_calle` (`nro_calle_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_pais` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dir_provincia` FOREIGN KEY (`provincia_id`) REFERENCES `provincias` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direccion`
--

LOCK TABLES `direccion` WRITE;
/*!40000 ALTER TABLE `direccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `direccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egreso`
--

DROP TABLE IF EXISTS `egreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `egreso` (
  `egreso_id` int(11) NOT NULL,
  `egreso` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`egreso_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_egreso_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egreso`
--

LOCK TABLES `egreso` WRITE;
/*!40000 ALTER TABLE `egreso` DISABLE KEYS */;
/*!40000 ALTER TABLE `egreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empleados` (
  `empleados_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `apellido` varchar(45) DEFAULT NULL,
  `dni` int(11) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `telefono_id` int(11) DEFAULT NULL,
  `genero_id` int(11) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `rol_id` int(11) DEFAULT NULL,
  `foto` varchar(45) DEFAULT NULL,
  `horarios_empleado_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`empleados_id`),
  KEY `direccion_id_idx` (`direccion_id`),
  KEY `telefono_id_idx` (`telefono_id`),
  KEY `genero_id_idx` (`genero_id`),
  KEY `rol_id_idx` (`rol_id`),
  KEY `horario_empleado_idx` (`horarios_empleado_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_empleados_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empleados_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empleados_genero` FOREIGN KEY (`genero_id`) REFERENCES `genero` (`genero_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empleados_horario` FOREIGN KEY (`horarios_empleado_id`) REFERENCES `horarios_empleado` (`horarios_empleado`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empleados_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_empleados_telefono` FOREIGN KEY (`telefono_id`) REFERENCES `telefonos` (`telefono_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `envios`
--

DROP TABLE IF EXISTS `envios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `envios` (
  `envios_id` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `precio` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`envios_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  CONSTRAINT `fk_envios_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleados_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_envios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipos` (
  `equipo_id` int(11) NOT NULL AUTO_INCREMENT,
  `marca_equipo_id` int(11) DEFAULT NULL,
  `categoria_equipo_id` int(11) DEFAULT NULL,
  `modelo_equipo_id` int(11) DEFAULT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `imei` varchar(50) DEFAULT NULL,
  `fecha_ingreso_sistema` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`equipo_id`),
  UNIQUE KEY `numero_serie` (`numero_serie`),
  UNIQUE KEY `imei` (`imei`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `categoria_id_idx` (`categoria_equipo_id`),
  KEY `marca_id_idx` (`marca_equipo_id`),
  KEY `modelo_id_idx` (`modelo_equipo_id`),
  CONSTRAINT `fk_equipos_categoria` FOREIGN KEY (`categoria_equipo_id`) REFERENCES `categorias_equipo` (`categoria_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_equipos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_equipos_marca` FOREIGN KEY (`marca_equipo_id`) REFERENCES `marcas_equipos` (`marca_equipo_id`),
  CONSTRAINT `fk_equipos_modelo` FOREIGN KEY (`modelo_equipo_id`) REFERENCES `modelo_equipos` (`modelo_equipo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estado` (
  `estado_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`estado_id`),
  KEY `fk_estado_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_estado_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_general`
--

DROP TABLE IF EXISTS `estado_general`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estado_general` (
  `estado_general_id` int(11) NOT NULL,
  `estado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`estado_general_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='est';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_general`
--

LOCK TABLES `estado_general` WRITE;
/*!40000 ALTER TABLE `estado_general` DISABLE KEYS */;
/*!40000 ALTER TABLE `estado_general` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_or`
--

DROP TABLE IF EXISTS `estados_or`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estados_or` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_or`
--

LOCK TABLES `estados_or` WRITE;
/*!40000 ALTER TABLE `estados_or` DISABLE KEYS */;
/*!40000 ALTER TABLE `estados_or` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `factura` (
  `factura_id` int(11) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `detalle_venta_id` int(11) DEFAULT NULL,
  `comision_id` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `detalle_reparacion_id` int(11) DEFAULT NULL,
  `sucursal_id` int(11) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `obervaciones` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`factura_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `comision_id_idx` (`comision_id`),
  KEY `sucursal_id_idx` (`sucursal_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  CONSTRAINT `fk_factura_comision` FOREIGN KEY (`comision_id`) REFERENCES `comision` (`comision_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_factura_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleados_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_factura_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_factura_sucursal` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`sucursales_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fotos_diagnostico`
--

DROP TABLE IF EXISTS `fotos_diagnostico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fotos_diagnostico` (
  `foto_diagnostico_id` int(11) NOT NULL AUTO_INCREMENT,
  `foto` varchar(255) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`foto_diagnostico_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_fotos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_diagnostico`
--

LOCK TABLES `fotos_diagnostico` WRITE;
/*!40000 ALTER TABLE `fotos_diagnostico` DISABLE KEYS */;
/*!40000 ALTER TABLE `fotos_diagnostico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garantias`
--

DROP TABLE IF EXISTS `garantias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `garantias` (
  `garantias_id` int(11) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `tipo_garantia` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `compra_proveedor_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`garantias_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_garantias_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genero` (
  `genero_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`genero_id`),
  KEY `fk_genero_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_genero_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genero`
--

LOCK TABLES `genero` WRITE;
/*!40000 ALTER TABLE `genero` DISABLE KEYS */;
/*!40000 ALTER TABLE `genero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_envio`
--

DROP TABLE IF EXISTS `historial_envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_envio` (
  `historial_envio_id` int(11) NOT NULL,
  `envios_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_envio_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `envios_id_idx` (`envios_id`),
  CONSTRAINT `fk_historial_envio_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_historial_envio_rel` FOREIGN KEY (`envios_id`) REFERENCES `envios` (`envios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_envio`
--

LOCK TABLES `historial_envio` WRITE;
/*!40000 ALTER TABLE `historial_envio` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_envio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_factura`
--

DROP TABLE IF EXISTS `historial_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_factura` (
  `historial_factura_id` int(11) NOT NULL,
  `factura_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_factura_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `factura_id_idx` (`factura_id`),
  CONSTRAINT `fk_historial_fact_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_historial_fact_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`factura_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_factura`
--

LOCK TABLES `historial_factura` WRITE;
/*!40000 ALTER TABLE `historial_factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_pedido_sucursal`
--

DROP TABLE IF EXISTS `historial_pedido_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_pedido_sucursal` (
  `historial_pedido_sucursal_id` int(11) NOT NULL,
  `pedido_sucursales_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_pedido_sucursal_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `pedido_sucursales_id_idx` (`pedido_sucursales_id`),
  CONSTRAINT `fk_historial_ped_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_historial_ped_pedido` FOREIGN KEY (`pedido_sucursales_id`) REFERENCES `pedidos_sucursales` (`pedidos_sucursales_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_pedido_sucursal`
--

LOCK TABLES `historial_pedido_sucursal` WRITE;
/*!40000 ALTER TABLE `historial_pedido_sucursal` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_pedido_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_producto`
--

DROP TABLE IF EXISTS `historial_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_producto` (
  `historial_producto_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_producto_id`),
  KEY `producto_id_idx` (`producto_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_historial_p_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_historial_p_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_producto`
--

LOCK TABLES `historial_producto` WRITE;
/*!40000 ALTER TABLE `historial_producto` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_reparacion`
--

DROP TABLE IF EXISTS `historial_reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_reparacion` (
  `historial_reparacion_id` int(11) NOT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_reparacion_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_historial_rep_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_reparacion`
--

LOCK TABLES `historial_reparacion` WRITE;
/*!40000 ALTER TABLE `historial_reparacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_usuario`
--

DROP TABLE IF EXISTS `historial_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_usuario` (
  `historial_usuario_id` int(11) NOT NULL,
  `ventas_id` int(11) DEFAULT NULL,
  `cantidad_puntos` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_usuario_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `ventas_id_idx` (`ventas_id`),
  CONSTRAINT `fk_historial_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_historial_venta` FOREIGN KEY (`ventas_id`) REFERENCES `venta` (`venta_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_usuario`
--

LOCK TABLES `historial_usuario` WRITE;
/*!40000 ALTER TABLE `historial_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_venta`
--

DROP TABLE IF EXISTS `historial_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_venta` (
  `historial_venta_id` int(11) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`historial_venta_id`),
  KEY `estado_general_id_idx` (`estado_general_id`,`venta_id`),
  CONSTRAINT `fk_historial_v_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_venta`
--

LOCK TABLES `historial_venta` WRITE;
/*!40000 ALTER TABLE `historial_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_empleado`
--

DROP TABLE IF EXISTS `horarios_empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horarios_empleado` (
  `horarios_empleado` int(11) NOT NULL,
  `horario` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`horarios_empleado`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_horarios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_empleado`
--

LOCK TABLES `horarios_empleado` WRITE;
/*!40000 ALTER TABLE `horarios_empleado` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios_empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horas_extra`
--

DROP TABLE IF EXISTS `horas_extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horas_extra` (
  `horas_extra_id` int(11) NOT NULL,
  `sueldo_por_hora` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`horas_extra_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_horas_extra_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horas_extra`
--

LOCK TABLES `horas_extra` WRITE;
/*!40000 ALTER TABLE `horas_extra` DISABLE KEYS */;
/*!40000 ALTER TABLE `horas_extra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interes`
--

DROP TABLE IF EXISTS `interes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interes` (
  `interes_id` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`interes_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_interes_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interes`
--

LOCK TABLES `interes` WRITE;
/*!40000 ALTER TABLE `interes` DISABLE KEYS */;
/*!40000 ALTER TABLE `interes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manzana`
--

DROP TABLE IF EXISTS `manzana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manzana` (
  `manzana_id` int(11) NOT NULL,
  `numero` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`manzana_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manzana`
--

LOCK TABLES `manzana` WRITE;
/*!40000 ALTER TABLE `manzana` DISABLE KEYS */;
/*!40000 ALTER TABLE `manzana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marca` (
  `marca_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`marca_id`),
  KEY `fk_marca_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_marca_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca_vehiculo`
--

DROP TABLE IF EXISTS `marca_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marca_vehiculo` (
  `marca_vehiculo_id` int(11) NOT NULL,
  `marca_vehiculo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`marca_vehiculo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_marca_vehiculo_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca_vehiculo`
--

LOCK TABLES `marca_vehiculo` WRITE;
/*!40000 ALTER TABLE `marca_vehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `marca_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas_equipos`
--

DROP TABLE IF EXISTS `marcas_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marcas_equipos` (
  `marca_equipo_id` int(11) NOT NULL,
  `marcas_equipos` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`marca_equipo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_marcas_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas_equipos`
--

LOCK TABLES `marcas_equipos` WRITE;
/*!40000 ALTER TABLE `marcas_equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `marcas_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas_proveedor`
--

DROP TABLE IF EXISTS `marcas_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marcas_proveedor` (
  `marcas_proveedor_id` int(11) NOT NULL,
  `marcas` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`marcas_proveedor_id`),
  KEY `fk_mprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_mprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas_proveedor`
--

LOCK TABLES `marcas_proveedor` WRITE;
/*!40000 ALTER TABLE `marcas_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `marcas_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matricula` (
  `matricula_id` int(11) NOT NULL,
  `matricula` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`matricula_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_matricula_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matricula`
--

LOCK TABLES `matricula` WRITE;
/*!40000 ALTER TABLE `matricula` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo`
--

DROP TABLE IF EXISTS `modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modelo` (
  `modelo_id` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`modelo_id`),
  KEY `fk_modelo_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_modelo_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo`
--

LOCK TABLES `modelo` WRITE;
/*!40000 ALTER TABLE `modelo` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_equipos`
--

DROP TABLE IF EXISTS `modelo_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modelo_equipos` (
  `modelo_equipo_id` int(11) NOT NULL,
  `modelo_equipos` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`modelo_equipo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_modelos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_equipos`
--

LOCK TABLES `modelo_equipos` WRITE;
/*!40000 ALTER TABLE `modelo_equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelo_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_proveedor`
--

DROP TABLE IF EXISTS `modelo_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modelo_proveedor` (
  `modelos_proveedor_id` int(11) NOT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`modelos_proveedor_id`),
  KEY `fk_modprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_modprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_proveedor`
--

LOCK TABLES `modelo_proveedor` WRITE;
/*!40000 ALTER TABLE `modelo_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelo_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_vehiculo`
--

DROP TABLE IF EXISTS `modelo_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modelo_vehiculo` (
  `modelo_vehiculo_id` int(11) NOT NULL,
  `modelo_vehiculo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`modelo_vehiculo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_modelo_vehiculo_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_vehiculo`
--

LOCK TABLES `modelo_vehiculo` WRITE;
/*!40000 ALTER TABLE `modelo_vehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelo_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nro_calle`
--

DROP TABLE IF EXISTS `nro_calle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nro_calle` (
  `nro_calle_id` int(11) NOT NULL,
  `numero` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`nro_calle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nro_calle`
--

LOCK TABLES `nro_calle` WRITE;
/*!40000 ALTER TABLE `nro_calle` DISABLE KEYS */;
/*!40000 ALTER TABLE `nro_calle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nro_chasis`
--

DROP TABLE IF EXISTS `nro_chasis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nro_chasis` (
  `nro_chasis_id` int(11) NOT NULL,
  `nro_chasis` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`nro_chasis_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_nro_chasis_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nro_chasis`
--

LOCK TABLES `nro_chasis` WRITE;
/*!40000 ALTER TABLE `nro_chasis` DISABLE KEYS */;
/*!40000 ALTER TABLE `nro_chasis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paises`
--

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paises` (
  `pais_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`pais_id`),
  KEY `fk_paises_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_paises_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paises`
--

LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos_sucursales`
--

DROP TABLE IF EXISTS `pedidos_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedidos_sucursales` (
  `pedidos_sucursales_id` int(11) NOT NULL,
  `fecha_pedido` date DEFAULT NULL,
  `hora_pedido` datetime DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`pedidos_sucursales_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_pedidos_suc_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_sucursales`
--

LOCK TABLES `pedidos_sucursales` WRITE;
/*!40000 ALTER TABLE `pedidos_sucursales` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `categoria_productos_id` int(11) DEFAULT NULL,
  `marca_id` int(11) DEFAULT NULL,
  `modelo_id` int(11) DEFAULT NULL,
  `codigo_producto_id` int(11) DEFAULT NULL,
  `precio_venta` decimal(15,2) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `imagen` varchar(45) DEFAULT NULL,
  `productos_id` int(11) NOT NULL,
  `garantia` tinyint(4) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos_sucursal`
--

DROP TABLE IF EXISTS `productos_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos_sucursal` (
  `productos_sucursal_id` int(11) NOT NULL,
  `productos_id` int(11) DEFAULT NULL,
  `sucursal_id` int(11) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `stock_disponible` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `stock_total` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`productos_sucursal_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `sucursal_id_idx` (`sucursal_id`),
  KEY `producto_id_idx` (`productos_id`),
  CONSTRAINT `fk_prod_suc_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_suc_producto` FOREIGN KEY (`productos_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prod_suc_sucursal` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`sucursales_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos_sucursal`
--

LOCK TABLES `productos_sucursal` WRITE;
/*!40000 ALTER TABLE `productos_sucursal` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`proveedor_id`),
  KEY `direccion_id_idx` (`direccion_id`),
  KEY `telefono_id_idx` (`telefono_id`),
  KEY `tipo_proveedor_id_idx` (`tipo_proveedor_id`),
  KEY `marcas_proveedor_id_idx` (`marcas_proveedor_id`),
  KEY `modelos_proveedor_id_idx` (`modelos_proveedor_id`),
  KEY `sitio_web_id_idx` (`sitio_web_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_prov_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_marca` FOREIGN KEY (`marcas_proveedor_id`) REFERENCES `marcas_proveedor` (`marcas_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_modelo` FOREIGN KEY (`modelos_proveedor_id`) REFERENCES `modelo_proveedor` (`modelos_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_tel` FOREIGN KEY (`telefono_id`) REFERENCES `telefonos` (`telefono_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_tipo` FOREIGN KEY (`tipo_proveedor_id`) REFERENCES `tipo_proveedor` (`tipo_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_prov_web` FOREIGN KEY (`sitio_web_id`) REFERENCES `sitios_web_proveedor` (`sitios_web_proveedor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provincias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_provincias_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_provincias_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincias`
--

LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puntos`
--

DROP TABLE IF EXISTS `puntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `puntos` (
  `puntos_producto_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `servicio_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`puntos_producto_id`),
  KEY `producto_id_idx` (`producto_id`),
  KEY `servicio_id_idx` (`servicio_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_puntos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_puntos_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`productos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_puntos_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos`
--

LOCK TABLES `puntos` WRITE;
/*!40000 ALTER TABLE `puntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `puntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puntos_usuario`
--

DROP TABLE IF EXISTS `puntos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `puntos_usuario` (
  `puntos_usuario_id` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`puntos_usuario_id`),
  KEY `fk_puntos_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_puntos_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos_usuario`
--

LOCK TABLES `puntos_usuario` WRITE;
/*!40000 ALTER TABLE `puntos_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `puntos_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regalos`
--

DROP TABLE IF EXISTS `regalos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `regalos` (
  `regalos_id` int(11) NOT NULL,
  `regalos` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`regalos_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_regalos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regalos`
--

LOCK TABLES `regalos` WRITE;
/*!40000 ALTER TABLE `regalos` DISABLE KEYS */;
/*!40000 ALTER TABLE `regalos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regalos_puntos_usuario`
--

DROP TABLE IF EXISTS `regalos_puntos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `regalos_puntos_usuario` (
  `regalos_puntos_usuario_id` int(11) NOT NULL,
  `regalos_id` int(11) DEFAULT NULL,
  `clasificacion_usuario_id` int(11) DEFAULT NULL,
  `puntos_usuario` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`regalos_puntos_usuario_id`),
  KEY `regalos_id_idx` (`regalos_id`),
  KEY `clasificacion_usuario_id_idx` (`clasificacion_usuario_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_regalos_puntos_clasif` FOREIGN KEY (`clasificacion_usuario_id`) REFERENCES `clasificacion_usuario` (`clasificacion_usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_regalos_puntos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_regalos_puntos_regalo` FOREIGN KEY (`regalos_id`) REFERENCES `regalos` (`regalos_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regalos_puntos_usuario`
--

LOCK TABLES `regalos_puntos_usuario` WRITE;
/*!40000 ALTER TABLE `regalos_puntos_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `regalos_puntos_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reparacion`
--

DROP TABLE IF EXISTS `reparacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reparacion` (
  `reparacion_id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_entrega` date DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `envio_id` tinyint(4) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`reparacion_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  KEY `usuario_id_idx` (`usuario_id`),
  CONSTRAINT `fk_reparacion_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleados_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_reparacion_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`),
  CONSTRAINT `fk_reparacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reparacion`
--

LOCK TABLES `reparacion` WRITE;
/*!40000 ALTER TABLE `reparacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `reparacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_roles_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_roles_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios` (
  `servicios_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `categorias_servicios_id` int(11) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `costo` decimal(15,2) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`servicios_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `categorias_servicios_id_idx` (`categorias_servicios_id`),
  CONSTRAINT `fk_servicios_categoria` FOREIGN KEY (`categorias_servicios_id`) REFERENCES `categorias_servicios` (`categorias_servicios_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_servicios_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sitios_web_proveedor`
--

DROP TABLE IF EXISTS `sitios_web_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sitios_web_proveedor` (
  `sitios_web_proveedor_id` int(11) NOT NULL,
  `sitios_web_proveedor` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`sitios_web_proveedor_id`),
  KEY `fk_swprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_swprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sitios_web_proveedor`
--

LOCK TABLES `sitios_web_proveedor` WRITE;
/*!40000 ALTER TABLE `sitios_web_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `sitios_web_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sueldo_basico`
--

DROP TABLE IF EXISTS `sueldo_basico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sueldo_basico` (
  `sueldo_basico_id` int(11) NOT NULL,
  `sueldo_basico` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`sueldo_basico_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_sueldo_basico_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sueldo_basico`
--

LOCK TABLES `sueldo_basico` WRITE;
/*!40000 ALTER TABLE `sueldo_basico` DISABLE KEYS */;
/*!40000 ALTER TABLE `sueldo_basico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sueldo_total`
--

DROP TABLE IF EXISTS `sueldo_total`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sueldo_total` (
  `sueldo_total_id` int(11) NOT NULL,
  `sueldo_basico_id` int(11) DEFAULT NULL,
  `comision_id` int(11) DEFAULT NULL,
  `horas_extra_id` int(11) DEFAULT NULL,
  `cantidad_horas_extra` int(11) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`sueldo_total_id`),
  KEY `sueldo_basico_id_idx` (`sueldo_basico_id`),
  KEY `comision_id_idx` (`comision_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_sueldo_total_basico` FOREIGN KEY (`sueldo_basico_id`) REFERENCES `sueldo_basico` (`sueldo_basico_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_sueldo_total_comision` FOREIGN KEY (`comision_id`) REFERENCES `comision` (`comision_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_sueldo_total_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sueldo_total`
--

LOCK TABLES `sueldo_total` WRITE;
/*!40000 ALTER TABLE `sueldo_total` DISABLE KEYS */;
/*!40000 ALTER TABLE `sueldo_total` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telefonos`
--

DROP TABLE IF EXISTS `telefonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telefonos` (
  `telefono_id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `codigo_area_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`telefono_id`),
  KEY `fk_tel_estado_general_idx` (`estado_general_id`),
  KEY `fk_tel_codigo_area_idx` (`codigo_area_id`),
  CONSTRAINT `fk_tel_codigo_area` FOREIGN KEY (`codigo_area_id`) REFERENCES `codigo_area` (`codigo_area_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tel_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telefonos`
--

LOCK TABLES `telefonos` WRITE;
/*!40000 ALTER TABLE `telefonos` DISABLE KEYS */;
/*!40000 ALTER TABLE `telefonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_comprobante`
--

DROP TABLE IF EXISTS `tipo_comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_comprobante` (
  `tipo_comprobante_id` int(11) NOT NULL,
  `tipo_comprobante` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tipo_comprobante_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_tipo_comprobante_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_comprobante`
--

LOCK TABLES `tipo_comprobante` WRITE;
/*!40000 ALTER TABLE `tipo_comprobante` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_envio`
--

DROP TABLE IF EXISTS `tipo_envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_envio` (
  `tipo_envio_id` int(11) NOT NULL,
  `tipo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tipo_envio_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_tipo_envio_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_envio`
--

LOCK TABLES `tipo_envio` WRITE;
/*!40000 ALTER TABLE `tipo_envio` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_envio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_garantia`
--

DROP TABLE IF EXISTS `tipo_garantia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_garantia` (
  `garantia_id` int(11) NOT NULL,
  `descipcion` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`garantia_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_tipo_garantia_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_garantia`
--

LOCK TABLES `tipo_garantia` WRITE;
/*!40000 ALTER TABLE `tipo_garantia` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_garantia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_proveedor`
--

DROP TABLE IF EXISTS `tipo_proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_proveedor` (
  `tipo_proveedor_id` int(11) NOT NULL,
  `tipo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tipo_proveedor_id`),
  KEY `fk_tprov_estado_general_idx` (`estado_general_id`),
  CONSTRAINT `fk_tprov_estado_general` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_proveedor`
--

LOCK TABLES `tipo_proveedor` WRITE;
/*!40000 ALTER TABLE `tipo_proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_vehiculo`
--

DROP TABLE IF EXISTS `tipo_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_vehiculo` (
  `tipo_vehiculo_id` int(11) NOT NULL,
  `tipo_vehiculo` varchar(45) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tipo_vehiculo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  CONSTRAINT `fk_tipo_vehiculo_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_vehiculo`
--

LOCK TABLES `tipo_vehiculo` WRITE;
/*!40000 ALTER TABLE `tipo_vehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `nombre` varchar(45) DEFAULT NULL,
  `apellido` varchar(45) DEFAULT NULL,
  `dni_cuit` int(11) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `telefono_id` int(11) DEFAULT NULL,
  `rol_id` int(11) DEFAULT NULL,
  `genero_id` int(11) DEFAULT NULL,
  `puntos_usuario_id` int(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `direccion_id_idx` (`direccion_id`),
  KEY `telefono_id_idx` (`telefono_id`),
  KEY `rol_id_idx` (`rol_id`),
  KEY `genero_id_idx` (`genero_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `fk_user_puntos` (`puntos_usuario_id`),
  CONSTRAINT `fk_user_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direccion` (`direccion_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_estado_gen` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_gen` FOREIGN KEY (`genero_id`) REFERENCES `genero` (`genero_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_puntos` FOREIGN KEY (`puntos_usuario_id`) REFERENCES `puntos_usuario` (`puntos_usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_tel` FOREIGN KEY (`telefono_id`) REFERENCES `telefonos` (`telefono_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos` (
  `vehiculos_id` int(11) NOT NULL,
  `marca_vehiculo_id` int(11) DEFAULT NULL,
  `modelo_vehiculo_id` int(11) DEFAULT NULL,
  `tipo_vehiculo_id` int(11) DEFAULT NULL,
  `matricula_id` int(11) DEFAULT NULL,
  `nro_chasis_id` int(11) DEFAULT NULL,
  `capacidad_espacio` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  `observaciones` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`vehiculos_id`),
  KEY `marca_vehiculo_id_idx` (`marca_vehiculo_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `modelo_vehiculo_id_idx` (`modelo_vehiculo_id`),
  KEY `tipo_vehiculo_id_idx` (`tipo_vehiculo_id`),
  KEY `matricula_id_idx` (`matricula_id`),
  KEY `nro_chasis_id_idx` (`nro_chasis_id`),
  CONSTRAINT `fk_vehiculos_chasis` FOREIGN KEY (`nro_chasis_id`) REFERENCES `nro_chasis` (`nro_chasis_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_vehiculos_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_vehiculos_marca` FOREIGN KEY (`marca_vehiculo_id`) REFERENCES `marca_vehiculo` (`marca_vehiculo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_vehiculos_matricula` FOREIGN KEY (`matricula_id`) REFERENCES `matricula` (`matricula_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_vehiculos_modelo` FOREIGN KEY (`modelo_vehiculo_id`) REFERENCES `modelo_vehiculo` (`modelo_vehiculo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_vehiculos_tipo` FOREIGN KEY (`tipo_vehiculo_id`) REFERENCES `tipo_vehiculo` (`tipo_vehiculo_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculos`
--

LOCK TABLES `vehiculos` WRITE;
/*!40000 ALTER TABLE `vehiculos` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehiculos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `venta` (
  `venta_id` int(11) NOT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(15,2) DEFAULT NULL,
  `envio_id` tinyint(4) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado_general_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`venta_id`),
  KEY `estado_general_id_idx` (`estado_general_id`),
  KEY `empleado_id_idx` (`empleado_id`),
  KEY `usuario_id_idx` (`usuario_id`),
  CONSTRAINT `fk_venta_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleados_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_venta_estado` FOREIGN KEY (`estado_general_id`) REFERENCES `estado_general` (`estado_general_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
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

-- Dump completed on 2026-07-03 10:02:48
