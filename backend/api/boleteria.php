<?php
// backend/api/boleteria.php
// RF2 - Módulo para registrar y consultar la boletería de un evento

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================================
// OBTENER boletería de un evento (GET)
// ==========================================================
if ($method === 'GET') {
    if (!isset($_GET['id_evento'])) {
        jsonResponse(['error' => 'Debe enviar el parámetro id_evento'], 400);
    }

    $id_evento = intval($_GET['id_evento']);

    try {
        $stmt = $pdo->prepare("
            SELECT 
                b.id, 
                b.valor, 
                b.cantidad_disponible,
                l.codigo_localidad, 
                l.nombre_localidad
            FROM boleteria b
            INNER JOIN localidades l ON b.id_localidad = l.id
            WHERE b.id_evento = :id_evento
        ");
        $stmt->execute([':id_evento' => $id_evento]);
        $boleteria = $stmt->fetchAll();

        jsonResponse(['boleteria' => $boleteria]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener la boletería', 'detalle' => $e->getMessage()], 500);
    }
}

// ==========================================================
// CREAR boletería para un evento (POST)
// ==========================================================
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['id_evento']) || empty($input['boleteria'])) {
        jsonResponse(['error' => 'Debe enviar id_evento y un arreglo de boletería'], 400);
    }

    $id_evento = intval($input['id_evento']);
    $boleteria = $input['boleteria']; // array de {id_localidad, valor, cantidad}

    if (!is_array($boleteria) || count($boleteria) === 0) {
        jsonResponse(['error' => 'El campo boleteria debe ser un arreglo con al menos un elemento'], 400);
    }

    try {
        $pdo->beginTransaction();

        foreach ($boleteria as $item) {
            if (
                empty($item['id_localidad']) ||
                empty($item['valor']) ||
                empty($item['cantidad'])
            ) {
                $pdo->rollBack();
                jsonResponse(['error' => 'Cada elemento debe tener id_localidad, valor y cantidad'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO boleteria (id_evento, id_localidad, valor, cantidad_disponible)
                VALUES (:id_evento, :id_localidad, :valor, :cantidad)
            ");

            $stmt->execute([
                ':id_evento' => $id_evento,
                ':id_localidad' => intval($item['id_localidad']),
                ':valor' => floatval($item['valor']),
                ':cantidad' => intval($item['cantidad'])
            ]);
        }

        $pdo->commit();
        jsonResponse(['mensaje' => 'Boletería registrada exitosamente'], 201);
    } catch (PDOException $e) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Error al registrar la boletería', 'detalle' => $e->getMessage()], 500);
    }
}

else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}
