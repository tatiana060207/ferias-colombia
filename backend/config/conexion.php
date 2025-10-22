<?php
// backend/config/conexion.php

// Configuración de la base de datos
$DB_HOST = '127.0.0.1';
$DB_NAME = 'feria_colombia';
$DB_USER = 'root';
$DB_PASS = ''; // cambia esto si tienes contraseña

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    // En producción muestra un mensaje genérico.
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Error de conexión a la base de datos', 'detalle' => $e->getMessage()]);
    exit;
}
