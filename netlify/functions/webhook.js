const axios = require('axios');
const { Resend } = require('resend');

// =========================================================================
// إعدادات البريد الإلكتروني (Email Settings)
// =========================================================================

// IMPORTANT: To send emails, you MUST verify your domain (e.g., ncase.com.sa) in Resend.
// Replace 'info@ncase.com.sa' with your verified sender email from Resend.
const SENDER_EMAIL = 'NCASE <info@ncase.com.sa>';
// The admin email where you want to receive new client details
const ADMIN_EMAIL = 'hello@ibrahemahmed.com';

// -------------------------------------------------------------------------
// 1. صيغة إيميل العميل (الذي يصل للمشترك بعد الدفع)
// Customer Confirmation Email Template
// -------------------------------------------------------------------------
const customerEmailSubject = 'تأكيد التسجيل والدفع - برنامج القيادة وإدارة التغيير';
const buildCustomerEmailHtml = (name, amount, whatsapp) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h3>مرحباً ${name}،</h3>
    <p>نشكرك على تسجيلك في <strong>برنامج القيادة وإدارة التغيير</strong>.</p>
    <p>لقد استلمنا المبلغ (${amount} ريال) بنجاح، وتم تأكيد حجزك في البرنامج.</p>
    <p>سنقوم بالتواصل معك قريباً على رقم الواتساب (${whatsapp}) لتزويدك بكافة التفاصيل والتعليمات.</p>
    <br/>
    <p>نتطلع لرؤيتك!</p>
    <p>مع تحيات،<br/>فريق NCASE إن كيس</p>
  </div>
`;

// -------------------------------------------------------------------------
// 2. صيغة إيميل الإدارة (الذي يصلك عند تسجيل عميل جديد)
// Admin Notification Email Template
// -------------------------------------------------------------------------
const adminEmailSubject = (name) => `تسجيل جديد مدفوع: ${name}`;
const buildAdminEmailHtml = (invoiceId, name, email, whatsapp, jobTitle, details, amount) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h3>تسجيل جديد (دفع مؤكد) ✅</h3>
    <p>تم تسجيل مشترك جديد في برنامج القيادة وإدارة التغيير. وتم تأكيد الدفع (الفاتورة: ${invoiceId}).</p>
    <ul>
      <li><strong>الاسم:</strong> ${name}</li>
      <li><strong>البريد الإلكتروني:</strong> ${email}</li>
      <li><strong>الواتساب:</strong> ${whatsapp}</li>
      <li><strong>المسمى الوظيفي:</strong> ${jobTitle}</li>
      <li><strong>جهة العمل/تفاصيل:</strong> ${details}</li>
      <li><strong>المبلغ المدفوع:</strong> ${amount} ريال</li>
    </ul>
  </div>
`;
// =========================================================================

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        let payload = {};
        try {
            payload = JSON.parse(event.body);
        } catch (e) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON' }) };
        }

        const invoiceId = payload.id;

        if (!invoiceId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing Invoice ID' }) };
        }

        const moyasarSecret = process.env.MOYASAR_SECRET_KEY;
        if (!moyasarSecret) {
            return { statusCode: 500, body: JSON.stringify({ message: 'Missing Moyasar Key' }) };
        }

        const authHeader = 'Basic ' + Buffer.from(moyasarSecret + ':').toString('base64');

        // Attempt to fetch invoice from Moyasar to verify it
        let verifiedInvoice;
        try {
            const response = await axios.get(`https://api.moyasar.com/v1/invoices/${invoiceId}`, {
                headers: { 'Authorization': authHeader }
            });
            verifiedInvoice = response.data;
        } catch (err) {
            console.error('Failed to verify invoice with Moyasar:', err.message);
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid invoice' }) };
        }

        if (verifiedInvoice.status !== 'paid') {
            return { statusCode: 200, body: JSON.stringify({ received: true, status: verifiedInvoice.status }) };
        }

        const amount = verifiedInvoice.amount / 100; // SAR
        const metadata = verifiedInvoice.metadata || {};

        const { name, email, whatsapp, jobTitle, details } = metadata;

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('RESEND_API_KEY is missing');
            return { statusCode: 200, body: JSON.stringify({ message: 'Missing Resend key, email not sent' }) };
        }

        const resend = new Resend(resendApiKey);

        // Helper to sanitize HTML to prevent XSS
        const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeWhatsapp = escapeHtml(whatsapp);
        const safeJobTitle = escapeHtml(jobTitle);
        const safeDetails = escapeHtml(details || 'غير محدد');

        const ownerEmailHtml = buildAdminEmailHtml(escapeHtml(invoiceId), safeName, safeEmail, safeWhatsapp, safeJobTitle, safeDetails, amount);
        const userEmailHtml = buildCustomerEmailHtml(safeName, amount, safeWhatsapp);

        // Send email to owner
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: ADMIN_EMAIL,
            subject: adminEmailSubject(safeName),
            html: ownerEmailHtml,
        });

        // Send email to user (if email exists)
        if (email) {
            await resend.emails.send({
                from: SENDER_EMAIL,
                to: email,
                subject: customerEmailSubject,
                html: userEmailHtml,
            });
        }

        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    } catch (error) {
        console.error('Webhook error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
