const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', usuarioController.iniciarSesion);

// Ruta para registrar usuarios
router.post('/registro', usuarioController.registrarUsuario);

module.exports = router;