const functions = require("firebase-functions");
const express = require("express");
const { google } = require("googleapis");
const env = require("./env.json");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

// Configura las credenciales de Google usando el archivo env.json
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.google.client_email,
    private_key: env.google.private_key.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ID de tu hoja de Google Sheets
const spreadsheetId = "1b3wUkfYsC0afHkPNxIP_05kkD005K-IXhzTS3zZnEgo";

// Ruta para actualizar Google Sheets
app.post("/", async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    if (!req.body.data) {
      res.status(400).send("Datos no proporcionados en la solicitud");
      return;
    }

    const { data } = req.body;

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "HOLD USRAP!A:CY",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: data,
      },
    });

    res.status(200).send("Datos guardados exitosamente en Google Sheets");
  } catch (error) {
    console.error("Error al actualizar Google Sheets:", error);
    res.status(500).send("Error al guardar los datos");
  }
});

// Ruta para verificar la conectividad
app.get("/", (req, res) => {
  res.send("La función está funcionando correctamente");
});

// Exportar la función de Firebase
exports.updateGoogleSheet = functions.https.onRequest(app);
