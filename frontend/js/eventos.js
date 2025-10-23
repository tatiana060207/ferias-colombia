const API_EVENTOS = "http://localhost/FERIAS-COLOMBIA/api/eventos.php";

document.getElementById("formEvento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha_inicio = document.getElementById("fechaInicio").value + " " + document.getElementById("horaInicio").value + ":00";
  const fecha_fin = document.getElementById("fechaFin").value + " " + document.getElementById("horaFin").value + ":00";
  const municipio = document.getElementById("municipio").value.trim();
  const departamento = document.getElementById("departamento").value.trim();

  const nuevoEvento = {
    nombre,
    descripcion,
    fecha_inicio,
    fecha_fin,
    municipio,
    departamento
  };

  try {
    const response = await fetch(API_EVENTOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoEvento)
    });

    const data = await response.json();
    if (response.ok) {
      alert("✅ Evento guardado con éxito");
      document.getElementById("formEvento").reset();
      cargarEventos();
    } else {
      alert("❌ Error: " + (data.error || "No se pudo guardar el evento"));
    }
  } catch (error) {
    console.error("Error guardando evento:", error);
    alert("❌ Error al conectar con el servidor.");
  }
});

async function cargarEventos() {
  try {
    const response = await fetch(API_EVENTOS);
    const data = await response.json();
    const tbody = document.querySelector("#tablaEventos tbody");
    tbody.innerHTML = "";

    data.forEach(ev => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ev.id}</td>
        <td>${ev.nombre}</td>
        <td>${ev.descripcion}</td>
        <td>${ev.fecha_inicio}</td>
        <td>${ev.fecha_fin}</td>
        <td>${ev.municipio || ''}</td>
        <td>${ev.departamento || ''}</td>
        <td>${ev.estado}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarEvento(${ev.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarEvento(${ev.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error cargando eventos:", err);
  }
}

document.getElementById("btnLimpiar").addEventListener("click", () => {
  document.getElementById("formEvento").reset();
});

document.addEventListener("DOMContentLoaded", cargarEventos);
