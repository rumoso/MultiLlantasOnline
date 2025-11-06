const formatearFecha = (fechaString) => {
    if (!fechaString || fechaString.length !== 14) {
        return new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato: YYYY-MM-DD HH:mm:ss
    }
    
    const year = fechaString.substring(0, 4);
    const month = fechaString.substring(4, 6);
    const day = fechaString.substring(6, 8);
    const hour = fechaString.substring(8, 10);
    const minute = fechaString.substring(10, 12);
    const second = fechaString.substring(12, 14);
    
    // Retornar como string en formato YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * Formatear fecha de finalización de turno
 * Combina fecha (YYYYMMDD) y hora de cierre (HH:MM:SS) en formato yyyyMMddHHmmss
 * @param {string} fecha - Fecha en formato YYYYMMDD
 * @param {string} horacierre - Hora en formato HH:MM:SS
 * @returns {string} Fecha y hora combinadas en formato yyyyMMddHHmmss
 */
const formatearFechaFinTurno = (fecha, horacierre) => {
    // Si no se proporcionan parámetros, usar fecha y hora actual
    if (!fecha || !horacierre) {
        const ahora = new Date();
        const year = ahora.getFullYear().toString();
        const month = (ahora.getMonth() + 1).toString().padStart(2, '0');
        const day = ahora.getDate().toString().padStart(2, '0');
        const hour = ahora.getHours().toString().padStart(2, '0');
        const minute = ahora.getMinutes().toString().padStart(2, '0');
        const second = ahora.getSeconds().toString().padStart(2, '0');
        
        return `${year}${month}${day}${hour}${minute}${second}`;
    }
    
    // Validar formato de fecha (YYYYMMDD)
    if (!/^\d{8}$/.test(fecha)) {
        throw new Error('La fecha debe tener el formato YYYYMMDD');
    }
    
    // Validar formato de hora (HH:MM:SS)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(horacierre)) {
        throw new Error('La hora debe tener el formato HH:MM:SS');
    }
    
    // Extraer componentes de la fecha
    const year = fecha.substring(0, 4);
    const month = fecha.substring(4, 6);
    const day = fecha.substring(6, 8);
    
    // Extraer componentes de la hora y remover los dos puntos
    const horaSinDosPartes = horacierre.replace(/:/g, '');
    
    // Combinar en formato yyyyMMddHHmmss
    return `${year}${month}${day}${horaSinDosPartes}`;
};

/**
 * Formatear fecha y hora a formato compacto
 * Convierte fecha (YYYY-MM-DD) y hora (HH:MM:SS) al formato yyyyMMddHHmmss
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (ej: '2025-08-03')
 * @param {string} hora - Hora en formato HH:MM:SS (ej: '20:24:00')
 * @returns {string} Fecha y hora combinadas en formato yyyyMMddHHmmss (ej: '20250803202400')
 */
const formatearFechaHora = (fecha, hora) => {
    // Validar que se proporcionen ambos parámetros
    if (!fecha || !hora) {
        throw new Error('Se requieren tanto la fecha como la hora');
    }
    
    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        throw new Error('La fecha debe tener el formato YYYY-MM-DD');
    }
    
    // Validar formato de hora (HH:MM:SS)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(hora)) {
        throw new Error('La hora debe tener el formato HH:MM:SS');
    }
    
    // Remover guiones de la fecha para obtener YYYYMMDD
    const fechaSinGuiones = fecha.replace(/-/g, '');
    
    // Remover dos puntos de la hora para obtener HHMMSS
    const horaSinDosPuntos = hora.replace(/:/g, '');
    
    // Combinar en formato yyyyMMddHHmmss
    return `${fechaSinGuiones}${horaSinDosPuntos}`;
};

/**
 * Convertir formato compacto a formato SQL datetime
 * Convierte yyyyMMddHHmmss a YYYY-MM-DD HH:MM:SS
 * @param {string} fechaCompacta - Fecha en formato yyyyMMddHHmmss (ej: '20250803202400')
 * @returns {string} Fecha en formato YYYY-MM-DD HH:MM:SS (ej: '2025-08-03 20:24:00')
 */
const formatoCompactoASQL = (fechaCompacta) => {
    // Validar que se proporcione el parámetro
    if (!fechaCompacta) {
        throw new Error('Se requiere la fecha en formato compacto');
    }
    
    // Validar formato yyyyMMddHHmmss
    if (!/^\d{14}$/.test(fechaCompacta)) {
        throw new Error('La fecha debe tener el formato yyyyMMddHHmmss (14 dígitos)');
    }
    
    // Extraer componentes
    const year = fechaCompacta.substring(0, 4);
    const month = fechaCompacta.substring(4, 6);
    const day = fechaCompacta.substring(6, 8);
    const hour = fechaCompacta.substring(8, 10);
    const minute = fechaCompacta.substring(10, 12);
    const second = fechaCompacta.substring(12, 14);
    
    // Combinar en formato SQL datetime
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

module.exports = {
    formatearFecha,
    formatearFechaFinTurno,
    formatearFechaHora,
    formatoCompactoASQL
};