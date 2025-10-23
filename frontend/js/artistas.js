const API_ARTISTAS = "http://localhost/FERIAS-COLOMBIA/api/artistas.php";

async function cargarArtistas() {
  try {
    const res = await fetch(API_ARTISTAS);
    const artistas = await res.json();

    const tbody = document.querySelector("#tablaArtistas tbody");
    tbody.innerHTML = "";

    if (Array.isArray(artistas) && artistas.length > 0) {
      artistas.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.id}</td>
          <td>${a.nombres}</td>
          <td>${a.apellidos}</td>
          <td>${a.genero_musical}</td>
          <td>${a.ciudad_natal}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarArtista(${a.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarArtista(${a.id})">Eliminar</button>
          </td>`;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay artistas</td></tr>';
    }
  } catch (err) {
    console.error("Error cargando artistas:", err);
    alert("Error al cargar los artistas. Revisa la consola (F12) y la ruta del API.");
  }
}

async function guardarArtista() {
  const id = document.getElementById("artistaId").value;
  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const genero_musical = document.getElementById("genero_musical").value.trim();
  const ciudad_natal = document.getElementById("ciudad_natal").value.trim();

  if (!nombres || !apellidos || !genero_musical || !ciudad_natal) {
    alert("Todos los campos son obligatorios");
    return;
  }

  const payload = { nombres, apellidos, genero_musical, ciudad_natal };
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_ARTISTAS}?id=${id}` : API_ARTISTAS;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok) {
      alert(result.mensaje || "Operación exitosa");
      limpiarFormulario();
      cargarArtistas();
    } else {
      console.error(result);
      alert(result.error || "Error en la operación");
    }
  } catch (err) {
    console.error("Error guardando artista:", err);
    alert("Error al conectar con el servidor. Revisa la consola y la ruta API.");
  }
}

async function editarArtista(id) {
  try {
    const res = await fetch(`${API_ARTISTAS}?id=${id}`);
    const a = await res.json();
    if (a && a.id) {
      document.getElementById("artistaId").value = a.id;
      document.getElementById("nombres").value = a.nombres;
      document.getElementById("apellidos").value = a.apellidos;
      document.getElementById("genero_musical").value = a.genero_musical;
      document.getElementById("ciudad_natal").value = a.ciudad_natal;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("Artista no encontrado");
    }
  } catch (err) {
    console.error("Error al obtener artista:", err);
    alert("Error al cargar el artista");
  }
}

async function eliminarArtista(id) {
  if (!confirm("¿Desea eliminar este artista?")) return;
  try {
    const res = await fetch(`${API_ARTISTAS}?id=${id}`, { method: "DELETE" });
    const result = await res.json();
    if (res.ok) {
      alert(result.mensaje || "Eliminado");
      cargarArtistas();
    } else {
      alert(result.error || "Error eliminando");
    }
  } catch (err) {
    console.error("Error eliminando artista:", err);
    alert("Error al conectar con el servidor");
  }
}

function limpiarFormulario() {
  document.getElementById("formArtista").reset();
  document.getElementById("artistaId").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarArtistas();
  document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
});
