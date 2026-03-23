// =========================================================================
// إعدادات البريد الإلكتروني (Email Settings)
// =========================================================================

// IMPORTANT: To send emails, you MUST verify your domain (e.g., ncase.com.sa) in Resend.
// Replace 'info@ncase.com.sa' with your verified sender email from Resend.
const SENDER_EMAIL = 'NCASE <info@ncase.com.sa>';
// The admin email where you want to receive new client details
const ADMIN_EMAIL = 'hello@ibrahemahmed.com';

// -------------------------------------------------------------------------
// 3. صيغة إيميل محاولة التسجيل (الذي يبدأ عملية الدفع)
// Admin Initiated Checkout Email Template
// -------------------------------------------------------------------------
const adminInitiatedSubject = (name) => `بانتظار الدفع ⏱️: ${name}`;
const buildAdminInitiatedHtml = (name, whatsapp, email, jobTitle) => `
  <div dir="rtl" style="font-family: Arial, sans-serif;">
    <h3>محاولة تسجيل جديدة (بانتظار إتمام الدفع) ⏱️</h3>
    <p>قام <strong>${name}</strong> بتعبئة النموذج وتم تحويله لصفحة الدفع ميسر.</p>
    <p>إذا لم تصله رسالة تأكيد الدفع خلال 5 دقائق، يمكنك التواصل معه وسؤاله إذا واجه مشكلة:</p>
    <ul>
      <li><strong>الواتساب:</strong> ${whatsapp}</li>
      <li><strong>البريد:</strong> ${email}</li>
      <li><strong>المسمى الوظيفي:</strong> ${jobTitle}</li>
    </ul>
  </div>
`;
// =========================================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, whatsapp, jobTitle, details, email } = req.body;

    const moyasarSecret = process.env.MOYASAR_SECRET_KEY;
    if (!moyasarSecret) {
        return res.status(500).json({ message: 'Moyasar Secret Key not configured on the server.' });
    }

    const authHeader = 'Basic ' + Buffer.from(moyasarSecret + ':').toString('base64');

    // URL to redirect users back or to success/failure pages
    const hostUrl = `https://${req.headers.host}`;

    try {
        // Dynamic import for Axios and Resend
        const axios = (await import('axios')).default;
        const { Resend } = await import('resend');

        // 1) Send immediate notification to admin that someone initiated checkout
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            const resend = new Resend(resendApiKey);

            const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            })[m]);

            const safeName = escapeHtml(name);
            const safeWhatsapp = escapeHtml(whatsapp);
            const safeEmail = escapeHtml(email);
            const safeJobTitle = escapeHtml(jobTitle);

            const initiatedEmailHtml = buildAdminInitiatedHtml(safeName, safeWhatsapp, safeEmail, safeJobTitle);

            // We don't await this so it doesn't block the checkout redirect!
            resend.emails.send({
                from: SENDER_EMAIL,
                to: ADMIN_EMAIL,
                subject: adminInitiatedSubject(safeName),
                html: initiatedEmailHtml,
            }).catch(err => console.error('Immediate Email Error:', err));
        }

        const response = await axios.post('https://api.moyasar.com/v1/invoices', {
            amount: 170000, // 1700 SAR = 170,000 Halalas
            currency: 'SAR',
            description: 'تسجيل - برنامج القيادة وإدارة التغيير',
            callback_url: `${hostUrl}/api/webhook`,
            success_url: `${hostUrl}/event.html?payment=success`,
            back_url: `${hostUrl}/event.html?payment=cancelled`,
            metadata: {
                name: String(name || ''),
                email: String(email || ''),
                whatsapp: String(whatsapp || ''),
                jobTitle: String(jobTitle || ''),
                details: String(details || '')
            }
        }, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        const invoiceUrl = response.data.url;
        // Redirect user to the payment link
        res.redirect(302, invoiceUrl);
    } catch (error) {
        console.error('Moyasar error:', error.response?.data || error.message);
        res.status(500).json({ message: 'An error occurred creating the invoice.', error: error.response?.data });
    }
}
