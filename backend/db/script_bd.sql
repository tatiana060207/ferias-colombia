-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-10-2025 a las 18:58:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `feria_colombia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `artistas`
--

CREATE TABLE `artistas` (
  `id` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `genero_musical` varchar(50) NOT NULL,
  `ciudad_natal` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `artistas`
--

INSERT INTO `artistas` (`id`, `nombres`, `apellidos`, `genero_musical`, `ciudad_natal`) VALUES
(1, 'Carlos', 'Vives', 'Vallenato', 'Santa Marta'),
(2, 'Shakira', 'Mebarak', 'Pop', 'Barranquilla');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `boleteria`
--

CREATE TABLE `boleteria` (
  `id` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `id_localidad` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `cantidad_disponible` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `boleteria`
--

INSERT INTO `boleteria` (`id`, `id_evento`, `id_localidad`, `valor`, `cantidad_disponible`) VALUES
(1, 1, 1, 120000.00, 100),
(2, 1, 2, 60000.00, 200),
(3, 2, 1, 150000.00, 80),
(4, 2, 2, 70000.00, 250),
(5, 1, 1, 80000.00, 100),
(6, 1, 2, 60000.00, 200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `id_localidad` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL CHECK (`cantidad` > 0 and `cantidad` <= 10),
  `valor_total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(20) NOT NULL,
  `numero_tarjeta` char(15) DEFAULT NULL,
  `estado` enum('Exitosa','Cancelada','Pendiente') DEFAULT 'Pendiente',
  `fecha_compra` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `id_usuario`, `id_evento`, `id_localidad`, `cantidad`, `valor_total`, `metodo_pago`, `numero_tarjeta`, `estado`, `fecha_compra`) VALUES
(1, 1, 1, 1, 2, 240000.00, 'Tarjeta', '111122223333444', 'Exitosa', '2025-10-22 15:18:17'),
(2, 2, 2, 2, 3, 210000.00, 'Tarjeta', '555566667777888', 'Exitosa', '2025-10-22 15:18:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `municipio`, `departamento`, `estado`) VALUES
(1, 'Festival del Río', 'Celebración cultural con artistas nacionales.', '2025-11-15 18:00:00', '2025-11-15 23:00:00', 'Honda', 'Tolima', 'Activo'),
(2, 'Feria del Café', 'Evento con música, danzas y gastronomía.', '2025-12-05 17:00:00', '2025-12-05 23:59:00', 'Manizales', 'Caldas', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_artista`
--

CREATE TABLE `evento_artista` (
  `id` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `evento_artista`
--

INSERT INTO `evento_artista` (`id`, `id_evento`, `id_artista`) VALUES
(1, 1, 1),
(2, 2, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidades`
--

CREATE TABLE `localidades` (
  `id` int(11) NOT NULL,
  `codigo_localidad` varchar(10) NOT NULL,
  `nombre_localidad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `localidades`
--

INSERT INTO `localidades` (`id`, `codigo_localidad`, `nombre_localidad`) VALUES
(1, 'LOC1', 'VIP'),
(2, 'LOC2', 'General'),
(3, 'LOC3', 'Palco');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `tipo_documento` enum('CC','TI','CE','PASAPORTE') NOT NULL,
  `numero_documento` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombres`, `apellidos`, `tipo_documento`, `numero_documento`, `correo`, `telefono`, `contraseña`, `fecha_registro`) VALUES
(1, 'Laura', 'Gómez', 'CC', '1002003001', 'laura@gmail.com', '3105550001', '12345', '2025-10-22 15:18:17'),
(2, 'Andrés', 'Pérez', 'CC', '1002003002', 'andres@gmail.com', '3105550002', '12345', '2025-10-22 15:18:17');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `artistas`
--
ALTER TABLE `artistas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `boleteria`
--
ALTER TABLE `boleteria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_evento` (`id_evento`),
  ADD KEY `id_localidad` (`id_localidad`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_evento` (`id_evento`),
  ADD KEY `id_localidad` (`id_localidad`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `evento_artista`
--
ALTER TABLE `evento_artista`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_evento` (`id_evento`),
  ADD KEY `id_artista` (`id_artista`);

--
-- Indices de la tabla `localidades`
--
ALTER TABLE `localidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_localidad` (`codigo_localidad`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_documento` (`numero_documento`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `artistas`
--
ALTER TABLE `artistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `boleteria`
--
ALTER TABLE `boleteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `evento_artista`
--
ALTER TABLE `evento_artista`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `localidades`
--
ALTER TABLE `localidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `boleteria`
--
ALTER TABLE `boleteria`
  ADD CONSTRAINT `boleteria_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `boleteria_ibfk_2` FOREIGN KEY (`id_localidad`) REFERENCES `localidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `compras_ibfk_3` FOREIGN KEY (`id_localidad`) REFERENCES `localidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `evento_artista`
--
ALTER TABLE `evento_artista`
  ADD CONSTRAINT `evento_artista_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `evento_artista_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artistas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
