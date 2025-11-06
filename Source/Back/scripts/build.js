const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const dotenv = require('dotenv');

// Configuración de entornos
const environments = {
    dev: 'DEV.env',
    prod: 'PROD.env'
};

// Obtener el entorno desde los argumentos de línea de comandos
const environment = process.argv[2] || 'dev';
if (!environments[environment]) {
    console.error(`Entorno "${environment}" no válido. Use: dev o prod`);
    process.exit(1);
}

// Cargar variables de entorno
dotenv.config({ path: environments[environment] });

// Directorios y archivos a incluir en el paquete
const includeDirs = [
    'controllers',
    'database',
    'helpers',
    'middlewares',
    'models',
    'routes',
    'public'
];

const includeFiles = [
    'app.js',
    'package.json',
    'package-lock.json',
    'example.env'
];

// Función para crear el paquete
async function createPackage() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = 'dist';
    const outputFile = `${outputDir}/${environment}-build-${timestamp}.zip`;

    // Crear directorio dist si no existe
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Crear archivo de salida
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Nivel máximo de compresión
    });

    // Eventos del archivo
    output.on('close', () => {
        console.log(`📦 Paquete creado: ${outputFile}`);
        console.log(`📊 Tamaño total: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    // Conectar archivo y archivador
    archive.pipe(output);

    // Agregar directorios
    for (const dir of includeDirs) {
        if (fs.existsSync(dir)) {
            archive.directory(dir, dir);
        }
    }

    // Agregar archivos individuales
    for (const file of includeFiles) {
        if (fs.existsSync(file)) {
            archive.file(file, { name: file });
        }
    }

    // Agregar archivo de entorno renombrado a .env
    archive.file(environments[environment], { name: '.env' });

    // Finalizar el archivo
    await archive.finalize();
}

// Ejecutar el empaquetado
console.log(`🚀 Iniciando empaquetado para entorno: ${environment.toUpperCase()}`);
createPackage().catch(err => {
    console.error('❌ Error durante el empaquetado:', err);
    process.exit(1);
});