<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
    $usuario_id = $_GET['usuario_id'] ?? null;

    try {
        $query = "
            SELECT
                c.id,
                c.id_usuario,
                u.nombres,
                u.apellidos,
                c.id_evento,
                e.nombre as nombre_evento,
                c.id_localidad,
                l.nombre_localidad,
                c.cantidad,
                c.valor_total,
                c.metodo_pago,
                c.numero_tarjeta,
                c.estado,
                c.fecha_compra
            FROM compras c
            JOIN usuarios u ON c.id_usuario = u.id
            JOIN eventos e ON c.id_evento = e.id
            JOIN localidades l ON c.id_localidad = l.id
        ";

        $params = [];

        if ($usuario_id) {
            $query .= " WHERE c.id_usuario = ?";
            $params[] = $usuario_id;
        }

        $query .= " ORDER BY c.fecha_compra DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $compras = $stmt->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse(['compras' => $compras]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener las compras', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        jsonResponse(['error' => 'Cuerpo JSON vacío o inválido'], 400);
    }

    $required = ['id_usuario', 'id_evento', 'id_localidad', 'cantidad', 'valor_total', 'metodo_pago'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            jsonResponse(['error' => "Campo requerido faltante: $field"], 400);
        }
    }

    if ($input['cantidad'] < 1 || $input['cantidad'] > 10) {
        jsonResponse(['error' => 'La cantidad de boletos debe estar entre 1 y 10 por transacción'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE id = ?");
        $stmt->execute([$input['id_usuario']]);
        if ($stmt->fetchColumn() == 0) {
            jsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM eventos WHERE id = ?");
        $stmt->execute([$input['id_evento']]);
        if ($stmt->fetchColumn() == 0) {
            jsonResponse(['error' => 'Evento no encontrado'], 404);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM localidades WHERE id = ?");
        $stmt->execute([$input['id_localidad']]);
        if ($stmt->fetchColumn() == 0) {
            jsonResponse(['error' => 'Localidad no encontrada'], 404);
        }

        $stmt = $pdo->prepare("SELECT cantidad_disponible FROM boleteria WHERE id_evento = ? AND id_localidad = ?");
        $stmt->execute([$input['id_evento'], $input['id_localidad']]);
        $boleteria = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$boleteria) {
            jsonResponse(['error' => 'No existe boletería para este evento y localidad'], 404);
        }

        if ($boleteria['cantidad_disponible'] < $input['cantidad']) {
            jsonResponse([
                'error' => 'No hay suficientes boletos disponibles',
                'disponibles' => $boleteria['cantidad_disponible'],
                'solicitados' => $input['cantidad']
            ], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO compras
            (id_usuario, id_evento, id_localidad, cantidad, valor_total, metodo_pago, numero_tarjeta, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['id_usuario'],
            $input['id_evento'],
            $input['id_localidad'],
            $input['cantidad'],
            $input['valor_total'],
            $input['metodo_pago'],
            $input['numero_tarjeta'] ?? null,
            $input['estado'] ?? 'Pendiente'
        ]);

        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare("
            UPDATE boleteria
            SET cantidad_disponible = cantidad_disponible - ?
            WHERE id_evento = ? AND id_localidad = ?
        ");
        $stmt->execute([$input['cantidad'], $input['id_evento'], $input['id_localidad']]);

        $stmt = $pdo->prepare("
            SELECT
                c.id,
                c.id_usuario,
                u.nombres,
                u.apellidos,
                c.id_evento,
                e.nombre as nombre_evento,
                c.id_localidad,
                l.nombre_localidad,
                c.cantidad,
                c.valor_total,
                c.metodo_pago,
                c.numero_tarjeta,
                c.estado,
                c.fecha_compra
            FROM compras c
            JOIN usuarios u ON c.id_usuario = u.id
            JOIN eventos e ON c.id_evento = e.id
            JOIN localidades l ON c.id_localidad = l.id
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $compra = $stmt->fetch(PDO::FETCH_ASSOC);

        jsonResponse([
            'mensaje' => 'Compra creada exitosamente',
            'compra' => $compra
        ], 201);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al crear la compra', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $put);

    if (!isset($put['id'])) {
        jsonResponse(['error' => 'ID de compra requerido'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM compras WHERE id = ?");
        $stmt->execute([$put['id']]);
        if ($stmt->fetchColumn() == 0) {
            jsonResponse(['error' => 'Compra no encontrada'], 404);
        }

        $stmt = $pdo->prepare("UPDATE compras SET estado = ? WHERE id = ?");
        $stmt->execute([$put['estado'] ?? 'Pendiente', $put['id']]);

        jsonResponse(['mensaje' => 'Compra actualizada exitosamente']);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al actualizar la compra', 'detalle' => $e->getMessage()], 500);
    }
}

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        jsonResponse(['error' => 'ID de compra requerido'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM compras WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() == 0) {
            jsonResponse(['error' => 'Compra no encontrada'], 404);
        }

        $stmt = $pdo->prepare("DELETE FROM compras WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['mensaje' => 'Compra eliminada exitosamente']);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al eliminar la compra', 'detalle' => $e->getMessage()], 500);
    }
}

else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}