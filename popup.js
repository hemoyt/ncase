(function () {
    if (document.getElementById('event-promo-popup')) return;

    const style = document.createElement('style');
    style.textContent = `
        #event-promo-overlay {
            position: fixed;
            inset: 0;
            z-index: 999998;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            opacity: 0;
            transition: opacity 0.6s ease;
        }
        #event-promo-overlay.visible {
            opacity: 1;
        }
        #event-promo-popup {
            position: relative;
            font-family: 'Tajawal', 'Cairo', sans-serif;
            direction: rtl;
            width: 100%;
            max-width: 400px;
            border-radius: 20px;
            overflow: hidden;
            transform: translateY(80px);
            transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
            filter: drop-shadow(0 20px 48px rgba(0,0,0,0.45));
        }
        #event-promo-overlay.visible #event-promo-popup {
            transform: translateY(0);
        }

        /* ── Header bar ── */
        .pp-header {
            background: #5B2082;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px 12px 14px;
        }
        .pp-header-title {
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.2px;
            flex: 1;
            text-align: center;
        }
        #close-promo-popup {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255,255,255,0.18);
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: background 0.2s;
            flex-shrink: 0;
        }
        #close-promo-popup:hover { background: rgba(255,255,255,0.32); }

        /* ── White body ── */
        .pp-body {
            background: #fff;
            padding: 22px 26px 20px;
        }

        /* Prices */
        .pp-old-price {
            display: block;
            text-align: center;
            font-size: 18px;
            color: #aaa;
            text-decoration: line-through;
            font-weight: 600;
            margin-bottom: 2px;
        }
        .pp-new-price {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 50px;
            font-weight: 900;
            color: #1a1a1a;
            line-height: 1.1;
            direction: ltr;
        }
        .pp-riyal-symbol {
            height: 0.7em;
            width: auto;
            display: inline-block;
            vertical-align: middle;
            filter: brightness(0);
        }

        /* Dashed divider */
        .pp-divider {
            position: relative;
            margin: 18px 0;
            display: flex;
            align-items: center;
        }
        .pp-divider::before,
        .pp-divider::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: #f5f0fa;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
        }
        .pp-divider::before { right: -32px; }
        .pp-divider::after  { left: -32px; }
        .pp-divider-line {
            flex: 1;
            border: none;
            border-top: 2px dashed #d4c0e8;
        }

        /* Program title */
        .pp-title {
            text-align: center;
            font-size: 18px;
            font-weight: 800;
            color: #1a1a1a;
            line-height: 1.55;
            margin: 0 0 16px;
        }
        .pp-title span { color: #5B2082; }

        /* Countdown box */
        .pp-countdown-box {
            background: #f3ecfb;
            border-radius: 14px;
            padding: 14px 16px 12px;
            margin-bottom: 4px;
        }
        .pp-countdown-label {
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            color: #5B2082;
            margin-bottom: 10px;
        }
        .pp-countdown-timer {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 6px;
            direction: ltr;
        }
        .pp-unit {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 48px;
        }
        .pp-unit-num {
            font-size: 34px;
            font-weight: 900;
            color: #c9a400;
            line-height: 1;
        }
        .pp-unit-label {
            font-size: 11px;
            color: #5B2082;
            font-weight: 600;
            margin-top: 3px;
        }
        .pp-colon {
            font-size: 30px;
            font-weight: 900;
            color: #c9a400;
            padding-top: 2px;
        }
        .pp-countdown-date {
            text-align: center;
            font-size: 11px;
            color: #888;
            margin-top: 8px;
        }

        /* CTA button */
        .pp-cta {
            display: block;
            text-align: center;
            background: #5B2082;
            color: #fff;
            text-decoration: none;
            padding: 17px 20px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.25s;
            border: none;
            width: 100%;
        }
        .pp-cta:hover { background: #4a1a6e; }

        @media (max-width: 480px) {
            #event-promo-popup { max-width: 100%; }
            .pp-new-price { font-size: 40px; }
            .pp-title { font-size: 16px; }
            .pp-unit-num { font-size: 28px; }
        }
    `;
    document.head.appendChild(style);

    const popupHtml = `
    <div id="event-promo-overlay">
        <div id="event-promo-popup">

            <div class="pp-header">
                <div class="pp-header-title">وفّر 300 ريال عند التسجيل مبكرًا</div>
                <button id="close-promo-popup" aria-label="أغلق">&times;</button>
            </div>

            <div class="pp-body">
                <span class="pp-old-price">2,000</span>
                <div class="pp-new-price">
                    <img class="pp-riyal-symbol" src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Saudi_Riyal_Symbol.png" alt="ريال">
                    1,700
                </div>

                <div class="pp-divider"><hr class="pp-divider-line"></div>

                <div class="pp-title">
                    برنامج القيادة وإدارة التغيير<br>
                    في عصر <span>الذكاء الاصطناعي</span>
                </div>

                <div class="pp-countdown-box">
                    <div class="pp-countdown-label">⏳ ينتهي العرض خلال</div>
                    <div class="pp-countdown-timer">
                        <div class="pp-unit">
                            <span class="pp-unit-num" id="pp-days">00</span>
                            <span class="pp-unit-label">يوم</span>
                        </div>
                        <span class="pp-colon">:</span>
                        <div class="pp-unit">
                            <span class="pp-unit-num" id="pp-hours">00</span>
                            <span class="pp-unit-label">ساعة</span>
                        </div>
                        <span class="pp-colon">:</span>
                        <div class="pp-unit">
                            <span class="pp-unit-num" id="pp-minutes">00</span>
                            <span class="pp-unit-label">دقيقة</span>
                        </div>
                        <span class="pp-colon">:</span>
                        <div class="pp-unit">
                            <span class="pp-unit-num" id="pp-seconds">00</span>
                            <span class="pp-unit-label">ثانية</span>
                        </div>
                    </div>
                    <div class="pp-countdown-date">الخميس ٩ أبريل ٢٠٢٦ — الساعة ١١:٥٩ مساءً</div>
                </div>
            </div>

            <button class="pp-cta" onclick="if(typeof openRegisterModal==='function'){openRegisterModal();}else{window.location.href='event.html#register';}">احجز مقعدك الآن</button>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHtml);

    // Countdown target: April 9, 2026 23:59:00 Saudi time (UTC+3)
    const targetDate = new Date('2026-04-09T23:59:00+03:00');

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) {
            document.getElementById('pp-days').textContent = '00';
            document.getElementById('pp-hours').textContent = '00';
            document.getElementById('pp-minutes').textContent = '00';
            document.getElementById('pp-seconds').textContent = '00';
            return;
        }
        const days    = Math.floor(diff / 86400000);
        const hours   = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('pp-days').textContent    = pad(days);
        document.getElementById('pp-hours').textContent   = pad(hours);
        document.getElementById('pp-minutes').textContent = pad(minutes);
        document.getElementById('pp-seconds').textContent = pad(seconds);
    }

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    const overlay = document.getElementById('event-promo-overlay');

    setTimeout(() => {
        overlay.classList.add('visible');
    }, 5000);

    function closePopup() {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.remove();
            clearInterval(countdownInterval);
        }, 400);
    }

    document.getElementById('close-promo-popup').addEventListener('click', closePopup);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });
})();
