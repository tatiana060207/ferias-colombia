// frontend/js/artistas.js
const API_ARTISTAS = "http://localhost/ferias-colombia/api/artistas.php";

// Cargar lista de artistas
async function cargarArtistas() {
    try {
        const response = await fetch(API_ARTISTAS);
        const artistas = await response.json();

        const tbody = document.getElementById("tablaArtistas").querySelector("tbody");
        tbody.innerHTML = "";

        if (artistas.length > 0) {
            artistas.forEach(artista => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${artista.id}</td>
                    <td>${artista.nombres} ${artista.apellidos}</td>
                    <td>${artista.genero_musical}</td>
                    <td>${artista.ciudad_natal}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarArtista(${artista.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarArtista(${artista.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay artistas registrados</td></tr>';
        }
    } catch (error) {
        console.error("Error cargando artistas:", error);
        mostrarError("Error al cargar los artistas");
    }
}

// Guardar artista (crear o actualizar)
async function guardarArtista() {
    const id = document.getElementById("artistaId").value;
    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const generoMusical = document.getElementById("genero_musical").value.trim();
    const ciudadNatal = document.getElementById("ciudad_natal").value.trim();

    // Validaciones
    if (!nombres || !apellidos || !generoMusical || !ciudadNatal) {
        mostrarError("Todos los campos son obligatorios");
        return;
    }

    const artistaData = {
        nombres: nombres,
        apellidos: apellidos,
        genero_musical: generoMusical,
        ciudad_natal: ciudadNatal
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_ARTISTAS}?id=${id}` : API_ARTISTAS;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artistaData)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.mensaje || "Artista guardado exitosamente");
            limpiarFormulario();
            cargarArtistas();
        } else {
            mostrarError(result.error || "Error al guardar el artista");
        }
    } catch (error) {
        console.error("Error guardando artista:", error);
        mostrarError("Error al guardar el artista");
    }
}

// Editar artista
async function editarArtista(id) {
    try {
        const response = await fetch(`${API_ARTISTAS}?id=${id}`);
        const artista = await response.json();

        if (artista && !artista.error) {
            document.getElementById("artistaId").value = artista.id;
            document.getElementById("nombres").value = artista.nombres;
            document.getElementById("apellidos").value = artista.apellidos;
            document.getElementById("genero_musical").value = artista.genero_musical;
            document.getElementById("ciudad_natal").value = artista.ciudad_natal;

            // Scroll al formulario
            document.getElementById("formArtista").scrollIntoView({ behavior: 'smooth' });
        } else {
            mostrarError("Artista no encontrado");
        }
    } catch (error) {
        console.error("Error obteniendo artista:", error);
        mostrarError("Error al cargar el artista");
    }
}

// Eliminar artista
function eliminarArtista(id) {
    if (confirm("¿Está seguro de eliminar este artista? Esta acción no se puede deshacer.")) {
        eliminarArtistaAPI(id);
    }
}

// Eliminar artista via API
async function eliminarArtistaAPI(id) {
    try {
        const response = await fetch(`${API_ARTISTAS}?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.mensaje || "Artista eliminado exitosamente");
            cargarArtistas();
        } else {
            mostrarError(result.error || "Error al eliminar el artista");
        }
    } catch (error) {
        console.error("Error eliminando artista:", error);
        mostrarError("Error al eliminar el artista");
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById("artistaId").value = "";
    document.getElementById("nombres").value = "";
    document.getElementById("apellidos").value = "";
    document.getElementById("genero_musical").value = "";
    document.getElementById("ciudad_natal").value = "";
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
    cargarArtistas();

    // Event listeners para botones
    document.getElementById("btnGuardar").addEventListener("click", guardarArtista);
    document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
});