// frontend/js/asociar-artistas.js
const API_EVENTOS = "http://localhost/ferias-colombia/api/eventos.php";
const API_ARTISTAS = "http://localhost/ferias-colombia/api/artistas.php";
const API_ASOCIACIONES = "http://localhost/ferias-colombia/api/evento_artista.php";

// Cargar eventos en el select
async function cargarEventos() {
    try {
        const response = await fetch(API_EVENTOS);
        const data = await response.json();

        const select = document.getElementById("evento_id");
        select.innerHTML = '<option value="">Seleccione un evento...</option>';

        if (data.eventos) {
            data.eventos.forEach(evento => {
                const option = document.createElement("option");
                option.value = evento.id;
                option.textContent = `${evento.nombre} - ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} ${new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando eventos:", error);
    }
}

// Cargar artistas en el select
async function cargarArtistas() {
    try {
        const response = await fetch(API_ARTISTAS);
        const artistas = await response.json();

        const select = document.getElementById("artista_id");
        select.innerHTML = '<option value="">Seleccione un artista...</option>';

        if (Array.isArray(artistas)) {
            artistas.forEach(artista => {
                const option = document.createElement("option");
                option.value = artista.id;
                option.textContent = `${artista.nombres} ${artista.apellidos} (${artista.genero_musical})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando artistas:", error);
    }
}

// Cargar asociaciones evento-artista
async function cargarAsociaciones() {
    try {
        const response = await fetch(API_ASOCIACIONES);
        const asociaciones = await response.json();

        const tbody = document.getElementById("tablaAsociaciones").querySelector("tbody");
        tbody.innerHTML = "";

        if (asociaciones.length > 0) {
            asociaciones.forEach(asociacion => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${asociacion.id}</td>
                    <td>${asociacion.evento}</td>
                    <td>${asociacion.artista}</td>
                    <td>${asociacion.genero_musical}</td>
                    <td>${asociacion.ciudad_natal}</td>
                    <td>${new Date(asociacion.fecha_inicio).toLocaleString('es-ES')}</td>
                    <td>${new Date(asociacion.fecha_fin).toLocaleString('es-ES')}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="eliminarAsociacion(${asociacion.id})">
                            <i class="fas fa-unlink"></i> Desasociar
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay asociaciones registradas</td></tr>';
        }
    } catch (error) {
        console.error("Error cargando asociaciones:", error);
        mostrarError("Error al cargar las asociaciones");
    }
}

// Crear nueva asociación
async function crearAsociacion() {
    const eventoId = document.getElementById("evento_id").value;
    const artistaId = document.getElementById("artista_id").value;

    if (!eventoId || !artistaId) {
        mostrarError("Seleccione tanto el evento como el artista");
        return;
    }

    try {
        const response = await fetch(API_ASOCIACIONES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_evento: parseInt(eventoId),
                id_artista: parseInt(artistaId)
            })
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.message || "Artista asociado correctamente al evento");
            limpiarFormulario();
            cargarAsociaciones();
        } else if (response.status === 409) {
            // Conflicto de horario - mostrar modal
            mostrarConflicto(result);
        } else {
            mostrarError(result.error || "Error al crear la asociación");
        }
    } catch (error) {
        console.error("Error creando asociación:", error);
        mostrarError("Error al crear la asociación");
    }
}

// Mostrar modal de conflicto
function mostrarConflicto(detalles) {
    const modal = new bootstrap.Modal(document.getElementById('modalConflicto'));
    document.getElementById('detallesConflicto').innerHTML = `
        <div class="alert alert-warning">
            <h6><i class="fas fa-exclamation-triangle"></i> Conflicto Detectado</h6>
            <p>El artista ya está asignado a otro evento que coincide en horario:</p>
            <ul>
                <li><strong>Evento en conflicto:</strong> ${detalles.evento_conflicto}</li>
                <li><strong>Fecha inicio:</strong> ${new Date(detalles.fecha_inicio).toLocaleString('es-ES')}</li>
                <li><strong>Fecha fin:</strong> ${new Date(detalles.fecha_fin).toLocaleString('es-ES')}</li>
            </ul>
            <p class="mb-0">No se puede asignar el mismo artista a dos eventos simultáneos.</p>
        </div>
    `;
    modal.show();
}

// Eliminar asociación
function eliminarAsociacion(id) {
    if (confirm("¿Está seguro de desasociar este artista del evento?")) {
        eliminarAsociacionAPI(id);
    }
}

// Eliminar asociación via API
async function eliminarAsociacionAPI(id) {
    try {
        const response = await fetch(`${API_ASOCIACIONES}?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.message || "Asociación eliminada correctamente");
            cargarAsociaciones();
        } else {
            mostrarError(result.error || "Error al eliminar la asociación");
        }
    } catch (error) {
        console.error("Error eliminando asociación:", error);
        mostrarError("Error al eliminar la asociación");
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById("evento_id").value = "";
    document.getElementById("artista_id").value = "";
}

// Funciones de utilidad
function mostrarExito(mensaje) {
    alert("✅ " + mensaje);
}

function mostrarError(mensaje) {
    alert("❌ " + mensaje);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    cargarEventos();
    cargarArtistas();
    cargarAsociaciones();

    // Event listener para el formulario
    document.getElementById("formAsociacion").addEventListener("submit", (e) => {
        e.preventDefault();
        crearAsociacion();
    });

    // Event listener para limpiar
    document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
});