
const express = require('express');
const path = require('path');

const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
const PORT = 5000;

// Middleware para recibir datos JSON
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Servir los archivos del frontend
app.use(express.static(
    path.join(__dirname, '../Frontend')
));

// Página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../Frontend/login.html')
    );
});

// Página de registro
app.get('/registro', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../Frontend/registro.html')
    );
});

// Pantalla principal
app.get('/pantalla-principal.html', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../Frontend/pantalla-principal.html')
    );
});

// Rutas de usuarios con MVC
app.use('/api', usuarioRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );
});

