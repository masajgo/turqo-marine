const SOURCE = 'https://www.go-shipping.net/demolition-market';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=14400, max-age=3600');

  try {
    const upstream = await fetch(SOURCE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TurqoMarine/1.0; +https://turqomarine.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) throw new Error('upstream ' + upstream.status);
    const html = await upstream.text();

    const countries = [];
    const rx = /<div class="section-newscnt__price-level__title">([^<]+)<\/div>\s*<p class="section-newscnt__price-level__descr">([\s\S]*?)<\/p>/g;
    let m;
    while ((m = rx.exec(html)) !== null) {
      const name = m[1].trim();
      const lines = m[2]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map(function (l) { return l.trim(); })
        .filter(Boolean);

      const entry = { name: name, wet: '', dry: '', container: '', sentiment: '' };
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
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

    const dateMatch = html.match(/Last update:\s*(\d+\s+[A-Za-z]+\s+\d{4})/);
    const lastUpdate = dateMatch ? dateMatch[1].trim() : null;

    res.status(200).json({ countries: countries, lastUpdate: lastUpdate, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
