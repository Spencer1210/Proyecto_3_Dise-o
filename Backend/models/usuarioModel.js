
const fs = require('fs');
const path = require('path');

// Ubicación del archivo JSON
const rutaBaseDatos = path.join(__dirname, '..', 'BaseD.json');

// Obtener todos los datos de la base
function leerBaseDatos() {
    const contenido = fs.readFileSync(rutaBaseDatos, 'utf8');
    return JSON.parse(contenido);
}

// Guardar los cambios en la base
function guardarBaseDatos(datos) {
    fs.writeFileSync(
        rutaBaseDatos,
        JSON.stringify(datos, null, 2)
    );
}

// Buscar un usuario por su correo
function buscarUsuarioPorCorreo(correo) {
    const baseDatos = leerBaseDatos();

    return baseDatos.usuarios.find(
        usuario => usuario.email === correo
    );
}

// Crear un nuevo usuario
function crearUsuario(nuevoUsuario) {
    const baseDatos = leerBaseDatos();

    baseDatos.usuarios.push(nuevoUsuario);
    guardarBaseDatos(baseDatos);

    return nuevoUsuario;
}

module.exports = {
    leerBaseDatos,
    guardarBaseDatos,
    buscarUsuarioPorCorreo,
    crearUsuario
};