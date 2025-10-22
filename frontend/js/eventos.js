// frontend/js/eventos.js
const API_LOCALIDADES = "http://localhost/ferias-colombia/api/localidades.php";
const API_EVENTOS = "http://localhost/ferias-colombia/api/eventos.php";

// Cargar localidades en el select
async function cargarLocalidades() {
    try {
        const response = await fetch(API_LOCALIDADES);
        const data = await response.json();

        const select = document.getElementById("localidad_id");
        select.innerHTML = '<option value="">Seleccione...</option>';

        if (data.localidades) {
            data.localidades.forEach(localidad => {
                const option = document.createElement("option");
                option.value = localidad.id;
                option.textContent = `${localidad.nombre_localidad} (${localidad.codigo_localidad})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando localidades:", error);
    }
}

// Cargar eventos en la tabla
async function cargarEventos() {
    try {
        const response = await fetch(API_EVENTOS);
        const data = await response.json();

        const tbody = document.getElementById("tablaEventos").querySelector("tbody");
        tbody.innerHTML = "";

        if (data.eventos) {
            data.eventos.forEach(evento => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${evento.id}</td>
                    <td>${evento.nombre}</td>
                    <td>${evento.descripcion || ''}</td>
                    <td>${evento.fecha}</td>
                    <td>${evento.hora}</td>
                    <td>${evento.nombre_localidad || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarEvento(${evento.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarEvento(${evento.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error cargando eventos:", error);
    }
}

// Editar evento
function editarEvento(id) {
    // Implementar lógica para cargar datos del evento y llenar el formulario
    console.log("Editar evento:", id);
}

// Eliminar evento
function eliminarEvento(id) {
    if (confirm("¿Está seguro de eliminar este evento?")) {
        // Implementar lógica para eliminar
        console.log("Eliminar evento:", id);
    }
}

// Limpiar formulario
document.getElementById("btnLimpiar").addEventListener("click", () => {
    document.getElementById("formEvento").reset();
    document.getElementById("eventoId").value = "";
});

// Cargar boletería de un evento para compra
async function cargarBoleteriaCompra(eventoId) {
    try {
        const response = await fetch(`http://localhost/ferias-colombia/api/boleteria.php?id_evento=${eventoId}`);
        const data = await response.json();

        const selectLocalidad = document.getElementById("localidadCompra");
        selectLocalidad.innerHTML = '<option value="">Seleccione una localidad...</option>';

        if (data.boleteria && data.boleteria.length > 0) {
            // Crear mapa de localidades con precios
            const localidadesMap = {};
            data.boleteria.forEach(boleto => {
                localidadesMap[boleto.id] = {
                    nombre: `${boleto.nombre_localidad} (${boleto.codigo_localidad})`,
                    precio: parseFloat(boleto.valor),
                    disponible: boleto.cantidad_disponible
                };
            });

            // Llenar select con localidades disponibles
            Object.keys(localidadesMap).forEach(id => {
                const localidad = localidadesMap[id];
                const option = document.createElement("option");
                option.value = id;
                option.textContent = `${localidad.nombre} - $${localidad.precio.toLocaleString('es-CO')} (Disponible: ${localidad.disponible})`;
                option.dataset.precio = localidad.precio;
                option.dataset.disponible = localidad.disponible;
                selectLocalidad.appendChild(option);
            });
        } else {
            selectLocalidad.innerHTML = '<option value="">No hay boletería disponible para este evento</option>';
        }
    } catch (error) {
        console.error("Error cargando boletería:", error);
    }
}

// Calcular valor total
function calcularTotal() {
    const cantidad = parseInt(document.getElementById("cantidadCompra").value) || 0;
    const precioUnitario = parseFloat(document.getElementById("precioUnitario").value.replace(/[$,]/g, '')) || 0;
    const total = cantidad * precioUnitario;

    document.getElementById("valorTotal").value = total > 0 ? `$${total.toLocaleString('es-CO')}` : '';
}

// Mostrar/ocultar campo de tarjeta según método de pago
function toggleCampoTarjeta() {
    const metodoPago = document.getElementById("metodoPago").value;
    const campoTarjeta = document.getElementById("campoTarjeta");
    const numeroTarjeta = document.getElementById("numeroTarjeta");

    if (metodoPago === "Tarjeta") {
        campoTarjeta.style.display = "block";
        numeroTarjeta.required = true;
    } else {
        campoTarjeta.style.display = "none";
        numeroTarjeta.required = false;
        numeroTarjeta.value = "";
    }
}

// Realizar compra
async function realizarCompra() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        mostrarError("Debe iniciar sesión para comprar boletos");
        window.location.href = "login.html";
        return;
    }

    const eventoId = document.getElementById("eventoCompra").value;
    const localidadId = document.getElementById("localidadCompra").value;
    const cantidad = parseInt(document.getElementById("cantidadCompra").value);
    const metodoPago = document.getElementById("metodoPago").value;
    const numeroTarjeta = document.getElementById("numeroTarjeta").value;
    const valorTotal = parseFloat(document.getElementById("valorTotal").value.replace(/[$,]/g, ''));

    // Validaciones
    if (!eventoId || !localidadId || !cantidad || !metodoPago) {
        mostrarError("Complete todos los campos obligatorios");
        return;
    }

    if (cantidad < 1 || cantidad > 10) {
        mostrarError("La cantidad debe estar entre 1 y 10 boletos");
        return;
    }

    if (metodoPago === "Tarjeta" && numeroTarjeta.length !== 15) {
        mostrarError("El número de tarjeta debe tener exactamente 15 dígitos");
        return;
    }

    try {
        const compraData = {
            id_usuario: usuario.id,
            id_evento: parseInt(eventoId),
            id_localidad: parseInt(localidadId),
            cantidad: cantidad,
            valor_total: valorTotal,
            metodo_pago: metodoPago,
            numero_tarjeta: metodoPago === "Tarjeta" ? numeroTarjeta : null,
            estado: "Pendiente"
        };

        const response = await fetch("http://localhost/ferias-colombia/api/compras.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(compraData)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(`Compra realizada exitosamente. ID: ${result.compra.id}`);
            limpiarFormularioCompra();
        } else {
            mostrarError(result.error || "Error al procesar la compra");
        }
    } catch (error) {
        console.error("Error realizando compra:", error);
        mostrarError("Error al procesar la compra");
    }
}

// Limpiar formulario de compra
function limpiarFormularioCompra() {
    document.getElementById("eventoCompra").value = "";
    document.getElementById("localidadCompra").innerHTML = '<option value="">Primero seleccione un evento</option>';
    document.getElementById("cantidadCompra").value = "";
    document.getElementById("precioUnitario").value = "";
    document.getElementById("valorTotal").value = "";
    document.getElementById("metodoPago").value = "";
    document.getElementById("numeroTarjeta").value = "";
    document.getElementById("campoTarjeta").style.display = "none";
}

// Verificar autenticación y mostrar/ocultar sección de compra
function verificarCompraPermitida() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const seccionCompra = document.getElementById('seccionCompra');

    if (usuario) {
        seccionCompra.style.display = 'block';
        cargarEventosCompra();
    } else {
        seccionCompra.style.display = 'none';
    }
}

// Cargar eventos para compra
async function cargarEventosCompra() {
    try {
        const response = await fetch(API_EVENTOS);
        const data = await response.json();

        const select = document.getElementById("eventoCompra");
        select.innerHTML = '<option value="">Seleccione un evento...</option>';

        if (data.eventos) {
            data.eventos.forEach(evento => {
                const option = document.createElement("option");
                option.value = evento.id;
                option.textContent = `${evento.nombre} - ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando eventos para compra:", error);
    }
}

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    cargarLocalidades();
    cargarEventos();
    verificarCompraPermitida();

    // Event listeners para compra
    document.getElementById("eventoCompra").addEventListener("change", (e) => {
        cargarBoleteriaCompra(e.target.value);
    });

    document.getElementById("localidadCompra").addEventListener("change", (e) => {
        const selectedOption = e.target.selectedOptions[0];
        const precio = selectedOption ? selectedOption.dataset.precio : "";
        document.getElementById("precioUnitario").value = precio ? `$${parseFloat(precio).toLocaleString('es-CO')}` : "";
        calcularTotal();
    });

    document.getElementById("cantidadCompra").addEventListener("input", calcularTotal);
    document.getElementById("metodoPago").addEventListener("change", toggleCampoTarjeta);

    document.getElementById("formCompra").addEventListener("submit", (e) => {
        e.preventDefault();
        realizarCompra();
    });

    document.getElementById("btnCancelarCompra").addEventListener("click", limpiarFormularioCompra);
});