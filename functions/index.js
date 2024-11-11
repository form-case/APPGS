const functions = require("firebase-functions");
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const fs = require("fs");

// Cargar credenciales del archivo JSON descargado
const credentials = JSON.parse(fs.readFileSync("service-account-key.json"));

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // Necesario para parsear JSON en solicitudes POST

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

// Ruta para obtener datos de Google Sheets (HOLD USRAP)
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

// Ruta para actualizar Google Sheets (HOLD USRAP)
app.post("/", async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    if (!req.body.data) {
      res.status(400).send("Datos no proporcionados en la solicitud");
      return;
    }

    const { data } = req.body;

    // Añadir la fecha y hora actual
    const timestamp = new Date().toLocaleString();
    const updatedData = data.map((row) => [...row, timestamp]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "HOLD USRAP!A:CY",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: updatedData,
      },
    });

    res.status(200).send("Datos guardados exitosamente en Google Sheets");
  } catch (error) {
    console.error("Error al actualizar Google Sheets:", error);
    res.status(500).send("Error al guardar los datos");
  }
});

// Ruta para obtener datos de seguimiento desde Google Sheets (Follow)
app.get("/getFollow", async (req, res) => {
  try {
    const { caseCode } = req.query;

    if (!caseCode) {
      res.status(400).send("Código de caso no proporcionado");
      return;
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Follow!A:H", // Obtener las columnas A a H de la hoja Follow, incluyendo la columna de timestamp
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const filteredRows = rows.filter((row) => row[0] === caseCode);

    res.status(200).send([headers, ...filteredRows]);
  } catch (error) {
    console.error("Error al obtener datos de seguimiento:", error);
    res.status(500).send("Error al obtener los datos de seguimiento");
  }
});

// Ruta para agregar un seguimiento a Google Sheets (Follow)
app.post("/addFollow", async (req, res) => {
  try {
    const { caseCode, followData } = req.body;

    if (!caseCode || !followData) {
      res.status(400).send("Código de caso o datos de seguimiento no proporcionados");
      return;
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Añadir la fecha y hora actual
    const timestamp = new Date().toLocaleString();
    const newFollowRow = [caseCode, ...followData, timestamp];

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "Follow!A:H", // Asegúrate de incluir la columna A que tiene el código del caso
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newFollowRow],
      },
    });

    res.status(200).send("Seguimiento guardado exitosamente en Google Sheets");
  } catch (error) {
    console.error("Error al agregar seguimiento:", error);
    res.status(500).send("Error al guardar el seguimiento");
  }
});

// Ruta para verificar la conectividad
app.get("/", (req, res) => {
  res.send("La función está funcionando correctamente");
});

// Exportar la función de Firebase
exports.updateGoogleSheet = functions.https.onRequest(app);
