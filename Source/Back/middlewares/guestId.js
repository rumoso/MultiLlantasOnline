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
        // Verificar si ya existe guest_id en cookies
        let currentGuestId = req.cookies.guest_id;

        // Si no existe, generar nuevo UUID
        if (!currentGuestId) {
            currentGuestId = uuidv4();
            
            // Configuración de la cookie
            const cookieOptions = {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días en milisegundos
                httpOnly: true,                    // No accesible desde JavaScript del navegador
                sameSite: 'lax',                   // Protección CSRF (permite en navegación normal)
                secure: process.env.NODE_ENV === 'production', // HTTPS solo en producción
                path: '/'                          // Disponible en toda la aplicación
            };

            // Crear cookie con el guest_id
            res.cookie('guest_id', currentGuestId, cookieOptions);
            
            console.log(`🆕 Nuevo guest_id creado: ${currentGuestId}`);
        } else {
            console.log(`✅ Guest_id existente: ${currentGuestId}`);
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
