<?php
// backend/api/usuario.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include '../config/conexion.php'; // usa $pdo

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// Helper para devolver error JSON y salir
function err($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

if ($method === 'POST') {
    if (!isset($input['accion'])) err("Falta el campo 'accion' (registro o login)");

    // ---------------------------
    // REGISTRO (acción = "registro")
    // Campos esperados:
    // nombres, apellidos, tipo_documento, numero_documento, correo, telefono, contraseña
    // ---------------------------
    if ($input['accion'] === 'registro') {
        $required = ['nombres','apellidos','tipo_documento','numero_documento','correo','contraseña'];
        foreach ($required as $r) {
            if (empty($input[$r])) err("Falta el campo obligatorio: $r");
        }

        // Verificar existencia por correo o número de documento
        $check = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :correo OR numero_documento = :ndoc");
        $check->execute([':correo' => $input['correo'], ':ndoc' => $input['numero_documento']]);
        if ($check->fetch()) err("El correo o número de documento ya está registrado", 409);

        // Hashear contraseña
        $hash = password_hash($input['contraseña'], PASSWORD_BCRYPT);

        // Insertar (nota: si no proveen telefono, usar NULL)
        $sql = "INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo, telefono, `contraseña`)
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

        echo json_encode(['message' => 'Usuario registrado correctamente']);
        exit;
    }

    // ---------------------------
    // LOGIN (acción = "login")
    // Campos: correo, contraseña
    // ---------------------------
    if ($input['accion'] === 'login') {
        if (empty($input['correo']) || empty($input['contraseña'])) err("Faltan datos de acceso");

        $stmt = $pdo->prepare("SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, `contraseña`, fecha_registro FROM usuarios WHERE correo = :correo");
        $stmt->execute([':correo' => $input['correo']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) err("Correo o contraseña incorrectos", 401);

        // password_verify con columna `contraseña`
        if (!password_verify($input['contraseña'], $user['contraseña'])) err("Correo o contraseña incorrectos", 401);

        // No enviar la contraseña al frontend
        unset($user['contraseña']);

        echo json_encode([
            'message' => 'Inicio de sesión exitoso',
            'usuario' => $user
        ]);
        exit;
    }

    err("Acción no reconocida");
}

// GET → listar usuarios (solo para pruebas / admin)
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, nombres, apellidos, tipo_documento, numero_documento, correo, telefono, fecha_registro FROM usuarios");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
    exit;
}

// PUT → actualizar datos del usuario (ejemplo simple por id)
if ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $put);
    if (empty($put['id'])) err("Falta id para actualizar");
    // Aquí puedes agregar validaciones y actualizar campos permitidos
    $sql = "UPDATE usuarios SET nombres = :nombres, apellidos = :apellidos, telefono = :telefono WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nombres' => $put['nombres'] ?? '',
        ':apellidos' => $put['apellidos'] ?? '',
        ':telefono' => $put['telefono'] ?? null,
        ':id' => intval($put['id'])
    ]);
    echo json_encode(['message' => 'Usuario actualizado']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
