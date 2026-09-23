// Funzione Vercel: inoltra la foto e le istruzioni a Claude usando la tua chiave API.
// Variabili d'ambiente (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  obbligatoria — la tua chiave da console.anthropic.com
//   ACCESS_CODE        facoltativa — se impostata, l'app chiede questo codice prima di usare Claude
//   CLAUDE_MODEL       facoltativa — modello da usare (predefinito: claude-sonnet-5)

const MAX_PROMPT = 20000;          // caratteri
const MAX_IMAGE_B64 = 5_500_000;   // circa 4 MB di immagine
const ALLOWED = ['image/jpeg', 'image/png'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ code: 'method_not_allowed' });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ code: 'not_configured' });

  const accessCode = process.env.ACCESS_CODE;
  if (accessCode && req.headers['x-access-code'] !== accessCode) {
    return res.status(401).json({ code: 'bad_code' });
  }

  const body = req.body || {};
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const images = Array.isArray(body.images) ? body.images.slice(0, 2) : [];
  if (!prompt || prompt.length > MAX_PROMPT) return res.status(400).json({ code: 'invalid_request' });
  for (const im of images) {
    if (!im || !ALLOWED.includes(im.media_type) || typeof im.data !== 'string' || im.data.length > MAX_IMAGE_B64) {
      return res.status(400).json({ code: 'image_rejected' });
    }
  }

  const content = [
    ...images.map((im) => ({ type: 'image', source: { type: 'base64', media_type: im.media_type, data: im.data } })),
    { type: 'text', text: prompt },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const code = r.status === 429 ? 'rate_limited' : 'upstream_error';
      return res.status(r.status === 429 ? 429 : 502).json({ code, message: j && j.error ? j.error.message : undefined });
    }
    const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ code: 'upstream_error' });
  }
};
