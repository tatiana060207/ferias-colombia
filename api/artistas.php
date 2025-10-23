<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once __DIR__ . '/../backend/config/conexion.php'; // <- ruta correcta

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM artistas WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $artista = $stmt->fetch();
            echo json_encode($artista ?: ["mensaje" => "Artista no encontrado"]);
        } else {
            $stmt = $pdo->query("SELECT * FROM artistas ORDER BY id DESC");
            $artistas = $stmt->fetchAll();
            echo json_encode($artistas);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['nombres']) ||
            empty($data['apellidos']) ||
            empty($data['genero_musical']) ||
            empty($data['ciudad_natal'])
        ) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan datos obligatorios"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO artistas (nombres, apellidos, genero_musical, ciudad_natal) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([
            $data['nombres'],
            $data['apellidos'],
            $data['genero_musical'],
            $data['ciudad_natal']
        ]);

        if ($ok) {
            http_response_code(201);
            echo json_encode(["mensaje" => "Artista registrado correctamente", "id" => $pdo->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al registrar artista"]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del artista"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE artistas 
                               SET nombres = ?, apellidos = ?, genero_musical = ?, ciudad_natal = ? 
                               WHERE id = ?");
        $ok = $stmt->execute([
            $data['nombres'],
            $data['apellidos'],
            $data['genero_musical'],
            $data['ciudad_natal'],
            $_GET['id']
        ]);

        echo json_encode($ok ? ["mensaje" => "Artista actualizado correctamente"] : ["error" => "Error al actualizar artista"]);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del artista"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM artistas WHERE id = ?");
        $ok = $stmt->execute([$_GET['id']]);

        echo json_encode($ok ? ["mensaje" => "Artista eliminado correctamente"] : ["error" => "Error al eliminar artista"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
