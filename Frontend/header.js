document.addEventListener('DOMContentLoaded', async function () {

    const contenedor = document.getElementById('header-techstore');

    if (!contenedor) return;

    // Obtener el ID del usuario que inició sesión
    function obtenerIdUsuarioHeader() {

        const datosSesion =
            localStorage.getItem('usuarioTechStore') ||
            sessionStorage.getItem('usuarioTechStore');

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

            console.error('Error al obtener usuario:', error);

            return null;
        }
    }

    try {

        // Cargar encabezado
        const respuesta = await fetch('/header.html', {
            cache: 'no-cache'
        });

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el encabezado');
        }

        contenedor.innerHTML = await respuesta.text();

        // Mostrar usuario
        const datosSesion =
            localStorage.getItem('usuarioTechStore') ||
            sessionStorage.getItem('usuarioTechStore');

        const linkAcceso = contenedor.querySelector('#linkAcceso');

        if (datosSesion && linkAcceso) {

            try {

                const usuario = JSON.parse(datosSesion);

                if (usuario.nombre) {

                    const textoAcceso =
                        linkAcceso.querySelector('.texto-acceso');

                    if (textoAcceso) {
                        textoAcceso.textContent =
                            'HOLA, ' + usuario.nombre;
                    }

                    linkAcceso.href = '/pantalla-principal.html';
                }

            } catch (error) {
                console.error('Error al leer la sesión:', error);
            }

        }

        // Cerrar sesión
        const cerrarSesion =
            contenedor.querySelector('#cerrarSesion');

        if (cerrarSesion) {

            cerrarSesion.addEventListener('click', function (evento) {

                evento.preventDefault();

                localStorage.removeItem('usuarioTechStore');
                sessionStorage.removeItem('usuarioTechStore');

                window.location.href = '/';

            });

        }

        // Actualizar total del carrito
        const carritoTotal =
            contenedor.querySelector('#carritoTotal');

        async function actualizarTotalCarrito() {

            if (!carritoTotal) return;

            try {

                // Obtener el identificador del usuario actual
                const usuarioId = obtenerIdUsuarioHeader();

                // Si no existe una sesión, mostrar carrito vacío
                if (!usuarioId) {

                    carritoTotal.textContent = '¢0';

                    return;
                }

                // Consultar el carrito individual del usuario
                const respuestaCarrito = await fetch('/api/carrito', {
                    cache: 'no-store',
                    headers: {
                        'X-Usuario-Id': usuarioId
                    }
                });

                if (!respuestaCarrito.ok) {
                    throw new Error('No se pudo consultar el carrito');
                }

                const datos = await respuestaCarrito.json();

                const total = Number(
                    datos.resumen?.total || 0
                );

                carritoTotal.textContent =
                    '¢' + total.toLocaleString('es-CR');

            } catch (error) {

                console.error('Error al actualizar el carrito:', error);

                carritoTotal.textContent = '¢0';

            }

        }

        // Patrón Observer: escuchar cambios del carrito
        window.addEventListener(
            'carritoActualizado',
            actualizarTotalCarrito
        );

        document.addEventListener(
            'techstore:carrito-actualizado',
            actualizarTotalCarrito
        );

        window.addEventListener('pageshow', function () {
            actualizarTotalCarrito();
        });

        // Barra de búsqueda
        const formulario =
            contenedor.querySelector('#formBusqueda');

        const input =
            contenedor.querySelector('#busquedaHeader');

        if (formulario && input) {

            const parametros = new URLSearchParams(
                window.location.search
            );

            if (window.location.pathname === '/busqueda.html') {
                input.value = parametros.get('q') || '';
            }

            formulario.addEventListener('submit', function (evento) {

                evento.preventDefault();

                const termino = input.value.trim();

                if (!termino) return;

                window.location.href =
                    '/busqueda.html?q=' +
                    encodeURIComponent(termino);

            });

            const lupa = formulario.querySelector('.buscador-icono');

            if (lupa) {

                lupa.style.cursor = 'pointer';

                lupa.addEventListener('click', function () {

                    formulario.requestSubmit();

                });

            }

        }

        // Cargar total del carrito del usuario
        await actualizarTotalCarrito();

        // Avisar que el encabezado está listo
        document.dispatchEvent(
            new CustomEvent('techstore:header-listo')
        );

    } catch (error) {

        console.error('Error al cargar el encabezado:', error);

    }

});