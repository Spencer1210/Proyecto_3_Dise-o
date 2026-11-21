
const fs = require("fs");
const path = require("path");

const rutaArchivo = path.join(
    __dirname,
    "../data/carritos.json"
);

// Leer los carritos almacenados
function leerCarritos() {
    if (!fs.existsSync(rutaArchivo)) {
        fs.mkdirSync(path.dirname(rutaArchivo), {
            recursive: true
        });

        fs.writeFileSync(rutaArchivo, "{}", "utf8");
    }

    const contenido = fs.readFileSync(
        rutaArchivo,
        "utf8"
    );

    return JSON.parse(contenido);
}

// Guardar los carritos en JSON
function guardarCarritos(carritos) {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(carritos, null, 2),
        "utf8"
    );
}

// Obtener el carrito de un usuario
function obtenerCarrito(usuarioId) {
    const carritos = leerCarritos();

    return carritos[usuarioId] || [];
}

// Agregar un producto
function agregarProducto(usuarioId, producto) {
    const carritos = leerCarritos();

    if (!carritos[usuarioId]) {
        carritos[usuarioId] = [];
    }

    const carrito = carritos[usuarioId];

    const existente = carrito.find(
        item => String(item.id) === String(producto.id)
    );

    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: producto.cantidad
        });
    }

    guardarCarritos(carritos);

    return carrito;
}

// Cambiar cantidad de un producto
function actualizarCantidad(usuarioId, productoId, cantidad) {
    const carritos = leerCarritos();

    const carrito = carritos[usuarioId] || [];

    const producto = carrito.find(
        item => String(item.id) === String(productoId)
    );

    if (!producto) {
        return null;
    }

    if (cantidad <= 0) {
        carritos[usuarioId] = carrito.filter(
            item => String(item.id) !== String(productoId)
        );
    } else {
        producto.cantidad = cantidad;
    }

    if (carritos[usuarioId].length === 0 && carritos.cupones) {
        delete carritos.cupones[usuarioId];
    }

    guardarCarritos(carritos);

    return carritos[usuarioId];
}

// Eliminar un producto
function eliminarProducto(usuarioId, productoId) {
    const carritos = leerCarritos();

    const carrito = carritos[usuarioId] || [];

    carritos[usuarioId] = carrito.filter(
        item => String(item.id) !== String(productoId)
    );

    if (carritos[usuarioId].length === 0 && carritos.cupones) {
        delete carritos.cupones[usuarioId];
    }

    guardarCarritos(carritos);

    return carritos[usuarioId];
}

// Obtener el cupón aplicado
function obtenerCupon(usuarioId) {
    const carritos = leerCarritos();

    if (!carritos.cupones) {
        return null;
    }

    return carritos.cupones[usuarioId] || null;
}

// Guardar un cupón
function aplicarCupon(usuarioId, codigo) {
    const carritos = leerCarritos();

    const carrito = carritos[usuarioId] || [];

    if (carrito.length === 0) {
        return null;
    }

    if (!carritos.cupones) {
        carritos.cupones = {};
    }

    carritos.cupones[usuarioId] = codigo;

    guardarCarritos(carritos);

    return codigo;
}

// Eliminar el cupón aplicado
function eliminarCupon(usuarioId) {
    const carritos = leerCarritos();

    if (carritos.cupones) {
        delete carritos.cupones[usuarioId];
    }

    guardarCarritos(carritos);

    return null;
}

// Vaciar el carrito
function vaciarCarrito(usuarioId) {
    const carritos = leerCarritos();

    carritos[usuarioId] = [];

    if (carritos.cupones) {
        delete carritos.cupones[usuarioId];
    }

    guardarCarritos(carritos);

    return [];
}

module.exports = {
    obtenerCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    obtenerCupon,
    aplicarCupon,
    eliminarCupon
};
