<?php
// backend/api/usuario.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include '../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->accion)) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el campo 'accion' (registro o login)"]);
            exit;
        }

        // ===== REGISTRO =====
        if ($data->accion === 'registro') {
            // Validar datos obligatorios
            $campos = ['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'correo', 'telefono', 'contraseña'];
            foreach ($campos as $campo) {
                if (empty($data->$campo)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Falta el campo '$campo'"]);
                    exit;
                }
            }

            // Encriptar contraseña
            $hash = password_hash($data->contraseña, PASSWORD_BCRYPT);

            // Insertar usuario
            $sql = "INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo, telefono, contraseña)
                    VALUES (:nombres, :apellidos, :tipo_documento, :numero_documento, :correo, :telefono, :contraseña)";
            $stmt = $pdo->prepare($sql);

            try {
                $stmt->execute([
                    ':nombres' => $data->nombres,
                    ':apellidos' => $data->apellidos,
                    ':tipo_documento' => $data->tipo_documento,
                    ':numero_documento' => $data->numero_documento,
                    ':correo' => $data->correo,
                    ':telefono' => $data->telefono,
                    ':contraseña' => $hash
                ]);
                echo json_encode(["message" => "Usuario registrado correctamente"]);
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    http_response_code(409);
                    echo json_encode(["error" => "El correo o número de documento ya está registrado"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al registrar usuario", "detalle" => $e->getMessage()]);
                }
            }
        }

        // ===== LOGIN =====
        elseif ($data->accion === 'login') {
            if (empty($data->correo) || empty($data->contraseña)) {
                http_response_code(400);
                echo json_encode(["error" => "Faltan datos de acceso"]);
                exit;
            }

            $sql = "SELECT * FROM usuarios WHERE correo = :correo";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':correo' => $data->correo]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($data->contraseña, $usuario['contraseña'])) {
                unset($usuario['contraseña']); // no enviar la contraseña al frontend
                echo json_encode([
                    "message" => "Inicio de sesión exitoso",
                    "usuario" => $usuario
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Correo o contraseña incorrectos"]);
            }
        }
        break;

    case 'GET':
        // Obtener todos los usuarios (solo para pruebas)
        $stmt = $pdo->query("SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, fecha_registro FROM usuarios");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
