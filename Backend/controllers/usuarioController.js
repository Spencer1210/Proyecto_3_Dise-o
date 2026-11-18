
const usuarioModel = require('../models/usuarioModel');

// Registrar un usuario
function registrarUsuario(req, res) {
    try {
        const { nombre, email, password } = req.body;

        // Validar que todos los campos estén completos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el correo ya existe
        const usuarioExistente =
            usuarioModel.buscarUsuarioPorCorreo(email);

        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        // Obtener los usuarios para generar el ID
        const baseDatos = usuarioModel.leerBaseDatos();

        const nuevoId = Math.max(
            0,
            ...baseDatos.usuarios.map(usuario => usuario.id)
        ) + 1;

        const nuevoUsuario = {
            id: nuevoId,
            nombre,
            email,
            password
        };

        usuarioModel.crearUsuario(nuevoUsuario);

        // Excluir la contraseña de la respuesta
        const { password: contraseña, ...usuarioPublico } = nuevoUsuario;

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            usuario: usuarioPublico
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// Iniciar sesión
function iniciarSesion(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña obligatorios'
            });
        }

        const usuario =
            usuarioModel.buscarUsuarioPorCorreo(email);

        if (!usuario || usuario.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Correo o contraseña incorrectos'
            });
        }

        // Enviar los datos sin contraseña
        const { password: contraseña, ...usuarioPublico } = usuario;

        return res.json({
            success: true,
            message: 'Login exitoso',
            usuario: usuarioPublico
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

module.exports = {
    registrarUsuario,
    iniciarSesion
};
