
const express = require('express');
const router = express.Router();

const productoController = require(
    '../controllers/productoController'
);

// Ruta para consultar todos los productos
router.get(
    '/productos',
    productoController.obtenerProductos
);

module.exports = router;
