
const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

// Registrar un nuevo usuario
router.post(
    '/registro',
    usuarioController.registrarUsuario
);

// Iniciar sesión
router.post(
    '/login',
    usuarioController.iniciarSesion
);

// Recuperar contraseña
router.post(
    '/recuperar-password',
    usuarioController.recuperarPassword
);

// Obtener usuarios sin mostrar contraseñas
router.get(
    '/usuarios',
    usuarioController.obtenerUsuarios
);

// Exportar las rutas
module.exports = router;

