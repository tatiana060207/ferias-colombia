<?php
// backend/api/eventos.php
// Endpoint para manejar eventos: GET (listar) y POST (crear)

header('Content-Type: application/json; charset=utf-8');
// Habilitar CORS para desarrollo (ajusta orígenes en producción)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder opciones preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';

// Helper para enviar respuesta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // --------------- Listar eventos ---------------
    // Opcional: soportar filtros por fecha, municipio o departamento
    $params = [];
    $wheres = [];

    if (!empty($_GET['fecha'])) {
        // Esperamos fecha en formato YYYY-MM-DD
        $wheres[] = "DATE(fecha_inicio) = :fecha";
        $params[':fecha'] = $_GET['fecha'];
    }
    if (!empty($_GET['municipio'])) {
        $wheres[] = "municipio = :municipio";
        $params[':municipio'] = $_GET['municipio'];
    }
    if (!empty($_GET['departamento'])) {
        $wheres[] = "departamento = :departamento";
        $params[':departamento'] = $_GET['departamento'];
    }

    $sql = "SELECT id, nombre, descripcion, fecha_inicio, fecha_fin, municipio, departamento, estado
            FROM eventos";

    if (count($wheres) > 0) {
        $sql .= " WHERE " . implode(' AND ', $wheres);
    }

    $sql .= " ORDER BY fecha_inicio ASC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $eventos = $stmt->fetchAll();

        // Para cada evento podemos traer artistas y boletería resumida (opcional)
        foreach ($eventos as &$ev) {
            // artistas
            $stmtA = $pdo->prepare(
                "SELECT a.id, a.nombres, a.apellidos, a.genero_musical, a.ciudad_natal
                 FROM artistas a
                 JOIN evento_artista ea ON ea.id_artista = a.id
                 WHERE ea.id_evento = :id_evento"
            );
            $stmtA->execute([':id_evento' => $ev['id']]);
            $ev['artistas'] = $stmtA->fetchAll();

            // boletería por localidad (nombre de localidad y cantidad disponible)
            $stmtB = $pdo->prepare(
                "SELECT l.id as id_localidad, l.codigo_localidad, l.nombre_localidad, b.valor, b.cantidad_disponible
                 FROM boleteria b
                 JOIN localidades l ON l.id = b.id_localidad
                 WHERE b.id_evento = :id_evento"
            );
            $stmtB->execute([':id_evento' => $ev['id']]);
            $ev['boleteria'] = $stmtB->fetchAll();
        }

        jsonResponse(['eventos' => $eventos]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al obtener eventos', 'detalle' => $e->getMessage()], 500);
    }
}
elseif ($method === 'POST') {
    // --------------- Crear evento (RF1) ---------------
    // Esperamos JSON en el body
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) jsonResponse(['error' => 'JSON inválido o body vacío'], 400);

    // Campos obligatorios
    $required = ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin'];

    foreach ($required as $campo) {
        if (empty($input[$campo])) {
            jsonResponse(['error' => "Campo obligatorio: $campo"], 400);
        }
    }

    $nombre = trim($input['nombre']);
    $descripcion = trim($input['descripcion']);
    $fecha_inicio = trim($input['fecha_inicio']); // formato esperado: 'YYYY-MM-DD HH:MM:SS'
    $fecha_fin = trim($input['fecha_fin']);
    $municipio = isset($input['municipio']) ? trim($input['municipio']) : null;
    $departamento = isset($input['departamento']) ? trim($input['departamento']) : null;

    // Validar formato de fechas
    $fi = DateTime::createFromFormat('Y-m-d H:i:s', $fecha_inicio);
    $ff = DateTime::createFromFormat('Y-m-d H:i:s', $fecha_fin);
    if (!$fi || !$ff) {
        jsonResponse(['error' => 'Formato de fecha inválido. Use "YYYY-MM-DD HH:MM:SS"'], 400);
    }
    if ($ff < $fi) {
        jsonResponse(['error' => 'La fecha_fin no puede ser anterior a fecha_inicio'], 400);
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, municipio, departamento)
             VALUES (:nombre, :descripcion, :fecha_inicio, :fecha_fin, :municipio, :departamento)"
        );
        $stmt->execute([
            ':nombre' => $nombre,
            ':descripcion' => $descripcion,
            ':fecha_inicio' => $fecha_inicio,
            ':fecha_fin' => $fecha_fin,
            ':municipio' => $municipio,
            ':departamento' => $departamento
        ]);

        $idNuevo = $pdo->lastInsertId();

        // Devolver el evento creado
        $stmt2 = $pdo->prepare("SELECT id, nombre, descripcion, fecha_inicio, fecha_fin, municipio, departamento FROM eventos WHERE id = :id");
        $stmt2->execute([':id' => $idNuevo]);
        $eventoCreado = $stmt2->fetch();

        jsonResponse(['mensaje' => 'Evento creado con éxito', 'evento' => $eventoCreado], 201);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Error al crear evento', 'detalle' => $e->getMessage()], 500);
    }
}
else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}
