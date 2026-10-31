function responseJson(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function environmentValue(name) {
  return String(process.env[name] || "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requestOriginIsAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const siteUrl = environmentValue("SITE_URL").replace(/\/$/, "");
  if (siteUrl) allowedOrigins.add(siteUrl);
  return allowedOrigins.has(origin);
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
      const name = String(body.name || "").trim().slice(0, 100);
      const replyEmail = String(body.replyEmail || "").trim().toLowerCase().slice(0, 254);
      const message = String(body.message || "").trim().slice(0, 5000);
      const website = String(body.website || "").trim();

      if (website) return responseJson({ sent: true });
      if (name.length < 2 || !validEmail(replyEmail) || message.length < 5) {
        return responseJson({ message: "Revisa el nombre, el email y el mensaje antes de enviarlo." }, 400);
      }

      const apiKey = environmentValue("RESEND_API_KEY");
      const from = environmentValue("CONTACT_FROM_EMAIL");
      const recipients = environmentValue("CONTACT_EMAIL")
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      if (!apiKey || !from || recipients.length === 0) {
        console.error("Contact email environment variables are incomplete.");
        return responseJson({ message: "El formulario de contacto todavia no esta disponible." }, 503);
      }

      const safeName = escapeHtml(name);
      const safeReplyEmail = escapeHtml(replyEmail);
      const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
      const subjectName = name.replace(/[\r\n]+/g, " ");
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: recipients,
          reply_to: replyEmail,
          subject: `Nueva consulta desde Reset de Conciencia - ${subjectName}`,
          html: `
            <h2>Nueva consulta desde la web</h2>
            <p><strong>Nombre:</strong> ${safeName}</p>
            <p><strong>Email de respuesta:</strong> ${safeReplyEmail}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${safeMessage}</p>
          `,
          text: `Nueva consulta desde la web\n\nNombre: ${name}\nEmail de respuesta: ${replyEmail}\n\n${message}`
        })
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error("Resend rejected the contact email:", resendResponse.status, resendError);
        return responseJson({ message: "No se pudo enviar la consulta. Intentalo de nuevo." }, 502);
      }

      return responseJson({ sent: true });
    } catch (error) {
      console.error("Could not send contact email:", error);
      return responseJson({ message: "No se pudo enviar la consulta. Intentalo de nuevo." }, 500);
    }
  }
};
