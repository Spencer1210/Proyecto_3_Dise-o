
document.addEventListener('DOMContentLoaded', async function () {

    const contenedor = document.getElementById('header-techstore');

    if (!contenedor) return;

    try {
        const respuesta = await fetch('/header.html', {
            cache: 'no-cache'
        });

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el encabezado');
        }

        contenedor.innerHTML = await respuesta.text();

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

        const cerrarSesion = contenedor.querySelector('#cerrarSesion');

        if (cerrarSesion) {
            cerrarSesion.addEventListener('click', function (evento) {
                evento.preventDefault();

                localStorage.removeItem('usuarioTechStore');
                sessionStorage.removeItem('usuarioTechStore');

                window.location.href = '/';
            });
        }

        const carritoTotal = contenedor.querySelector('#carritoTotal');

        function actualizarTotalCarrito() {
            if (!carritoTotal) return;

            const totalGuardado = Number(
                localStorage.getItem('carritoTotal') || 0
            );

            carritoTotal.textContent =
                '¢' + (
                    Number.isFinite(totalGuardado) ? totalGuardado : 0
                ).toLocaleString('es-CR');
        }

        actualizarTotalCarrito();

        window.addEventListener('storage', actualizarTotalCarrito);

        const formulario = contenedor.querySelector('#formBusqueda');

        if (formulario) {
            formulario.addEventListener('submit', function (evento) {
                evento.preventDefault();

                const input = contenedor.querySelector('#busquedaHeader');
                const termino = input.value.trim();

                if (!termino) return;

                document.dispatchEvent(
                    new CustomEvent('techstore:buscar', {
                        detail: {
                            termino: termino
                        }
                    })
                );
            });
        }

        document.dispatchEvent(
            new CustomEvent('techstore:header-listo')
        );

    } catch (error) {
        console.error('Error al cargar el encabezado:', error);
    }

});
