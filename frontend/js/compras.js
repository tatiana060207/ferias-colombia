// frontend/js/compras.js
const API_COMPRAS = "http://localhost/ferias-colombia/api/compras.php";

// Cargar todas las compras
async function cargarCompras() {
    try {
        const response = await fetch(API_COMPRAS);
        const data = await response.json();

        const tbody = document.getElementById("tablaCompras").querySelector("tbody");
        tbody.innerHTML = "";

        if (data.compras && data.compras.length > 0) {
            data.compras.forEach(compra => {
                const row = document.createElement("tr");

                // Determinar clase CSS según estado
                let estadoClass = "";
                switch (compra.estado) {
                    case "Exitosa": estadoClass = "badge bg-success"; break;
                    case "Pendiente": estadoClass = "badge bg-warning"; break;
                    case "Cancelada": estadoClass = "badge bg-danger"; break;
                }

                row.innerHTML = `
                    <td>${compra.id}</td>
                    <td>${compra.nombres} ${compra.apellidos}</td>
                    <td>${compra.nombre_evento}</td>
                    <td>${compra.nombre_localidad}</td>
                    <td>${compra.cantidad}</td>
                    <td>$${parseFloat(compra.valor_total).toLocaleString()}</td>
                    <td>${compra.metodo_pago}</td>
                    <td><span class="${estadoClass}">${compra.estado}</span></td>
                    <td>${new Date(compra.fecha_compra).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="verDetalles(${compra.id})">Ver</button>
                        <button class="btn btn-sm btn-warning" onclick="cambiarEstado(${compra.id}, '${compra.estado}')">Estado</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarCompra(${compra.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Actualizar estadísticas
            actualizarEstadisticas(data.compras);
        } else {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">No hay compras registradas</td></tr>';
        }
    } catch (error) {
        console.error("Error cargando compras:", error);
        mostrarError("Error al cargar las compras");
    }
}

// Actualizar estadísticas
function actualizarEstadisticas(compras) {
    const total = compras.length;
    const exitosas = compras.filter(c => c.estado === "Exitosa").length;
    const pendientes = compras.filter(c => c.estado === "Pendiente").length;

    document.getElementById("totalCompras").textContent = `Total: ${total}`;
    document.getElementById("totalExitosas").textContent = `Exitosas: ${exitosas}`;
    document.getElementById("totalPendientes").textContent = `Pendientes: ${pendientes}`;
}

// Ver detalles de una compra
async function verDetalles(id) {
    try {
        // Para detalles completos, podríamos hacer una consulta específica
        // Por ahora, mostramos un mensaje básico
        const modal = new bootstrap.Modal(document.getElementById('modalDetallesCompra'));
        document.getElementById('detallesCompra').innerHTML = `
            <p><strong>ID de Compra:</strong> ${id}</p>
            <p>Para ver detalles completos, implementa una consulta específica en la API.</p>
        `;
        modal.show();
    } catch (error) {
        console.error("Error obteniendo detalles:", error);
    }
}

// Cambiar estado de una compra
function cambiarEstado(id, estadoActual) {
    const nuevoEstado = prompt(`Estado actual: ${estadoActual}\n\nNuevo estado (Exitosa/Pendiente/Cancelada):`, estadoActual);
    if (nuevoEstado && nuevoEstado !== estadoActual) {
        actualizarCompra(id, { estado: nuevoEstado });
    }
}

// Actualizar compra
async function actualizarCompra(id, datos) {
    try {
        const formData = new FormData();
        formData.append('id', id);
        Object.keys(datos).forEach(key => formData.append(key, datos[key]));

        const response = await fetch(API_COMPRAS, {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.mensaje || "Compra actualizada exitosamente");
            cargarCompras(); // Recargar la lista
        } else {
            mostrarError(result.error || "Error al actualizar la compra");
        }
    } catch (error) {
        console.error("Error actualizando compra:", error);
        mostrarError("Error al actualizar la compra");
    }
}

// Eliminar compra
function eliminarCompra(id) {
    if (confirm("¿Está seguro de eliminar esta compra? Esta acción no se puede deshacer.")) {
        eliminarCompraAPI(id);
    }
}

// Eliminar compra via API
async function eliminarCompraAPI(id) {
    try {
        const response = await fetch(`${API_COMPRAS}?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.mensaje || "Compra eliminada exitosamente");
            cargarCompras(); // Recargar la lista
        } else {
            mostrarError(result.error || "Error al eliminar la compra");
        }
    } catch (error) {
        console.error("Error eliminando compra:", error);
        mostrarError("Error al eliminar la compra");
    }
}

// Aplicar filtros
document.getElementById("btnFiltrar").addEventListener("click", () => {
    // Implementar lógica de filtrado
    console.log("Aplicando filtros...");
    // Por ahora, recarga todas las compras
    cargarCompras();
});

// Limpiar filtros
document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroMetodoPago").value = "";
    document.getElementById("filtroFechaDesde").value = "";
    document.getElementById("filtroFechaHasta").value = "";
    cargarCompras();
});

// Funciones de utilidad
function mostrarExito(mensaje) {
    // Implementar notificación de éxito
    alert("✅ " + mensaje);
}

function mostrarError(mensaje) {
    // Implementar notificación de error
    alert("❌ " + mensaje);
}

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    cargarCompras();
});