// File: netlify/functions/analyze.js
// Questo codice viene eseguito sui server di Netlify, non nel browser.

// Importa il modulo 'fetch' se stai usando una versione di Node.js che non lo include di default.
// Netlify di solito lo gestisce, ma è una buona pratica.
const fetch = require('node-fetch');

exports.handler = async function (event) {
  // Accetta solo richieste di tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Prende i dati inviati dal frontend (l'immagine e il prompt)
    const { base64ImageData, prompt } = JSON.parse(event.body);

    // Prende la chiave API segreta dalle Variabili d'Ambiente di Netlify
    // Questo è il passaggio cruciale per la sicurezza.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Se la chiave non è impostata su Netlify, restituisce un errore chiaro.
      console.error('La variabile d\'ambiente GEMINI_API_KEY non è impostata.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'La chiave API del server non è configurata.' })
      };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        paers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Se Google restituisce un errore, lo inoltriamo per il debug.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Errore dall\'API di Gemini:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Errore durante la comunicazione con l\'API di Gemini.' })
      };
    }

    const result = await response.json();

    // Invia il risultato di successo di nuovo al browser dell'utente
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    // Gestisce qualsiasi altro errore imprevisto
    console.error('Errore nella funzione Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
rts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    // Esegue la vera chiamata all'API di Gemini, dal server sicuro di Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      head