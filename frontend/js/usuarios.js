const API_URL = "http://localhost/ferias-colombia/api/usuario.php";

// === REGISTRO ===
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      accion: "registro",
      nombres: document.getElementById("nombres").value.trim(),
      apellidos: document.getElementById("apellidos").value.trim(),
      tipo_documento: document.getElementById("tipo_documento").value,
      numero_documento: document.getElementById("numero_documento").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      contrasena: document.getElementById("contrasena").value.trim(),
    };

    const mensaje = document.getElementById("mensaje");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Si el servidor no responde correctamente
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const resultado = await res.json();
      mensaje.textContent = resultado.message || resultado.error || "Registro exitoso";

    } catch (error) {
      console.error("Error en registro:", error);
      mensaje.textContent = "❌ No se pudo conectar con el servidor. Verifica tu conexión o que PHP esté activo.";
    }
  });
}

// === LOGIN ===
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      accion: "login",
      correo: document.getElementById("correo").value.trim(),
      contrasena: document.getElementById("contrasena").value.trim(),
    };

    const mensaje = document.getElementById("mensaje");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const resultado = await res.json();

      if (resultado.usuario) {
        localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
        window.location.href = "admin.html";
      } else {
        mensaje.textContent = resultado.error || "❌ Credenciales incorrectas";
      }

    } catch (error) {
      console.error("Error en login:", error);
      mensaje.textContent = "❌ No se pudo conectar con el servidor.";
    }
  });
}
