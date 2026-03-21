export default async function handler(req, res) {
    // Moyasar will send a POST request to this endpoint
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const payload = req.body;

        // We only care if the invoice is paid
        if (payload.status !== 'paid') {
            return res.status(200).json({ received: true, status: payload.status });
        }

        const invoiceId = payload.id;
        const amount = payload.amount / 100; // convert back to SAR string format if needed
        const metadata = payload.metadata || {};

        const { name, email, whatsapp, jobTitle, details } = metadata;

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('RESEND_API_KEY is missing');
            return res.status(200).json({ message: 'Missing Resend key, email not sent' });
        }

        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        // Prepare email HTML
        const ownerEmailHtml = `
      <h3>تسجيل جديد (دفع مؤكد)</h3>
      <p>تم تسجيل مشترك جديد في برنامج القيادة وإدارة التغيير. وتم تأكيد الدفع (الفاتورة: ${invoiceId}).</p>
      <ul>
        <li><strong>الاسم:</strong> ${name}</li>
        <li><strong>البريد الإلكتروني:</strong> ${email}</li>
        <li><strong>الواتساب:</strong> ${whatsapp}</li>
        <li><strong>المسمى الوظيفي:</strong> ${jobTitle}</li>
        <li><strong>جهة العمل/تفاصيل:</strong> ${details || 'غير محدد'}</li>
        <li><strong>المبلغ المدفوع:</strong> ${amount} SAR</li>
      </ul>
    `;

        const userEmailHtml = `
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

        // Send email to owner
        await resend.emails.send({
            from: 'NCASE Notifications <onboarding@resend.dev>', // you can change this to your verified domain like no-reply@ncase.sa
            to: 'hello@ibrahemahmed.com',
            subject: `تسجيل جديد مدفوع: ${name}`,
            html: ownerEmailHtml,
        });

        // Send email to user (if email exists)
        if (email) {
            await resend.emails.send({
                from: 'NCASE <onboarding@resend.dev>', // change to your verified domain later
                to: email,
                subject: 'تأكيد التسجيل والدفع - برنامج القيادة وإدارة التغيير',
                html: userEmailHtml,
            });
        }

        // Acknowledge the webhook successfully
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
