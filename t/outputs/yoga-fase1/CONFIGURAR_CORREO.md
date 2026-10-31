# Configurar el envio del formulario de contacto

El formulario envia las consultas desde una funcion privada de Vercel. La direccion de la clienta no se incluye en el HTML ni se muestra a los visitantes.

## 1. Preparar Resend

1. Crea una cuenta en https://resend.com.
2. En `Domains`, anade `resetdeconciencia.com`.
3. Copia en la zona DNS de OVH los registros que indique Resend.
4. Cuando el dominio figure como verificado, crea una API key en `API Keys`.

## 2. Anadir variables en Vercel

En el proyecto `pagina-de-yoga`, abre `Settings > Environment Variables` y anade estas variables para `Production`:

```text
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL=Reset de Conciencia <contacto@resetdeconciencia.com>
CONTACT_EMAIL=correo-privado-de-la-clienta@ejemplo.com
```

- `RESEND_API_KEY`: clave privada creada en Resend.
- `CONTACT_FROM_EMAIL`: remitente del dominio verificado.
- `CONTACT_EMAIL`: direccion privada que recibira las consultas.

No uses el prefijo `NEXT_PUBLIC_` en ninguna de estas variables.

## 3. Publicar y comprobar

1. Haz un nuevo despliegue de produccion en Vercel.
2. Entra en la pagina de contacto y envia una consulta.
3. Comprueba la entrega en la bandeja de la clienta y en el apartado `Emails` de Resend.
4. En el panel de la profesora, abre `Editar web` y guarda una vez para retirar de los datos publicos cualquier correo que se hubiera guardado con la version anterior.

