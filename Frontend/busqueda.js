const API_PRODUCTOS = '/api/productos';
const API_CARRITO_BUSQUEDA = '/api/carrito';

// Obtener el ID del usuario conectado
function obtenerIdUsuarioBusqueda() {

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

        console.error(
            'Error al obtener el usuario:',
            error
        );

        return null;

    }

}

// Normalizar palabras
function normalizarTexto(texto) {

    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

}

// Formato de precios
function formatoPrecio(valor) {

    return '¢' + Number(valor).toLocaleString('es-CR');

}

// Palabras relacionadas con categorías
const sinonimos = {

    monitor: 'monitores pantallas pantalla',
    teclado: 'teclados',
    mouse: 'raton ratones mouses',
    audifonos: 'audio auriculares audifono cascos'

};

// Buscar coincidencias
function coincideProducto(producto, termino) {

    const tipo = normalizarTexto(producto.tipo);

    const contenido = normalizarTexto(
        producto.nombre + ' ' +
        producto.tipo + ' ' +
        (sinonimos[tipo] || '')
    );

    const palabras = normalizarTexto(termino)
        .split(/\s+/)
        .filter(Boolean);

    return palabras.every(
        palabra => contenido.includes(palabra)
    );

}

// Agregar producto al carrito individual
async function agregarAlCarrito(producto, boton) {

    if (boton.disabled) return;

    // Identificar al usuario conectado
    const usuarioId = obtenerIdUsuarioBusqueda();

    if (!usuarioId) {

        alert(
            'Debés iniciar sesión para agregar productos.'
        );

        window.location.href = '/';

        return;

    }

    boton.disabled = true;

    const mensaje =
        document.getElementById('mensajeBusqueda');

    mensaje.textContent = '';

    try {

        const respuesta = await fetch(
            API_CARRITO_BUSQUEDA,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'X-Usuario-Id': usuarioId
                },

                body: JSON.stringify({

                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    cantidad: 1

                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'No se pudo agregar el producto.'
            );

        }

        // Patrón Observer: actualizar encabezado
        document.dispatchEvent(
            new CustomEvent('techstore:carrito-actualizado')
        );

    } catch (error) {

        console.error(error);

        mensaje.textContent =
            'No se pudo agregar el producto al carrito.';

    } finally {

        boton.disabled = Number(producto.stock) <= 0;

    }

}

// Crear tarjeta de producto
function crearTarjeta(producto) {

    const tarjeta = document.createElement('article');

    tarjeta.className = 'busqueda-producto';

    // Imagen
    const contenedorImagen = document.createElement('div');

    contenedorImagen.className = 'busqueda-producto-imagen';

    const imagen = document.createElement('img');

    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';

    contenedorImagen.appendChild(imagen);

    // Categoría
    const categoria = document.createElement('span');

    categoria.className = 'busqueda-producto-tipo';
    categoria.textContent = producto.tipo;

    // Nombre
    const nombre = document.createElement('h3');

    nombre.textContent = producto.nombre;

    // Precio
    const precio = document.createElement('p');

    precio.className = 'busqueda-producto-precio';

    precio.textContent = formatoPrecio(producto.precio);

    // Disponibilidad
    const stock = document.createElement('p');

    stock.className = 'busqueda-producto-stock';

    stock.textContent = producto.stock > 0
        ? producto.stock + ' unidades disponibles'
        : 'Producto agotado';

    if (producto.stock <= 0) {

        stock.classList.add('stock-agotado');

    }

    // Botón del carrito
    const boton = document.createElement('button');

    boton.type = 'button';

    boton.className = 'busqueda-agregar';

    boton.textContent = producto.stock > 0
        ? 'Agregar al carrito'
        : 'Agotado';

    boton.disabled = producto.stock <= 0;

    boton.addEventListener('click', function () {

        agregarAlCarrito(producto, boton);

    });

    tarjeta.append(
        contenedorImagen,
        categoria,
        nombre,
        precio,
        stock,
        boton
    );

    return tarjeta;

}

// Mostrar resultados
function mostrarResultados(productos, termino) {

    const contenedor =
        document.getElementById('resultadosBusqueda');

    const titulo =
        document.getElementById('tituloBusqueda');

    const cantidad =
        document.getElementById('cantidadResultados');

    const sinResultados =
        document.getElementById('sinResultados');

    contenedor.innerHTML = '';

    titulo.textContent =
        'Resultados para: "' + termino + '"';

    cantidad.textContent =
        productos.length === 1
            ? '1 producto encontrado'
            : productos.length + ' productos encontrados';

    sinResultados.hidden = productos.length !== 0;

    productos.forEach(producto => {

        contenedor.appendChild(
            crearTarjeta(producto)
        );

    });

}

// Consultar catálogo
async function buscarProductos() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const termino = (
        parametros.get('q') || ''
    ).trim();

    if (!termino) {

        document.getElementById(
            'cantidadResultados'
        ).textContent = 'Ingresá un término de búsqueda.';

        return;

    }

    try {

        const respuesta = await fetch(API_PRODUCTOS, {
            cache: 'no-store'
        });

        if (!respuesta.ok) {

            throw new Error('No se pudo consultar el catálogo');

        }

        const productos = await respuesta.json();

        if (!Array.isArray(productos)) {

            throw new Error('Formato de catálogo no válido');

        }

        const resultados = productos.filter(producto =>

            coincideProducto(producto, termino)

        );

        mostrarResultados(resultados, termino);

    } catch (error) {

        console.error('Error en la búsqueda:', error);

        document.getElementById(
            'cantidadResultados'
        ).textContent =
            'No se pudieron cargar los productos.';

    }

}

// Iniciar búsqueda
document.addEventListener(
    'DOMContentLoaded',
    buscarProductos
);