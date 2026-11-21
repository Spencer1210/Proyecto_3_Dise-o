
const express = require('express');
const fs = require('fs');
const path = require('path');

const usuarioRoutes = require('./routes/usuarioRoutes');
const carritoRoutes = require('./routes/carritoRoutes');

const app = express();
const PORT = 5000;

// Middleware para entender JSON
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');

    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Servir archivos estáticos del Frontend
app.use(express.static(
    path.join(__dirname, '../Frontend')
));

// Servir la carpeta Catalogo
app.use('/img/Catalogo', express.static(
    path.join(__dirname, '../Frontend/Catalogo')
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

// Página de categorías
app.get('/categorias.html', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../Frontend/categorias.html')
    );
});

// Página de categoría
app.get('/categoria.html', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../Frontend/categoria.html')
    );
});

// Obtener todos los productos
app.get('/api/productos', (req, res) => {

    try {

        const dbPath = path.join(
            __dirname,
            'BaseD.json'
        );

        const data = JSON.parse(
            fs.readFileSync(dbPath, 'utf8')
        );

        res.json(data.productos);

    } catch (error) {

        console.error('Error:', error);

        res.status(500).json({
            error: 'Error al leer la base de datos'
        });

    }

});

// Obtener usuarios
app.get('/api/usuarios', (req, res) => {

    try {

        const dbPath = path.join(
            __dirname,
            'BaseD.json'
        );

        const data = JSON.parse(
            fs.readFileSync(dbPath, 'utf8')
        );

        const usuarios = data.usuarios.map(usuario => ({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        }));

        res.json(usuarios);

    } catch (error) {

        console.error('Error:', error);

        res.status(500).json({
            error: 'Error al leer la base de datos'
        });

    }

});

// Rutas de usuarios con MVC
app.use('/api', usuarioRoutes);

// Rutas del carrito y descuentos con MVC
app.use('/api/carrito', carritoRoutes);

// Iniciar el servidor
app.listen(PORT, () => {

    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );

});
