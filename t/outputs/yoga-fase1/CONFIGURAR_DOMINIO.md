# Conectar el dominio a Vercel

## Datos que faltan

Antes de hacer el cambio definitivo hay que confirmar:

- El dominio exacto, por ejemplo `resetdeconciencia.es`.
- La empresa donde se compro el dominio.
- Si la direccion principal sera con `www` o sin `www`.

## 1. Anadir el dominio al proyecto

1. Abre el proyecto `pagina-de-yoga` en Vercel.
2. Entra en **Settings > Domains**.
3. Anade el dominio sin `www`.
4. Anade tambien la version con `www`.
5. Elige una como principal y configura la otra para redirigir a ella.

Vercel mostrara los registros DNS exactos que necesita ese dominio. Deben copiarse en el panel de la empresa donde se compro. Como referencia, un dominio raiz suele utilizar un registro `A` y `www` suele utilizar un `CNAME`, pero hay que usar los valores que muestre Vercel para este proyecto.

Documentacion oficial: https://vercel.com/docs/domains/set-up-custom-domain

## 2. Actualizar la direccion usada por los pagos

En **Vercel > Settings > Environment Variables**, cambia:

```text
SITE_URL=https://DOMINIO-ELEGIDO
```

No anadas una barra al final. Aplica la variable a `Production` y vuelve a desplegar la web.

## 3. Actualizar el webhook de Stripe

En Stripe, crea o actualiza el endpoint del entorno correspondiente:

```text
https://DOMINIO-ELEGIDO/api/stripe-webhook
```

Eventos utilizados por la web:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Copia el nuevo secreto de firma del endpoint, que empieza por `whsec_`, y guardalo en Vercel como:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

El secreto del webhook es distinto de `STRIPE_SECRET_KEY`. Despues hay que volver a desplegar.

Documentacion oficial: https://docs.stripe.com/keys

## 4. Comprobaciones finales

- Abrir el dominio con y sin `www` y comprobar que una direccion redirige a la principal.
- Confirmar que aparece el candado HTTPS.
- Registrar una cuenta de prueba.
- Probar una compra con Stripe en modo de prueba.
- Confirmar que el pago concede acceso en Supabase.
- Revisar que `SITE_URL`, las claves de Stripe y el webhook pertenecen todos al mismo entorno: prueba o real.

## Antes de cobrar pagos reales

La web aun utiliza el acceso provisional de demostracion. Antes de activar claves `sk_live_` hay que migrar el registro e inicio de sesion a Supabase Auth y aplicar politicas RLS privadas. No se deben activar pagos reales con contrasenas guardadas en la tabla `users`.
