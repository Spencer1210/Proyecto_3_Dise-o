
const express = require("express");

const router = express.Router();

const carritoController = require(
    "../controllers/carritoController"
);

// Consultar el carrito
router.get(
    "/",
    carritoController.obtenerCarrito
);

// Consultar descuentos disponibles
router.get(
    "/descuentos",
    carritoController.obtenerDescuentos
);

// Agregar producto
router.post(
    "/",
    carritoController.agregarProducto
);

// Aplicar descuento
router.post(
    "/descuento",
    carritoController.aplicarDescuento
);

// Eliminar descuento
router.delete(
    "/descuento",
    carritoController.eliminarDescuento
);

// Actualizar cantidad
router.put(
    "/:productoId",
    carritoController.actualizarCantidad
);

// Eliminar producto
router.delete(
    "/:productoId",
    carritoController.eliminarProducto
);

// Vaciar carrito
router.delete(
    "/",
    carritoController.vaciarCarrito
);

module.exports = router;
