class PagoTarjeta {
    procesarPago() {
        return "El pago se realiza con tarjeta.";
    }
}

class PagoSinpe {
    procesarPago() {
        return "El pago se realiza mediante SINPE Móvil.";
    }
}

class PagoEfectivo {
    procesarPago() {
        return "El pago se realiza en la tienda.";
    }
}

function realizarPago(metodoPago) {
    return metodoPago.procesarPago();
}
document.addEventListener('DOMContentLoaded', function () {

    const CLAVE_SESION = 'usuarioTechStore';
    const CLAVE_CARRITO = 'carritoTechStore';

    // ======================================
    // CATÁLOGO
    // ======================================

    const catalogo = {
        mouse: {
            id: 'mouse',
            nombre: 'Mouse inalámbrico ergonómico',
            precio: 14900,
            imagen: 'img/MouseErgonomica.png'
        },
        monitor: {
            id: 'monitor',
            nombre: 'Monitor 27" 144 Hz',
            precio: 159000,
            imagen: 'img/monitor27.png'
        },
        teclado: {
            id: 'teclado',
            nombre: 'Teclado mecánico 75 %',
            precio: 42500,
            imagen: 'img/TecladoMecanico.png'
        },
        auriculares: {
            id: 'auriculares',
            nombre: 'Auriculares con micrófono',
            precio: 27900,
            imagen: 'img/AuricularesMicro.png'
        },
        webcam: {
            id: 'webcam',
            nombre: 'Webcam Full HD',
            precio: 21500,
            imagen: 'img/WebcamHD.png'
        }
    };

    // ======================================
    // INICIO DE SESIÓN
    // ======================================

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const respuesta = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const datos = await respuesta.json();

                if (!datos.success) {
                    alert(datos.message || 'No se pudo iniciar sesión.');
                    return;
                }

                localStorage.removeItem(CLAVE_SESION);
                sessionStorage.removeItem(CLAVE_SESION);

                const casilla = document.getElementById('mantenerSesion');

                const almacenamiento =
                    casilla && casilla.checked
                        ? localStorage
                        : sessionStorage;

                almacenamiento.setItem(
                    CLAVE_SESION,
                    JSON.stringify(datos.usuario)
                );

                window.location.replace('/pantalla-principal.html');

            } catch (error) {
                console.error(error);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }

    // ======================================
    // REGISTRO
    // ======================================

    const registroForm = document.getElementById('registroForm');

    if (registroForm) {
        registroForm.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nombre,
                        email,
                        password
                    })
                });

                const datos = await respuesta.json();

                if (datos.success) {
                    alert('Usuario registrado correctamente.');
                    window.location.href = '/';
                } else {
                    alert(datos.message || 'Error al registrar usuario.');
                }

            } catch (error) {
                console.error(error);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }

    // ======================================
    // FUNCIONES DEL CARRITO
    // ======================================

    function obtenerCarrito() {
        try {
            const datos = JSON.parse(
                localStorage.getItem(CLAVE_CARRITO) || '[]'
            );

            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            console.error('Error al leer el carrito:', error);
            return [];
        }
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
    }

    function calcularSubtotal() {
        return obtenerCarrito().reduce(function (total, producto) {
            return total + producto.precio * producto.cantidad;
        }, 0);
    }

    function formatoPrecio(cantidad) {
        return '¢' + cantidad.toLocaleString('es-CR');
    }

    function actualizarTotalCarrito() {
        const elemento = document.getElementById('carritoTotal');

        if (elemento) {
            elemento.textContent = formatoPrecio(calcularSubtotal());
        }
    }

    function agregarAlCarrito(id) {
        const producto = catalogo[id];

        if (!producto) {
            console.error('Producto no encontrado:', id);
            return;
        }

        const carrito = obtenerCarrito();

        const existente = carrito.find(function (item) {
            return item.id === id;
        });

        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({
                ...producto,
                cantidad: 1
            });
        }

        guardarCarrito(carrito);
        actualizarTotalCarrito();

        alert('Agregaste al carrito: ' + producto.nombre);
    }

    // ======================================
    // BOTONES AGREGAR AL CARRITO
    // ======================================

    document.querySelectorAll('.btn-add-cart').forEach(function (boton) {
        boton.addEventListener('click', function () {
            agregarAlCarrito(this.dataset.id);
        });
    });

    actualizarTotalCarrito();

    // ======================================
    // USUARIO CONECTADO
    // ======================================

    const datosSesion =
        localStorage.getItem(CLAVE_SESION) ||
        sessionStorage.getItem(CLAVE_SESION);

    const linkAcceso = document.getElementById('linkAcceso');

    if (datosSesion && linkAcceso) {
        try {
            const usuario = JSON.parse(datosSesion);

            if (usuario && usuario.nombre) {
                linkAcceso.textContent = 'HOLA, ' + usuario.nombre;
                linkAcceso.href = '#';
            }
        } catch (error) {
            console.error('Error al leer la sesión:', error);
        }
    }

    // ======================================
    // CERRAR SESIÓN
    // ======================================

    const cerrarSesion = document.getElementById('cerrarSesion');

    if (cerrarSesion) {
        cerrarSesion.addEventListener('click', function (evento) {
            evento.preventDefault();

            localStorage.removeItem(CLAVE_SESION);
            sessionStorage.removeItem(CLAVE_SESION);
            sessionStorage.removeItem('usuario');

            window.location.replace('/');
        });
    }

});
