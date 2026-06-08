# Task Manager — Sistema de Gestión de Tareas

Aplicación web fullstack para gestionar proyectos y tareas, con autenticación y roles de usuario.

## Tecnologías

- Next.js 15
- React
- TailwindCSS
- NextAuth v5
- Prisma 7
- Supabase (PostgreSQL)

## Integrantes del equipo

- (Agrega aquí los nombres de tu equipo)

## Credenciales de acceso

| Rol   | Correo                   | Contraseña |
|-------|--------------------------|------------|
| ADMIN | admin@taskmanager.com    | admin123   |
| USER  | user@taskmanager.com     | user123    |

## Cómo ejecutar el proyecto

1. Clona el repositorio
2. Instala las dependencias:
```bash
   npm install
```
3. Crea un archivo `.env` en la raíz con las siguientes variables:
```env
   DATABASE_URL=tu_string_de_conexion_supabase
   NEXTAUTH_SECRET=una_clave_secreta
   NEXTAUTH_URL=http://localhost:3000
```
4. Ejecuta las migraciones:
```bash
   npx prisma migrate dev
```
5. Inicia el servidor:
```bash
   npm run dev
```
6. Abre [http://localhost:3000](http://localhost:3000)

## Funcionalidades

- Landing page con botón de inicio de sesión
- Autenticación con credenciales (email y contraseña)
- Sidebar con navegación según rol
- **Proyectos (Maestros):** visualización y creación de proyectos (solo ADMIN puede crear)
- **Transacciones:** gestión de tareas por proyecto con gráfica de evolución
- **Usuarios:** gestión de roles (solo ADMIN)

## Despliegue

La aplicación está desplegada en Vercel:  
[https://nombreEquipoFuncionalidad.vercel.app](https://nombreEquipoFuncionalidad.vercel.app)