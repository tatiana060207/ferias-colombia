<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../backend/config/conexion.php';

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM eventos ORDER BY fecha_inicio DESC");
        $eventos = $stmt->fetchAll();
        jsonResponse($eventos);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener eventos', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        jsonResponse(['error' => 'No se recibieron datos JSON válidos'], 400);
    }

    $nombre = trim($input['nombre'] ?? '');
    $descripcion = trim($input['descripcion'] ?? '');
    $fecha_inicio = trim($input['fecha_inicio'] ?? '');
    $fecha_fin = trim($input['fecha_fin'] ?? '');
    $municipio = trim($input['municipio'] ?? '');
    $departamento = trim($input['departamento'] ?? '');
    $estado = 'Activo';

    if (empty($nombre) || empty($descripcion) || empty($fecha_inicio) || empty($fecha_fin)) {
        jsonResponse(['error' => 'Todos los campos obligatorios deben completarse'], 400);
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO eventos 
            (nombre, descripcion, fecha_inicio, fecha_fin, municipio, departamento, estado) 
            VALUES (:nombre, :descripcion, :fecha_inicio, :fecha_fin, :municipio, :departamento, :estado)");

        $stmt->execute([
            ':nombre' => $nombre,
            ':descripcion' => $descripcion,
            ':fecha_inicio' => $fecha_inicio,
            ':fecha_fin' => $fecha_fin,
            ':municipio' => $municipio,
            ':departamento' => $departamento,
            ':estado' => $estado
        ]);

        jsonResponse(['mensaje' => 'Evento guardado correctamente', 'id' => $pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al guardar el evento', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);

    $id = intval($input['id'] ?? 0);
    if ($id <= 0) jsonResponse(['error' => 'ID inválido'], 400);

    $nombre = trim($input['nombre'] ?? '');
    $descripcion = trim($input['descripcion'] ?? '');
    $fecha_inicio = trim($input['fecha_inicio'] ?? '');
    $fecha_fin = trim($input['fecha_fin'] ?? '');
    $municipio = trim($input['municipio'] ?? '');
    $departamento = trim($input['departamento'] ?? '');
    $estado = trim($input['estado'] ?? 'Activo');

    try {
        $stmt = $pdo->prepare("UPDATE eventos 
            SET nombre=:nombre, descripcion=:descripcion, fecha_inicio=:fecha_inicio, fecha_fin=:fecha_fin, 
                municipio=:municipio, departamento=:departamento, estado=:estado 
            WHERE id=:id");

        $stmt->execute([
            ':nombre' => $nombre,
            ':descripcion' => $descripcion,
            ':fecha_inicio' => $fecha_inicio,
            ':fecha_fin' => $fecha_fin,
            ':municipio' => $municipio,
            ':departamento' => $departamento,
            ':estado' => $estado,
            ':id' => $id
        ]);

        jsonResponse(['mensaje' => 'Evento actualizado correctamente']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al actualizar el evento', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = intval($input['id'] ?? 0);

    if ($id <= 0) jsonResponse(['error' => 'ID inválido'], 400);

    try {
        $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        jsonResponse(['mensaje' => 'Evento eliminado correctamente']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al eliminar el evento', 'detalle' => $e->getMessage()], 500);
    }
}

else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}
?>
