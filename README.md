# Casa Studio

Costruisci una casa in 3D, modifica le foto di case vere e sostituisci gli oggetti con modelli 3D.

## Pubblicare su Vercel

1. Crea un nuovo repository su GitHub (per esempio `casa-studio`) e carica tutti i file di questa cartella, compresa la cartella `api`.
2. Su vercel.com: **Add New… → Project**, scegli il repository e premi **Deploy**. Non serve cambiare nessuna impostazione.
3. Per attivare «Rileva le parti con Claude», in **Settings → Environment Variables** aggiungi:
   - `ANTHROPIC_API_KEY` = la tua chiave da console.anthropic.com
   - `ACCESS_CODE` = una parola a tua scelta (consigliato: chi apre il sito deve inserirla per usare Claude)
4. Vai su **Deployments** e fai **Redeploy**, così le variabili vengono lette.

Senza la chiave il sito funziona lo stesso: si possono solo selezionare le parti a mano.

## Costi

Ogni foto analizzata usa la tua chiave API. Imposta un limite di spesa mensile in console.anthropic.com → Settings → Limits.
