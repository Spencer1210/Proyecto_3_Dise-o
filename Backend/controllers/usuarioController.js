
const usuarioModel = require('../models/usuarioModel');

// Registrar un usuario
function registrarUsuario(req, res) {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        const usuarioExistente =
            usuarioModel.buscarUsuarioPorCorreo(email);

        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

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

        const {
            password: contraseña,
            ...usuarioPublico
        } = nuevoUsuario;

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

        const {
            password: contraseña,
            ...usuarioPublico
        } = usuario;

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

// Recuperar contraseña
function recuperarPassword(req, res) {
    try {
        const { email, nuevaPassword } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El campo correo electrónico está vacío.'
            });
        }

        if (!nuevaPassword || !nuevaPassword.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El campo nueva contraseña está vacío.'
            });
        }

        if (nuevaPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres.'
            });
        }

        const actualizado = usuarioModel.actualizarPassword(
            email.trim(),
            nuevaPassword
        );

        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'No existe una cuenta registrada con ese correo.'
            });
        }

        return res.json({
            success: true,
            message: 'Contraseña actualizada correctamente.'
        });

    } catch (error) {
        console.error('Error al recuperar contraseña:', error);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// Obtener usuarios
function obtenerUsuarios(req, res) {
    try {
        const usuarios = usuarioModel.obtenerUsuarios();

        return res.json(usuarios);

    } catch (error) {
        console.error('Error al obtener usuarios:', error);

        return res.status(500).json({
            error: 'Error al leer la base de datos'
        });
    }
}

// Exportar funciones del controlador
module.exports = {
    registrarUsuario,
    iniciarSesion,
    recuperarPassword,
    obtenerUsuarios
};
