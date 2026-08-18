# 🛒 MiShop — Ecommerce Full Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Plataforma de ecommerce completa con panel de administración, autenticación por roles, carrito de compras, gestión de órdenes y subida de imágenes con Cloudinary.

---

## 📋 Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Referencia de la API](#referencia-de-la-api)
- [Roles del sistema](#roles-del-sistema)

---

## ✨ Características

- **Autenticación** con JWT y control de acceso por roles (ADMIN / CLIENTE)
- **Catálogo de productos** con imágenes, categorías, stock y descuentos
- **Búsqueda y filtros** por nombre, categoría y rango de precios
- **Carrito de compras** con sesión persistente por usuario
- **Gestión de órdenes** con historial y estado de pago
- **Panel de administración** para gestionar productos y categorías
- **Subida de imágenes** con Cloudinary
- **Validación de datos** con Zod
- **Rate limiting** para proteger la API
- **Manejo de errores** global centralizado
- **Perfil de usuario** con gestión de direcciones

---

## 🛠 Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express 5 | Servidor HTTP |
| TypeScript | Tipado estático |
| Prisma 7 | ORM |
| PostgreSQL | Base de datos |
| JWT | Autenticación |
| Zod | Validación de datos |
| Cloudinary | Almacenamiento de imágenes |
| Multer | Manejo de archivos |
| express-rate-limit | Rate limiting |
| bcrypt | Encriptación de contraseñas |
| Winston | Logging |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + Vite | SPA |
| TailwindCSS v4 | Estilos |
| React Router v7 | Navegación |
| Axios | Peticiones HTTP |
| Context API | Estado global |

---

## 📁 Estructura del proyecto

```
mi-ecommerce/
├── src/                          # Backend
│   ├── __tests__/                # Tests
│   ├── config/
│   │   └── cloudinary.ts         # Configuración Cloudinary
│   ├── controllers/              # Lógica de negocio
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── category.controller.ts
│   │   ├── order.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/              # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/                   # Rutas de la API
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── category.routes.ts
│   │   ├── order.routes.ts
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/                  # Esquemas de validación Zod
│   │   ├── auth.schema.ts
│   │   ├── category.schema.ts
│   │   └── product.schema.ts
│   ├── services/
│   │   └── cloudinary.service.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── prisma.ts                 # Cliente Prisma
│   └── index.ts                  # Entry point
├── prisma/
│   ├── migrations/               # Historial de migraciones
│   └── schema.prisma             # Modelos de la base de datos
├── frontend/                     # Frontend React
│   └── src/
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── useAuth.js
│       ├── pages/
│       │   ├── Admin.jsx
│       │   ├── Cart.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Orders.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Products.jsx
│       │   ├── Profile.jsx
│       │   └── Register.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── auth.service.js
│       │   ├── cart.service.js
│       │   ├── category.service.js
│       │   ├── order.service.js
│       │   ├── product.service.js
│       │   └── user.service.js
│       └── components/
│           └── Navbar.jsx
├── .env
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## ⚙️ Requisitos previos

- Node.js v20+
- PostgreSQL 18
- Cuenta en Cloudinary

---

## 🚀 Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/mi-ecommerce.git
cd mi-ecommerce
```

### 2. Instala dependencias del backend

```bash
npm install
```

### 3. Instala dependencias del frontend

```bash
cd frontend
npm install
```

### 4. Configura las variables de entorno

Crea el archivo `.env` en la raíz del proyecto (ver sección Variables de entorno)

### 5. Aplica las migraciones

```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Inicia el backend

```bash
npm run dev
```

### 7. Inicia el frontend

```bash
cd frontend
npm run dev
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/mi_ecommerce"
JWT_SECRET="tu_clave_secreta_muy_larga"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
PORT=3000
```

---

## 🗄️ Base de datos

### Modelos principales

| Modelo | Descripción |
|---|---|
| User | Usuarios con rol ADMIN o CLIENTE |
| Product | Productos con precio, stock e imagen |
| ProductCategory | Categorías de productos |
| ProductInventory | Control de stock por producto |
| ShoppingSession | Sesión activa del carrito |
| CartItem | Items dentro del carrito |
| OrderDetails | Órdenes realizadas |
| OrderItems | Productos dentro de una orden |
| PaymentDetails | Información de pago |
| UserAddress | Direcciones del usuario |

---

## 📡 Referencia de la API

### Autenticación — `/auth`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |

### Productos — `/product`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/product` | Listar todos | No |
| GET | `/product/:id` | Ver uno | No |
| POST | `/product` | Crear producto | ADMIN |
| PUT | `/product/:id` | Editar producto | ADMIN |
| DELETE | `/product/:id` | Eliminar producto | ADMIN |

### Categorías — `/category`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/category` | Listar todas | No |
| GET | `/category/:id` | Ver una | No |
| POST | `/category` | Crear categoría | ADMIN |
| PUT | `/category/:id` | Editar categoría | ADMIN |
| DELETE | `/category/:id` | Eliminar categoría | ADMIN |

### Carrito — `/cart`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/cart` | Ver carrito | Sí |
| POST | `/cart/items` | Agregar item | Sí |
| PUT | `/cart/items/:id` | Actualizar cantidad | Sí |
| DELETE | `/cart/items/:id` | Eliminar item | Sí |
| DELETE | `/cart` | Vaciar carrito | Sí |

### Órdenes — `/order`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/order` | Ver mis órdenes | Sí |
| GET | `/order/:id` | Ver una orden | Sí |
| POST | `/order` | Crear orden | Sí |

### Usuario — `/user`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/user/profile` | Ver perfil | Sí |
| PUT | `/user/profile` | Editar perfil | Sí |
| GET | `/user/address` | Ver direcciones | Sí |
| POST | `/user/address` | Agregar dirección | Sí |
| PUT | `/user/address/:id` | Editar dirección | Sí |
| DELETE | `/user/address/:id` | Eliminar dirección | Sí |

---

## 👥 Roles del sistema

| Rol | Permisos |
|---|---|
| CLIENTE | Navegar productos, gestionar carrito, crear órdenes, gestionar perfil |
| ADMIN | Todo lo anterior + crear, editar y eliminar productos y categorías |

---

## 📄 Scripts disponibles

### Backend
```bash
npm run dev      # Desarrollo con ts-node
npm run build    # Compilar TypeScript
npm run start    # Producción
npm run test     # Correr tests
```

### Frontend
```bash
npm run dev      # Desarrollo con Vite
npm run build    # Build de producción
npm run preview  # Preview del build
```

---

## 👤 Autor

**Juan Diego Gómez Betancur**
- LinkedIn: [juan-diego-gomez-betancur](https://www.linkedin.com/in/juan-diego-gomez-betancur-435752317/)
- GitHub: [Juandiego341](https://github.com/Juandiego341)