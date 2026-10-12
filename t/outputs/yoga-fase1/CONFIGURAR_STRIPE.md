# Configurar Stripe en modo de prueba

La web ya contiene el flujo de compra individual y suscripcion. Para activarlo hay que configurar Stripe y Vercel; ninguna clave secreta debe copiarse en `index.html` ni en `app.js`.

## 1. Crear la suscripcion en Stripe

1. Entra en Stripe con el modo de prueba activado.
2. Crea un producto llamado, por ejemplo, `Reset Premium`.
3. Anade un precio recurrente mensual con el importe decidido por la clienta.
4. Copia su identificador `price_...`.

Los precios individuales se toman directamente del campo `price_individual` de cada contenido guardado en Supabase.

## 2. Variables privadas en Vercel

En `Project > Settings > Environment Variables`, anade:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SITE_URL=https://tu-dominio.vercel.app
```

Para la URL también puede reutilizarse `NEXT_PUBLIC_SUPABASE_URL`; el servidor acepta ambos nombres.
`SUPABASE_SERVICE_ROLE_KEY` es distinta de la clave publica `anon`. Solo debe estar en Vercel.

## 3. Webhook

1. Publica de nuevo el proyecto en Vercel.
2. En Stripe, crea un endpoint webhook con esta URL:

```text
https://tu-dominio.vercel.app/api/stripe-webhook
```

3. Selecciona estos eventos:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

4. Copia el secreto `whsec_...` del webhook a Vercel como `STRIPE_WEBHOOK_SECRET`.
5. Vuelve a desplegar la web.

## 4. Probar

Usa una cuenta de alumna registrada y un contenido premium guardado en Supabase. En Stripe Checkout puede usarse la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

Antes de cambiar de claves `sk_test_...` a claves reales hay que migrar el acceso actual a Supabase Auth. El inicio de sesion provisional de esta fase no ofrece seguridad suficiente para cobrar dinero real.
