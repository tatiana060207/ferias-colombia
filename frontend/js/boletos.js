const API_EVENTOS = "http://localhost/ferias-colombia/api/eventos.php";
const API_LOCALIDADES = "http://localhost/ferias-colombia/api/localidades.php";
const API_BOLETERIA = "http://localhost/ferias-colombia/api/boleteria.php";

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
                option.textContent = `${evento.nombre} - ${new Date(evento.fecha).toLocaleDateString('es-ES')}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando eventos:", error);
    }
}

async function cargarLocalidades() {
    try {
        const response = await fetch(API_LOCALIDADES);
        const data = await response.json();

        const select = document.getElementById("localidad_id");
        select.innerHTML = '<option value="">Seleccione una localidad...</option>';

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

async function cargarBoleteria(eventoId = null) {
    if (!eventoId) {
        eventoId = document.getElementById("evento_id").value;
    }

    if (!eventoId) {
        document.getElementById("listaBoleteria").innerHTML = '<p class="text-muted">Seleccione un evento para ver su boletería</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BOLETERIA}?id_evento=${eventoId}`);
        const data = await response.json();

        const container = document.getElementById("listaBoleteria");

        if (data.boleteria && data.boleteria.length > 0) {
            let html = '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Localidad</th><th>Valor</th><th>Disponibles</th><th>Acciones</th></tr></thead><tbody>';

            data.boleteria.forEach(boleto => {
                html += `
                    <tr>
                        <td>${boleto.nombre_localidad} (${boleto.codigo_localidad})</td>
                        <td>$${parseFloat(boleto.valor).toLocaleString('es-CO')}</td>
                        <td>${boleto.cantidad_disponible}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editarBoleto(${boleto.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarBoleto(${boleto.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-muted">No hay boletería registrada para este evento</p>';
        }
    } catch (error) {
        console.error("Error cargando boletería:", error);
        document.getElementById("listaBoleteria").innerHTML = '<p class="text-danger">Error al cargar la boletería</p>';
    }
}

function agregarBoleto() {
    const container = document.getElementById("boletosContainer");
    const boletoDiv = document.createElement("div");
    boletoDiv.className = "boleto-item border p-3 mb-3 rounded";
    boletoDiv.innerHTML = `
        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label">Localidad</label>
                <select class="form-select localidad-select" required>
                    <option value="">Seleccione...</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Valor ($)</label>
                <input type="number" class="form-control valor-input" min="0" step="0.01" required>
            </div>
            <div class="col-md-3">
                <label class="form-label">Cantidad Disponible</label>
                <input type="number" class="form-control cantidad-input" min="0" required>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-danger" onclick="eliminarBoletoItem(this)">Eliminar</button>
            </div>
        </div>
    `;

    container.appendChild(boletoDiv);

    cargarLocalidadesEnSelect(boletoDiv.querySelector('.localidad-select'));
}

async function cargarLocalidadesEnSelect(select) {
    try {
        const response = await fetch(API_LOCALIDADES);
        const data = await response.json();

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

function eliminarBoletoItem(button) {
    button.closest('.boleto-item').remove();
}

async function guardarBoleteria() {
    const eventoId = document.getElementById("evento_id").value;
    if (!eventoId) {
        mostrarError("Seleccione un evento");
        return;
    }

    const boletosItems = document.querySelectorAll('.boleto-item');
    if (boletosItems.length === 0) {
        mostrarError("Agregue al menos un boleto");
        return;
    }

    const boleteria = [];
    for (let item of boletosItems) {
        const localidadId = item.querySelector('.localidad-select').value;
        const valor = item.querySelector('.valor-input').value;
        const cantidad = item.querySelector('.cantidad-input').value;

        if (!localidadId || !valor || !cantidad) {
            mostrarError("Complete todos los campos de los boletos");
            return;
        }

        boleteria.push({
            id_localidad: parseInt(localidadId),
            valor: parseFloat(valor),
            cantidad: parseInt(cantidad)
        });
    }

    try {
        const response = await fetch(API_BOLETERIA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_evento: parseInt(eventoId),
                boleteria: boleteria
            })
        });

        const result = await response.json();

        if (response.ok) {
            mostrarExito(result.mensaje || "Boletería guardada exitosamente");
            cargarBoleteria(eventoId);
            limpiarFormulario();
        } else {
            mostrarError(result.error || "Error al guardar la boletería");
        }
    } catch (error) {
        console.error("Error guardando boletería:", error);
        mostrarError("Error al guardar la boletería");
    }
}

function limpiarFormulario() {
    document.getElementById("boletosContainer").innerHTML = '';
    document.getElementById("evento_id").value = '';
    cargarBoleteria();
}

function mostrarExito(mensaje) {
    alert("✅ " + mensaje);
}

function mostrarError(mensaje) {
    alert("❌ " + mensaje);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarEventos();
    cargarLocalidades();

    document.getElementById("evento_id").addEventListener("change", (e) => {
        cargarBoleteria(e.target.value);
    });

    document.getElementById("btnAgregarBoleto").addEventListener("click", agregarBoleto);
    document.getElementById("btnGuardar").addEventListener("click", guardarBoleteria);
    document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
});