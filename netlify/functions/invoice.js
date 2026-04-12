// liga-garden/netlify/functions/invoice.js

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appc8NrhAXkthRmVj';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const GREEN_INVOICE_API_KEY = '96fdbd5d-2d97-4fc6-877e-060e67313d0c';
const GREEN_INVOICE_SECRET = 'PVcaS>#FENIj%5s5-4<l"E7Ts"CZPSD9';

const ITEMS = [
  { name: 'אוסמוקוט', price: 55 },
  { name: 'אוראה', price: 27 },
  { name: 'גרנולר', price: 70 },
  { name: 'דשא חורף', price: 70 },
  { name: 'דשן', price: 85 },
  { name: 'חול', price: 15 },
  { name: 'חלוקי נחל', price: 43 },
  { name: 'טוף', price: 30 },
  { name: 'טפטפת', price: 2 },
  { name: 'כוסית עונתי', price: 2.5 },
  { name: 'כוסית רב עונתי', price: 4.5 },
  { name: 'מחבר', price: 30 },
  { name: 'מחבר שן', price: 4 },
  { name: 'מתז', price: 30 },
  { name: 'ראש מתז', price: 16 },
  { name: 'סרפיקו', price: 24 },
  { name: 'עציץ 10 ליטר', price: 85 },
  { name: 'עציץ 12 רב עונתי', price: 15 },
  { name: 'עציץ 12 עונתי', price: 11 },
  { name: 'עציץ 25 ליטר', price: 240 },
  { name: 'עציץ 4 ליטר', price: 45 },
  { name: 'צינור 32', price: 7 },
  { name: 'צינור 25', price: 5 },
  { name: 'צינור 16', price: 4 },
  { name: 'צינור טפטוף', price: 6 },
  { name: 'צמח מטפס', price: 85 },
  { name: 'קומודור', price: 35 },
  { name: 'קומפוסט', price: 25 },
  { name: 'קונפידור', price: 30 },
  { name: 'ריסוס יתושים', price: 35 },
  { name: 'ריסוס עשבים', price: 24 },
  { name: 'תערובת שתילה 50', price: 45 },
  { name: 'תערובת שתילה 80', price: 58 },
  { name: 'סוללה', price: 20 }
];

function parseMessage(message, clients) {
  let foundClient = null;
  for (const client of clients) {
    const nameParts = (client.name || '').split(' ');
    for (const part of nameParts) {
      if (part.length > 1 && message.includes(part)) {
        foundClient = client;
        break;
      }
    }
    if (foundClient) break;
  }

  const foundItems = [];
  for (const item of ITEMS) {
    if (message.includes(item.name)) {
      const regex = new RegExp(`(\\d+)\\s*${item.name}`);
      const match = message.match(regex);
      const quantity = match ? parseInt(match[1]) : 1;
      foundItems.push({ ...item, quantity });
    }
  }

  const hasTreatment = message.includes('טיפול');
  return { foundClient, foundItems, hasTreatment };
}

async function getGreenInvoiceToken() {
  console.log('Getting token, API_KEY:', GREEN_INVOICE_API_KEY.substring(0, 8));
  const resp = await fetch('https://api.morning.co/idp/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: GREEN_INVOICE_API_KEY,
      client_secret: GREEN_INVOICE_SECRET
    })
  });
  const data = await resp.json();
  console.log('Token response keys:', Object.keys(data).join(','));
  if (!data.accessToken) throw new Error('Failed to get token: ' + JSON.stringify(data));
  return data.accessToken;
}

async function getClientsFromAirtable() {
  const resp = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clients?fields[]=Client%20Name&fields[]=TreatmentPrice&fields[]=Email%20Address&fields[]=Phone%20Number`,
    { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
  );
  const data = await resp.json();
  if (!data.records) throw new Error('Airtable error: ' + JSON.stringify(data));
  return data.records.map(r => ({
    name: r.fields['Client Name'] || '',
    price: r.fields['TreatmentPrice'] || 0,
    email: r.fields['Email Address'] || '',
    phone: r.fields['Phone Number'] || ''
  }));
}

async function createInvoice(token, client, foundItems, hasTreatment) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  const lineItems = [];

  if (hasTreatment) {
    lineItems.push({
      catalogNum: 'טיפול',
      description: `טיפול ${today.toLocaleDateString('he-IL')}`,
      quantity: 1,
      price: client.price,
      vatType: 0
    });
  }

  for (const item of foundItems) {
    lineItems.push({
      catalogNum: item.name,
      description: item.name,
      quantity: item.quantity,
      price: item.price,
      vatType: 0
    });
  }

  const invoiceBody = {
    type: 300,
    lang: 'he',
    currency: 'ILS',
    vatType: 0,
    date: parseInt(dateStr),
    dueDate: parseInt(dateStr),
    client: { name: client.name, emails: client.email ? [client.email] : [], phone: client.phone || '' },
    income: lineItems,
    remarks: ''
  };

  console.log('Creating invoice:', JSON.stringify(invoiceBody).substring(0, 200));

  const resp = await fetch('https://api.morning.co/api/v1/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(invoiceBody)
  });

  const data = await resp.json();
  console.log('Invoice response:', JSON.stringify(data).substring(0, 200));
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const message = body.message;
    console.log('Message received:', message);
console.log('Clients count:', clients.length);
console.log('Found client:', foundClient ? foundClient.name : 'NOT FOUND');

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'חסרה הודעה' }) };
    }

    const clients = await getClientsFromAirtable();
    const { foundClient, foundItems, hasTreatment } = parseMessage(message, clients);

    if (!foundClient) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'error', message: `⚠️ לא זיהיתי לקוח בהודעה: "${message}"` })
      };
    }

    const token = await getGreenInvoiceToken();
    const invoice = await createInvoice(token, foundClient, foundItems, hasTreatment);

    const total = (hasTreatment ? foundClient.price : 0) +
      foundItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const itemsSummary = [
      hasTreatment ? `💼 טיפול: ₪${foundClient.price}` : '',
      ...foundItems.map(i => `➕ ${i.name} × ${i.quantity} = ₪${i.price * i.quantity}`)
    ].filter(Boolean).join('\n');

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        summary: `✅ חשבון עסקה נוצר!\n\n👤 ${foundClient.name}\n${itemsSummary}\n💰 סה"כ: ₪${total}\n\n🔗 ${invoice.editUrl || 'פתח חשבונית ירוקה'}`,
        invoiceId: invoice.id,
        editUrl: invoice.editUrl
      })
    };

  } catch (err) {
    console.error('Handler error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
