import { authenticateRequest, getServerDatabase, responseJson } from "../lib/payments.js";

function environmentValue(name) {
  return String(process.env[name] || "").trim();
}

function requestOriginIsAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const siteUrl = environmentValue("SITE_URL").replace(/\/$/, "");
  if (siteUrl) allowedOrigins.add(siteUrl);
  return allowedOrigins.has(origin);
}

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    if (!requestOriginIsAllowed(request)) {
      return responseJson({ message: "No se pudo validar el origen de la solicitud." }, 403);
    }

    try {
      const body = await request.json();
      const targetUserId = String(body.targetUserId || "").trim();

      if (!validUuid(targetUserId)) {
        return responseJson({ message: "Faltan datos para confirmar la eliminacion." }, 400);
      }

      const database = getServerDatabase();
      const actor = await authenticateRequest(request, database);
      if (!actor) return responseJson({ message: "Inicia sesion de nuevo para continuar." }, 401);
      if (!["teacher", "admin"].includes(actor.role)) {
        return responseJson({ message: "No tienes permiso para eliminar usuarios." }, 403);
      }

      const { data: target, error: targetError } = await database
        .from("users")
        .select("id,auth_user_id,email,role,stripe_subscription_id,subscription_status")
        .eq("id", targetUserId)
        .maybeSingle();

      if (targetError) throw targetError;
      if (!target) return responseJson({ message: "La cuenta ya no existe." }, 404);
      if (target.id === actor.id || ["teacher", "admin"].includes(target.role)) {
        return responseJson({ message: "La cuenta de la profesora esta protegida." }, 409);
      }

      const subscriptionStatus = String(target.subscription_status || "inactive");
      const inactiveStatuses = new Set(["inactive", "canceled", "incomplete_expired"]);
      if (target.stripe_subscription_id && !inactiveStatuses.has(subscriptionStatus)) {
        return responseJson({
          message: "Cancela primero la suscripcion activa de esta cuenta antes de eliminarla."
        }, 409);
      }

      if (target.auth_user_id) {
        const { error: authDeleteError } = await database.auth.admin.deleteUser(target.auth_user_id);
        if (authDeleteError) throw authDeleteError;
      }

      const { error: deleteError } = await database
        .from("users")
        .delete()
        .eq("id", target.id);

      if (deleteError) throw deleteError;
      return responseJson({ deleted: true });
    } catch (error) {
      console.error("Could not delete user:", error);
      return responseJson({ message: "No se pudo eliminar la cuenta. Intentalo de nuevo." }, 500);
    }
  }
};
