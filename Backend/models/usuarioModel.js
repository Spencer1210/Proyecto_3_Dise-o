
const fs = require('fs');
const path = require('path');

// Ubicación del archivo JSON
const rutaBaseDatos = path.join(__dirname, '..', 'BaseD.json');

// Leer la base de datos
function leerBaseDatos() {
    const contenido = fs.readFileSync(rutaBaseDatos, 'utf8');
    return JSON.parse(contenido);
}

// Guardar cambios en la base de datos
function guardarBaseDatos(datos) {
    fs.writeFileSync(
        rutaBaseDatos,
        JSON.stringify(datos, null, 2),
        'utf8'
    );
}

// Buscar usuario por correo electrónico
function buscarUsuarioPorCorreo(correo) {
    const baseDatos = leerBaseDatos();

    return baseDatos.usuarios.find(
        usuario => usuario.email === correo
    );
}

// Registrar un nuevo usuario
function crearUsuario(nuevoUsuario) {
    const baseDatos = leerBaseDatos();

    baseDatos.usuarios.push(nuevoUsuario);

    guardarBaseDatos(baseDatos);

    return nuevoUsuario;
}

// Actualizar contraseña de un usuario
function actualizarPassword(correo, nuevaPassword) {
    const baseDatos = leerBaseDatos();

    const usuario = baseDatos.usuarios.find(
        usuario => usuario.email === correo
    );

    // Si el usuario no existe
    if (!usuario) {
        return false;
    }

    // Actualizar contraseña
    usuario.password = nuevaPassword;

    // Guardar los cambios en BaseD.json
    guardarBaseDatos(baseDatos);

    return true;
}

// Exportar todas las funciones del modelo
module.exports = {
    leerBaseDatos,
    guardarBaseDatos,
    buscarUsuarioPorCorreo,
    crearUsuario,
    actualizarPassword
};
