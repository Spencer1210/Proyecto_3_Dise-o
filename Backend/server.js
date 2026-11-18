const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware para entender JSON
app.use(express.json());

// Ruta para permitir peticiones desde el frontend (CORS)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola Segun! Tu servidor Node.js está funcionando 🚀');
});

// Ruta para obtener todos los usuarios (solo para probar)
app.get('/api/usuarios', (req, res) => {
    const dbPath = path.join(__dirname, 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(data.usuarios);
});

// Ruta para registrar un nuevo usuario
app.post('/api/registro', (req, res) => {
    const { nombre, email, password } = req.body;
    const dbPath = path.join(__dirname, 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Verificar si el email ya existe
    const existe = data.usuarios.find(u => u.email === email);
    if (existe) {
        return res.json({ success: false, message: 'El correo ya está registrado' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
        id: data.usuarios.length + 1,
        nombre,
        email,
        password
    };

    data.usuarios.push(nuevoUsuario);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.json({ success: true, message: 'Usuario registrado correctamente', usuario: nuevoUsuario });
});

// Ruta para iniciar sesión
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const dbPath = path.join(__dirname, 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Buscar usuario
    const usuario = data.usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
        res.json({ success: true, message: 'Login exitoso', usuario });
    } else {
        res.json({ success: false, message: 'Correo o contraseña incorrectos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});