const { v4: uuidv4 } = require('uuid');

/**
 * Middleware para gestionar identificadores de invitados (guest_id)
 * 
 * Este middleware permite que usuarios no autenticados puedan:
 * - Navegar por el sitio
 * - Agregar productos al carrito
 * - Mantener su sesión de compra
 * 
 * Funcionamiento:
 * 1. Verifica si existe una cookie 'guest_id'
 * 2. Si no existe, genera un UUID v4 único
 * 3. Crea una cookie HTTP-only con duración de 30 días
 * 4. Adjunta req.guestId para usar en los controllers
 * 
 * Seguridad:
 * - Cookie HTTP-only: No accesible desde JavaScript del cliente
 * - SameSite 'lax': Protección contra CSRF
 * - Duración: 30 días (2592000000 ms)
 */
const guestId = (req, res, next) => {
    try {
        // Skip for OPTIONS requests (CORS preflight)
        if (req.method === 'OPTIONS') {
            return next();
        }

        // console.log('DEBUG: Headers received:', req.headers); // Descomentar para depurar

        // 1. Prioridad: Header 'x-guest-id' (enviado por frontend desde localStorage)
        let currentGuestId = req.headers['x-guest-id'];

        // 2. Si no hay header, buscar en cookies
        if (!currentGuestId) {
            currentGuestId = req.cookies.guest_id;
        }

        // Si no existe en ninguno, generar nuevo UUID
        if (!currentGuestId || currentGuestId === 'null' || currentGuestId === 'undefined') {
            currentGuestId = uuidv4();

            // Configuración de la cookie
            const cookieOptions = {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días en milisegundos
                httpOnly: true,                    // No accesible desde JavaScript del navegador
                sameSite: 'lax',                   // Lax es el mejor compromiso para desarrollo local
                secure: false,                     // FORZAR false para desarrollo en HTTP (localhost)
                path: '/'                          // Disponible en toda la aplicación
            };

            // Crear cookie con el guest_id
            res.cookie('guest_id', currentGuestId, cookieOptions);

            console.log(`🆕 Nuevo guest_id creado: ${currentGuestId}`);
        } else {
            // console.log(`✅ Guest_id recibido: ${currentGuestId}`);
        }

        // Adjuntar guest_id al objeto request para usarlo en controllers
        req.guestId = currentGuestId;

        // Continuar con el siguiente middleware o ruta
        next();

    } catch (error) {
        console.error('❌ Error en middleware guestId:', error);
        // En caso de error, continuar sin bloquear la petición
        next();
    }
};

module.exports = guestId;
