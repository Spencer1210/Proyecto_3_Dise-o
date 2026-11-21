const API_CARRITO = '/api/carrito';

let carrito = [];

let resumenCarrito = {
    cantidadProductos: 0,
    subtotal: 0,
    descuento: 0,
    cupon: null,
    porcentajeDescuento: 0,
    total: 0
};

let procesando = false;
let carritoCargado = false;

// Productos recomendados
const productosRecomendados = {
    mouse: {
        id: 'mouse',
        nombre: 'Mouse inalámbrico ergonómico',
        precio: 14900,
        imagen: '/img/MouseErgonomica.png'
    },

    webcam: {
        id: 'webcam',
        nombre: 'Webcam Full HD',
        precio: 21500,
        imagen: '/img/WebcamHD.png'
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
    }
};

// Obtener el ID del usuario que inició sesión
function obtenerIdUsuarioCarrito() {

    const datosGuardados =
        localStorage.getItem('usuarioTechStore') ||
        sessionStorage.getItem('usuarioTechStore');

    if (!datosGuardados) {
        throw new Error('Debés iniciar sesión.');
    }

    const usuario = JSON.parse(datosGuardados);

    if (
        !usuario ||
        !Number.isSafeInteger(usuario.id) ||
        usuario.id < 1
    ) {
        throw new Error('Usuario no válido.');
    }

    return String(usuario.id);
}

// Comunicación con el backend
async function solicitarCarrito(
    metodo = 'GET',
    ruta = '',
    cuerpo = null
) {
    const opciones = {
        method: metodo,
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'X-Usuario-Id': obtenerIdUsuarioCarrito()
        }
    };

    if (cuerpo !== null) {
        opciones.body = JSON.stringify(cuerpo);
    }

    const respuesta = await fetch(
        API_CARRITO + ruta,
        opciones
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje || 'Error en el carrito'
        );
    }

    return datos;
}

// Actualizar el carrito y el encabezado
function actualizarCarrito(datos) {
    carrito = datos.productos;
    resumenCarrito = datos.resumen;
    carritoCargado = true;

    renderizarCarrito();

    document.dispatchEvent(
        new CustomEvent('techstore:carrito-actualizado')
    );
}

// Cargar productos guardados
async function cargarCarrito() {
    if (procesando) return;

    procesando = true;

    try {
        const datos = await solicitarCarrito();
        actualizarCarrito(datos);

    } catch (error) {
        console.error('Error al cargar el carrito:', error);

        document.getElementById(
            'listaCarrito'
        ).textContent = 'No se pudo cargar el carrito.';

    } finally {
        procesando = false;
    }
}

// Agregar producto recomendado
async function agregarProducto(id) {
    if (procesando) return;

    const producto = productosRecomendados[id];

    if (!producto) return;

    procesando = true;

    try {
        const datos = await solicitarCarrito(
            'POST',
            '',
            {
                ...producto,
                cantidad: 1
            }
        );

        actualizarCarrito(datos);

    } catch (error) {
        console.error(error);
        alert('No se pudo agregar el producto.');

    } finally {
        procesando = false;
    }
}

// Cambiar cantidad
async function cambiarCantidad(id, cambio) {
    if (procesando) return;

    const producto = carrito.find(
        item => String(item.id) === String(id)
    );

    if (!producto) return;

    const nuevaCantidad = producto.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        await eliminarProducto(id);
        return;
    }

    procesando = true;

    try {
        const datos = await solicitarCarrito(
            'PUT',
            '/' + encodeURIComponent(id),
            {
                cantidad: nuevaCantidad
            }
        );

        actualizarCarrito(datos);

    } catch (error) {
        console.error(error);
        alert('No se pudo actualizar la cantidad.');

    } finally {
        procesando = false;
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (procesando) return;

    procesando = true;

    try {
        const datos = await solicitarCarrito(
            'DELETE',
            '/' + encodeURIComponent(id)
        );

        actualizarCarrito(datos);

    } catch (error) {
        console.error(error);
        alert('No se pudo eliminar el producto.');

    } finally {
        procesando = false;
    }
}

// Cargar cupones disponibles
async function cargarCupones() {
    const lista = document.getElementById('listaCupones');

    try {
        const datos = await solicitarCarrito(
            'GET',
            '/descuentos'
        );

        lista.innerHTML = '';

        if (datos.descuentos.length === 0) {
            lista.textContent = 'No hay cupones disponibles.';
            return;
        }

        datos.descuentos.forEach(cupon => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'cupon-disponible';

            const informacion = document.createElement('div');
            informacion.className = 'cupon-informacion';

            const codigo = document.createElement('strong');
            codigo.className = 'cupon-codigo';
            codigo.textContent = cupon.codigo;

            const porcentaje = document.createElement('span');
            porcentaje.className = 'cupon-porcentaje';
            porcentaje.textContent =
                cupon.porcentaje + '% de descuento';

            informacion.append(codigo, porcentaje);

            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'btn-usar-cupon';
            boton.textContent = 'Usar cupón';

            boton.addEventListener('click', () => {
                if (procesando) return;

                document.getElementById(
                    'codigoDescuento'
                ).value = cupon.codigo;

                aplicarDescuento();
            });

            tarjeta.append(informacion, boton);
            lista.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(error);
        lista.textContent =
            'No se pudieron cargar los cupones.';
    }
}

// Mostrar mensajes del descuento
function mostrarMensajeDescuento(texto, esError = false) {
    const mensaje = document.getElementById(
        'mensajeDescuento'
    );

    mensaje.textContent = texto;

    mensaje.classList.toggle(
        'mensaje-cupon-error',
        esError
    );

    mensaje.classList.toggle(
        'mensaje-cupon-exito',
        !esError && texto !== ''
    );
}

// Aplicar descuento
async function aplicarDescuento() {
    if (procesando) return;

    const entrada = document.getElementById(
        'codigoDescuento'
    );

    const codigo = entrada.value.trim().toUpperCase();

    if (!carritoCargado) {
        mostrarMensajeDescuento(
            'Esperá a que se cargue el carrito.',
            true
        );
        return;
    }

    if (carrito.length === 0) {
        mostrarMensajeDescuento(
            'Agregá productos antes de aplicar un cupón.',
            true
        );
        return;
    }

    if (!codigo) {
        mostrarMensajeDescuento(
            'Ingresá un código de descuento.',
            true
        );
        return;
    }

    procesando = true;

    try {
        const datos = await solicitarCarrito(
            'POST',
            '/descuento',
            {
                codigo
            }
        );

        actualizarCarrito(datos);
        entrada.value = '';

        mostrarMensajeDescuento(
            'Descuento aplicado correctamente.'
        );

    } catch (error) {
        mostrarMensajeDescuento(error.message, true);

    } finally {
        procesando = false;
    }
}

// Quitar descuento
async function quitarDescuento() {
    if (procesando) return;

    procesando = true;

    try {
        const datos = await solicitarCarrito(
            'DELETE',
            '/descuento'
        );

        actualizarCarrito(datos);

        document.getElementById(
            'codigoDescuento'
        ).value = '';

        mostrarMensajeDescuento(
            'Descuento eliminado correctamente.'
        );

    } catch (error) {
        mostrarMensajeDescuento(error.message, true);

    } finally {
        procesando = false;
    }
}

// Mostrar cupón aplicado
function mostrarCuponAplicado() {
    const contenedor = document.getElementById(
        'cuponAplicado'
    );

    const nombre = document.getElementById(
        'nombreCuponAplicado'
    );

    if (resumenCarrito.cupon) {
        contenedor.hidden = false;

        nombre.textContent =
            resumenCarrito.cupon +
            ' - ' +
            resumenCarrito.porcentajeDescuento +
            '% de descuento';

    } else {
        contenedor.hidden = true;
        nombre.textContent = '';
    }
}

// Formato de precios
function formatoPrecio(valor) {
    return '¢' + Number(valor).toLocaleString('es-CR');
}

// Mostrar productos del carrito
function renderizarCarrito() {
    const lista = document.getElementById('listaCarrito');
    lista.innerHTML = '';

    const cantidad = resumenCarrito.cantidadProductos;
    const subtotal = resumenCarrito.subtotal;

    // Calcular el envío gratis
    const envioGratisDesde = 150000;

    const restante = Math.max(
        0,
        envioGratisDesde - subtotal
    );

    document.getElementById(
        'cantidadProductos'
    ).textContent =
        cantidad +
        (cantidad === 1 ? ' producto' : ' productos');

    document.getElementById(
        'mensajeEnvio'
    ).textContent =
        restante > 0
            ? 'Te faltan ' +
              formatoPrecio(restante) +
              ' para tener envío gratis.'
            : '¡Tu pedido alcanza el mínimo para envío gratis!';

    document.getElementById(
        'progresoEnvio'
    ).style.width =
        Math.min(
            100,
            subtotal / envioGratisDesde * 100
        ) + '%';

    // Mensaje del carrito vacío
    if (carrito.length === 0) {
        const mensaje = document.createElement('p');

        mensaje.className = 'carrito-vacio';
        mensaje.textContent = 'Tu carrito está vacío.';

        lista.appendChild(mensaje);
        mostrarMensajeDescuento('');
    }

    // Recorrer los productos
    carrito.forEach(producto => {
        const fila = document.createElement('article');
        fila.className = 'carrito-producto';

        // Imagen del producto
        const foto = document.createElement('div');
        foto.className = 'carrito-producto-foto';

        if (producto.imagen) {
            const imagen = document.createElement('img');

            imagen.src = producto.imagen;
            imagen.alt = producto.nombre;

            foto.appendChild(imagen);

        } else {
            foto.textContent = 'Sin imagen';
        }

        // Información del producto
        const detalle = document.createElement('div');
        detalle.className = 'carrito-producto-detalle';

        const nombre = document.createElement('h3');
        nombre.textContent = producto.nombre;

        const precioUnitario = document.createElement('p');

        precioUnitario.textContent =
            'Precio: ' + formatoPrecio(producto.precio);

        // Botón para eliminar
        const eliminar = document.createElement('button');
        eliminar.className = 'carrito-eliminar';
        eliminar.textContent = 'Eliminar';

        eliminar.addEventListener(
            'click',
            () => eliminarProducto(producto.id)
        );

        detalle.append(
            nombre,
            precioUnitario,
            eliminar
        );

        // Controles de cantidad
        const controles = document.createElement('div');
        controles.className = 'carrito-cantidad';

        const menos = document.createElement('button');
        menos.textContent = '−';

        menos.addEventListener(
            'click',
            () => cambiarCantidad(producto.id, -1)
        );

        const numero = document.createElement('span');
        numero.textContent = producto.cantidad;

        const mas = document.createElement('button');
        mas.textContent = '+';

        mas.addEventListener(
            'click',
            () => cambiarCantidad(producto.id, 1)
        );

        controles.append(menos, numero, mas);

        // Precio total del producto
        const precio = document.createElement('strong');
        precio.className = 'carrito-precio';

        precio.textContent = formatoPrecio(
            producto.precio * producto.cantidad
        );

        fila.append(
            foto,
            detalle,
            controles,
            precio
        );

        lista.appendChild(fila);
    });

    // Mostrar descuento y total del backend
    const descuento = resumenCarrito.descuento;
    const total = resumenCarrito.total;

    document.getElementById(
        'subtotal'
    ).textContent = formatoPrecio(subtotal);

    document.getElementById(
        'descuento'
    ).textContent = descuento
        ? '-' + formatoPrecio(descuento)
        : '¢0';

    document.getElementById(
        'total'
    ).textContent = formatoPrecio(total);

    document.getElementById(
        'finalizarCompra'
    ).disabled =
        !carritoCargado || carrito.length === 0;

    mostrarCuponAplicado();
}

// Abrir selección de pago sin vaciar el carrito
function finalizarCompra() {
    if (
        procesando ||
        !carritoCargado ||
        carrito.length === 0
    ) {
        return;
    }

    const ventana = document.getElementById(
        'seleccionPago'
    );

    if (
        !ventana ||
        typeof ventana.showModal !== 'function'
    ) {
        console.error(
            'No se encontró la ventana de métodos de pago.'
        );
        return;
    }

    document.getElementById(
        'mensajeMetodoPago'
    ).textContent = '';

    ventana.showModal();
}

// Confirmar el método y finalizar la compra simulada
async function confirmarCompraConPago() {
    if (
        procesando ||
        !carritoCargado ||
        carrito.length === 0
    ) {
        return;
    }

    const seleccion = document.querySelector(
        'input[name="metodoPago"]:checked'
    );

    const mensaje = document.getElementById(
        'mensajeMetodoPago'
    );

    if (!seleccion) {
        mensaje.textContent =
            'Seleccioná un método de pago.';
        return;
    }

    const ventanaPago = document.getElementById(
        'seleccionPago'
    );

    const ventanaConfirmacion = document.getElementById(
        'confirmacionCompra'
    );

    const botonConfirmar = document.getElementById(
        'confirmarPago'
    );

    const botonFinalizar = document.getElementById(
        'finalizarCompra'
    );

    if (
        !ventanaConfirmacion ||
        typeof ventanaConfirmacion.showModal !== 'function'
    ) {
        mensaje.textContent =
            'No se pudo abrir la confirmación.';
        return;
    }

    try {
        // Factory Method crea la estrategia de pago
        const estrategia = PagoFactory.crearPago(
            seleccion.value
        );

        // Strategy ejecuta el método seleccionado
        const resultadoPago = realizarPago(estrategia);

        procesando = true;

        botonConfirmar.disabled = true;
        botonFinalizar.disabled = true;

        mensaje.textContent =
            'Procesando compra simulada...';

        // Vaciar carrito solo después de confirmar
        const datos = await solicitarCarrito('DELETE');

        actualizarCarrito(datos);

        document.getElementById(
            'codigoDescuento'
        ).value = '';

        mostrarMensajeDescuento('');

        console.info(resultadoPago);

        ventanaPago.close();
        ventanaConfirmacion.showModal();

    } catch (error) {
        console.error(
            'Error al finalizar compra:',
            error
        );

        mensaje.textContent =
            'No se pudo finalizar la compra. Intentá nuevamente.';

    } finally {
        procesando = false;

        botonConfirmar.disabled = false;

        botonFinalizar.disabled =
            !carritoCargado || carrito.length === 0;
    }
}

// Iniciar las funciones de la página
function iniciarCarrito() {

    // Agregar productos recomendados
    document.querySelectorAll(
        '.recomendado button'
    ).forEach(boton => {

        boton.addEventListener('click', () => {
            agregarProducto(boton.dataset.id);
        });

    });

    // Aplicar cupón
    document.getElementById(
        'aplicarDescuento'
    ).addEventListener(
        'click',
        aplicarDescuento
    );

    // Aplicar cupón con Enter
    document.getElementById(
        'codigoDescuento'
    ).addEventListener('keydown', evento => {

        if (evento.key === 'Enter') {
            evento.preventDefault();
            aplicarDescuento();
        }

    });

    // Quitar cupón
    document.getElementById(
        'quitarDescuento'
    ).addEventListener(
        'click',
        quitarDescuento
    );

    // Finalizar compra
    const botonFinalizar = document.getElementById(
        'finalizarCompra'
    );

    botonFinalizar.disabled = true;

    botonFinalizar.addEventListener(
        'click',
        finalizarCompra
    );

    // Cancelar selección de pago
    document.getElementById(
        'cancelarPago'
    ).addEventListener('click', () => {

        if (!procesando) {
            document.getElementById(
                'seleccionPago'
            ).close();
        }

    });

    // Confirmar compra
    document.getElementById(
        'confirmarPago'
    ).addEventListener(
        'click',
        confirmarCompraConPago
    );

    // Evitar cerrar mientras se procesa
    document.getElementById(
        'seleccionPago'
    ).addEventListener('cancel', evento => {

        if (procesando) {
            evento.preventDefault();
        }

    });

    // Cargar carrito y cupones
    cargarCarrito();
    cargarCupones();
}

// Inicializar la página
if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        iniciarCarrito
    );

} else {
    iniciarCarrito();
}

// Actualizar al regresar a la página
window.addEventListener('pageshow', evento => {

    if (evento.persisted) {
        cargarCarrito();
        cargarCupones();
    }

});