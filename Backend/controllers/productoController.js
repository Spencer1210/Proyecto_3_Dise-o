
const productoModel = require('../models/productoModel');

// Controlador para obtener todos los productos
function obtenerProductos(req, res) {

    try {

        const productos = productoModel.obtenerProductos();

        res.json(productos);

    } catch (error) {

        console.error(
            'Error al obtener productos:',
            error
        );

        res.status(500).json({
            error: 'Error al leer la base de datos'
        });

    }

}

module.exports = {
    obtenerProductos
};
