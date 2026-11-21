
const fs = require('fs');
const path = require('path');

// Ruta del archivo JSON que almacena los datos
const dbPath = path.join(__dirname, '../BaseD.json');

// Obtener todos los productos
function obtenerProductos() {

    const data = JSON.parse(
        fs.readFileSync(dbPath, 'utf8')
    );

    return data.productos;
}

module.exports = {
    obtenerProductos
};
