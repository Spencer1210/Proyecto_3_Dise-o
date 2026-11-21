const express = require('express');
const path = require('path');
const fs = require('fs');

const usuarioRoutes = require('./routes/usuarioRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();
const PORT = 5000;

const rutaFrontend = path.join(__dirname, '../Frontend');

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
        'Content-Type, X-Usuario-Id'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();

});

// Cargar los módulos del frontend

app.use((req, res, next) => {

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }

    let nombreArchivo;

    if (req.path === '/') {

        nombreArchivo = 'login.html';

    } else if (req.path === '/registro') {

        nombreArchivo = 'registro.html';

    } else if (req.path.endsWith('.html')) {

        nombreArchivo = req.path.substring(1);

    } else {

        return next();

    }

    if (
        path.basename(nombreArchivo).toLowerCase() === 'header.html'
    ) {
        return next();
    }

    const rutaArchivo = path.resolve(
        rutaFrontend,
        nombreArchivo
    );

    const rutaRelativa = path.relative(
        rutaFrontend,
        rutaArchivo
    );

    if (
        rutaRelativa.startsWith('..') ||
        path.isAbsolute(rutaRelativa)
    ) {
        return next();
    }

    fs.readFile(rutaArchivo, 'utf8', (error, contenido) => {

        if (error) {

            if (
                error.code === 'ENOENT' ||
                error.code === 'EISDIR'
            ) {
                return next();
            }

            return next(error);
        }

        if (!/<\/head\s*>/i.test(contenido)) {
            return next();
        }

        contenido = contenido.replace(
            /<link\b[^>]*href\s*=\s*["'][^"']*accesibilidad\.css(?:\?[^"']*)?["'][^>]*>/gi,
            ''
        );

        contenido = contenido.replace(
            /<script\b[^>]*src\s*=\s*["'][^"']*(?:tema|accesibilidad)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,
            ''
        );

        const referencias = `
            <link rel="stylesheet" href="/accesibilidad.css">
            <script src="/tema.js" defer></script>
            <script src="/accesibilidad.js" defer></script>
        `;

        contenido = contenido.replace(
            /<\/head\s*>/i,
            referencias + '</head>'
        );

        res.type('html');
        res.send(contenido);

    });

});

// Archivos estáticos

app.use(express.static(rutaFrontend));

app.use('/img/Catalogo', express.static(
    path.join(rutaFrontend, 'Catalogo')
));

// Rutas del frontend

app.get('/', (req, res) => {

    res.sendFile(
        path.join(rutaFrontend, 'login.html')
    );

});

app.get('/registro', (req, res) => {

    res.sendFile(
        path.join(rutaFrontend, 'registro.html')
    );

});

app.get('/pantalla-principal.html', (req, res) => {

    res.sendFile(
        path.join(rutaFrontend, 'pantalla-principal.html')
    );

});

app.get('/categorias.html', (req, res) => {

    res.sendFile(
        path.join(rutaFrontend, 'categorias.html')
    );

});

app.get('/categoria.html', (req, res) => {

    res.sendFile(
        path.join(rutaFrontend, 'categoria.html')
    );

});

// Rutas MVC

app.use('/api', usuarioRoutes);

app.use('/api', productoRoutes);

app.use('/api/carrito', carritoRoutes);

app.listen(PORT, () => {

    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );

});