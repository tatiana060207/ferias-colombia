const API_COMPRAS = "http://localhost/ferias-colombia/api/compras.php";

function obtenerUsuarioId() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario ? usuario.id : null;
}

async function cargarMisCompras(filtros = {}) {
    const usuarioId = obtenerUsuarioId();
    if (!usuarioId) {
        mostrarError("Usuario no autenticado");
        window.location.href = "login.html";
        return;
    }

    try {
        let url = `${API_COMPRAS}?usuario_id=${usuarioId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.compras) {
            let comprasFiltradas = data.compras;

            if (filtros.evento) {
                comprasFiltradas = comprasFiltradas.filter(c =>
                    c.nombre_evento.toLowerCase().includes(filtros.evento.toLowerCase())
                );
            }

            if (filtros.estado) {
                comprasFiltradas = comprasFiltradas.filter(c => c.estado === filtros.estado);
            }

            if (filtros.fechaDesde) {
                comprasFiltradas = comprasFiltradas.filter(c =>
                    new Date(c.fecha_compra) >= new Date(filtros.fechaDesde)
                );
            }

            mostrarCompras(comprasFiltradas);
            actualizarEstadisticas(comprasFiltradas);
        } else {
            mostrarCompras([]);
        }
    } catch (error) {
        console.error("Error cargando compras:", error);
        mostrarError("Error al cargar tus compras");
    }
}

function mostrarCompras(compras) {
    const tbody = document.getElementById("tablaCompras").querySelector("tbody");
    const mensajeSinCompras = document.getElementById("mensajeSinCompras");

    tbody.innerHTML = "";

    if (compras.length === 0) {
        tbody.style.display = "none";
        mensajeSinCompras.style.display = "block";
        return;
    }

    mensajeSinCompras.style.display = "none";
    tbody.style.display = "";

    compras.forEach(compra => {
        const row = document.createElement("tr");

        let estadoClass = "";
        let estadoIcon = "";
        switch (compra.estado) {
            case "Exitosa":
                estadoClass = "badge bg-success";
                estadoIcon = "✅";
                break;
            case "Pendiente":
                estadoClass = "badge bg-warning";
                estadoIcon = "⏳";
                break;
            case "Cancelada":
                estadoClass = "badge bg-danger";
                estadoIcon = "❌";
                break;
        }

        const fecha = new Date(compra.fecha_compra);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        row.innerHTML = `
            <td>
                <strong>${compra.nombre_evento}</strong>
            </td>
            <td>${compra.nombre_localidad}</td>
            <td class="text-center">${compra.cantidad}</td>
            <td class="fw-bold text-success">$${parseFloat(compra.valor_total).toLocaleString('es-CO')}</td>
            <td>${fechaFormateada}</td>
            <td><span class="${estadoClass}">${estadoIcon} ${compra.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetallesCompra(${compra.id})">
                    Ver Detalles
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function actualizarEstadisticas(compras) {
    const totalCompras = compras.length;
    const exitosas = compras.filter(c => c.estado === "Exitosa").length;
    const pendientes = compras.filter(c => c.estado === "Pendiente").length;
    const totalGastado = compras
        .filter(c => c.estado === "Exitosa")
        .reduce((sum, c) => sum + parseFloat(c.valor_total), 0);

    document.getElementById("totalCompras").textContent = totalCompras;
    document.getElementById("comprasExitosas").textContent = exitosas;
    document.getElementById("comprasPendientes").textContent = pendientes;
    document.getElementById("totalGastado").textContent = `$${totalGastado.toLocaleString('es-CO')}`;
}

async function verDetallesCompra(id) {
    try {
        const usuarioId = obtenerUsuarioId();
        const response = await fetch(`${API_COMPRAS}?usuario_id=${usuarioId}`);
        const data = await response.json();

        const compra = data.compras.find(c => c.id == id);
        if (compra) {
            const modal = new bootstrap.Modal(document.getElementById('modalDetallesCompra'));
            const fecha = new Date(compra.fecha_compra);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            document.getElementById('detallesCompra').innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Información del Evento</h6>
                        <p><strong>Evento:</strong> ${compra.nombre_evento}</p>
                        <p><strong>Localidad:</strong> ${compra.nombre_localidad}</p>
                        <p><strong>Cantidad:</strong> ${compra.cantidad} boletos</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Información de Pago</h6>
                        <p><strong>Valor Total:</strong> $${parseFloat(compra.valor_total).toLocaleString('es-CO')}</p>
                        <p><strong>Método de Pago:</strong> ${compra.metodo_pago}</p>
                        <p><strong>Estado:</strong> ${compra.estado}</p>
                        <p><strong>Fecha de Compra:</strong> ${fechaFormateada}</p>
                    </div>
                </div>
                ${compra.numero_tarjeta ? `<p><strong>Número de Tarjeta:</strong> ****${compra.numero_tarjeta.slice(-4)}</p>` : ''}
            `;
            modal.show();
        }
    } catch (error) {
        console.error("Error obteniendo detalles:", error);
        mostrarError("Error al cargar los detalles de la compra");
    }
}

document.getElementById("btnBuscar").addEventListener("click", () => {
    const filtros = {
        evento: document.getElementById("buscarEvento").value.trim(),
        estado: document.getElementById("filtroEstado").value,
        fechaDesde: document.getElementById("filtroFechaDesde").value
    };
    cargarMisCompras(filtros);
});

document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
    document.getElementById("buscarEvento").value = "";
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroFechaDesde").value = "";
    cargarMisCompras();
});

document.getElementById("btnExportar").addEventListener("click", () => {
    alert("Funcionalidad de exportación a PDF próximamente disponible");
});

function mostrarExito(mensaje) {
    alert("✅ " + mensaje);
}

function mostrarError(mensaje) {
    alert("❌ " + mensaje);
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("nombreUsuario").textContent = `${usuario.nombres} ${usuario.apellidos}`;

    cargarMisCompras();
});