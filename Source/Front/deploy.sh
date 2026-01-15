#!/bin/bash

################################################################################
# Script de despliegue para Diprolim Web
# Descripción: Respalda los archivos actuales y despliega la nueva versión
################################################################################

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
DEPLOY_DIR="/var/www/sistema.diprolim.com.mx"  # Directorio donde se desplegará la aplicación
BACKUP_DIR="/var/www/sistema.diprolim.com.mx_backup"  # Directorio de respaldos
TAR_FILE=""  # Se especificará como argumento

# Función para mostrar mensajes de error
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

# Función para mostrar mensajes de éxito
success_msg() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para mostrar mensajes de advertencia
warning_msg() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar si se proporcionó el archivo tar.gz
if [ -z "$1" ]; then
    error_exit "Debe especificar el archivo .tar.gz a desplegar

Uso: ./deploy.sh <archivo.tar.gz>

Ejemplos:
  ./deploy.sh diprolimweb-prod.tar.gz
  ./deploy.sh diprolimweb-dev.tar.gz
  ./deploy.sh diprolimweb-qa.tar.gz"
fi

TAR_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$TAR_FILE" ]; then
    error_exit "El archivo '$TAR_FILE' no existe"
fi

# Verificar que es un archivo .tar.gz
if [[ ! "$TAR_FILE" =~ \.tar\.gz$ ]]; then
    error_exit "El archivo debe ser .tar.gz"
fi

echo "=========================================="
echo "   DESPLIEGUE DIPROLIM WEB"
echo "=========================================="
echo ""
echo "Archivo a desplegar: $TAR_FILE"
echo "Directorio destino: $DEPLOY_DIR"
echo "Directorio respaldo: $BACKUP_DIR"
echo ""

# Confirmar antes de continuar
read -p "¿Desea continuar con el despliegue? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    warning_msg "Despliegue cancelado por el usuario"
    exit 0
fi

# Crear directorio de backups si no existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Creando directorio de respaldos..."
    mkdir -p "$BACKUP_DIR" || error_exit "No se pudo crear el directorio de respaldos"
    success_msg "Directorio de respaldos creado"
fi

# Generar nombre de respaldo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Verificar si existe el directorio de despliegue
if [ -d "$DEPLOY_DIR" ]; then
    # Verificar si hay archivos en el directorio
    if [ "$(ls -A $DEPLOY_DIR)" ]; then
        echo ""
        echo "Creando respaldo de archivos actuales..."

        # Crear directorio de respaldo
        mkdir -p "$BACKUP_PATH" || error_exit "No se pudo crear el directorio de respaldo"

        # Mover archivos actuales al respaldo
        mv "$DEPLOY_DIR"/* "$BACKUP_PATH"/ 2>/dev/null || warning_msg "Algunos archivos no se pudieron mover"

        success_msg "Respaldo creado en: $BACKUP_PATH"

        # Opcional: Comprimir el respaldo para ahorrar espacio
        echo "Comprimiendo respaldo..."
        tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME" 2>/dev/null
        if [ $? -eq 0 ]; then
            rm -rf "$BACKUP_PATH"
            success_msg "Respaldo comprimido: $BACKUP_PATH.tar.gz"
        fi
    else
        warning_msg "El directorio de despliegue está vacío, no hay nada que respaldar"
    fi
else
    echo "Creando directorio de despliegue..."
    mkdir -p "$DEPLOY_DIR" || error_exit "No se pudo crear el directorio de despliegue"
    success_msg "Directorio de despliegue creado"
fi

# Descomprimir el archivo
echo ""
echo "Descomprimiendo archivos..."
tar -xzf "$TAR_FILE" -C "$DEPLOY_DIR" || error_exit "Error al descomprimir el archivo"
success_msg "Archivos descomprimidos exitosamente"

# Verificar permisos
echo ""
echo "Configurando permisos..."
chmod -R 755 "$DEPLOY_DIR" || warning_msg "No se pudieron configurar algunos permisos"
success_msg "Permisos configurados"

# Opcional: Cambiar propietario (descomentar si es necesario)
# WEBUSER="www-data"  # Cambiar según tu servidor (www-data, nginx, apache, etc.)
# chown -R $WEBUSER:$WEBUSER "$DEPLOY_DIR" || warning_msg "No se pudo cambiar el propietario"
# success_msg "Propietario cambiado a $WEBUSER"

# Mostrar resumen
echo ""
echo "=========================================="
echo "   DESPLIEGUE COMPLETADO"
echo "=========================================="
echo ""
success_msg "Aplicación desplegada en: $DEPLOY_DIR"
if [ -f "$BACKUP_PATH.tar.gz" ]; then
    success_msg "Respaldo guardado en: $BACKUP_PATH.tar.gz"
fi
echo ""
echo "Archivos desplegados:"
ls -lh "$DEPLOY_DIR" | head -10

# Opcional: Limpiar respaldos antiguos (mantener solo los últimos 5)
echo ""
echo "Limpiando respaldos antiguos..."
cd "$BACKUP_DIR"
ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
BACKUP_COUNT=$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
success_msg "Respaldos actuales: $BACKUP_COUNT"

echo ""
echo "=========================================="
echo "¡Despliegue finalizado exitosamente!"
echo "=========================================="
