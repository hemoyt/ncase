// =========================================================================
// إعدادات البريد الإلكتروني (Email Settings)
// =========================================================================

// IMPORTANT: To send emails, you MUST verify your domain (e.g., ncase.com.sa) in Resend.
// Replace 'info@ncase.com.sa' with your verified sender email from Resend.
const SENDER_EMAIL = 'NCASE <info@ncase.com.sa>';
// The admin email where you want to receive new client details
const ADMIN_EMAIL = 'info@ncase.com.sa';

// -------------------------------------------------------------------------
// 1. صيغة إيميل العميل (الذي يصل للمشترك بعد الدفع)
// Customer Confirmation Email Template
// -------------------------------------------------------------------------
const customerEmailSubject = 'تأكيد التسجيل والدفع - برنامج القيادة وإدارة التغيير';
const buildCustomerEmailHtml = (name, amount, whatsapp, invoiceUrl) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://ncase.com.sa/image/%D8%AA%D8%B5%D9%85%D9%8A%D9%85%20%D8%A8%D8%AF%D9%88%D9%86%20%D8%B9%D9%86%D9%88%D8%A7%D9%86.png" alt="NCASE Logo" style="max-width: 200px;" />
    </div>
    <h3>مرحباً ${name}،</h3>
    <p>نشكرك على تسجيلك في <strong>برنامج القيادة وإدارة التغيير</strong>.</p>
    <p>لقد استلمنا المبلغ (${amount} ريال) بنجاح، وتم تأكيد حجزك في البرنامج.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${invoiceUrl}" style="background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">عرض الفاتورة</a>
    </div>
    <p>سنقوم بالتواصل معك قريباً على رقم الواتساب (${whatsapp}) لتزويدك بكافة التفاصيل والتعليمات.</p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin-top: 0; color: #7C3097;">📅 تفاصيل البرنامج:</h4>
      <p style="margin: 5px 0;"><strong>التاريخ:</strong> الجمعة 24 أبريل والسبت 25 أبريل 2026</p>
      <p style="margin: 5px 0;"><strong>الوقت:</strong> 4:30 مساءً - 9:30 مساءً (5 ساعات يومياً)</p>
      <p style="margin: 5px 0;"><strong>المكان:</strong> فندق هيلتون - الرياض</p>
      <br/>
      <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=برنامج+القيادة+وإدارة+التغيير+-+NCASE&dates=20260424T133000Z/20260424T183000Z&details=برنامج+القيادة+وإدارة+التغيير+من+NCASE+يمتد+من+24+إلى+25+أبريل+في+فندق+هيلتون+الرياض&location=Hilton+Hotel,+Riyadh&recur=RRULE:FREQ=DAILY;COUNT=2" style="background-color: #7C3097; color: #ffffff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">إضافة إلى تقويم جوجل</a>
    </div>

    <p>نتطلع لرؤيتك!</p>
    <p>مع تحيات،<br/>فريق NCASE إن كيس</p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <div style="text-align: center; font-size: 14px; color: #666;">
      <p style="margin: 5px 0;"><strong>تواصل معنا:</strong></p>
      <p style="margin: 5px 0;">
        🌐 <a href="https://ncase.com.sa" style="color: #7C3097; text-decoration: none;">ncase.com.sa</a> | 
        📞 <a href="https://wa.me/966550650292" style="color: #7C3097; text-decoration: none;">+966 55 065 0292</a>
      </p>
      <p style="margin: 5px 0;">
        <a href="https://www.linkedin.com/company/ncase-consulting-group/" style="color: #7C3097; text-decoration: none;">LinkedIn</a> | 
        <a href="https://www.instagram.com/ncase.sa" style="color: #7C3097; text-decoration: none;">Instagram</a>
      </p>
    </div>
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

        // Verify webhook secret token to ensure request is from Moyasar
        const webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('CRITICAL: MOYASAR_WEBHOOK_SECRET is not configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        if (payload.secret_token !== webhookSecret) {
            return res.status(401).json({ message: 'Invalid secret token' });
        }

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

        const invoiceUrl = verifiedInvoice.url || `https://moyasar.com/invoices/${invoiceId}`;
        const ownerEmailHtml = buildAdminEmailHtml(escapeHtml(invoiceId), safeName, safeEmail, safeWhatsapp, safeJobTitle, safeDetails, amount);
        const userEmailHtml = buildCustomerEmailHtml(safeName, amount, safeWhatsapp, invoiceUrl);

        // Send email to owner
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: ADMIN_EMAIL,
            subject: adminEmailSubject(safeName),
            html: ownerEmailHtml,
        });

        // ics file content
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:برنامج القيادة وإدارة التغيير - NCASE
DTSTART:20260424T133000Z
DTEND:20260424T183000Z
RRULE:FREQ=DAILY;COUNT=2
LOCATION:Hilton Hotel, Riyadh
DESCRIPTION:برنامج القيادة وإدارة التغيير من NCASE
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:تذكير ببرنامج القيادة وإدارة التغيير
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

        // Send email to user (if valid email exists)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && emailRegex.test(email)) {
            await resend.emails.send({
                from: SENDER_EMAIL,
                to: email,
                subject: customerEmailSubject,
                html: userEmailHtml,
                attachments: [
                    {
                        filename: 'event.ics',
                        content: Buffer.from(icsContent, 'utf-8')
                    }
                ]
            });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
