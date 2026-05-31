const SUBJECTS = {
  recycling: 'Recycling Project Advisory',
  compliance: 'HKC / EU SRR Compliance',
  drydock: 'Drydock & Technical Support',
  port: 'Port Management',
  advisory: 'Maritime Advisory',
  training: 'Training & Certification',
  other: 'General Enquiry',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Mail service not configured' });

  try {
    const {
      fname, lname, email, company, subject, message,
      vessel_type, ldt,
      attachment_name, attachment_data,
    } = req.body || {};

    if (!fname || !lname || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subjectLabel = SUBJECTS[subject] || subject || 'New Enquiry';
    const vesselLine = vessel_type
      ? `<tr><td style="padding:6px 0;color:#888;width:140px">Vessel Type</td><td style="padding:6px 0">${vessel_type}</td></tr>`
      : '';
    const ldtLine = ldt
      ? `<tr><td style="padding:6px 0;color:#888">LDT</td><td style="padding:6px 0">${Number(ldt).toLocaleString()} LDT</td></tr>`
      : '';

    const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
  <tr><td style="background:#0A1628;padding:28px 36px">
    <p style="margin:0;color:#C8963E;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">TURQO MARINE</p>
    <p style="margin:4px 0 0;color:#F5EDE0;font-size:20px;font-weight:600">New Contact Enquiry</p>
  </td></tr>
  <tr><td style="padding:32px 36px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #eee;margin-bottom:24px;padding-bottom:24px">
      <tr><td style="padding:6px 0;color:#888;width:140px">From</td><td style="padding:6px 0;font-weight:600">${fname} ${lname}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#0A1628">${email}</a></td></tr>
      ${company ? `<tr><td style="padding:6px 0;color:#888">Company</td><td style="padding:6px 0">${company}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#888">Subject</td><td style="padding:6px 0">${subjectLabel}</td></tr>
      ${vesselLine}${ldtLine}
    </table>
    <p style="margin:0 0 8px;font-weight:600;color:#0A1628">Message</p>
    <p style="margin:0;color:#333;line-height:1.7;white-space:pre-wrap">${message}</p>
    ${attachment_name ? `<p style="margin:24px 0 0;padding:12px;background:#f9f9f9;border-radius:4px;font-size:13px;color:#666">📎 Attachment: <strong>${attachment_name}</strong></p>` : ''}
  </td></tr>
  <tr><td style="background:#f9f9f9;padding:16px 36px;font-size:12px;color:#999">
    Sent via turqomarine.com contact form. Reply directly to this email to respond to ${fname}.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    const payload = {
      from: 'Turqo Marine <noreply@turqomarine.com>',
      to: ['info@turqomarine.com'],
      reply_to: email,
      subject: `[Turqo Marine] ${subjectLabel} — ${fname} ${lname}`,
      html,
    };

    if (attachment_data && attachment_name) {
      payload.attachments = [{ filename: attachment_name, content: attachment_data }];
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Resend error:', err);
      return res.status(502).json({ error: 'Mail delivery failed' });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    res.status(500).json({ error: err.message });
  }
};
