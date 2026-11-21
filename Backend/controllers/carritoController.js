
const carritoModel = require("../models/carritoModel");
const descuentoModel = require("../models/descuentoModel");

// Usuario temporal de demostración
function obtenerUsuarioId(req) {
    return "demo";
}

// Calcular el resumen del carrito
function calcularResumen(productos, usuarioId) {

    const cantidadProductos = productos.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );

    const subtotal = productos.reduce(
        (total, producto) =>
            total + producto.precio * producto.cantidad,
        0
    );

    const codigoCupon =
        carritoModel.obtenerCupon(usuarioId);

    const cupon = codigoCupon
        ? descuentoModel.validarDescuento(codigoCupon)
        : null;

    const descuento = cupon
        ? descuentoModel.calcularDescuento(
            subtotal,
            cupon.porcentaje
        )
        : 0;

    return {
        cantidadProductos,
        subtotal,
        descuento,
        cupon: cupon ? cupon.codigo : null,
        porcentajeDescuento: cupon ? cupon.porcentaje : 0,
        total: subtotal - descuento
    };
}

// Consultar el carrito
function obtenerCarrito(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);

        const productos =
            carritoModel.obtenerCarrito(usuarioId);

        return res.status(200).json({
            mensaje: "Carrito obtenido correctamente",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al obtener carrito:", error);

        return res.status(500).json({
            mensaje: "Error al consultar el carrito"
        });
    }
}

// Agregar producto
function agregarProducto(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);

        const {
            id,
            nombre,
            precio,
            imagen,
            cantidad = 1
        } = req.body;

        const precioNumerico = Number(precio);
        const cantidadNumerica = Number(cantidad);

        if (
            id === undefined ||
            id === null ||
            String(id).trim() === "" ||
            typeof nombre !== "string" ||
            nombre.trim() === "" ||
            !Number.isFinite(precioNumerico) ||
            precioNumerico < 0 ||
            !Number.isInteger(cantidadNumerica) ||
            cantidadNumerica < 1
        ) {
            return res.status(400).json({
                mensaje: "Datos del producto no válidos"
            });
        }

        const producto = {
            id: String(id),
            nombre: nombre.trim(),
            precio: precioNumerico,
            imagen: imagen || "",
            cantidad: cantidadNumerica
        };

        const productos = carritoModel.agregarProducto(
            usuarioId,
            producto
        );

        return res.status(201).json({
            mensaje: "Producto agregado al carrito",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al agregar producto:", error);

        return res.status(500).json({
            mensaje: "Error al agregar el producto"
        });
    }
}

// Actualizar cantidad
function actualizarCantidad(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);
        const productoId = req.params.productoId;
        const cantidad = Number(req.body.cantidad);

        if (
            !Number.isInteger(cantidad) ||
            cantidad < 0
        ) {
            return res.status(400).json({
                mensaje: "La cantidad debe ser un entero mayor o igual a cero"
            });
        }

        const productos = carritoModel.actualizarCantidad(
            usuarioId,
            productoId,
            cantidad
        );

        if (productos === null) {
            return res.status(404).json({
                mensaje: "Producto no encontrado en el carrito"
            });
        }

        return res.status(200).json({
            mensaje: "Cantidad actualizada correctamente",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al actualizar cantidad:", error);

        return res.status(500).json({
            mensaje: "Error al actualizar la cantidad"
        });
    }
}

// Eliminar producto
function eliminarProducto(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);
        const productoId = req.params.productoId;

        const productos = carritoModel.eliminarProducto(
            usuarioId,
            productoId
        );

        return res.status(200).json({
            mensaje: "Producto eliminado del carrito",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al eliminar producto:", error);

        return res.status(500).json({
            mensaje: "Error al eliminar el producto"
        });
    }
}

// Vaciar carrito
function vaciarCarrito(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);

        const productos =
            carritoModel.vaciarCarrito(usuarioId);

        return res.status(200).json({
            mensaje: "Carrito vaciado correctamente",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al vaciar carrito:", error);

        return res.status(500).json({
            mensaje: "Error al vaciar el carrito"
        });
    }
}

// Consultar descuentos disponibles
function obtenerDescuentos(req, res) {

    try {
        const descuentos =
            descuentoModel.obtenerDescuentos();

        return res.status(200).json({
            mensaje: "Descuentos obtenidos correctamente",
            descuentos
        });

    } catch (error) {
        console.error("Error al consultar descuentos:", error);

        return res.status(500).json({
            mensaje: "Error al consultar los descuentos"
        });
    }
}

// Aplicar código de descuento
function aplicarDescuento(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);

        const { codigo } = req.body;

        const productos =
            carritoModel.obtenerCarrito(usuarioId);

        if (productos.length === 0) {
            return res.status(400).json({
                mensaje: "El carrito está vacío"
            });
        }

        const cupon =
            descuentoModel.validarDescuento(codigo);

        if (!cupon) {
            return res.status(400).json({
                mensaje: "Código de descuento no válido o inactivo"
            });
        }

        carritoModel.aplicarCupon(
            usuarioId,
            cupon.codigo
        );

        return res.status(200).json({
            mensaje: "Descuento aplicado correctamente",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al aplicar descuento:", error);

        return res.status(500).json({
            mensaje: "Error al aplicar el descuento"
        });
    }
}

// Eliminar descuento aplicado
function eliminarDescuento(req, res) {

    try {
        const usuarioId = obtenerUsuarioId(req);

        carritoModel.eliminarCupon(usuarioId);

        const productos =
            carritoModel.obtenerCarrito(usuarioId);

        return res.status(200).json({
            mensaje: "Descuento eliminado correctamente",
            productos,
            resumen: calcularResumen(productos, usuarioId)
        });

    } catch (error) {
        console.error("Error al eliminar descuento:", error);

        return res.status(500).json({
            mensaje: "Error al eliminar el descuento"
        });
    }
}

module.exports = {
    obtenerCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    obtenerDescuentos,
    aplicarDescuento,
    eliminarDescuento
};
