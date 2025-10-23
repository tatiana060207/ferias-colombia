<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../backend/config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT 
                    ea.id,
                    e.nombre AS evento,
                    a.nombres AS artista,
                    a.genero_musical,
                    a.ciudad_natal,
                    e.fecha_inicio,
                    e.fecha_fin
                FROM evento_artista ea
                INNER JOIN eventos e ON ea.id_evento = e.id
                INNER JOIN artistas a ON ea.id_artista = a.id";
        $stmt = $pdo->query($sql);
        $asociaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($asociaciones);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id_evento) || !isset($data->id_artista)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos obligatorios']);
            exit;
        }

        $validacion = $pdo->prepare("
            SELECT ea.id_evento, e.nombre as nombre_evento, e.fecha_inicio, e.fecha_fin
            FROM evento_artista ea
            INNER JOIN eventos e ON ea.id_evento = e.id
            INNER JOIN eventos e2 ON e2.id = :id_evento
            WHERE ea.id_artista = :id_artista
              AND (
                (e.fecha_inicio < e2.fecha_fin AND e.fecha_fin > e2.fecha_inicio)
              )
        ");
        $validacion->execute([
            ':id_evento' => $data->id_evento,
            ':id_artista' => $data->id_artista
        ]);

        if ($validacion->rowCount() > 0) {
            $conflicto = $validacion->fetch(PDO::FETCH_ASSOC);
            http_response_code(409);
            echo json_encode([
                'error' => 'El artista ya está asignado a otro evento en el mismo horario',
                'evento_conflicto' => $conflicto['nombre_evento'],
                'fecha_inicio' => $conflicto['fecha_inicio'],
                'fecha_fin' => $conflicto['fecha_fin']
            ]);
            exit;
        }

        $sql = "INSERT INTO evento_artista (id_evento, id_artista) VALUES (:id_evento, :id_artista)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id_evento' => $data->id_evento,
            ':id_artista' => $data->id_artista
        ]);

        echo json_encode(['message' => 'Artista asociado correctamente al evento']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Parámetro id faltante']);
            exit;
        }

        $sql = "DELETE FROM evento_artista WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $_GET['id']]);

        echo json_encode(['message' => 'Asociación eliminada correctamente']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
