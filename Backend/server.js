const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware para entender JSON
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Servir archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

// Servir la carpeta Catalogo
app.use('/img/Catalogo', express.static(path.join(__dirname, '../Frontend/Catalogo')));

// ===== RUTAS DE PÁGINAS =====

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/registro.html'));
});

app.get('/pantalla-principal.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/pantalla-principal.html'));
});

app.get('/categorias.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/categorias.html'));
});

app.get('/categoria.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/categoria.html'));
});
// ===== RUTAS DE LA API =====

// Obtener todos los productos desde BaseD.json
app.get('/api/productos', (req, res) => {
    try {
        const dbPath = path.join(__dirname, 'BaseD.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        res.json(data.productos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al leer la base de datos' });
    }
});

// Obtener usuarios
app.get('/api/usuarios', (req, res) => {
    try {
        const dbPath = path.join(__dirname, 'BaseD.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        res.json(data.usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la base de datos' });
    }
});

// Registrar usuario
app.post('/api/registro', (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const dbPath = path.join(__dirname, 'BaseD.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        const existe = data.usuarios.find(u => u.email === email);
        if (existe) {
            return res.json({ success: false, message: 'El correo ya está registrado' });
        }

        const nuevoUsuario = {
            id: data.usuarios.length + 1,
            nombre,
            email,
            password
        };

        data.usuarios.push(nuevoUsuario);
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        res.json({ success: true, message: 'Usuario registrado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar' });
    }
});

// Iniciar sesión
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const dbPath = path.join(__dirname, 'BaseD.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        const usuario = data.usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            res.json({ success: true, message: 'Login exitoso', usuario });
        } else {
            res.json({ success: false, message: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});