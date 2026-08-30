# Control-CANT

Sistema web/PWA para CANTECOR.

## Roles
- Administrador: acceso total.
- Veedor 1 y 2: solo lectura.
- Comandero: producción, planta y viajes.
- Pañolero: combustible/pañol + producción y viajes.
- Retrista 1 y 2: partes de máquinas.
- Palero 1 y 2: partes de máquinas.
- Mecánico 1 y 2: órdenes de trabajo.
- Camioneros: no tienen usuario.

## Importante
Esta versión funciona como aplicación estática con `localStorage`. La contraseña no es un mecanismo de seguridad real porque el código queda visible al navegador. Para producción con información sensible se recomienda una base de datos y autenticación en servidor.

## Publicación
Subir todos los archivos a la raíz de la rama `main`/`principal` de GitHub y activar GitHub Pages.
