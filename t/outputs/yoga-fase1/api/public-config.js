function firstEnvironmentValue(names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

export default {
  async fetch() {
    const url = firstEnvironmentValue([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_URL"
    ]);
    const publishableKey = firstEnvironmentValue([
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_ANON_KEY"
    ]);

    if (!url || !publishableKey) {
      return Response.json({ message: "Falta la configuracion publica de Supabase." }, {
        status: 500,
        headers: { "Cache-Control": "no-store" }
      });
    }

    return Response.json({ url, publishableKey }, {
      headers: { "Cache-Control": "no-store" }
    });
  }
};
