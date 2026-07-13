import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

const ADMIN_EMAIL = "admin@iibs-sn.com";
const ADMIN_PASSWORD = "IIBS@2026";

let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
} catch {
  console.error(
    "❌ Impossible de lire serviceAccountKey.json",
    "\nTélécharge la clé depuis : Firebase Console → Paramètres du projet → Comptes de service → Générer une nouvelle clé privée",
    "\nPlace le fichier à la racine du projet (form/serviceAccountKey.json)"
  );
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

async function seed() {
  const auth = getAuth(app);

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (existing) {
      console.log(`⚠️  L'utilisateur ${ADMIN_EMAIL} existe déjà (uid: ${existing.uid}). Mise à jour du mot de passe...`);
      await auth.updateUser(existing.uid, { password: ADMIN_PASSWORD });
      console.log("✅ Mot de passe mis à jour avec succès.");
    } else {
      const user = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: "Admin IIBS",
        emailVerified: true,
      });
      console.log(`✅ Admin créé avec succès !`);
      console.log(`   Email : ${user.email}`);
      console.log(`   UID   : ${user.uid}`);
    }
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'admin :", err.message);
    process.exit(1);
  }
}

seed();
