// frontend/js/main.js - Funciones globales

// Verificar autenticación y actualizar menú
function verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const userMenu = document.getElementById('userMenu');
    const loginMenu = document.getElementById('loginMenu');
    const registerMenu = document.getElementById('registerMenu');
    const linkAdmin = document.getElementById('linkAdmin');

    if (usuario && userMenu && loginMenu && registerMenu) {
        // Usuario autenticado
        userMenu.style.display = 'block';
        loginMenu.style.display = 'none';
        registerMenu.style.display = 'none';

        // Mostrar nombre del usuario
        const nombreUsuario = document.getElementById('nombreUsuario');
        if (nombreUsuario) {
            nombreUsuario.textContent = `${usuario.nombres} ${usuario.apellidos}`;
        }

        // Mostrar enlace admin si es admin (puedes agregar lógica aquí)
        if (linkAdmin) {
            linkAdmin.style.display = 'block'; // Por ahora siempre visible, puedes agregar lógica de roles
        }
    } else {
        // Usuario no autenticado
        if (userMenu) userMenu.style.display = 'none';
        if (loginMenu) loginMenu.style.display = 'block';
        if (registerMenu) registerMenu.style.display = 'block';
    }
}

// Función de logout
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// Cargar eventos destacados en la página principal
async function cargarEventosDestacados() {
    try {
        const response = await fetch('http://localhost/ferias-colombia/api/eventos.php');
        const data = await response.json();

        const container = document.getElementById('eventosDestacados');
        if (!container || !data.eventos) return;

        // Mostrar solo los primeros 3 eventos
        const eventosDestacados = data.eventos.slice(0, 3);

        container.innerHTML = '';
        eventosDestacados.forEach(evento => {
            const eventoCard = document.createElement('div');
            eventoCard.className = 'col-md-4';
            eventoCard.innerHTML = `
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title">${evento.nombre}</h5>
                        <p class="card-text">${evento.descripcion || 'Sin descripción'}</p>
                        <p class="text-muted">
                            <small>${new Date(evento.fecha).toLocaleDateString('es-ES')} - ${evento.hora}</small>
                        </p>
                        <a href="pages/eventos.html" class="btn btn-primary">Ver Detalles</a>
                    </div>
                </div>
            `;
            container.appendChild(eventoCard);
        });
    } catch (error) {
        console.error('Error cargando eventos destacados:', error);
    }
}

// Cargar estadísticas generales
async function cargarEstadisticas() {
    try {
        // Cargar eventos
        const eventosResponse = await fetch('http://localhost/ferias-colombia/api/eventos.php');
        const eventosData = await eventosResponse.json();
        document.getElementById('totalEventos').textContent = eventosData.eventos ? eventosData.eventos.length : 0;

        // Cargar artistas
        const artistasResponse = await fetch('http://localhost/ferias-colombia/api/artistas.php');
        const artistasData = await artistasResponse.json();
        document.getElementById('totalArtistas').textContent = artistasData.artistas ? artistasData.artistas.length : 0;

        // Cargar compras
        const comprasResponse = await fetch('http://localhost/ferias-colombia/api/compras.php');
        const comprasData = await comprasResponse.json();
        document.getElementById('totalCompras').textContent = comprasData.compras ? comprasData.compras.length : 0;

        // Cargar usuarios
        const usuariosResponse = await fetch('http://localhost/ferias-colombia/api/usuario.php');
        const usuariosData = await usuariosResponse.json();
        document.getElementById('totalUsuarios').textContent = Array.isArray(usuariosData) ? usuariosData.length : 0;

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Inicializar cuando se carga cualquier página
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();

    // Agregar event listener para logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Cargar contenido específico de la página principal
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/ferias-colombia/')) {
        cargarEventosDestacados();
        cargarEstadisticas();
    }
});
