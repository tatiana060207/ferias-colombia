<?php
// backend/api/localidades.php
// Módulo para listar y crear localidades (RF3)

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
    // =====================================
    // OBTENER TODAS LAS LOCALIDADES
    // =====================================
    try {
        $stmt = $pdo->query("SELECT id, codigo_localidad, nombre_localidad FROM localidades ORDER BY id ASC");
        $localidades = $stmt->fetchAll();
        jsonResponse(['localidades' => $localidades]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener las localidades', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'POST') {
    // =====================================
    // CREAR UNA NUEVA LOCALIDAD
    // =====================================
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        jsonResponse(['error' => 'Cuerpo JSON vacío o inválido'], 400);
    }

    // Validar campos requeridos
    if (empty($input['codigo_localidad']) || empty($input['nombre_localidad'])) {
        jsonResponse(['error' => 'Los campos codigo_localidad y nombre_localidad son obligatorios'], 400);
    }

    $codigo = strtoupper(trim($input['codigo_localidad']));
    $nombre = ucfirst(trim($input['nombre_localidad']));

    // Validar longitud y formato (solo letras/números)
    if (!preg_match('/^[A-Za-z0-9]{1,10}$/', $codigo)) {
        jsonResponse(['error' => 'El código de localidad solo puede contener letras y números (máx 10)'], 400);
    }

    try {
        // Verificar que el código no exista
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM localidades WHERE codigo_localidad = :codigo");
        $stmt->execute([':codigo' => $codigo]);
        $existe = $stmt->fetchColumn();

        if ($existe > 0) {
            jsonResponse(['error' => 'El código de localidad ya existe'], 409);
        }

        // Insertar nueva localidad
        $stmt = $pdo->prepare(
            "INSERT INTO localidades (codigo_localidad, nombre_localidad)
             VALUES (:codigo, :nombre)"
        );
        $stmt->execute([':codigo' => $codigo, ':nombre' => $nombre]);

        $id = $pdo->lastInsertId();

        // Devolver el registro creado
        $stmt = $pdo->prepare("SELECT id, codigo_localidad, nombre_localidad FROM localidades WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $localidadCreada = $stmt->fetch();

        jsonResponse([
            'mensaje' => 'Localidad creada exitosamente',
            'localidad' => $localidadCreada
        ], 201);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al crear la localidad', 'detalle' => $e->getMessage()], 500);
    }
}

else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}
