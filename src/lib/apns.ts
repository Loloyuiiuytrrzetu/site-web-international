// Envoi de push APNs pour Apple Wallet.
//
// Pour mettre à jour une passe, Apple veut un push « vide » envoyé à APNs,
// authentifié par le certificat Pass Type ID (le même que pour signer la passe).
// L'appareil reçoit ce push silencieux puis rappelle notre service web pour
// récupérer la passe à jour ; la notification visible est produite par le
// `changeMessage` du champ modifié.
//
// On utilise le module http2 natif de Node (pas de dépendance externe).

import http2 from "http2";
import { appleConfig } from "@/lib/apple-wallet";

const APNS_HOST = process.env.APNS_HOST || "https://api.push.apple.com";

/**
 * Envoie un push de mise à jour de passe à une liste de jetons APNs.
 * Renvoie le nombre d'envois acceptés (statut 200).
 */
export async function sendPassPush(pushTokens: string[]): Promise<number> {
  const cfg = appleConfig();
  if (!cfg || pushTokens.length === 0) return 0;

  return new Promise<number>((resolve) => {
    let client: http2.ClientHttp2Session;
    try {
      client = http2.connect(APNS_HOST, {
        cert: cfg.signerCert,
        key: cfg.signerKey,
        passphrase: cfg.signerKeyPassphrase,
      });
    } catch {
      resolve(0);
      return;
    }

    let ok = 0;
    let pending = pushTokens.length;
    const finish = () => {
      if (--pending <= 0) {
        client.close();
        resolve(ok);
      }
    };

    client.on("error", () => resolve(ok));

    for (const token of pushTokens) {
      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${token}`,
        "apns-topic": cfg.passTypeId,
        "apns-push-type": "background",
        "apns-priority": "5",
      });
      let status = 0;
      req.on("response", (headers) => {
        status = Number(headers[":status"]) || 0;
      });
      req.on("data", () => {});
      req.on("end", () => {
        if (status === 200) ok++;
        finish();
      });
      req.on("error", () => finish());
      req.write(JSON.stringify({})); // payload vide = simple mise à jour de passe
      req.end();
    }
  });
}
