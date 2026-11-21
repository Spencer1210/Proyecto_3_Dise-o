(function () {

    const CLAVE_TEMA = 'techstore-tema';

    const estilosOriginales = new Map();

    let observador = null;
    let actualizacionPendiente = false;

    const colores = {

        fondo: '#121212',
        tarjeta: '#242424',
        superficie: '#292235',
        texto: '#f5f5f5',
        secundario: '#d1d1d1',
        morado: '#c4b5fd',
        borde: '#555555'

    };

    function obtenerRGB(color) {

        if (!color || !/^rgba?\(/i.test(color)) {
            return null;
        }

        const valores = color.match(/[\d.]+/g);

        if (!valores || valores.length < 3) {
            return null;
        }

        return {

            r: Number(valores[0]),
            g: Number(valores[1]),
            b: Number(valores[2]),

            a: valores.length > 3
                ? Number(valores[3])
                : 1

        };
    }

    function luminosidad(color) {

        return (
            color.r * 0.299 +
            color.g * 0.587 +
            color.b * 0.114
        );
    }

    function esClaro(color) {

        return color &&
               color.a > 0.1 &&
               luminosidad(color) > 145;

    }

    // Guardar los estilos originales

    function cambiarEstilo(elemento, propiedad, valor) {

        if (!estilosOriginales.has(elemento)) {

            estilosOriginales.set(
                elemento,
                new Map()
            );

        }

        const propiedades =
            estilosOriginales.get(elemento);

        if (!propiedades.has(propiedad)) {

            propiedades.set(propiedad, {

                valor: elemento.style.getPropertyValue(
                    propiedad
                ),

                prioridad: elemento.style.getPropertyPriority(
                    propiedad
                )

            });
        }

        elemento.style.setProperty(
            propiedad,
            valor,
            'important'
        );
    }

    function excluirElemento(elemento) {

        if (!(elemento instanceof HTMLElement)) {
            return true;
        }

        if (elemento.matches(
            'img, video, canvas, script, style, iframe, picture, source, audio'
        )) {
            return true;
        }

        return Boolean(elemento.closest(
            '.accesibilidad-contenedor, ' +
            '.leaflet-container, ' +
            '.marca, svg'
        ));

    }

    function esMorado(color) {

        return color &&
               color.b > color.g + 15 &&
               color.r > color.g + 5;

    }

    // Adaptar fondos y bordes

    function adaptarFondo(elemento) {

        if (excluirElemento(elemento)) {
            return;
        }

        const estilo = getComputedStyle(elemento);

        const fondo = obtenerRGB(
            estilo.backgroundColor
        );

        const borde = obtenerRGB(
            estilo.borderTopColor
        );

        if (esClaro(fondo)) {

            cambiarEstilo(
                elemento,
                'background-color',
                esMorado(fondo)
                    ? colores.superficie
                    : colores.tarjeta
            );

        }

        if (
            estilo.backgroundImage.includes('gradient')
        ) {

            const coloresDegradado =
                estilo.backgroundImage.match(
                    /rgba?\([^)]+\)/gi
                ) || [];

            const degradadoClaro =
                coloresDegradado.some(color => {

                    return esClaro(
                        obtenerRGB(color)
                    );

                });

            if (degradadoClaro) {

                cambiarEstilo(
                    elemento,
                    'background-image',
                    'linear-gradient(135deg, #21192e, #342446)'
                );

                cambiarEstilo(
                    elemento,
                    'background-color',
                    colores.superficie
                );

            }
        }

        if (
            estilo.borderTopWidth !== '0px' &&
            esClaro(borde)
        ) {

            cambiarEstilo(
                elemento,
                'border-color',
                colores.borde
            );

        }

    }

    // Adaptar los textos

    function adaptarTexto(elemento) {

        if (excluirElemento(elemento)) {
            return;
        }

        const estilo = getComputedStyle(elemento);

        const colorOriginal = obtenerRGB(
            estilo.color
        );

        if (!colorOriginal || colorOriginal.a === 0) {
            return;
        }

        let nuevoColor = colores.texto;

        const esBoton = elemento.matches(
            'button, [role="button"], input[type="submit"], input[type="button"]'
        );

        const perteneceBoton = elemento.closest(
            'button, [role="button"]'
        );

        if (esBoton || perteneceBoton) {

            nuevoColor = '#ffffff';

        } else if (elemento.matches(
            'h1, h2, h3, h4, h5, h6, strong, b'
        )) {

            nuevoColor = colores.texto;

        } else if (elemento.matches(
            'a, a *'
        )) {

            nuevoColor = colores.morado;

        } else if (elemento.matches(
            'p, small, label, address'
        )) {

            nuevoColor = colores.secundario;

        } else if (esMorado(colorOriginal)) {

            nuevoColor = colores.morado;

        }

        cambiarEstilo(
            elemento,
            'color',
            nuevoColor
        );

        if (elemento.matches(
            'input, select, textarea'
        )) {

            cambiarEstilo(
                elemento,
                'color',
                colores.texto
            );

        }

        if (
            Number(estilo.opacity) < 1 &&
            Number(estilo.opacity) > 0 &&
            !elemento.matches(
                ':disabled, [aria-disabled="true"]'
            )
        ) {

            const contieneTexto = Array.from(
                elemento.childNodes
            ).some(nodo => {

                return nodo.nodeType === Node.TEXT_NODE &&
                       nodo.textContent.trim();

            });

            if (contieneTexto) {

                cambiarEstilo(
                    elemento,
                    'opacity',
                    '1'
                );

            }

        }

    }

    // Restaurar los estilos originales

    function restaurarEstilos() {

        estilosOriginales.forEach(
            (propiedades, elemento) => {

                propiedades.forEach(
                    (original, propiedad) => {

                        if (original.valor) {

                            elemento.style.setProperty(
                                propiedad,
                                original.valor,
                                original.prioridad
                            );

                        } else {

                            elemento.style.removeProperty(
                                propiedad
                            );

                        }

                    }
                );

            }
        );

        estilosOriginales.clear();

    }

    // Aplicar el tema a toda la página

    function actualizarPagina() {

        if (!document.body || !esModoOscuro()) {
            return;
        }

        restaurarEstilos();

        cambiarEstilo(
            document.documentElement,
            'background-color',
            colores.fondo
        );

        cambiarEstilo(
            document.body,
            'background-color',
            colores.fondo
        );

        cambiarEstilo(
            document.body,
            'color',
            colores.texto
        );

        const elementos =
            document.body.querySelectorAll('*');

        elementos.forEach(elemento => {

            if (!excluirElemento(elemento)) {

                cambiarEstilo(
                    elemento,
                    'transition-property',
                    'none'
                );

            }

        });

        elementos.forEach(adaptarFondo);

        elementos.forEach(adaptarTexto);

    }

    function programarActualizacion() {

        if (
            actualizacionPendiente ||
            !esModoOscuro()
        ) {
            return;
        }

        actualizacionPendiente = true;

        requestAnimationFrame(() => {

            actualizacionPendiente = false;

            actualizarPagina();

        });

    }

    // Detectar contenido dinámico

    function iniciarObservador() {

        if (observador) {

            observador.disconnect();

        }

        observador = new MutationObserver(cambios => {

            const requiereActualizacion =
                cambios.some(cambio => {

                    const elemento =
                        cambio.target instanceof HTMLElement
                            ? cambio.target
                            : cambio.target.parentElement;

                    return elemento &&
                           !excluirElemento(elemento);

                });

            if (requiereActualizacion) {

                programarActualizacion();

            }

        });

        observador.observe(document.body, {

            childList: true,
            subtree: true,
            attributes: true,

            attributeFilter: [

                'class',
                'hidden',
                'aria-hidden'

            ]

        });

    }

    function guardarTema(tema) {

        try {

            localStorage.setItem(
                CLAVE_TEMA,
                tema
            );

        } catch (error) {

            console.warn(
                'No se pudo guardar el tema.'
            );

        }

    }

    // Activar el modo oscuro

    function activarModoOscuro() {

        document.documentElement.classList.add(
            'modo-oscuro'
        );

        guardarTema('oscuro');

        actualizarPagina();

        iniciarObservador();

    }

    // Activar el modo claro

    function activarModoClaro() {

        if (observador) {

            observador.disconnect();

            observador = null;

        }

        document.documentElement.classList.remove(
            'modo-oscuro'
        );

        restaurarEstilos();

        guardarTema('claro');

    }

    function esModoOscuro() {

        return document.documentElement.classList
            .contains('modo-oscuro');

    }

    function cambiarTema() {

        if (esModoOscuro()) {

            activarModoClaro();

            return false;

        }

        activarModoOscuro();

        return true;

    }

    function iniciarTema() {

        let temaGuardado = 'claro';

        try {

            temaGuardado =
                localStorage.getItem(CLAVE_TEMA);

        } catch (error) {

            console.warn(
                'No se pudo recuperar el tema.'
            );

        }

        if (temaGuardado === 'oscuro') {

            activarModoOscuro();

        } else {

            activarModoClaro();

        }

    }

    window.TemaTechStore = {

        cambiarTema,
        activarModoOscuro,
        activarModoClaro,
        esModoOscuro,
        actualizarPagina

    };

    window.addEventListener(
        'load',
        programarActualizacion
    );

    window.addEventListener(
        'resize',
        programarActualizacion
    );

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            iniciarTema
        );

    } else {

        iniciarTema();

    }

})();