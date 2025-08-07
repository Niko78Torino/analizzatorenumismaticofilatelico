// File: netlify/functions/analyze.js
// Questo codice viene eseguito sui server di Netlify, non nel browser.

const fetch = require('node-fetch');

exports.handler = async function (event) {
  // Accetta solo richieste di tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Prende i dati inviati dal frontend. 'base64ImageDataBack' può essere null.
    const { base64ImageDataFront, base64ImageDataBack, prompt } = JSON.parse(event.body);
    
    // Prende la chiave API segreta dalle Variabili d'Ambiente di Netlify
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

    // Costruisce dinamicamente le parti della richiesta per Gemini
    const parts = [
      { text: prompt },
      // Aggiunge sempre la prima immagine (fronte o francobollo)
      { inlineData: { mimeType: "image/jpeg", data: base64ImageDataFront } }
    ];

    // Se c'è una seconda immagine (il retro della moneta), la aggiunge alla richiesta
    if (base64ImageDataBack) {
      parts.push({ text: "Questa è l'altra faccia della moneta (retro)." });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: base64ImageDataBack } });
    }

    const payload = {
      contents: [{ parts: parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    // Esegue la vera chiamata all'API di Gemini, dal server sicuro di Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
