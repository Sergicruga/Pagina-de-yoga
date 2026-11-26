import { authenticateRequest, getServerDatabase, responseJson } from "../lib/payments.js";

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    try {
      const body = await request.json();
      const targetUserId = String(body.targetUserId || "").trim();
      const premium = body.premium === true;
      if (!validUuid(targetUserId)) {
        return responseJson({ message: "La cuenta no es valida." }, 400);
      }

      const database = getServerDatabase();
      const actor = await authenticateRequest(request, database);
      if (!actor) return responseJson({ message: "Inicia sesion de nuevo para continuar." }, 401);
      if (!["teacher", "admin"].includes(actor.role)) {
        return responseJson({ message: "No tienes permiso para cambiar accesos." }, 403);
      }

      const { data: target, error: targetError } = await database
        .from("users")
        .select("id,role,stripe_subscription_id,subscription_status")
        .eq("id", targetUserId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!target) return responseJson({ message: "La cuenta ya no existe." }, 404);
      if (["teacher", "admin"].includes(target.role)) {
        return responseJson({ message: "La cuenta de la profesora esta protegida." }, 409);
      }
      if (target.stripe_subscription_id && ["active", "trialing", "past_due"].includes(target.subscription_status)) {
        return responseJson({ message: "Gestiona esta suscripcion desde Stripe para no desincronizar el pago." }, 409);
      }

      const { error: updateError } = await database
        .from("users")
        .update({
          is_premium: premium,
          subscription_status: premium ? "active" : "inactive",
          premium_until: null
        })
        .eq("id", target.id);
      if (updateError) throw updateError;
      return responseJson({ updated: true, premium });
    } catch (error) {
      console.error("Could not update user access:", error);
      return responseJson({ message: "No se pudo actualizar el acceso. Intentalo de nuevo." }, 500);
    }
  }
};
