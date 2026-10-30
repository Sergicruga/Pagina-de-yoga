# Configurar Stripe en modo de prueba

La web ya contiene el flujo de compra individual y suscripcion. Para activarlo hay que configurar Stripe y Vercel; ninguna clave secreta debe copiarse en `index.html` ni en `app.js`.

## 1. Crear los planes de suscripcion en Stripe

1. Entra en Stripe con el modo de prueba activado.
2. Crea un producto llamado, por ejemplo, `Reset Premium`.
3. Anade cuatro precios recurrentes en EUR al mismo producto, con la frecuencia mensual indicada:
   - 1 mes: intervalo `month`, cada 1 mes.
   - 3 meses: intervalo `month`, cada 3 meses.
   - 6 meses: intervalo `month`, cada 6 meses.
   - 12 meses: intervalo `month`, cada 12 meses.
4. Decide el importe de cada precio y copia sus identificadores `price_...`. La pagina muestra los importes configurados en Stripe; los planes sin precio configurado no se pueden comprar.
5. Activa el portal de clientes de Stripe y permite gestionar metodos de pago y cancelar suscripciones. El boton de gestion de la cuenta abre este portal.

Los precios individuales se toman directamente del campo `price_individual` de cada contenido guardado en Supabase.

## 2. Variables privadas en Vercel

En `Project > Settings > Environment Variables`, anade:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_1_MONTH=price_...
STRIPE_PREMIUM_PRICE_3_MONTHS=price_...
STRIPE_PREMIUM_PRICE_6_MONTHS=price_...
STRIPE_PREMIUM_PRICE_12_MONTHS=price_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SITE_URL=https://resetdeconciencia.com
```

También se aceptan los nombres antiguos `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY`. La clave secreta de Supabase solo debe estar en Vercel.

## 3. Webhook

1. Publica de nuevo el proyecto en Vercel.
2. En Stripe, crea un endpoint webhook con esta URL:

```text
https://resetdeconciencia.com/api/stripe-webhook
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

## 4. Probar las suscripciones

Publica de nuevo despues de configurar los cuatro precios. Abre `Suscripcion`, selecciona un periodo e inicia sesion o crea una cuenta para continuar con Stripe Checkout. Tras confirmarse el pago, la cuenta obtiene acceso a todo el contenido premium mientras la suscripcion esta activa. Desde el espacio de la alumna se puede abrir el portal de Stripe para cancelar o gestionar la suscripcion.

En Stripe Checkout puede usarse la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

Antes de cambiar de claves `sk_test_...` a claves reales hay que migrar el acceso actual a Supabase Auth. El inicio de sesion provisional de esta fase no ofrece seguridad suficiente para cobrar dinero real.
