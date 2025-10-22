<?php
// backend/api/usuario.php

// === CONFIGURACIÓN DE CORS ===
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Manejar preflight OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../backend/config/conexion.php'; // usa $pdo

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// Helper para devolver error JSON y salir
function err($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

// === MÉTODO POST ===
if ($method === 'POST') {
    if (!isset($input['accion'])) err("Falta el campo 'accion' (registro o login)");

    // ---------------------------
    // REGISTRO (acción = "registro")
    // ---------------------------
    if ($input['accion'] === 'registro') {
        $required = ['nombres','apellidos','tipo_documento','numero_documento','correo','contrasena'];
        foreach ($required as $r) {
            if (empty($input[$r])) err("Falta el campo obligatorio: $r");
        }

        try {
            // Verificar existencia
            $check = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :correo OR numero_documento = :ndoc");
            $check->execute([':correo' => $input['correo'], ':ndoc' => $input['numero_documento']]);
            if ($check->fetch()) err("El correo o número de documento ya está registrado", 409);

            // Hashear contraseña
            $hash = password_hash($input['contrasena'], PASSWORD_BCRYPT);

            // Insertar usuario (sin campo rol)
            $sql = "INSERT INTO usuarios 
                    (nombres, apellidos, tipo_documento, numero_documento, correo, telefono, contrasena) 
                    VALUES (:nombres, :apellidos, :tipo_documento, :numero_documento, :correo, :telefono, :pass)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nombres' => $input['nombres'],
                ':apellidos' => $input['apellidos'],
                ':tipo_documento' => $input['tipo_documento'],
                ':numero_documento' => $input['numero_documento'],
                ':correo' => $input['correo'],
                ':telefono' => $input['telefono'] ?? null,
                ':pass' => $hash
            ]);

            echo json_encode(['message' => '✅ Usuario registrado correctamente']);
        } catch (PDOException $e) {
            err("Error en base de datos: " . $e->getMessage(), 500);
        }
        exit;
    }

    // ---------------------------
    // LOGIN (acción = "login")
    // ---------------------------
    if ($input['accion'] === 'login') {
        if (empty($input['correo']) || empty($input['contrasena'])) err("Faltan datos de acceso");

        try {
            $stmt = $pdo->prepare("SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, contrasena, fecha_registro 
                                   FROM usuarios WHERE correo = :correo");
            $stmt->execute([':correo' => $input['correo']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) err("Correo o contraseña incorrectos", 401);
            if (!password_verify($input['contrasena'], $user['contrasena'])) err("Correo o contraseña incorrectos", 401);

            unset($user['contrasena']); // no enviar la contraseña
            echo json_encode(['message' => 'Inicio de sesión exitoso', 'usuario' => $user]);
        } catch (PDOException $e) {
            err("Error en base de datos: " . $e->getMessage(), 500);
        }
        exit;
    }

    err("Acción no reconocida");
}

// === MÉTODO GET ===
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, fecha_registro FROM usuarios");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
    } catch (PDOException $e) {
        err("Error al obtener usuarios: " . $e->getMessage(), 500);
    }
    exit;
}

// === MÉTODO PUT ===
if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $put);
    if (empty($put['id'])) err("Falta id para actualizar");

    try {
        $sql = "UPDATE usuarios 
                SET nombres = :nombres, apellidos = :apellidos, telefono = :telefono 
                WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombres' => $put['nombres'] ?? '',
            ':apellidos' => $put['apellidos'] ?? '',
            ':telefono' => $put['telefono'] ?? null,
            ':id' => intval($put['id'])
        ]);
        echo json_encode(['message' => 'Usuario actualizado']);
    } catch (PDOException $e) {
        err("Error al actualizar usuario: " . $e->getMessage(), 500);
    }
    exit;
}

// Si llega aquí, método no permitido
http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
