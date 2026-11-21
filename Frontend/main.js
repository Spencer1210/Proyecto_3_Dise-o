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
    const API_CARRITO = '/api/carrito';

    // CATÁLOGO

    const catalogo = {
        mouse: {
            id: 'mouse',
            nombre: 'Mouse inalámbrico ergonómico',
            precio: 14900,
            imagen: '/img/MouseErgonomica.png'
        },
        monitor: {
            id: 'monitor',
            nombre: 'Monitor 27" 144 Hz',
            precio: 159000,
            imagen: '/img/monitor27.png'
        },
        teclado: {
            id: 'teclado',
            nombre: 'Teclado mecánico 75 %',
            precio: 42500,
            imagen: '/img/TecladoMecanico.png'
        },
        auriculares: {
            id: 'auriculares',
            nombre: 'Auriculares con micrófono',
            precio: 27900,
            imagen: '/img/AuricularesMicro.png'
        },
        webcam: {
            id: 'webcam',
            nombre: 'Webcam Full HD',
            precio: 21500,
            imagen: '/img/WebcamHD.png'
        }
    };

    // OBTENER IDENTIFICADOR DEL USUARIO

    function obtenerIdUsuario() {

        const datosSesion =
            localStorage.getItem(CLAVE_SESION) ||
            sessionStorage.getItem(CLAVE_SESION);

        if (!datosSesion) {
            return null;
        }

        try {

            const usuario = JSON.parse(datosSesion);

            if (
                !usuario ||
                !Number.isSafeInteger(usuario.id) ||
                usuario.id < 1
            ) {
                return null;
            }

            return String(usuario.id);

        } catch (error) {

            console.error(
                'Error al obtener el usuario:',
                error
            );

            return null;
        }
    }

    // INICIO DE SESIÓN

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

    // REGISTRO

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

    // FUNCIONES DEL CARRITO

    function formatoPrecio(cantidad) {
        return '¢' + Number(cantidad).toLocaleString('es-CR');
    }

    // Consultar el total del carrito individual
    async function actualizarTotalCarrito() {

        const elemento = document.getElementById('carritoTotal');

        try {

            const usuarioId = obtenerIdUsuario();

            if (!usuarioId) {

                if (elemento) {
                    elemento.textContent = '¢0';
                }

                return;
            }

            const respuesta = await fetch(API_CARRITO, {
                cache: 'no-store',
                headers: {
                    'X-Usuario-Id': usuarioId
                }
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo consultar el carrito.');
            }

            const datos = await respuesta.json();

            if (elemento) {
                elemento.textContent = formatoPrecio(
                    datos.resumen.total
                );
            }

        } catch (error) {
            console.error(
                'Error al actualizar el total del carrito:',
                error
            );
        }
    }

    // Agregar productos al carrito individual
    async function agregarAlCarrito(id) {

        const producto = catalogo[id];

        if (!producto) {
            console.error('Producto no encontrado:', id);
            return;
        }

        const usuarioId = obtenerIdUsuario();

        if (!usuarioId) {

            alert('Debés iniciar sesión para agregar productos.');

            window.location.href = '/';

            return;
        }

        try {
            const respuesta = await fetch(API_CARRITO, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Usuario-Id': usuarioId
                },
                body: JSON.stringify({
                    ...producto,
                    cantidad: 1
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.mensaje || 'No se pudo agregar el producto.'
                );
            }

            // Patrón Observer: avisar al encabezado compartido
            document.dispatchEvent(
                new CustomEvent('techstore:carrito-actualizado')
            );

            // Actualizar también si existe un total local
            await actualizarTotalCarrito();

        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            alert('No se pudo agregar el producto al carrito.');
        }
    }

    // BOTONES AGREGAR AL CARRITO

    document.querySelectorAll('.btn-add-cart').forEach(function (boton) {
        boton.addEventListener('click', async function () {
            if (this.disabled) return;

            this.disabled = true;

            try {
                await agregarAlCarrito(this.dataset.id);
            } finally {
                this.disabled = false;
            }
        });
    });

    // Sincronizar el total del carrito
    actualizarTotalCarrito();

    // USUARIO CONECTADO

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

    // CERRAR SESIÓN

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