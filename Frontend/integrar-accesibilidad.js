const fs = require('fs');
const path = require('path');

// Ubicación del Frontend

const rutaFrontend = path.join(
    __dirname,
    'Frontend'
);

// Referencias de accesibilidad

const enlaceCSS =
    '<link rel="stylesheet" href="/accesibilidad.css">';

const enlaceJS =
    '<script src="/accesibilidad.js" defer></script>';

// Contadores

let archivosActualizados = 0;
let archivosSinCambios = 0;
let archivosOmitidos = 0;

// Verificar la carpeta

if (!fs.existsSync(rutaFrontend)) {

    console.error(
        'No se encontró la carpeta Frontend.'
    );

    process.exit(1);
}

// Verificar los archivos de accesibilidad

const archivosNecesarios = [
    'accesibilidad.js',
    'accesibilidad.css'
];

for (const archivo of archivosNecesarios) {

    const ruta = path.join(
        rutaFrontend,
        archivo
    );

    if (!fs.existsSync(ruta)) {

        console.error(
            `No se encontró Frontend/${archivo}`
        );

        process.exit(1);
    }
}

// Integrar accesibilidad en un archivo HTML

function actualizarArchivo(rutaArchivo) {

    const nombreArchivo = path.basename(
        rutaArchivo
    );

    // No modificar el encabezado compartido

    if (
        nombreArchivo.toLowerCase() === 'header.html'
    ) {

        archivosOmitidos++;

        return;
    }

    let contenido = fs.readFileSync(
        rutaArchivo,
        'utf8'
    );

    // Comprobar que sea una página completa

    if (!/<\/head\s*>/i.test(contenido)) {

        archivosOmitidos++;

        console.log(
            `Omitido: ${nombreArchivo}`
        );

        return;
    }

    const saltoLinea = contenido.includes('\r\n')
        ? '\r\n'
        : '\n';

    const referencias = [];

    // Evitar duplicar el CSS

    if (!/href\s*=\s*["'][^"']*accesibilidad\.css["']/i.test(contenido)) {

        referencias.push(enlaceCSS);
    }

    // Evitar duplicar el JavaScript

    if (!/src\s*=\s*["'][^"']*accesibilidad\.js["']/i.test(contenido)) {

        referencias.push(enlaceJS);
    }

    // Si ya está integrado, no modificar

    if (referencias.length === 0) {

        archivosSinCambios++;

        console.log(
            `Ya integrado: ${nombreArchivo}`
        );

        return;
    }

    // Agregar antes del cierre del head

    const bloque =
        referencias
            .map(referencia => '    ' + referencia)
            .join(saltoLinea) +
        saltoLinea;

    contenido = contenido.replace(
        /<\/head\s*>/i,
        cierreHead => bloque + cierreHead
    );

    // Guardar sin eliminar el contenido existente

    fs.writeFileSync(
        rutaArchivo,
        contenido,
        'utf8'
    );

    archivosActualizados++;

    console.log(
        `Actualizado: ${nombreArchivo}`
    );
}

// Recorrer las carpetas del Frontend

function recorrerCarpeta(rutaCarpeta) {

    const elementos = fs.readdirSync(
        rutaCarpeta,
        { withFileTypes: true }
    );

    elementos.forEach(function (elemento) {

        const rutaCompleta = path.join(
            rutaCarpeta,
            elemento.name
        );

        if (elemento.isDirectory()) {

            if (
                elemento.name === 'node_modules' ||
                elemento.name === '.git'
            ) {
                return;
            }

            recorrerCarpeta(rutaCompleta);

        } else if (
            elemento.isFile() &&
            elemento.name.toLowerCase().endsWith('.html')
        ) {

            actualizarArchivo(rutaCompleta);
        }
    });
}

// Ejecutar integración

console.log(
    '\nIntegrando accesibilidad en TechStore...\n'
);

recorrerCarpeta(rutaFrontend);

// Mostrar resultados

console.log(
    '\n===================================='
);

console.log(
    'INTEGRACIÓN FINALIZADA'
);

console.log(
    '===================================='
);

console.log(
    `Archivos actualizados: ${archivosActualizados}`
);

console.log(
    `Archivos sin cambios: ${archivosSinCambios}`
);

console.log(
    `Archivos omitidos: ${archivosOmitidos}`
);

console.log(
    '\nModo oscuro y lector de texto integrados.'
);