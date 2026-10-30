export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() ?? '';

export const isContactConnected = endpoint.length > 0;

export async function sendContactMessage(message: ContactMessage, honeypot = ''): Promise<void> {
  if (honeypot) return;

  if (!isContactConnected) {
    await new Promise((resolve) => setTimeout(resolve, 1100));
    console.info('[contact] Preview mode: set VITE_CONTACT_ENDPOINT to deliver messages.', message);
    return;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...message, _subject: message.subject || `New message from ${message.name}` }),
  });

  if (!response.ok) {
    throw new Error(`The form service answered with status ${response.status}.`);
  }
}
