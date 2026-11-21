
const fs = require('fs');
const path = require('path');

const rutaArchivo = path.join(
    __dirname,
    '../data/descuentos.json'
);

// Leer los descuentos
function leerDescuentos() {

    const contenido = fs.readFileSync(
        rutaArchivo,
        'utf8'
    );

    return JSON.parse(contenido);
}

// Obtener descuentos públicos y activos
function obtenerDescuentos() {

    const descuentos = leerDescuentos();

    return descuentos.filter(
        descuento =>
            descuento.activo === true &&
            descuento.publico === true
    );
}

// Validar un código de descuento
function validarDescuento(codigo) {

    if (typeof codigo !== 'string') {
        return null;
    }

    const descuentos = leerDescuentos();

    const codigoNormalizado =
        codigo.trim().toUpperCase();

    return descuentos.find(
        descuento =>
            descuento.codigo === codigoNormalizado &&
            descuento.activo === true &&
            Number.isFinite(descuento.porcentaje) &&
            descuento.porcentaje > 0 &&
            descuento.porcentaje <= 100
    ) || null;
}

// Calcular el monto del descuento
function calcularDescuento(subtotal, porcentaje) {

    return Math.round(
        subtotal * porcentaje / 100
    );
}

module.exports = {
    obtenerDescuentos,
    validarDescuento,
    calcularDescuento
};
