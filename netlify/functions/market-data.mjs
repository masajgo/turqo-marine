const SOURCE = 'https://www.go-shipping.net/demolition-market';
const TIMEOUT = 10_000;

export default async () => {
  try {
    const res = await fetch(SOURCE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TurqoMarine/1.0; +https://turqomarine.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const html = await res.text();

    // Parse country blocks
    const countries = [];
    const rx = /<div class="section-newscnt__price-level__title">([^<]+)<\/div>\s*<p class="section-newscnt__price-level__descr">([\s\S]*?)<\/p>/g;
    let m;
    while ((m = rx.exec(html)) !== null) {
      const name = m[1].trim();
      const lines = m[2]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const entry = { name, wet: '', dry: '', container: '', sentiment: '' };
      for (const line of lines) {
        if (/^Wet/i.test(line))
          entry.wet = line.replace(/Wet\s*-\s*USD\$\s*/i, '').replace(/\s*per LDT/i, '').trim();
        else if (/^Dry/i.test(line))
          entry.dry = line.replace(/Dry\s*-\s*USD\$\s*/i, '').replace(/\s*per LDT/i, '').trim();
        else if (/^Container/i.test(line))
          entry.container = line.replace(/Container\s*-\s*USD\$\s*/i, '').replace(/\s*per LDT/i, '').trim();
        else if (/^Market Sentiment/i.test(line))
          entry.sentiment = line.replace(/^Market Sentiment:\s*/i, '').trim();
      }
      if (entry.wet) countries.push(entry);
    }

    // Parse last update date
    const dateMatch = html.match(/Last update:\s*(\d+\s+[A-Za-z]+\s+\d{4})/);
    const lastUpdate = dateMatch ? dateMatch[1].trim() : null;

    const payload = {
      countries,
      lastUpdate,
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=14400, max-age=3600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const config = { path: '/api/market-data' };
