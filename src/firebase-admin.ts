// src/firebase-admin.ts
import admin from "firebase-admin";
import path from "path";
import fs from "fs";

if (!admin.apps.length) {
  // Ruta por env o, por defecto, raíz del proyecto (NUNCA en public/)
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(process.cwd(), "serviceAccountKey.json");

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      [
        "Firebase service account JSON not found.",
        `Tried: ${serviceAccountPath}`,
        "Fix:",
        "- Move your service account JSON to the project root and rename it to `serviceAccountKey.json` (recommended), OR",
        "- Set `FIREBASE_SERVICE_ACCOUNT_PATH` in your backend `.env` to the absolute/relative path of the JSON file.",
      ].join("\n"),
    );
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };