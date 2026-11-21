(function () {

    function iniciarAccesibilidad() {

        if (document.getElementById('panelAccesibilidad')) {
            return;
        }

        const contenedor = document.createElement('div');

        contenedor.className = 'accesibilidad-contenedor';

        contenedor.innerHTML = `
            <button
                id="botonAccesibilidad"
                class="accesibilidad-boton"
                type="button"
                aria-label="Abrir opciones de accesibilidad"
                aria-expanded="false"
                aria-controls="panelAccesibilidad">

                <svg viewBox="0 0 24 24"
                     width="30"
                     height="30"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     stroke-linecap="round"
                     aria-hidden="true">

                    <circle cx="12" cy="4" r="2"/>
                    <path d="M4 8l8 2 8-2"/>
                    <path d="M12 10v5"/>
                    <path d="M12 15l-4 6"/>
                    <path d="M12 15l4 6"/>

                </svg>

            </button>

            <section
                id="panelAccesibilidad"
                class="accesibilidad-panel"
                aria-labelledby="tituloAccesibilidad"
                hidden>

                <div class="accesibilidad-encabezado">

                    <h2 id="tituloAccesibilidad">
                        Accesibilidad
                    </h2>

                    <button
                        id="cerrarAccesibilidad"
                        class="accesibilidad-cerrar"
                        type="button"
                        aria-label="Cerrar panel">
                        ×
                    </button>

                </div>

                <button
                    id="cambiarTema"
                    class="accesibilidad-opcion"
                    type="button"
                    aria-pressed="false">

                    <span id="iconoTema" aria-hidden="true">☾</span>
                    <span id="textoTema">Modo oscuro</span>

                </button>

                <button
                    id="leerContenido"
                    class="accesibilidad-opcion"
                    type="button">

                    <span aria-hidden="true">🔊</span>
                    Leer contenido

                </button>

                <button
                    id="pausarLectura"
                    class="accesibilidad-opcion"
                    type="button"
                    disabled>

                    <span aria-hidden="true">⏸</span>
                    Pausar lectura

                </button>

                <button
                    id="reanudarLectura"
                    class="accesibilidad-opcion"
                    type="button"
                    disabled>

                    <span aria-hidden="true">▶</span>
                    Reanudar lectura

                </button>

                <button
                    id="detenerLectura"
                    class="accesibilidad-opcion"
                    type="button"
                    disabled>

                    <span aria-hidden="true">■</span>
                    Detener lectura

                </button>

                <p class="accesibilidad-ayuda">
                    Seleccioná un texto para escucharlo
                    o presioná Leer contenido.
                </p>

                <p
                    id="estadoLectura"
                    class="accesibilidad-estado"
                    role="status"
                    aria-live="polite">
                </p>

            </section>
        `;

        document.body.appendChild(contenedor);

        const boton = document.getElementById('botonAccesibilidad');
        const panel = document.getElementById('panelAccesibilidad');
        const cerrar = document.getElementById('cerrarAccesibilidad');
        const cambiarTema = document.getElementById('cambiarTema');
        const textoTema = document.getElementById('textoTema');
        const iconoTema = document.getElementById('iconoTema');
        const leer = document.getElementById('leerContenido');
        const pausar = document.getElementById('pausarLectura');
        const reanudar = document.getElementById('reanudarLectura');
        const detener = document.getElementById('detenerLectura');
        const estadoLectura = document.getElementById('estadoLectura');

        // Abrir y cerrar el panel

        function abrirPanel() {

            panel.hidden = false;

            boton.setAttribute('aria-expanded', 'true');
            boton.setAttribute(
                'aria-label',
                'Cerrar opciones de accesibilidad'
            );

            actualizarBotonTema();

            cambiarTema.focus();
        }

        function cerrarPanel() {

            panel.hidden = true;

            boton.setAttribute('aria-expanded', 'false');
            boton.setAttribute(
                'aria-label',
                'Abrir opciones de accesibilidad'
            );

            boton.focus();
        }

        boton.addEventListener('click', () => {

            if (panel.hidden) {
                abrirPanel();
            } else {
                cerrarPanel();
            }

        });

        cerrar.addEventListener('click', cerrarPanel);

        document.addEventListener('keydown', evento => {

            if (evento.key === 'Escape' && !panel.hidden) {
                evento.preventDefault();
                cerrarPanel();
            }

        });

        // Cambiar el tema

        function actualizarBotonTema() {

            const oscuro = document.documentElement
                .classList.contains('modo-oscuro');

            textoTema.textContent = oscuro
                ? 'Modo claro'
                : 'Modo oscuro';

            iconoTema.textContent = oscuro
                ? '☀'
                : '☾';

            cambiarTema.setAttribute(
                'aria-pressed',
                String(oscuro)
            );
        }

        actualizarBotonTema();

        cambiarTema.addEventListener('click', () => {

            if (!window.TemaTechStore) {

                estadoLectura.textContent =
                    'No se pudo cargar el módulo de temas.';

                return;
            }

            window.TemaTechStore.cambiarTema();

            actualizarBotonTema();

        });

        if (
            !('speechSynthesis' in window) ||
            !('SpeechSynthesisUtterance' in window)
        ) {

            leer.disabled = true;

            estadoLectura.textContent =
                'El navegador no admite el lector de texto.';

            return;
        }

        const sintetizador = window.speechSynthesis;

        let lecturaActual = null;
        let textoSeleccionado = '';
        let identificadorLectura = 0;

        // Detectar texto seleccionado

        document.addEventListener('selectionchange', () => {

            const seleccion = window.getSelection();

            if (!seleccion) return;

            if (
                seleccion.anchorNode &&
                contenedor.contains(seleccion.anchorNode)
            ) {
                return;
            }

            const texto = seleccion.toString().trim();

            if (texto) {
                textoSeleccionado = texto;
            }

        });

        document.addEventListener('pointerdown', evento => {

            if (!contenedor.contains(evento.target)) {
                textoSeleccionado = '';
            }

        });

        // Obtener contenido de la página

        function obtenerTextoPagina() {

            const principal =
                document.querySelector('main') ||
                document.body;

            const selector =
                'h1, h2, h3, h4, p, li, label, a, button, td, th, img, .prod-nombre, .prod-precio, .precio';

            const elementos = principal.querySelectorAll(selector);

            const textos = [];

            elementos.forEach(elemento => {

                if (
                    elemento.closest(
                        '.accesibilidad-contenedor, [hidden], [aria-hidden="true"], script, style'
                    )
                ) {
                    return;
                }

                if (
                    elemento.getClientRects().length === 0 ||
                    getComputedStyle(elemento).visibility === 'hidden'
                ) {
                    return;
                }

                if (elemento.parentElement?.closest(selector)) {
                    return;
                }

                const texto = elemento.tagName === 'IMG'
                    ? elemento.alt
                    : elemento.innerText;

                if (texto && texto.trim()) {
                    textos.push(texto.trim());
                }

            });

            return textos.join('. ');
        }

        function actualizarControles(estado) {

            pausar.disabled = estado !== 'leyendo';
            reanudar.disabled = estado !== 'pausado';
            detener.disabled = estado === 'detenido';

        }

        // Dividir textos extensos

        function dividirTexto(texto) {

            const palabras = texto.split(/\s+/);
            const fragmentos = [];

            let fragmento = '';

            palabras.forEach(palabra => {

                if (
                    fragmento &&
                    fragmento.length + palabra.length + 1 > 180
                ) {

                    fragmentos.push(fragmento.trim());
                    fragmento = '';

                }

                fragmento += palabra + ' ';

            });

            if (fragmento.trim()) {
                fragmentos.push(fragmento.trim());
            }

            return fragmentos;
        }

        function obtenerVoz() {

            const voces = sintetizador.getVoices();

            return voces.find(voz => voz.lang === 'es-CR') ||
                   voces.find(voz => voz.lang.startsWith('es'));

        }

        // Reproducir los fragmentos

        function reproducirFragmento(
            fragmentos,
            indice,
            identificador
        ) {

            if (identificador !== identificadorLectura) {
                return;
            }

            if (indice >= fragmentos.length) {

                lecturaActual = null;

                estadoLectura.textContent =
                    'Lectura finalizada.';

                actualizarControles('detenido');

                return;
            }

            const nuevaLectura =
                new SpeechSynthesisUtterance(fragmentos[indice]);

            lecturaActual = nuevaLectura;

            nuevaLectura.lang = 'es-CR';
            nuevaLectura.rate = 0.9;
            nuevaLectura.pitch = 1;
            nuevaLectura.volume = 1;

            const voz = obtenerVoz();

            if (voz) {
                nuevaLectura.voice = voz;
            }

            nuevaLectura.onstart = () => {

                if (identificador !== identificadorLectura) {
                    return;
                }

                estadoLectura.textContent =
                    'Leyendo contenido...';

                actualizarControles('leyendo');

            };

            nuevaLectura.onend = () => {

                reproducirFragmento(
                    fragmentos,
                    indice + 1,
                    identificador
                );

            };

            nuevaLectura.onerror = () => {

                if (identificador !== identificadorLectura) {
                    return;
                }

                lecturaActual = null;

                estadoLectura.textContent =
                    'No se pudo reproducir la lectura.';

                actualizarControles('detenido');

            };

            sintetizador.speak(nuevaLectura);
        }

        // Iniciar lectura

        leer.addEventListener('click', () => {

            const seleccion = window.getSelection();

            const seleccionActual =
                seleccion &&
                !contenedor.contains(seleccion.anchorNode)
                    ? seleccion.toString().trim()
                    : '';

            const texto =
                seleccionActual ||
                textoSeleccionado ||
                obtenerTextoPagina();

            if (!texto) {

                estadoLectura.textContent =
                    'No hay contenido disponible para leer.';

                return;
            }

            identificadorLectura++;

            sintetizador.cancel();

            if (sintetizador.paused) {
                sintetizador.resume();
            }

            textoSeleccionado = '';

            const fragmentos = dividirTexto(texto);

            estadoLectura.textContent =
                'Preparando lectura...';

            actualizarControles('leyendo');

            reproducirFragmento(
                fragmentos,
                0,
                identificadorLectura
            );

        });

        pausar.addEventListener('click', () => {

            if (lecturaActual) {

                sintetizador.pause();

                estadoLectura.textContent =
                    'Lectura pausada.';

                actualizarControles('pausado');

            }

        });

        reanudar.addEventListener('click', () => {

            if (sintetizador.paused) {

                sintetizador.resume();

                estadoLectura.textContent =
                    'Leyendo contenido...';

                actualizarControles('leyendo');

            }

        });

        function detenerLectura() {

            identificadorLectura++;

            lecturaActual = null;

            sintetizador.cancel();

            estadoLectura.textContent =
                'Lectura detenida.';

            actualizarControles('detenido');
        }

        detener.addEventListener('click', detenerLectura);

        window.addEventListener('pagehide', detenerLectura);

    }

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            iniciarAccesibilidad
        );

    } else {

        iniciarAccesibilidad();

    }

})();