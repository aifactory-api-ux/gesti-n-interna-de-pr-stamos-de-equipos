# Préstamo de Equipos Apiux

Aplicación web interna para la gestión de préstamos de equipos de TI en Apiux.

## Requisitos

- Docker 20.x o superior
- Docker Compose 2.x o superior
- Git

## Quick Start

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd prestamo-equipos-apiux

# 2. Copiar configuración
cp .env.example .env

# 3. Editar .env y configurar Azure AD
nano .env

# 4. Iniciar servicios
./run.sh
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:25173
- **Backend API:** http://localhost:23000
- **Documentación API:** http://localhost:23000/api/docs

## Configuración

### Variables de Entorno

Editar el archivo `.env` con los valores correspondientes:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `tu-contraseña` |
| `DB_DATABASE` | Nombre de la base de datos | `prestamo_equipos` |
| `AZURE_AD_CLIENT_ID` | ID de cliente de Azure AD | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_AD_CLIENT_SECRET` | Secreto del cliente Azure AD | `tu-cliente-secreto` |
| `AZURE_AD_TENANT_ID` | ID del tenant de Azure AD | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### Azure AD Setup

1. Registrar aplicación en Azure AD
2. Configurar redirect URI: `http://localhost:25173/api/auth/azure/callback`
3. Obtener client_id, client_secret y tenant_id
4. Configurar los permisos: User.Read, email, profile, openid

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│  PostgreSQL │
│   (React)   │◀────│  (NestJS)   │◀────│   (Docker)  │
│   :25173   │     │   :23000   │     │    :5432    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Comandos Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado de servicios
docker-compose ps

# Detener servicios
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build

# Limpiar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v
```

## Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/equipment` | Listar equipos |
| POST | `/api/equipment` | Crear equipo |
| GET | `/api/loan` | Listar préstamos |
| POST | `/api/loan` | Crear préstamo |
| PATCH | `/api/loan/:id/approve` | Aprobar préstamo |
| PATCH | `/api/loan/:id/return` | Registrar devolución |
| GET | `/api/audit-log` | Ver auditoría |

## Desarrollo

### Estructura del Proyecto

```
├── backend/              # NestJS API
│   ├── src/
│   │   ├── entities/    # TypeORM entities
│   │   ├── modules/    # NestJS modules
│   │   ├── config/     # Configuration
│   │   └── db/         # Database schema
│   └── Dockerfile
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # React hooks
│   │   └── contexts/   # React contexts
│   └── Dockerfile
├── docker-compose.yml  # Docker orchestration
├── run.sh              # Startup script
└── .env.example        # Environment template
```

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Despliegue en GCP

1. Construir imágenes de Docker
2. Subir a Google Container Registry
3. Desplegar en Cloud Run
4. Configurar Cloud SQL para PostgreSQL
5. Configurar Secret Manager para variables sensibles

Ver documentación detallada en el wiki del proyecto.

## Licencia

Propiedad de Apiux - Uso interno exclusivamente.
