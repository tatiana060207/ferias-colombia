<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../backend/config/conexion.php';

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, codigo_localidad, nombre_localidad FROM localidades ORDER BY id ASC");
        $localidades = $stmt->fetchAll();
        jsonResponse(['localidades' => $localidades]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener las localidades', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        jsonResponse(['error' => 'Cuerpo JSON vacío o inválido'], 400);
    }

    if (empty($input['codigo_localidad']) || empty($input['nombre_localidad'])) {
        jsonResponse(['error' => 'Los campos código y nombre son obligatorios'], 400);
    }

    $codigo = strtoupper(trim($input['codigo_localidad']));
    $nombre = ucfirst(trim($input['nombre_localidad']));

    if (!preg_match('/^[A-Za-z0-9]{1,10}$/', $codigo)) {
        jsonResponse(['error' => 'El código solo puede contener letras y números (máx 10)'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM localidades WHERE codigo_localidad = :codigo");
        $stmt->execute([':codigo' => $codigo]);
        if ($stmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'El código de localidad ya existe'], 409);
        }

        $stmt = $pdo->prepare("INSERT INTO localidades (codigo_localidad, nombre_localidad) VALUES (:codigo, :nombre)");
        $stmt->execute([':codigo' => $codigo, ':nombre' => $nombre]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT id, codigo_localidad, nombre_localidad FROM localidades WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $localidad = $stmt->fetch();

        jsonResponse(['mensaje' => 'Localidad creada exitosamente', 'localidad' => $localidad], 201);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al crear la localidad', 'detalle' => $e->getMessage()], 500);
    }
}

else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}
