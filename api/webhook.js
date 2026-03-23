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

// -------------------------------------------------------------------------
// 3. صيغة إيميل الإدارة عند رفض الدفع (Declined Payment Admin Alert)
// Declined Payment Notification Template
// -------------------------------------------------------------------------
const declinedEmailSubject = (name) => `⚠️ محاولة دفع مرفوضة: ${name}`;
const buildDeclinedEmailHtml = (invoiceId, name, email, whatsapp, jobTitle, details, amount, status) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h3 style="color: #cc0000;">⚠️ محاولة دفع مرفوضة</h3>
    <p>حاول مشترك الدفع لكن تم رفض عملية الدفع. يُنصح بالتواصل معه مباشرة.</p>
    <ul>
      <li><strong>الاسم:</strong> ${name || 'غير محدد'}</li>
      <li><strong>البريد الإلكتروني:</strong> ${email || 'غير محدد'}</li>
      <li><strong>الواتساب:</strong> ${whatsapp || 'غير محدد'}</li>
      <li><strong>المسمى الوظيفي:</strong> ${jobTitle || 'غير محدد'}</li>
      <li><strong>جهة العمل/تفاصيل:</strong> ${details || 'غير محدد'}</li>
      <li><strong>المبلغ الذي حاول الدفع:</strong> ${amount} ريال</li>
      <li><strong>سبب الرفض (الحالة):</strong> ${status}</li>
      <li><strong>رقم الفاتورة:</strong> ${invoiceId}</li>
    </ul>
    <p style="color: #cc0000;"><strong>يُرجى التواصل مع العميل لمساعدته في إتمام الدفع.</strong></p>
  </div>
`;
// =========================================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const payload = req.body;
        const invoiceId = payload.id;

        if (!invoiceId) {
            return res.status(400).json({ message: 'Missing Invoice ID' });
        }

        const moyasarSecret = process.env.MOYASAR_SECRET_KEY;
        if (!moyasarSecret) {
            return res.status(500).json({ message: 'Missing Moyasar Key' });
        }

        // Security: Verify the actual status of the invoice from Moyasar API
        // This prevents forged webhook requests from falsely confirming payments.
        const axios = (await import('axios')).default;
        const authHeader = 'Basic ' + Buffer.from(moyasarSecret + ':').toString('base64');

        // Attempt to fetch invoice from Moyasar
        let verifiedInvoice;
        try {
            const response = await axios.get(`https://api.moyasar.com/v1/invoices/${invoiceId}`, {
                headers: { 'Authorization': authHeader }
            });
            verifiedInvoice = response.data;
        } catch (err) {
            console.error('Failed to verify invoice with Moyasar:', err.message);
            return res.status(400).json({ message: 'Invalid invoice' });
        }

        // Check if the verified invoice status is indeed "paid"
        const isPaid = verifiedInvoice.status === 'paid';
        const isDeclined = ['failed', 'declined'].includes(verifiedInvoice.status);

        // If payment was declined/failed, send admin an alert email
        if (isDeclined) {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
                const { Resend } = await import('resend');
                const resend = new Resend(resendApiKey);
                const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
                })[m]);
                const metadata = verifiedInvoice.metadata || {};
                const { name, email, whatsapp, jobTitle, details } = metadata;
                const amount = verifiedInvoice.amount / 100;
                const declinedHtml = buildDeclinedEmailHtml(
                    escapeHtml(invoiceId),
                    escapeHtml(name),
                    escapeHtml(email),
                    escapeHtml(whatsapp),
                    escapeHtml(jobTitle),
                    escapeHtml(details || 'غير محدد'),
                    amount,
                    verifiedInvoice.status
                );
                await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: ADMIN_EMAIL,
                    subject: declinedEmailSubject(escapeHtml(name) || 'عميل غير معروف'),
                    html: declinedHtml,
                });
                console.log('Declined payment notification sent to admin.');
            }
            return res.status(200).json({ received: true, status: verifiedInvoice.status });
        }

        if (!isPaid) {
            return res.status(200).json({ received: true, status: verifiedInvoice.status });
        }

        // Now we trust the verified invoice data completely
        const amount = verifiedInvoice.amount / 100; // SAR
        const metadata = verifiedInvoice.metadata || {};

        const { name, email, whatsapp, jobTitle, details } = metadata;

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('RESEND_API_KEY is missing');
            return res.status(200).json({ message: 'Missing Resend key, email not sent' });
        }

        const { Resend } = await import('resend');
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

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
