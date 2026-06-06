const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "Walletiz <onboarding@resend.dev>";

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

type InviteParams = {
  to: string;
  inviteLink: string;
  restaurantName: string;
};

function buildInviteHtml({ inviteLink, restaurantName }: Omit<InviteParams, "to">): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bienvenue sur Walletiz</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf7f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;background:#7a1226;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;letter-spacing:-0.5px;">Walletiz</h1>
              <p style="margin:6px 0 0;font-size:12px;opacity:0.9;letter-spacing:1px;text-transform:uppercase;">Menus digitaux QR</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Bienvenue ${escapeHtml(restaurantName)} !</h2>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#4b5563;">
                Votre compte restaurateur Walletiz a été créé. Cliquez sur le bouton ci-dessous pour activer votre compte et définir votre mot de passe.
              </p>
              <p style="margin:24px 0;text-align:center;">
                <a href="${inviteLink}" style="display:inline-block;background:#7a1226;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
                  Activer mon compte
                </a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
              </p>
              <p style="margin:8px 0 0;font-size:12px;word-break:break-all;color:#9ca3af;background:#f9fafb;padding:10px;border-radius:6px;">
                ${inviteLink}
              </p>
              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
                Ce lien est valable 1 heure. Si vous n'attendiez pas cet email, ignorez-le simplement.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                © Walletiz — Menus digitaux pour restaurants
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInviteEmail(params: InviteParams): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    return {
      ok: false,
      error: "RESEND_API_KEY non configurée côté serveur.",
    };
  }

  const html = buildInviteHtml(params);
  const subject = `Bienvenue sur Walletiz — Activez votre compte ${params.restaurantName}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [params.to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Resend HTTP ${res.status}: ${body.slice(0, 300)}`,
      };
    }

    const data = await res.json();
    return { ok: true, id: data.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
