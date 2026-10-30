# Conectar resetdeconciencia.com a Vercel

## Configuracion elegida

- Dominio principal: `https://resetdeconciencia.com`
- Redireccion: `https://www.resetdeconciencia.com` hacia el dominio principal
- Proyecto de Vercel: `pagina-de-yoga`
- Proveedor DNS detectado: OVH

Estado comprobado el 30 de octubre de 2026:

- Los nameservers son `dns103.ovh.net` y `ns103.ovh.net`.
- El dominio raiz apunta al aparcamiento de OVH: `213.186.33.5`.
- `www` todavia no tiene un CNAME configurado.

## 1. Anadir los dominios en Vercel

1. Abre el proyecto `pagina-de-yoga`.
2. Entra en **Settings > Domains**.
3. Anade `resetdeconciencia.com`.
4. Anade `www.resetdeconciencia.com`.
5. Configura `www` para redirigir permanentemente a `resetdeconciencia.com`.

Vercel mostrara los registros DNS exactos necesarios. Hay que utilizar esos valores, ya que el CNAME puede ser especifico del proyecto.

Documentacion oficial: https://vercel.com/docs/domains/set-up-custom-domain

## 2. Cambiar la zona DNS en OVH

Entra en **OVHcloud Manager > Web Cloud > Dominios > resetdeconciencia.com > Zona DNS**.

1. Edita o elimina unicamente el registro `A` del dominio raiz que apunta a `213.186.33.5`.
2. Crea el registro `A` para `@` con el valor que muestre Vercel. El valor general de Vercel suele ser `76.76.21.21`, pero manda el valor mostrado en el proyecto.
3. Crea un registro `CNAME` con subdominio `www` y el destino que muestre Vercel. Puede ser `cname.vercel-dns-0.com` o un destino especifico.
4. No elimines registros MX, SPF, DKIM, TXT ni otros registros relacionados con correo.

La propagacion puede tardar desde unos minutos hasta 24 horas. Vercel emitira automaticamente el certificado HTTPS cuando valide los DNS.

## 3. Actualizar Vercel

En **Settings > Environment Variables**, configura:

```text
SITE_URL=https://resetdeconciencia.com
```

Aplica la variable a `Production` y realiza un nuevo despliegue.

## 4. Actualizar Stripe

Crea o actualiza el endpoint webhook con esta URL:

```text
https://resetdeconciencia.com/api/stripe-webhook
```

Eventos utilizados:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Copia el nuevo secreto de firma del endpoint, que empieza por `whsec_`, y guardalo en Vercel:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

El secreto del webhook es distinto de `STRIPE_SECRET_KEY`. Despues hay que volver a desplegar.

## 5. Comprobaciones

- `https://resetdeconciencia.com` abre la web.
- `https://www.resetdeconciencia.com` redirige a la direccion principal.
- El navegador muestra HTTPS sin errores.
- Una compra de prueba vuelve al nuevo dominio.
- El webhook de Stripe aparece como entregado.
- El pago concede acceso en Supabase.

## Antes de cobrar pagos reales

La web aun utiliza el acceso provisional de demostracion. Antes de activar claves `sk_live_` hay que migrar el registro e inicio de sesion a Supabase Auth y aplicar politicas RLS privadas.
