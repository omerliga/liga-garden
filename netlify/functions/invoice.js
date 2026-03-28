// liga-garden/netlify/functions/invoice.js
// מקבל הודעת וואצאפ, מפרק אותה, ויוצר חשבון עסקה בחשבונית ירוקה

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const GREEN_INVOICE_API_KEY = process.env.GREEN_INVOICE_API_KEY;
const GREEN_INVOICE_SECRET = process.env.GREEN_INVOICE_SECRET;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// רשימת פריטים מחשבונית ירוקה (מסונכרן מה-CSV)
const ITEMS = [
  { name: 'אוסמוקוט', description: 'דשן בשחרור איטי לדשא סטרטר (לפי ק"ג)', price: 55, id: '96292888-14e1-4696-9cdb-e0ec0dec67ec' },
  { name: 'אוראה', description: 'דשן', price: 27, id: 'd16529e9-0e25-400c-944b-566d54facac1' },
  { name: 'גרנולר', description: 'פיתיון לנמלים אדומות', price: 70, id: 'bdab9479-f3b7-4c1b-b775-d0fc38608532' },
  { name: 'דשא חורף', description: 'זרעי חורף רייגראס | 1 ק"ג עד 50 מ"ר', price: 70, id: '10ec5c46-1106-4042-8072-0a85191f97bc' },
  { name: 'דשן', description: 'דשן אביב מערכת השקיה', price: 85, id: '23ecb414-8da3-45a9-a3f5-d14851367725' },
  { name: 'חול', description: 'שקי חול', price: 15, id: 'ecc85c95-7c56-4bed-9ca3-9604b2c065c8' },
  { name: 'חלוקי נחל', description: 'חלוקי נחל', price: 43, id: '98d5d66f-961b-4350-98ca-cad24bdda23c' },
  { name: 'טוף', description: 'טוף', price: 30, id: '45927c2f-bbf6-400e-b0d0-cf84db0e6115' },
  { name: 'טפטפת', description: 'טפטפת', price: 2, id: '04ac52b3-4e2c-4317-ab3d-8948af94accf' },
  { name: 'כוסית עונתי', description: 'שתיל רב עונתי', price: 2.5, id: '7f834879-f27e-4250-b586-33eddc22166b' },
  { name: 'כוסית רב עונתי', description: 'שתיל רב יונית', price: 4.5, id: '0b6d6860-53bb-4659-af3c-6e469f92d4e0' },
  { name: 'מחבר', description: 'מחבר הברגה 25', price: 30, id: '48071c2b-2927-4883-bf03-59f602bfc3d6' },
  { name: 'מחבר שן', description: 'מחבר שן', price: 4, id: '9e0ac6de-aa8f-40c9-b49d-099a2f067d7e' },
  { name: 'מתז', description: 'מתז', price: 30, id: '4664545f-a75a-45cc-834c-8dc62719947b' },
  { name: 'ראש מתז', description: 'ראש מתז', price: 16, id: '4d487c75-5c3a-4b69-b93c-3209829e4373' },
  { name: 'סרפיקו', description: 'בונה שורשים', price: 24, id: 'c1641858-88a5-4ac9-8aad-efd463c519bc' },
  { name: 'עציץ 10 ליטר', description: '10 ליטר', price: 85, id: '54e769b8-6cb8-4355-b6a1-045f8c61228d' },
  { name: 'עציץ 12 רב עונתי', description: 'רב עונתי', price: 15, id: '801b883b-5a5a-4498-90c4-d5af4daff071' },
  { name: 'עציץ 12 עונתי', description: 'עונתי', price: 11, id: '7ad645ae-13f4-4e17-9612-3d8ea8edbbc7' },
  { name: 'עציץ 25 ליטר', description: '25 ליטר', price: 240, id: '2a7859f7-5137-46e8-95b7-9bd54e5789cb' },
  { name: 'עציץ 4 ליטר', description: 'עציץ 4 ליטר', price: 45, id: '568300a2-e918-4c99-abb3-7ca0510ff99c' },
  { name: 'צינור 32', description: 'צינור 32', price: 7, id: 'b47c082c-16d2-4b4e-832a-cdd2eb106700' },
  { name: 'צינור 25', description: 'צינור 25', price: 5, id: '9831e0ba-2a70-4d3f-ad1e-260903b855f4' },
  { name: 'צינור 16', description: 'צינור 16', price: 4, id: 'a2370221-eadc-4037-af01-4a948dc819fc' },
  { name: 'צינור טפטוף', description: 'צינור טפטוף 8', price: 6, id: 'd97004f1-e38a-4333-8867-8a08e3f5bd0e' },
  { name: 'צמח מטפס', description: 'צמח מטפס', price: 85, id: '709ede25-dc81-45d6-94f5-7f516fad22a4' },
  { name: 'קומודור', description: 'חומר נגד פטריות לדשא (5 ל\')', price: 35, id: 'ed0ca150-7286-409d-a16f-511bf4a639b3' },
  { name: 'קומפוסט', description: 'קומפוסט', price: 25, id: 'd47375a0-03bb-437c-898c-4f5636d42833' },
  { name: 'קונפידור', description: 'ריסוס נגד מזיקים', price: 30, id: 'a0fdabe2-c121-4d58-9d92-c91f46e227f6' },
  { name: 'ריסוס יתושים', description: 'חומר נגד יתושים', price: 35, id: '354e8498-7af3-473c-ba8b-ef121c28f578' },
  { name: 'ריסוס עשבים', description: 'ריסוס נגד עשבים', price: 24, id: '0cb8f86c-1dcf-4390-8150-10f3537eee6f' },
  { name: 'תערובת שתילה 50', description: 'תערובת שתילה 50 ליטר', price: 45, id: 'e41c3060-7b8b-43eb-981c-7d9956ca8581' },
  { name: 'תערובת שתילה 80', description: '80 ליטר תערובת', price: 58, id: '2855f99d-ab7c-4acb-bffe-bb9b048dff51' },
  { name: 'סוללה', description: 'סוללה 9V', price: 20, id: null } // יש להוסיף ב-Green Invoice ולעדכן ID
];

// שלב 1: קבל טוקן מחשבונית ירוקה
async function getGreenInvoiceToken() {
  const resp = await fetch('https://api.greeninvoice.co.il/api/v1/account/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: GREEN_INVOICE_API_KEY,
      secret: GREEN_INVOICE_SECRET
    })
  });
  const data = await resp.json();
  if (!data.token) throw new Error('Failed to get Green Invoice token');
  return data.token;
}

// שלב 2: קבל לקוחות מ-Airtable
async function getClientsFromAirtable() {
  const resp = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clients?fields[]=Client%20Name&fields[]=TreatmentPrice&fields[]=ClientID&fields[]=Email%20Address&fields[]=Phone%20Number`,
    { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
  );
  const data = await resp.json();
  return data.records.map(r => ({
    name: r.fields['Client Name'],
    price: r.fields['TreatmentPrice'],
    clientId: r.fields['ClientID'],
    email: r.fields['Email Address'],
    phone: r.fields['Phone Number']
  }));
}

// שלב 3: שלח ל-Claude לפרק את ההודעה
async function parseMessageWithClaude(message, clients) {
  const clientList = clients.map(c => `${c.name} (מחיר טיפול: ₪${c.price})`).join('\n');
  const itemList = ITEMS.map(i => `${i.name} - ₪${i.price}`).join('\n');

  const prompt = `אתה עוזר לגנן ישראלי לפרק הודעות לחשבוניות.

רשימת הלקוחות הקיימים:
${clientList}

רשימת הפריטים הקיימים:
${itemList}

הודעה לפרק:
"${message}"

הנחיות:
1. זהה את שם הלקוח גם אם יש שגיאת כתיב או שם חלקי
2. "טיפול" = מחיר הטיפול הקבוע של הלקוח
3. זהה תוספות וכמויות (לדוגמה "3 אוסמוקוט" = כמות 3)
4. אם לא בטוח בזיהוי — ציין זאת

החזר JSON בלבד בפורמט הזה:
{
  "clientName": "שם הלקוח המדויק מהרשימה",
  "confident": true/false,
  "treatmentDescription": "תיאור העבודה שנעשתה (לפירוט בחשבון)",
  "items": [
    { "name": "שם הפריט מהרשימה", "quantity": 1 }
  ],
  "notes": "הערות אם יש"
}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await resp.json();
  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// שלב 4: מצא לקוח ב-Green Invoice לפי שם
async function findClientInGreenInvoice(token, clientName, clientPhone) {
  const resp = await fetch(
    `https://api.greeninvoice.co.il/api/v1/clients?search=${encodeURIComponent(clientName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await resp.json();
  if (data.items && data.items.length > 0) {
    return data.items[0].id;
  }
  return null;
}

// שלב 5: צור חשבון עסקה בחשבונית ירוקה
async function createInvoice(token, client, parsed, clients) {
  const clientData = clients.find(c => c.name === parsed.clientName);
  if (!clientData) throw new Error(`לקוח לא נמצא: ${parsed.clientName}`);

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  // בנה רשימת פריטים
  const lineItems = [];

  // פריט טיפול ראשי
  lineItems.push({
    catalogNum: 'טיפול',
    description: `טיפול ${today.toLocaleDateString('he-IL')} - ${parsed.treatmentDescription}`,
    quantity: 1,
    price: clientData.price,
    vatType: 0 // לפני מע"מ
  });

  // תוספות
  for (const item of parsed.items) {
    const found = ITEMS.find(i =>
      i.name.includes(item.name) || item.name.includes(i.name)
    );
    if (found) {
      lineItems.push({
        catalogNum: found.name,
        description: found.description,
        quantity: item.quantity || 1,
        price: found.price,
        vatType: 0
      });
    }
  }

  // מצא ID לקוח ב-Green Invoice
  const greenClientId = await findClientInGreenInvoice(token, parsed.clientName, clientData.phone);

  const invoiceBody = {
    type: 300, // חשבון עסקה
    lang: 'he',
    currency: 'ILS',
    vatType: 0,
    date: parseInt(dateStr),
    dueDate: parseInt(dateStr),
    client: greenClientId ? { id: greenClientId } : {
      name: parsed.clientName,
      emails: clientData.email ? [clientData.email] : [],
      phone: clientData.phone || ''
    },
    income: lineItems,
    remarks: parsed.notes || ''
  };

  const resp = await fetch('https://api.greeninvoice.co.il/api/v1/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(invoiceBody)
  });

  const data = await resp.json();
  return data;
}

// Handler ראשי
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const message = body.message;

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'חסרה הודעה' }) };
    }

    // 1. קבל לקוחות מ-Airtable
    const clients = await getClientsFromAirtable();

    // 2. פרק הודעה עם Claude
    const parsed = await parseMessageWithClaude(message, clients);

    // אם Claude לא בטוח — החזר לאישור
    if (!parsed.confident) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'needs_confirmation',
          message: `⚠️ לא הצלחתי לזהות בוודאות:\nלקוח: ${parsed.clientName}\n\nבדוק ואשר או תקן.`,
          parsed
        })
      };
    }

    // 3. קבל טוקן Green Invoice
    const token = await getGreenInvoiceToken();

    // 4. צור חשבון עסקה
    const invoice = await createInvoice(token, null, parsed, clients);

    // 5. בנה סיכום להחזרה
    const clientData = clients.find(c => c.name === parsed.clientName);
    const total = clientData.price + parsed.items.reduce((sum, item) => {
      const found = ITEMS.find(i => i.name.includes(item.name) || item.name.includes(i.name));
      return sum + (found ? found.price * (item.quantity || 1) : 0);
    }, 0);

    const itemsSummary = parsed.items.map(item => {
      const found = ITEMS.find(i => i.name.includes(item.name) || item.name.includes(i.name));
      return `➕ ${item.name} × ${item.quantity || 1} = ₪${found ? found.price * (item.quantity || 1) : '?'}`;
    }).join('\n');

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        summary: `✅ חשבון עסקה נוצר!\n\n👤 ${parsed.clientName}\n💼 טיפול: ₪${clientData.price}\n${itemsSummary}\n💰 סה"כ לפני מע"מ: ₪${total}\n\n🔗 ${invoice.editUrl || 'פתח חשבונית ירוקה לאישור'}`,
        invoiceId: invoice.id,
        editUrl: invoice.editUrl
      })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
