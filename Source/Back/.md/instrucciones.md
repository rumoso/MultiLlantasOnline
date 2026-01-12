```md
# Proyecto: Tienda de Llantas Online (Estilo MercadoLibre)

## 🎯 Objetivo del Proyecto
Crear una tienda online para vender llantas con una experiencia similar a MercadoLibre, usando Angular 20 (Frontend), Node.js + Express (Backend) y MySQL (Base de datos).

---

## 📋 Características Principales

### 1. Usuario Invitado (Guest)
- ✅ **No requiere registro inicial**: Los usuarios pueden navegar y agregar productos al carrito sin crear cuenta
- ✅ **Carrito provisional**: Se usa `guest_id` (UUID en cookie) para identificar al usuario anónimo
- ✅ **Persistencia del carrito**: Los productos se guardan en BD asociados al `guest_id`

### 2. Registro al Momento de Pagar
- ✅ **Checkout con registro**: Al intentar pagar, se solicita crear cuenta o iniciar sesión
- ✅ **Merge de carritos**: Al registrarse/loguearse, el carrito de invitado se fusiona con el carrito del usuario
- ✅ **Sin pérdida de productos**: Todo lo agregado como invitado se conserva

### 3. Sección "Mis Compras" (Estilo MercadoLibre)
- ✅ **Historial de órdenes**: Lista de todas las compras realizadas
- ✅ **Estados de pedido**: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- ✅ **Detalles de compra**: Ver productos, cantidad, precio, total, fecha
- ✅ **Tracking**: Seguimiento del estado de cada pedido

### 4. Catálogo de Llantas
- ✅ **Búsqueda avanzada**: Por marca, modelo, medidas (ancho/perfil/rin)
- ✅ **Filtros**: Precio, stock, marca
- ✅ **Vista de producto**: Imagen, descripción, especificaciones, precio, stock
- ✅ **Agregar al carrito**: Con control de cantidad y stock disponible

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Angular 20
- **UI**: Material Angular / Bootstrap / TailwindCSS
- **Estado**: Servicios Angular + RxJS
- **HTTP**: HttpClient de Angular

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: JavaScript (NO TypeScript en backend)
- **ORM**: Sequelize
- **Autenticación**: JWT (jsonwebtoken) + bcryptjs
- **Cookies**: cookie-parser (para guest_id)
- **Validación**: express-validator

### Base de Datos
- **Motor**: MySQL 8.0.42
- **Base de datos**: `db_multillantas` ✅ (ya creada)
- **Tablas**: users, roles, productos, carts, cart_items, orders, order_items, payments, addresses ✅

### Pasarela de Pagos
- **Recomendada**: MercadoPago (México)
- **Alternativas**: Stripe, PayPal
- **Implementación**: Webhooks para verificar pagos

---

## 📁 Estructura de Bases de Datos (✅ Ya creada)

### Tablas Principales:

1. **users** - Usuarios registrados
   ```sql
   id, nombre, email, password, telefono, activo, created_at, updated_at
   ```

2. **carts** - Carritos de compra
   ```sql
   id, user_id (NULL para invitados), guest_id (UUID), created_at, updated_at
   ```

3. **cart_items** - Items del carrito
   ```sql
   id, cart_id, producto_id, cantidad, precio, created_at, updated_at
   ```

4. **productos** - Catálogo de llantas
   ```sql
   id, nombre, descripcion, marca, modelo, ancho, perfil, rin, 
   precio, stock, imagen_url, activo, created_at, updated_at
   ```

5. **orders** - Órdenes de compra
   ```sql
   id, user_id, total, status, payment_id, external_reference, 
   notas, created_at, updated_at
   ```

6. **order_items** - Detalles de órdenes
   ```sql
   id, order_id, producto_id, cantidad, precio, subtotal, created_at
   ```

7. **payments** - Registro de pagos
   ```sql
   id, order_id, amount, method, status, external_id, 
   external_reference, payment_data (JSON), created_at, updated_at
   ```

8. **addresses** - Direcciones de envío
   ```sql
   id, user_id, nombre_completo, telefono, calle, numero_ext, numero_int,
   colonia, ciudad, estado, codigo_postal, pais, es_principal, created_at
   ```

---

## 🎯 Flujo de Usuario (User Journey)

### Flujo 1: Usuario Invitado
1. Usuario ingresa al sitio
2. No se le pide registro
3. **Backend genera `guest_id`** (UUID) y lo guarda en cookie HTTP-only
4. Usuario navega y agrega productos al carrito
5. Productos se guardan en `carts` (con `guest_id`, sin `user_id`)
6. Los items se guardan en `cart_items` relacionados al `cart_id`

### Flujo 2: Checkout y Registro
1. Usuario hace clic en "Comprar" o "Ir a pagar"
2. **Frontend detecta** que no hay usuario autenticado
3. Muestra modal/página de registro/login
4. Usuario se registra o inicia sesión
5. **Backend ejecuta `mergeGuestCart(guest_id, user_id)`**:
   - Obtiene cart del guest_id
   - Obtiene/crea cart del user_id
   - Combina items (suma cantidades de productos duplicados)
   - Verifica stock disponible
   - Actualiza cart del usuario
   - Elimina cart del invitado
6. Usuario procede al pago

### Flujo 3: Proceso de Pago
1. Usuario confirma dirección de envío
2. Selecciona método de pago
3. **Backend crea orden** (status: PENDING)
4. Redirige a pasarela de pago (MercadoPago)
5. Usuario completa el pago
6. **Webhook recibe notificación** de pago exitoso
7. Backend actualiza orden (status: PAID)
8. Crea registro en tabla `payments`
9. Reduce stock de productos
10. Vacía el carrito del usuario

### Flujo 4: Mis Compras
1. Usuario logueado accede a "Mis Compras"
2. **Backend devuelve** todas las órdenes del `user_id`
3. Frontend muestra lista con:
   - Número de orden
   - Fecha
   - Total
   - Estado (badge con color según status)
   - Productos comprados
4. Usuario puede ver detalles de cada compra
5. Puede descargar factura/ticket (opcional)

---

## 🚀 Implementación Paso a Paso

### BACKEND (Node.js + Express)

#### Paso 1: Middleware `guest_id`
**Archivo**: `middlewares/guestId.js`

**Funcionalidad**:
- Verifica si existe cookie `guest_id`
- Si no existe, genera UUID y crea cookie HTTP-only (30 días)
- Adjunta `req.guestId` para usar en controllers

**Prompt para la IA**:
```
Crea un middleware en Express (JavaScript) llamado guestId.js en la carpeta middlewares/:

1. Verifica si existe cookie 'guest_id'
2. Si no existe:
   - Genera un UUID v4
   - Crea cookie HTTP-only con nombre 'guest_id', duración 30 días
   - Agrega opciones secure: false (dev), httpOnly: true, sameSite: 'lax'
3. Adjunta req.guestId con el valor (existente o nuevo)
4. Usa el paquete 'uuid' y 'cookie-parser'
5. Incluye comentarios explicativos

Devuelve el código completo del middleware.
```

#### Paso 2: Modelos Sequelize
**Archivos**: `models/cart.js`, `models/cartItem.js`, `models/order.js`, etc.

**Prompt para la IA**:
```
El proyecto usa Sequelize con MySQL. La base de datos 'db_multillantas' ya existe con estas tablas:
- carts (id, user_id, guest_id, created_at, updated_at)
- cart_items (id, cart_id, producto_id, cantidad, precio, created_at, updated_at)
- orders (id, user_id, total, status, payment_id, external_reference, notas, created_at, updated_at)
- order_items (id, order_id, producto_id, cantidad, precio, subtotal, created_at)
- payments (id, order_id, amount, method, status, external_id, external_reference, payment_data, created_at, updated_at)

Crea los modelos Sequelize siguiendo el patrón de los modelos existentes en models/:
1. models/cart.js
2. models/cartItem.js  
3. models/order.js
4. models/orderItem.js
5. models/payment.js

Incluye las relaciones en models/asociaciones.js:
- Cart belongsTo User (opcional, puede ser null)
- Cart hasMany CartItem
- CartItem belongsTo Cart
- CartItem belongsTo Producto
- Order belongsTo User
- Order hasMany OrderItem
- Order hasOne Payment
- OrderItem belongsTo Order
- OrderItem belongsTo Producto
- Payment belongsTo Order

Usa { timestamps: true, underscored: false, tableName: 'nombre_exacto' }
```

#### Paso 3: Controlador de Carrito
**Archivo**: `controllers/cartController.js`

**Endpoints necesarios**:
- `GET /api/cart` - Obtener carrito (guest o user)
- `POST /api/cart/items` - Agregar producto al carrito
- `PATCH /api/cart/items/:id` - Actualizar cantidad
- `DELETE /api/cart/items/:id` - Eliminar item
- `POST /api/cart/merge` - Fusionar carrito invitado con usuario

**Prompt para la IA**:
```
Crea el controlador cartController.js en controllers/ con estos endpoints:

1. getCart (GET /api/cart)
   - Obtiene req.guestId del middleware o req.user.id del JWT
   - Busca cart por guest_id o user_id
   - Incluye cart_items con datos del producto (JOIN)
   - Calcula total del carrito
   - Retorna: { cart, items: [...], total }

2. addItem (POST /api/cart/items)
   - Body: { producto_id, cantidad }
   - Verifica stock disponible
   - Busca o crea cart (por guest_id o user_id)
   - Verifica si producto ya existe en cart
   - Si existe: actualiza cantidad (suma)
   - Si no: crea nuevo cart_item
   - Retorna item creado/actualizado

3. updateItem (PATCH /api/cart/items/:id)
   - Params: id del cart_item
   - Body: { cantidad }
   - Verifica que el item pertenece al cart del usuario/invitado
   - Verifica stock disponible
   - Actualiza cantidad
   - Si cantidad = 0, elimina el item

4. deleteItem (DELETE /api/cart/items/:id)
   - Verifica pertenencia al cart
   - Elimina cart_item

5. mergeCart (POST /api/cart/merge)
   - Se ejecuta después del login/registro
   - Recibe user_id del JWT autenticado
   - Obtiene guest_id de cookie
   - Busca cart del invitado y del usuario
   - Combina items (suma cantidades si son mismo producto)
   - Verifica stock para cada producto
   - Actualiza cart del usuario
   - Elimina cart del invitado
   - Retorna cart fusionado

Usa express-validator para validaciones.
Maneja errores con try/catch.
Retorna status codes apropiados (200, 201, 400, 404, 500).
```

#### Paso 4: Controlador de Órdenes
**Archivo**: `controllers/orderController.js`

**Prompt para la IA**:
```
Crea orderController.js con:

1. createOrder (POST /api/orders)
   - Requiere JWT (usuario autenticado)
   - Body: { direccion_envio_id, notas }
   - Obtiene cart del usuario
   - Calcula total
   - Crea orden (status: PENDING)
   - Crea order_items copiando cart_items
   - Retorna orden creada con external_reference para pago

2. getMyOrders (GET /api/orders/me)
   - Requiere JWT
   - Obtiene todas las orders del user_id
   - Incluye order_items con datos de productos
   - Ordena por fecha descendente
   - Retorna lista de órdenes

3. getOrderById (GET /api/orders/:id)
   - Requiere JWT
   - Verifica que la orden pertenece al usuario
   - Incluye order_items, payment, dirección
   - Retorna orden completa

4. cancelOrder (POST /api/orders/:id/cancel)
   - Verifica que status sea PENDING o PAID
   - Actualiza status a CANCELLED
   - Restaura stock de productos (opcional)
   - Retorna orden actualizada
```

#### Paso 5: Webhook de Pagos (MercadoPago)
**Archivo**: `controllers/webhookController.js`

**Prompt para la IA**:
```
Crea webhookController.js para MercadoPago:

1. mercadoPagoWebhook (POST /api/webhooks/mercadopago)
   - Valida firma usando headers x-signature y x-request-id
   - Maneja tipo 'payment'
   - Obtiene datos del pago de MercadoPago API
   - Busca orden por external_reference
   - Si pago aprobado:
     * Actualiza order.status = 'PAID'
     * Crea registro en payments tabla
     * Reduce stock de productos
     * Vacía carrito del usuario
   - Retorna status 200 (importante para webhook)
   
Incluye variables de entorno:
- MERCADOPAGO_ACCESS_TOKEN
- MERCADOPAGO_WEBHOOK_SECRET

Usa try/catch robusto (los webhooks se reintentan).
```

#### Paso 6: Rutas
**Archivo**: `routes/cartRoute.js`, `routes/orderRoute.js`, `routes/webhookRoute.js`

**Prompt para la IA**:
```
Crea las rutas siguiendo el patrón del proyecto:

1. routes/cartRoute.js
   - Usa middleware guestId en todas las rutas
   - Usa validar-jwt solo en /merge
   - GET /api/cart -> getCart
   - POST /api/cart/items -> addItem (con validaciones)
   - PATCH /api/cart/items/:id -> updateItem
   - DELETE /api/cart/items/:id -> deleteItem
   - POST /api/cart/merge -> mergeCart (requiere JWT)

2. routes/orderRoute.js
   - Todas requieren validar-jwt
   - POST /api/orders -> createOrder
   - GET /api/orders/me -> getMyOrders
   - GET /api/orders/:id -> getOrderById
   - POST /api/orders/:id/cancel -> cancelOrder

3. routes/webhookRoute.js
   - POST /api/webhooks/mercadopago -> mercadoPagoWebhook
   - NO usar middleware JWT (es llamada externa)
   - Usa express.raw() para body en webhook
```

#### Paso 7: Registrar Rutas en Server
**Archivo**: `models/server.js`

**Prompt para la IA**:
```
Agrega en models/server.js:

En constructor, añade:
this.cartPath = '/api/cart';
this.ordersPath = '/api/orders';
this.webhooksPath = '/api/webhooks';

En routes(), añade:
this.app.use(this.cartPath, require('../routes/cartRoute'));
this.app.use(this.ordersPath, require('../routes/orderRoute'));
this.app.use(this.webhooksPath, require('../routes/webhookRoute'));
```

---

### FRONTEND (Angular 20)

#### Estructura de Módulos

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── product.service.ts
│   │   │   └── order.service.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── product.model.ts
│   │       ├── cart.model.ts
│   │       └── order.model.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── product-card/
│   │   └── pipes/
│   ├── features/
│   │   ├── home/
│   │   ├── products/
│   │   │   ├── product-list/
│   │   │   └── product-detail/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── my-purchases/
│   │       ├── order-list/
│   │       └── order-detail/
│   └── app.routes.ts
```

#### Servicios Principales

**Prompt para Cart Service**:
```
Crea cart.service.ts en Angular 20:

1. Propiedades:
   - cartItems$: BehaviorSubject<CartItem[]>([])
   - cartTotal$: Observable calculado automáticamente

2. Métodos:
   - getCart(): Observable que llama GET /api/cart
   - addToCart(productId, quantity): POST /api/cart/items
   - updateQuantity(itemId, quantity): PATCH /api/cart/items/:id
   - removeItem(itemId): DELETE /api/cart/items/:id
   - mergeCart(): POST /api/cart/merge (después de login)
   - clearCart(): Limpia BehaviorSubject local

3. Usa HttpClient con withCredentials: true (para cookies)
4. Maneja errores con catchError
5. Actualiza cartItems$ después de cada operación
```

**Prompt para Order Service**:
```
Crea order.service.ts:

1. Métodos:
   - createOrder(data): POST /api/orders
   - getMyOrders(): GET /api/orders/me
   - getOrderById(id): GET /api/orders/:id
   - cancelOrder(id): POST /api/orders/:id/cancel

2. Retorna Observables
3. Incluye JWT automáticamente (interceptor)
```

#### Componentes Clave

**Componente: My Purchases (Mis Compras)**

**Prompt para la IA**:
```
Crea el módulo my-purchases en Angular 20 estilo MercadoLibre:

1. order-list.component (lista de órdenes)
   - Muestra tabla/cards con órdenes
   - Campos: Número orden, Fecha, Total, Estado
   - Estado con badge de color:
     * PENDING: amarillo
     * PAID: azul
     * PROCESSING: naranja
     * SHIPPED: púrpura
     * DELIVERED: verde
     * CANCELLED: rojo
   - Click en orden va a detalle
   - Botón "Cancelar" si status es PENDING/PAID

2. order-detail.component (detalle de orden)
   - Muestra información completa:
     * Número de orden y fecha
     * Estado actual
     * Lista de productos (imagen, nombre, cantidad, precio)
     * Subtotal, total
     * Dirección de envío
     * Información de pago
   - Timeline de estados (opcional)
   - Botón volver a lista

Usa Angular Material o Bootstrap para UI.
Implementa lazy loading para el módulo.
```

**Componente: Cart**

**Prompt para la IA**:
```
Crea cart.component.ts:

1. Muestra lista de productos en carrito
2. Cada item con:
   - Imagen producto
   - Nombre, marca, modelo
   - Precio unitario
   - Control de cantidad (+/- buttons)
   - Subtotal
   - Botón eliminar
3. Resumen:
   - Subtotal general
   - Total
   - Botón "Proceder al pago"
4. Si carrito vacío: mensaje "Tu carrito está vacío"
5. Al hacer clic en "Proceder al pago":
   - Verifica si usuario está autenticado (authService.isAuthenticated())
   - Si NO: abre modal de login/register
   - Si SÍ: navega a /checkout
6. Después del login exitoso: ejecuta cartService.mergeCart()
```

**Componente: Checkout**

**Prompt para la IA**:
```
Crea checkout.component.ts (requiere auth guard):

1. Paso 1: Confirmar productos del carrito
2. Paso 2: Seleccionar/agregar dirección de envío
3. Paso 3: Método de pago
4. Botón "Finalizar compra":
   - Llama orderService.createOrder()
   - Recibe external_reference
   - Redirige a MercadoPago con preference_id
5. Página de confirmación después del pago
```

---

## 📝 Variables de Entorno

**Archivo**: `.env`

```env
# Server
PORT=8087

# JWT
SECRETPRIVATEKEY=tu_secret_key_aqui_cambiar_en_produccion

# Database
DATABASE=db_multillantas
USERDB=newUser
PASSWORD=clave
SERVER=127.0.0.1
PORT_SQL=3306
DATABASE_TYPE=mysql

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:4200

# Cookies
COOKIE_DOMAIN=localhost
```

---

## ✅ Checklist de Implementación

### Backend - Node.js + Express ✅ Base completada

**Completado**:
- [x] Base de datos `db_multillantas` creada
- [x] Tablas: users, roles, productos, carts, cart_items, orders, order_items, payments, addresses
- [x] Productos de ejemplo insertados
- [x] Estructura del proyecto Express existente
- [x] Auth con JWT y bcryptjs

**Por Hacer**:
- [ ] Middleware `guestId.js`
- [ ] Modelos Sequelize: Cart, CartItem, Order, OrderItem, Payment
- [ ] Actualizar `models/asociaciones.js` con nuevas relaciones
- [ ] Controller: `cartController.js` (getCart, addItem, updateItem, deleteItem, mergeCart)
- [ ] Controller: `orderController.js` (createOrder, getMyOrders, getOrderById, cancelOrder)
- [ ] Controller: `webhookController.js` (mercadoPagoWebhook)
- [ ] Routes: `cartRoute.js`, `orderRoute.js`, `webhookRoute.js`
- [ ] Registrar rutas en `models/server.js`
- [ ] Instalar: `npm install uuid cookie-parser`
- [ ] Configurar CORS para Angular
- [ ] Tests unitarios (opcional)

### Frontend - Angular 20

**Por Hacer**:
- [ ] Crear proyecto Angular 20: `ng new multillantas-frontend`
- [ ] Estructura de módulos (core, shared, features)
- [ ] Services: auth, cart, product, order
- [ ] Guards: auth.guard
- [ ] Interceptors: jwt.interceptor
- [ ] Componentes:
  - [ ] Home / Landing
  - [ ] Product List (catálogo con filtros)
  - [ ] Product Detail
  - [ ] Cart (carrito)
  - [ ] Login / Register (modal o página)
  - [ ] Checkout (proceso de pago)
  - [ ] My Purchases (lista de órdenes)
  - [ ] Order Detail (detalle de compra)
  - [ ] Header (con icono carrito + contador)
  - [ ] Footer
- [ ] Routing con lazy loading
- [ ] Integración con MercadoPago (frontend SDK)
- [ ] Manejo de cookies (withCredentials)
- [ ] Responsive design

### Integración y Deploy

- [ ] Configurar CORS en backend
- [ ] Probar flujo completo: invitado → agregar productos → login → merge → pagar
- [ ] Configurar webhooks de MercadoPago (ngrok para testing local)
- [ ] Variables de entorno para producción
- [ ] Deploy backend (Heroku, Railway, DigitalOcean)
- [ ] Deploy frontend (Vercel, Netlify, Firebase)
- [ ] SSL para cookies seguras en producción

---

## 🚀 Comandos Rápidos

### Backend
```bash
# Instalar dependencias adicionales
npm install uuid cookie-parser

# Ejecutar en desarrollo
npm run dev

# Probar conexión DB
node test_db_connection.js
```

### Frontend (cuando esté creado)
```bash
# Crear proyecto
ng new multillantas-frontend --routing --style=scss

# Instalar Material (opcional)
ng add @angular/material

# Ejecutar
ng serve
```

---

## 📚 Recursos Útiles

- [MercadoPago Docs](https://www.mercadopago.com.mx/developers/es/docs)
- [Angular 20 Docs](https://angular.dev)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [Express.js Docs](https://expressjs.com/)

---

## 🎨 Inspiración UI

**Estilo MercadoLibre**:
- Header sticky con logo, buscador, carrito, login
- Catálogo en grid con cards de productos
- Filtros laterales (marca, precio, etc.)
- Carrito tipo sidebar o página dedicada
- "Mis Compras" con cards de órdenes y estados visuales
- Colores: Amarillo (#FFF159), Azul (#3483FA) - opcional

---

**¿Por dónde empezar?**
1. Backend: Middleware guestId → Modelos → Controllers → Routes
2. Probar endpoints con Postman
3. Frontend: Crear proyecto → Services → Componentes básicos
4. Integración: Conectar Angular con API
5. Pagos: Configurar MercadoPago

¡Listo para comenzar! 🚀
```

---

## Estructura actual del proyecto
El proyecto YA TIENE esta estructura (NO crear desde cero):
- package.json ✅
- app.js ✅ (entry point)
- models/server.js ✅ (configuración express)
- routes/ ✅ (múltiples rutas ya creadas)
- controllers/ ✅ (múltiples controladores ya creados)
- models/ ✅ (modelos Sequelize)
- middlewares/ ✅
- helpers/ ✅
- database/config.js ✅ (Sequelize + mysql2)
- assets/productos/ ✅ (almacenamiento local de imágenes)
- .env, DEV.env, PROD.env ✅

**IMPORTANTE**: Al pedir funcionalidad nueva, mantén la estructura y patrones existentes.

---

## Flujo paso a paso y prompts concretos

**NOTA**: El proyecto ya existe. Estos prompts son para AGREGAR funcionalidades nuevas.

1) ❌ ~~Scaffold inicial~~ (YA EXISTE - NO HACER)

2) Schema DB y migraciones (Sequelize)
Prompt:
"El proyecto usa Sequelize con MySQL. Genera los modelos Sequelize para las tablas:
- carts, cart_items (relacionados con users y products existentes)
- orders, order_items, payments
Incluye relaciones, índices básicos y un seed script. Sigue el patrón de los modelos existentes en models/ y las asociaciones en models/asociaciones.js"

3) Middleware guest_id (carrito provisional)
Prompt:
"Implementa un middleware en Express (JavaScript, NO TypeScript) que:
- revisa cookie 'guest_id' o header 'x-guest-id'
- si no existe crea UUID y setea cookie HTTP-only (30 días)
- adjunta req.guestId para uso posterior
Colócalo en middlewares/ siguiendo el patrón del proyecto (como validar-campos.js)"

4) Endpoints de carrito y merge
Prompt:
"Genera endpoints siguiendo la estructura del proyecto (route + controller):
- GET /api/cart -> obtiene carrito (por guest_id o user JWT)
- POST /api/cart/items -> { productId, quantity }
- PATCH /api/cart/items/:id -> actualizar cantidad
- DELETE /api/cart/items/:id
- POST /api/cart/merge -> { userId } : fusiona guest cart con user cart
Crea cartRoute.js en routes/ y cartController.js en controllers/. Usa Sequelize para la función mergeGuestCart(guestId, userId) que suma cantidades para duplicados, actualiza stock y borra cart guest."

5) ✅ Auth ya existe (register/login en authController.js)
Prompt (solo si necesitas mejoras):
"El proyecto ya tiene auth en authController.js con JWT y bcryptjs. Revísalo y sugiere mejoras de seguridad si es necesario."

6) ✅ Productos CRUD ya existe (productosController.js)
Prompt (solo para agregar funcionalidad):
"El proyecto ya tiene CRUD de productos. Agrega filtros avanzados por marca, medida (ancho/perfil/rin) y stock en el endpoint GET /api/productos"

7) Checkout y pagos (MercadoPago recomendado para México)
Prompt:
"Implementa flujo checkout con MercadoPago para México:
- POST /api/checkout/create-order: crea order en BD (PENDING) y Preference en MercadoPago. Guarda preference_id en order.
- POST /api/webhooks/mercadopago: endpoint webhook que valida firma y maneja payment -> actualizar order a PAID, crear payment record en tabla payments.
Usa Sequelize y sigue la estructura del proyecto (routes/ + controllers/). Incluye validación con express-validator como en otros controllers."

8) Seguridad y buenas prácticas
Prompt:
"Revisa el proyecto actual (models/server.js) y agrega:
- Helmet para headers de seguridad
- express-rate-limit para limitar requests
- Sanitización de inputs (express-mongo-sanitize o similar)
- Manejo de errores centralizado
- Validación de webhooks con firma
Mantén la estructura actual del proyecto."

9) Tests y mejoras
Prompt:
"Agrega tests con Jest para:
- Auth existente (authController.js)
- Cart merge (cuando se implemente)
- Webhooks de pagos
Sigue la estructura del proyecto y genera archivos en carpeta tests/"

---

## Prompts listos para copiar (copia/pega)

- Modelos Sequelize para carrito y órdenes:
"El proyecto usa Sequelize con MySQL (ver database/config.js). Genera los modelos siguiendo el patrón de models/clientes.js y models/proveedores.js para:
- carts (id, user_id, guest_id, created_at, updated_at)
- cart_items (id, cart_id, product_id, quantity, price, created_at)
- orders (id, user_id, total, status, payment_id, created_at)
- order_items (id, order_id, product_id, quantity, price)
- payments (id, order_id, amount, method, status, external_id, created_at)
Incluye las asociaciones en models/asociaciones.js"

- mergeGuestCart (función):
"Escribe la función mergeGuestCart(guestId, userId) en JavaScript usando Sequelize que:
  1) obtiene items del cart guest y del cart user
  2) combina cantidades (sumando duplicados)
  3) verifica stock (consulta tabla productos)
  4) actualiza/crea items en user cart
  5) borra cart guest
Colócala en un helper o en el controller de cart."

- Webhook MercadoPago:
"Genera endpoint Express /api/webhooks/mercadopago que:
  - valida la firma usando x-signature y x-request-id
  - maneja notification de tipo 'payment'
  - marca order como PAID buscando por external_reference
  - crea registro en tabla payments
Usa Sequelize y sigue el patrón de controllers existentes."

---

## Comandos útiles para el proyecto actual
- Instalar dependencias: npm install
- Run dev: npm run dev (usa nodemon)
- Build dev: npm run build:dev
- Build prod: npm run build:prod
- Test: npm test (pendiente configurar Jest)

Variables de entorno (ver example.env):
- PORT, SECRETPRIVATEKEY (JWT)
- DATABASE, USERDB, PASSWORD, SERVER, PORT_SQL, DATABASE_TYPE

---

## Endpoints mínimos a solicitar y probar

**Endpoints que YA EXISTEN:**
- ✅ GET/POST /api/productos
- ✅ POST /api/auth/login
- ✅ POST /api/auth/register (verificar si existe)
- ✅ Y muchos más en routes/

**Endpoints NUEVOS a implementar:**
- ❌ GET /api/cart
- ❌ POST /api/cart/items
- ❌ PATCH /api/cart/items/:id
- ❌ DELETE /api/cart/items/:id
- ❌ POST /api/cart/merge
- ❌ POST /api/checkout/create-order
- ❌ POST /api/webhooks/mercadopago

Pruebas rápidas (curl ejemplo):
- Login: curl -X POST http://localhost:PORT/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"pass123"}'
- Añadir item al carrito: usar Postman/Insomnia para manejar cookies

---

## Checklist backend (MVP)

**Completados ✅:**
- [x] Proyecto Express + JavaScript configurado
- [x] Sequelize + MySQL configurado
- [x] Auth básico (JWT + bcryptjs)
- [x] CRUD productos
- [x] Múltiples módulos (clientes, vendedores, ventas, etc.)
- [x] Storage local de imágenes

**Pendientes ❌:**
- [ ] Modelos para cart, cart_items, orders, order_items, payments
- [ ] Middleware guest_id para carritos de invitados
- [ ] Endpoints de cart (GET, POST, PATCH, DELETE)
- [ ] Función mergeGuestCart implementada y probada
- [ ] Checkout con MercadoPago (o pasarela elegida)
- [ ] Webhook de pagos verificado
- [ ] Tests unitarios con Jest
- [ ] Seguridad mejorada (Helmet, rate-limit)
- [ ] Docker (opcional)

---

**RECORDATORIO IMPORTANTE:**
- Este proyecto USA JavaScript, NO TypeScript
- Usa Sequelize, NO Prisma
- Storage LOCAL (assets/), no cloud
- Mantén la estructura existente (routes/, controllers/, models/, etc.)
- Sigue los patrones del código actual

---

Si quieres, ahora puedo:
- Generar los modelos Sequelize para carrito y órdenes
- Implementar el middleware guest_id
- Crear los endpoints de carrito con merge
- Configurar integración con MercadoPago
Dime qué funcionalidad quieres implementar primero.
```