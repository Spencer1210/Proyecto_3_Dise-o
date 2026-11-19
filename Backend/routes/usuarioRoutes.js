
const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

// Registrar usuario
router.post('/registro', usuarioController.registrarUsuario);

// Iniciar sesión
router.post('/login', usuarioController.iniciarSesion);

// Recuperar contraseña
router.post(
    '/recuperar-password',
    usuarioController.recuperarPassword
);

module.exports = router;
