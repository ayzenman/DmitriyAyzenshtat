import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, company } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const message = `
📩 <b>Новая заявка с сайта</b>

👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${phone}
✉️ <b>Email:</b> ${email}
🏢 <b>Компания и оборот:</b> ${company || 'не указано'}
  `.trim();

  try {
    const telegramUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
