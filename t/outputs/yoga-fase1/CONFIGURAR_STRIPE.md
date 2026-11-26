# Configurar Stripe

La web ya contiene el flujo de compra individual y suscripcion. Para activarlo hay que configurar Supabase Auth, Stripe y Vercel; ninguna clave secreta debe copiarse en `index.html` ni en `app.js`.

## 0. Seguridad obligatoria antes de pagos reales

1. Ejecuta `supabase/01_preparar_supabase_auth.sql`.
2. En `Supabase > Authentication > URL Configuration`, configura `https://resetdeconciencia.com` como Site URL y anade `https://resetdeconciencia.com/**` a Redirect URLs.
3. Despliega la version que inicia sesion con Supabase Auth.
4. Crea o confirma la cuenta de la profesora con el mismo email de su perfil existente y una contraseña nueva.
5. Comprueba que puede entrar, subir contenido y ver usuarios.
6. Ejecuta `supabase/02_cerrar_politicas_produccion.sql`.

El segundo script elimina las politicas de demostracion y las claves antiguas, protege los enlaces y textos premium con URLs y tablas privadas, y deja las operaciones administrativas solo para la profesora.

## 1. Crear los planes de suscripcion en Stripe

1. Empieza en modo de prueba. Pasa a modo real solo despues de completar el apartado de seguridad.
2. Crea un producto llamado, por ejemplo, `Reset Premium`.
3. Anade tres precios recurrentes en EUR al mismo producto:
   - 31,50 EUR: intervalo `month`, cada 1 mes.
   - 81,50 EUR: intervalo `month`, cada 3 meses.
   - 140,50 EUR: intervalo `month`, cada 6 meses.
4. Copia sus identificadores `price_...`. La pagina valida el periodo y el importe para evitar publicar un precio equivocado.
5. Activa el portal de clientes de Stripe y permite gestionar metodos de pago y cancelar suscripciones. El boton de gestion de la cuenta abre este portal.

Los precios individuales se toman directamente del campo `price_individual` de cada contenido guardado en Supabase.

## 2. Variables privadas en Vercel

En `Project > Settings > Environment Variables`, anade:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_1_MONTH=price_...
STRIPE_PREMIUM_PRICE_3_MONTHS=price_...
STRIPE_PREMIUM_PRICE_6_MONTHS=price_...
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

Publica de nuevo despues de configurar los tres precios. Abre `Suscripcion`, selecciona un periodo e inicia sesion o crea una cuenta para continuar con Stripe Checkout. Tras confirmarse el pago, la cuenta obtiene acceso a las meditaciones y clases marcadas como incluidas mientras la suscripcion esta activa. Desde el espacio de la alumna se puede abrir el portal de Stripe para cancelar o gestionar la suscripcion.

En Stripe Checkout puede usarse la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

En modo real utiliza exclusivamente claves `sk_live_...` de la cuenta de la clienta y rota cualquier clave que se haya compartido fuera de Vercel.
