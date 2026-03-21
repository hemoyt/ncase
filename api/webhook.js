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
        if (verifiedInvoice.status !== 'paid') {
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

        const ownerEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>تسجيل جديد (دفع مؤكد) ✅</h3>
        <p>تم تسجيل مشترك جديد في برنامج القيادة وإدارة التغيير. وتم تأكيد الدفع (الفاتورة: ${escapeHtml(invoiceId)}).</p>
        <ul>
          <li><strong>الاسم:</strong> ${safeName}</li>
          <li><strong>البريد الإلكتروني:</strong> ${safeEmail}</li>
          <li><strong>الواتساب:</strong> ${safeWhatsapp}</li>
          <li><strong>المسمى الوظيفي:</strong> ${safeJobTitle}</li>
          <li><strong>جهة العمل/تفاصيل:</strong> ${safeDetails}</li>
          <li><strong>المبلغ المدفوع:</strong> ${amount} ريال</li>
        </ul>
      </div>
    `;

        const userEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>مرحباً ${safeName}،</h3>
        <p>نشكرك على تسجيلك في <strong>برنامج القيادة وإدارة التغيير</strong>.</p>
        <p>لقد استلمنا المبلغ (${amount} ريال) بنجاح، وتم تأكيد حجزك في البرنامج.</p>
        <p>سنقوم بالتواصل معك قريباً على رقم الواتساب (${safeWhatsapp}) لتزويدك بكافة التفاصيل والتعليمات.</p>
        <br/>
        <p>نتطلع لرؤيتك!</p>
        <p>مع تحيات،<br/>فريق NCASE إن كيس</p>
      </div>
    `;

        // Send email to owner
        await resend.emails.send({
            from: 'NCASE Notifications <onboarding@resend.dev>', // Update to a verified domain on Resend in production if needed
            to: 'hello@ibrahemahmed.com',
            subject: `تسجيل جديد مدفوع: ${safeName}`,
            html: ownerEmailHtml,
        });

        // Send email to user (if email exists)
        if (email) {
            await resend.emails.send({
                from: 'NCASE Confirmation <onboarding@resend.dev>', // Update to a verified domain on Resend in production if needed
                to: email,
                subject: 'تأكيد التسجيل والدفع - برنامج القيادة وإدارة التغيير',
                html: userEmailHtml,
            });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
