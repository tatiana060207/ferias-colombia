const API_URL = "http://localhost/ferias-colombia/backend/api/usuario.php";

// === REGISTRO ===
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      accion: "registro",
      nombres: document.getElementById("nombres").value,
      apellidos: document.getElementById("apellidos").value,
      tipo_documento: document.getElementById("tipo_documento").value,
      numero_documento: document.getElementById("numero_documento").value,
      correo: document.getElementById("correo").value,
      telefono: document.getElementById("telefono").value,
      contraseña: document.getElementById("contrasena").value,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resultado = await res.json();
    document.getElementById("mensaje").textContent =
      resultado.message || resultado.error;
  });
}

// === LOGIN ===
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      accion: "login",
      correo: document.getElementById("correo").value,
      contrasena: document.getElementById("contrasena").value,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resultado = await res.json();

    if (resultado.usuario) {
      localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
      window.location.href = "admin.html";
    } else {
      document.getElementById("mensaje").textContent =
        resultado.error || "Error al iniciar sesión";
    }
  });
}
