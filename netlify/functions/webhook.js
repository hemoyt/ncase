const axios = require('axios');
const { Resend } = require('resend');

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
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 620px; margin: 0 auto; color: #222;">

    <!-- Header -->
    <div style="background-color: #7C3097; padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
      <img src="https://ncase.com.sa/image/%D8%AA%D8%B5%D9%85%D9%8A%D9%85%20%D8%A8%D8%AF%D9%88%D9%86%20%D8%B9%D9%86%D9%88%D8%A7%D9%86.png" alt="NCASE Logo" style="max-width: 160px;" />
    </div>

    <!-- Body -->
    <div style="background-color: #ffffff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">

      <h2 style="color: #7C3097; margin-top: 0;">مرحباً ${name} 👋</h2>
      <p>نشكرك على تسجيلك في <strong>برنامج القيادة وإدارة التغيير</strong>.</p>
      <p>لقد استلمنا مبلغ <strong>${amount} ريال</strong> بنجاح، وتم تأكيد حجزك في البرنامج.</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${invoiceUrl}" style="background-color: #28a745; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">🧾 عرض الفاتورة</a>
      </div>

      <p>سنتواصل معك قريباً على الواتساب (<strong>${whatsapp}</strong>) لتزويدك بكافة التفاصيل والتعليمات.</p>

      <!-- Event Details -->
      <div style="background-color: #f5eefa; padding: 20px; border-radius: 10px; margin: 24px 0; border-right: 4px solid #7C3097;">
        <h3 style="margin-top: 0; color: #7C3097;">📅 تفاصيل البرنامج</h3>
        <p style="margin: 6px 0;">📍 <strong>المكان:</strong> فندق هيلتون — الرياض</p>
        <p style="margin: 6px 0;">🗓️ <strong>التواريخ:</strong> الجمعة 24 أبريل والسبت 25 أبريل 2026</p>
        <p style="margin: 6px 0;">🕓 <strong>الوقت:</strong> 4:30 مساءً — 9:30 مساءً (5 ساعات يومياً)</p>
      </div>

      <!-- Timeline -->
      <h3 style="color: #7C3097;">🗓️ الجدول الزمني للبرنامج</h3>

      <!-- Day 1 -->
      <div style="border: 1px solid #e0cced; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 12px 0; color: #7C3097;">اليوم الأول — الجمعة 24 أبريل 2026</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>4:30 م</strong></td>
            <td style="padding: 8px 12px;">استقبال المشاركين والتسجيل</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>5:00 م</strong></td>
            <td style="padding: 8px 12px;">الجلسة الأولى — مفاهيم القيادة وإدارة التغيير</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>7:00 م</strong></td>
            <td style="padding: 8px 12px;">استراحة</td>
          </tr>
          <tr>
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>7:30 م</strong></td>
            <td style="padding: 8px 12px;">الجلسة الثانية — تطبيقات عملية وورش عمل</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 14px;">
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=برنامج+القيادة+وإدارة+التغيير+%28اليوم+1%29+-+NCASE&dates=20260424T133000Z/20260424T183000Z&details=برنامج+القيادة+وإدارة+التغيير+من+NCASE+-+فندق+هيلتون+الرياض&location=Hilton+Hotel,+Riyadh" style="background-color: #7C3097; color: #ffffff; padding: 9px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; display: inline-block;">➕ أضف اليوم الأول للتقويم</a>
        </div>
      </div>

      <!-- Day 2 -->
      <div style="border: 1px solid #e0cced; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #7C3097;">اليوم الثاني — السبت 25 أبريل 2026</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>4:30 م</strong></td>
            <td style="padding: 8px 12px;">استقبال المشاركين</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>5:00 م</strong></td>
            <td style="padding: 8px 12px;">الجلسة الثالثة — استراتيجيات التغيير المؤسسي</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0e6f8;">
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>7:00 م</strong></td>
            <td style="padding: 8px 12px;">استراحة</td>
          </tr>
          <tr>
            <td style="padding: 8px 4px; color: #7C3097; white-space: nowrap;"><strong>7:30 م</strong></td>
            <td style="padding: 8px 12px;">الجلسة الرابعة — خطط العمل الفردية والختام</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 14px;">
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=برنامج+القيادة+وإدارة+التغيير+%28اليوم+2%29+-+NCASE&dates=20260425T133000Z/20260425T183000Z&details=برنامج+القيادة+وإدارة+التغيير+من+NCASE+-+فندق+هيلتون+الرياض&location=Hilton+Hotel,+Riyadh" style="background-color: #7C3097; color: #ffffff; padding: 9px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; display: inline-block;">➕ أضف اليوم الثاني للتقويم</a>
        </div>
      </div>

      <p style="color: #555; font-size: 13px; background-color: #fffbe6; padding: 10px 14px; border-radius: 6px; border-right: 3px solid #f0ad00;">
        💡 <strong>تلميح:</strong> ستجد ملف التقويم (.ics) مرفقاً بهذا البريد — يمكنك فتحه لإضافة كلا اليومين دفعةً واحدة مع تذكيرات تلقائية.
      </p>

      <p style="margin-top: 24px;">نتطلع لرؤيتك! 🌟</p>
      <p>مع تحيات،<br/><strong>فريق NCASE إن كيس</strong></p>

      <!-- Contact Footer -->
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <div style="text-align: center; font-size: 13px; color: #666;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #7C3097;">تواصل معنا</p>
        <p style="margin: 6px 0;">
          🌐 <a href="https://ncase.com.sa" style="color: #7C3097; text-decoration: none;">ncase.com.sa</a>
        </p>
        <p style="margin: 6px 0;">
          📞 <a href="tel:+966550650292" style="color: #7C3097; text-decoration: none;">+966 55 065 0292</a>
          &nbsp;|&nbsp;
          💬 <a href="https://wa.me/966550650292" style="color: #7C3097; text-decoration: none;">واتساب</a>
        </p>
        <p style="margin: 6px 0;">
          <a href="https://www.linkedin.com/company/ncase-consulting-group/" style="color: #7C3097; text-decoration: none; margin: 0 6px;">🔗 LinkedIn</a>
          &nbsp;|&nbsp;
          <a href="https://www.instagram.com/ncase.sa" style="color: #7C3097; text-decoration: none; margin: 0 6px;">📸 Instagram</a>
        </p>
        <p style="margin: 14px 0 0 0; font-size: 11px; color: #aaa;">NCASE إن كيس — الرياض، المملكة العربية السعودية</p>
      </div>

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

    // Verify webhook secret token to ensure request is from Moyasar
    const webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CRITICAL: MOYASAR_WEBHOOK_SECRET is not configured');
      return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error' }) };
    }
    if (payload.secret_token !== webhookSecret) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid secret token' }) };
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

    // If payment was declined/failed, send admin an alert email
    const isDeclined = ['failed', 'declined'].includes(verifiedInvoice.status);
    if (isDeclined) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
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
      return { statusCode: 200, body: JSON.stringify({ received: true, status: verifiedInvoice.status }) };
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

    const invoiceUrl = verifiedInvoice.url || `https://moyasar.com/invoices/${invoiceId}`;
    const ownerEmailHtml = buildAdminEmailHtml(escapeHtml(invoiceId), safeName, safeEmail, safeWhatsapp, safeJobTitle, safeDetails, amount);
    const userEmailHtml = buildCustomerEmailHtml(safeName, amount, safeWhatsapp, invoiceUrl);

    // Send email to owner
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: ADMIN_EMAIL,
        subject: adminEmailSubject(safeName),
        html: ownerEmailHtml,
      });
    } catch (adminEmailErr) {
      console.error('Admin email failed:', adminEmailErr);
    }

    // ics file content — two separate events with 3 reminders each
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//NCASE//Event//AR
BEGIN:VEVENT
UID:ncase-event-day1-20260424@ncase.com.sa
SUMMARY:برنامج القيادة وإدارة التغيير - اليوم الأول - NCASE
DTSTART:20260424T133000Z
DTEND:20260424T183000Z
LOCATION:Hilton Hotel\\, Riyadh
DESCRIPTION:برنامج القيادة وإدارة التغيير من NCASE - اليوم الأول\\nفندق هيلتون\\, الرياض\\n4:30 م - 9:30 م
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير غداً - اليوم الأول
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير بعد ساعة - اليوم الأول
END:VALARM
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير بعد 15 دقيقة - اليوم الأول
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:ncase-event-day2-20260425@ncase.com.sa
SUMMARY:برنامج القيادة وإدارة التغيير - اليوم الثاني - NCASE
DTSTART:20260425T133000Z
DTEND:20260425T183000Z
LOCATION:Hilton Hotel\\, Riyadh
DESCRIPTION:برنامج القيادة وإدارة التغيير من NCASE - اليوم الثاني\\nفندق هيلتون\\, الرياض\\n4:30 م - 9:30 م
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير غداً - اليوم الثاني
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير بعد ساعة - اليوم الثاني
END:VALARM
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:تذكير: برنامج القيادة وإدارة التغيير بعد 15 دقيقة - اليوم الثاني
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Send email to user (if valid email exists)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: email,
          subject: customerEmailSubject,
          html: userEmailHtml,
          attachments: [
            {
              filename: 'event.ics',
              content: Buffer.from(icsContent, 'utf-8').toString('base64')
            }
          ]
        });
        console.log('Customer confirmation email sent to:', email);
      } catch (customerEmailErr) {
        console.error('Customer email failed:', customerEmailErr);
      }
    } else {
      console.error('Invalid or missing customer email in metadata:', email);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (error) {
    console.error('Webhook error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
