(function () {
    // Only show if the user hasn't closed it before (optional, but good practice).
    // I will just show it always on page load to fulfill the user's prompt.

    if (document.getElementById('event-promo-popup')) return;

    const popupHtml = `
    <div id="event-promo-popup" style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 999999;
      background: #7C3097;
      color: #fff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 350px;
      font-family: 'Tajawal', 'Cairo', sans-serif;
      direction: rtl;
      transform: translateY(150%);
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid #9B4DBA;
    ">
      <button id="close-promo-popup" style="
        position: absolute;
        top: 10px;
        left: 10px;
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        opacity: 0.7;
        line-height: 1;
        outline: none;
      " aria-label="أغلق">&times;</button>
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; margin-left: 20px;">🎉 سجل ببرنامجنا القادم!</div>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
        احصل على الخصم المبكر الآن بـ <strong style="color: #FFD700;">1,700 ريال</strong> فقط! (السعر الأساسي 2,000 ريال).
      </p>
      <a href="event.html" style="
        display: block;
        text-align: center;
        background: #fff;
        color: #7C3097;
        text-decoration: none;
        padding: 12px 15px;
        border-radius: 6px;
        font-weight: bold;
        transition: background 0.3s;
      " onmouseover="this.style.background='#f3f3f3'" onmouseout="this.style.background='#fff'">
        احجز التذكرة المخفضة الآن
      </a>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', popupHtml);

    // Show it slowly after 1.5 seconds
    setTimeout(() => {
        document.getElementById('event-promo-popup').style.transform = 'translateY(0)';
    }, 1500);

    document.getElementById('close-promo-popup').addEventListener('click', () => {
        document.getElementById('event-promo-popup').style.transform = 'translateY(150%)';
        setTimeout(() => {
            document.getElementById('event-promo-popup').remove();
        }, 500);
    });
})();
