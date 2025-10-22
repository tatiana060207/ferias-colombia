<?php
// backend/api/artistas.php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include '../config/conexion.php'; // usa $pdo

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // =====================================
    // GET → listar artistas o uno en específico
    // =====================================
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM artistas WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $artista = $stmt->fetch();
            echo json_encode($artista ?: ["mensaje" => "Artista no encontrado"]);
        } else {
            $stmt = $pdo->query("SELECT * FROM artistas");
            $artistas = $stmt->fetchAll();
            echo json_encode($artistas);
        }
        break;

    // =====================================
    // POST → crear artista nuevo
    // =====================================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['nombres']) ||
            empty($data['apellidos']) ||
            empty($data['genero_musical']) ||
            empty($data['ciudad_natal'])
        ) {
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
            echo json_encode(["mensaje" => "Artista registrado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al registrar artista"]);
        }
        break;

    // =====================================
    // PUT → actualizar artista existente
    // =====================================
    case 'PUT':
        if (!isset($_GET['id'])) {
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

        echo json_encode($ok
            ? ["mensaje" => "Artista actualizado correctamente"]
            : ["error" => "Error al actualizar artista"]
        );
        break;

    // =====================================
    // DELETE → eliminar artista
    // =====================================
    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["error" => "Falta el ID del artista"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM artistas WHERE id = ?");
        $ok = $stmt->execute([$_GET['id']]);

        echo json_encode($ok
            ? ["mensaje" => "Artista eliminado correctamente"]
            : ["error" => "Error al eliminar artista"]
        );
        break;

    default:
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>
