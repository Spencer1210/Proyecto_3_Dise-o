document.addEventListener('DOMContentLoaded', function() {

    // ===== LÓGICA DE LOGIN =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    window.location.href = '/pantalla-principal.html';
                } else {
                    alert('❌ ' + data.message);
                }
            })
            .catch(() => alert('Error al conectar. Asegúrate de correr node server.js'));
        });
    }

    // ===== LÓGICA DE REGISTRO =====
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    alert('✅ ' + data.message);
                    window.location.href = '/';
                } else {
                    alert('❌ ' + data.message);
                }
            })
            .catch(() => alert('Error al conectar. Asegúrate de correr node server.js'));
        });
    }

    // ===== LÓGICA DE LA TIENDA (pantalla principal) =====
    const tienda = document.querySelector('.tienda-page');
    if (tienda) {

        // Mostrar usuario logueado
        const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');
        const linkAcceso = document.getElementById('linkAcceso');
        if (usuario && linkAcceso) {
            linkAcceso.textContent = 'Hola, ' + usuario.nombre;
            linkAcceso.href = '#';
            linkAcceso.addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.removeItem('usuario');
                window.location.href = '/';
            });
        }

        // Carrito (persistente con localStorage)
        let total = parseInt(localStorage.getItem('carritoTotal') || '0', 10);
        const carritoTotal = document.getElementById('carritoTotal');
        function pintarCarrito() {
            if (carritoTotal) carritoTotal.textContent = '¢' + total.toLocaleString('es-CR');
        }
        pintarCarrito();

        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const precio = parseInt(this.dataset.precio, 10);
                total += precio;
                localStorage.setItem('carritoTotal', total);
                pintarCarrito();
                const nombre = this.closest('.producto').querySelector('.prod-nombre').textContent;
                alert('🛒 Agregaste: ' + nombre);
            });
        });
    }

});