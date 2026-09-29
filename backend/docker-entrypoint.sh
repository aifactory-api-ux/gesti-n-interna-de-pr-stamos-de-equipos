#!/bin/sh
set -e

echo "Esperando a la base de datos..."

wait_for_db() {
    host="${DB_HOST:-localhost}"
    port="${DB_PORT:-5432}"

    while ! nc -z "$host" "$port" 2>/dev/null; do
        echo "Base de datos no disponible en $host:$port - esperando..."
        sleep 2
    done
    echo "Base de datos disponible!"
}

wait_for_db

echo "Iniciando aplicación..."
exec "$@"
