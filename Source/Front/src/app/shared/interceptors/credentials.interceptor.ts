import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para incluir credenciales (cookies) en todas las peticiones HTTP
 *
 * Esto permite que el backend pueda leer y escribir cookies,
 * especialmente importante para el guest_id
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar withCredentials: true
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};
