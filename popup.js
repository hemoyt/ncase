(function () {
    if (document.getElementById('event-promo-popup')) return;

    const style = document.createElement('style');
    style.textContent = `
        #event-promo-overlay {
            position: fixed;
            inset: 0;
            z-index: 999998;
            background: rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        #event-promo-overlay.visible {
            opacity: 1;
        }
        #event-promo-popup {
            position: relative;
            font-family: 'Tajawal', 'Cairo', sans-serif;
            direction: rtl;
            width: 100%;
            max-width: 420px;
            border-radius: 20px;
            overflow: visible;
            transform: scale(0.85) translateY(30px);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));
        }
        #event-promo-overlay.visible #event-promo-popup {
            transform: scale(1) translateY(0);
        }

        /* Top purple banner */
        .popup-banner {
            background: #5B2082;
            color: #fff;
            text-align: center;
            padding: 10px 20px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 20px 20px 0 0;
            letter-spacing: 0.3px;
        }

        /* Ticket white body */
        .popup-ticket {
            background: #fff;
            padding: 24px 28px 28px;
            position: relative;
        }

        /* Ticket notch separating price from content */
        .popup-divider {
            position: relative;
            margin: 18px 0;
            display: flex;
            align-items: center;
        }
        .popup-divider::before,
        .popup-divider::after {
            content: '';
            position: absolute;
            width: 22px;
            height: 22px;
            background: rgba(0,0,0,0.5);
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
        }
        .popup-divider::before { right: -40px; }
        .popup-divider::after  { left: -40px; }
        .popup-divider-line {
            flex: 1;
            border: none;
            border-top: 2.5px dashed #d0d0d0;
        }

        /* Price section */
        .popup-price-section {
            text-align: center;
            padding: 4px 0 0;
        }
        .popup-old-price {
            font-size: 22px;
            color: #aaa;
            text-decoration: line-through;
            font-weight: 600;
            display: block;
            margin-bottom: 2px;
        }
        .popup-new-price {
            font-size: 46px;
            font-weight: 800;
            color: #2d2d2d;
            line-height: 1.1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .popup-riyal-symbol {
            height: 0.75em;
            width: auto;
            display: inline-block;
            vertical-align: middle;
        }

        /* Program title */
        .popup-title {
            text-align: center;
            font-size: 22px;
            font-weight: 800;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 6px 0 20px;
        }
        .popup-title span {
            color: #5B2082;
        }

        /* CTA button */
        .popup-cta {
            display: block;
            text-align: center;
            background: #5B2082;
            color: #fff;
            text-decoration: none;
            padding: 16px 20px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 700;
            transition: background 0.25s, transform 0.2s;
            border-radius: 0 0 16px 16px;
        }
        .popup-cta:hover {
            background: #4a1a6e;
            transform: translateY(-1px);
        }

        /* Bottom rounded ticket shape */
        .popup-bottom {
            background: #5B2082;
            border-radius: 0 0 20px 20px;
        }

        /* Close button */
        #close-promo-popup {
            position: absolute;
            top: -14px;
            left: -14px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid #5B2082;
            color: #5B2082;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            line-height: 1;
            transition: background 0.2s, color 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        #close-promo-popup:hover {
            background: #5B2082;
            color: #fff;
        }

        @media (max-width: 480px) {
            #event-promo-popup { max-width: 100%; }
            .popup-new-price { font-size: 38px; }
            .popup-title { font-size: 19px; }
            .popup-banner { font-size: 13px; }
        }
    `;
    document.head.appendChild(style);

    const popupHtml = `
    <div id="event-promo-overlay">
        <div id="event-promo-popup">
            <button id="close-promo-popup" aria-label="أغلق">&times;</button>

            <div class="popup-banner">وفّر 300 ريال عند التسجيل مبكرًا</div>

            <div class="popup-ticket">
                <div class="popup-price-section">
                    <span class="popup-old-price">2,000</span>
                    <span class="popup-new-price">1,700<img class="popup-riyal-symbol" src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Saudi_Riyal_Symbol.png" alt="ريال"></span>
                </div>

                <div class="popup-divider">
                    <hr class="popup-divider-line">
                </div>

                <div class="popup-title">
                    برنامج القيادة وإدارة التغيير<br>
                    في عصر <span>الذكاء الاصطناعي</span>
                </div>
            </div>

            <div class="popup-bottom">
                <a href="event.html#register" class="popup-cta" onclick="if(typeof openRegisterModal==='function'){event.preventDefault();openRegisterModal();}">احجز مقعدك الآن</a>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHtml);

    const overlay = document.getElementById('event-promo-overlay');

    setTimeout(() => {
        overlay.classList.add('visible');
    }, 1500);

    document.getElementById('close-promo-popup').addEventListener('click', () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 400);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 400);
        }
    });
})();
