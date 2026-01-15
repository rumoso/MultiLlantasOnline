
# GENERACION DE COMPILADO Y LEVANTAR SERVIDOR POR AMBIENTE

Para desarrollo:

ng serve --configuration=development

o simplemente:

ng serve

Para producción:

ng serve --configuration=production

Para construir la aplicación:

Desarrollo:

ng build --configuration=development

Producción:

ng build --configuration=production

o simplemente:

ng build

# Servir la aplicación en modo QA
ng serve --configuration=qa

# Construir la aplicación para QA
ng build --configuration=qa

---

## COMPILACIÓN CON COMPRESIÓN AUTOMÁTICA

Los siguientes comandos compilan el proyecto y automáticamente generan un archivo .tar.gz comprimido en la carpeta `dist/`:

### Desarrollo (con compresión):
```bash
npm run build:dev
```
Genera: `dist/diprolimweb-dev.tar.gz`

### Producción (con compresión):
```bash
npm run build:prod
```
Genera: `dist/diprolimweb-prod.tar.gz`

### QA (con compresión):
```bash
npm run build:qa
```
Genera: `dist/diprolimweb-qa.tar.gz`

**Nota:** El archivo .tar.gz contiene todos los archivos compilados de la carpeta `dist/diprolimWeb/browser/` listos para desplegar en el servidor.

---

## DESPLIEGUE EN SERVIDOR LINUX

Se incluye un script automatizado (`deploy.sh`) para desplegar la aplicación en el servidor Linux de forma segura.

### Características del script:
- ✅ Crea respaldo automático de la versión actual
- ✅ Comprime los respaldos para ahorrar espacio
- ✅ Descomprime y despliega la nueva versión
- ✅ Configura permisos automáticamente
- ✅ Mantiene historial de los últimos 5 respaldos
- ✅ Validaciones de seguridad antes de desplegar

### Uso del script:

1. **Transferir archivos al servidor:**
```bash
# Transferir el archivo compilado y el script
scp dist/diprolimweb-prod.tar.gz usuario@servidor:/ruta/temporal/
scp deploy.sh usuario@servidor:/ruta/temporal/
```

2. **Conectar al servidor y ejecutar:**
```bash
ssh usuario@servidor
cd /ruta/temporal/
chmod +x deploy.sh
sudo ./deploy.sh diprolimweb-prod.tar.gz
```

### Configuración del script:

Editar las siguientes variables en `deploy.sh` según tu servidor:

```bash
DEPLOY_DIR="/var/www/diprolimweb"      # Directorio de la aplicación
BACKUP_DIR="/var/www/diprolimweb_backups"  # Directorio de respaldos
```

### Restaurar un respaldo:

Si necesitas restaurar una versión anterior:

```bash
cd /var/www/diprolimweb_backups
# Listar respaldos disponibles
ls -lh backup_*.tar.gz

# Restaurar un respaldo específico
sudo ./deploy.sh backup_YYYYMMDD_HHMMSS.tar.gz
```
