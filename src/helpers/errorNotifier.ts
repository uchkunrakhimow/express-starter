import crypto from 'node:crypto';
import { Telegraf } from 'telegraf';

const TELEGRAM_BOT_TOKEN = process.env['BOT_TOKEN']!;
const TELEGRAM_CHAT_ID = process.env['BOT_CHAT_ID']!;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export async function errorNotifier(error: Error) {
  const errorID = crypto.randomBytes(3).toString('hex').slice(0, 5);
  const errorLog = {
    id: errorID,
    message: error.message || 'Unknown error',
    stack: error.stack || '',
  };

  const message = `
🚨 *Error Logged* 🚨

*ID*: #${errorLog.id}
*Message*: ${errorLog.message}
*Stack*: \`${errorLog.stack}\`
  `;
  try {
    await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'Markdown',
    });
    console.log('Error notification sent to Telegram.');
  } catch (err) {
    console.error('Failed to send error notification to Telegram:', err);
  }
}
