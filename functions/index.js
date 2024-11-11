const functions = require("firebase-functions");
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const fs = require("fs");

// Cargar credenciales del archivo JSON descargado
const credentials = JSON.parse(fs.readFileSync("service-account-key.json"));

const app = express();
app.use(cors({ origin: true }));

// Configurar autenticación con las credenciales de la cuenta de servicio
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ID de tu hoja de Google Sheets
const spreadsheetId = "1b3wUkfYsC0afHkPNxIP_05kkD005K-IXhzTS3zZnEgo";

// Ruta para obtener datos de Google Sheets
app.get("/get", async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "HOLD USRAP!A:CY",
    });

    res.status(200).send(response.data.values);
  } catch (error) {
    console.error("Error al obtener datos de Google Sheets:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

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
