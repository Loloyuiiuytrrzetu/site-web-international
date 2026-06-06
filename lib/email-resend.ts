const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "Walletiz <onboarding@resend.dev>";

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

type InviteParams = {
  to: string;
  inviteLink: string;
  otpCode: string;
  restaurantName: string;
  setupUrl: string;
};

function buildInviteHtml({
  inviteLink,
  otpCode,
  restaurantName,
  setupUrl,
}: Omit<InviteParams, "to">): string {
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
                Votre compte restaurateur Walletiz a été créé. Pour activer votre compte, utilisez le <strong>code d'activation</strong> ci-dessous :
              </p>

              <div style="background:#faf7f2;border:2px solid #7a1226;border-radius:14px;padding:24px;text-align:center;margin:20px 0;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#7a1226;">Votre code d'activation</p>
                <p style="margin:0;font-size:38px;font-weight:700;letter-spacing:6px;color:#1f2937;font-family:'Courier New',monospace;">${escapeHtml(otpCode)}</p>
                <p style="margin:6px 0 0;font-size:10px;color:#7a1226;">Tapez-le en entier, zéros du début inclus</p>
              </div>

              <p style="margin:24px 0 12px;font-size:14px;color:#4b5563;line-height:1.5;">
                <strong>Comment activer mon compte ?</strong>
              </p>
              <ol style="margin:0;padding-left:20px;font-size:14px;color:#4b5563;line-height:1.7;">
                <li>Cliquez sur le bouton ci-dessous</li>
                <li>Entrez votre email et le code complet</li>
                <li>Choisissez votre mot de passe</li>
              </ol>

              <p style="margin:24px 0;text-align:center;">
                <a href="${setupUrl}" style="display:inline-block;background:#7a1226;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
                  Aller à la page d'activation
                </a>
              </p>

              <p style="margin:32px 0 0;padding:12px;background:#f9fafb;border-radius:6px;font-size:12px;color:#6b7280;line-height:1.5;">
                <strong>Astuce :</strong> Si le bouton ne fonctionne pas, allez sur <a href="${setupUrl}" style="color:#7a1226;">${setupUrl}</a> et entrez votre email + le code.
              </p>

              <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">
                Ce code est valable 1 heure. Si vous n'attendiez pas cet email, ignorez-le simplement.
              </p>

              <p style="margin:8px 0 0;font-size:10px;color:#cbd5e1;line-height:1.4;word-break:break-all;">
                Lien direct (avancé) : ${inviteLink}
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
  const subject = `Code d'activation Walletiz : ${params.otpCode}`;

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
