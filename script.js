// Language Management
let currentLang = 'ar';

// Language data
const langData = {
    ar: {
        dir: 'rtl',
        font: 'Cairo'
    },
    en: {
        dir: 'ltr',
        font: 'Inter'
    }
};

// Initialize language
function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'ar';
    setLanguage(savedLang);
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    const html = document.documentElement;
    const body = document.body;

    // Set attributes on both html and body elements
    html.setAttribute('lang', lang);
    html.setAttribute('dir', langData[lang].dir);
    html.style.fontFamily = langData[lang].font;

    body.setAttribute('lang', lang);
    body.setAttribute('dir', langData[lang].dir);
    body.style.fontFamily = langData[lang].font;

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update all translatable elements
    updateTexts();
}

// Update all translatable texts
function updateTexts() {
    // Update elements with data-ar and data-en attributes
    document.querySelectorAll('[data-ar][data-en]').forEach(element => {
        const text = currentLang === 'ar' ? element.dataset.ar : element.dataset.en;

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else if (element.tagName === 'OPTION') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]').forEach(element => {
        const placeholder = currentLang === 'ar' ? element.dataset.arPlaceholder : element.dataset.enPlaceholder;
        element.placeholder = placeholder;
    });

    // Update arrow icons based on language
    document.querySelectorAll('[data-ar-icon][data-en-icon]').forEach(element => {
        const iconName = currentLang === 'ar' ? element.dataset.arIcon : element.dataset.enIcon;
        element.setAttribute('data-lucide', iconName);
        // Re-render the icon
        const parent = element.parentElement;
        const iconData = element.getAttribute('data-lucide');
        if (iconData && typeof lucide !== 'undefined') {
            element.innerHTML = '';
            lucide.createIcons();
        }
    });

    // Update href attributes for elements with data-ar-href and data-en-href
    document.querySelectorAll('[data-ar-href][data-en-href]').forEach(element => {
        const href = currentLang === 'ar' ? element.dataset.arHref : element.dataset.enHref;
        element.setAttribute('href', href);
    });

    // Re-initialize icons after language change
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        setTimeout(() => {
            document.querySelectorAll('[data-lucide]').forEach(icon => {
                const svg = icon.querySelector('svg');
                if (svg) {
                    svg.setAttribute('stroke', 'currentColor');
                    svg.style.stroke = 'currentColor';
                }
            });
        }, 100);
    }
}

// Animate statistics counter
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const suffix = target === 200 ? '%' : (target === 50 ? 'M' : '+');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            if (target === 50) {
                element.textContent = target + 'M';
            } else if (target === 200) {
                element.textContent = target + '%';
            } else {
                element.textContent = target + '+';
            }
            clearInterval(timer);
        } else {
            if (target === 50) {
                element.textContent = Math.floor(current) + 'M';
            } else if (target === 200) {
                element.textContent = Math.floor(current) + '%';
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }
    }, 16);
}

// Intersection Observer for statistics
function initStatisticsAnimation() {
    const statsSection = document.querySelector('.statistics');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.target);
                    if (!stat.classList.contains('animated')) {
                        stat.classList.add('animated');
                        animateCounter(stat, target);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// Language switch event listeners
document.addEventListener('DOMContentLoaded', function () {
    initLanguage();

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            setLanguage(this.dataset.lang);
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function () {
            nav.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    // Close mobile menu if open
                    if (nav) {
                        nav.classList.remove('active');
                    }
                }
            }
        });
    });

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function () {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');

            // Close all other FAQ items
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.classList.remove('active');
                    q.nextElementSibling.classList.remove('active');
                }
            });

            // Toggle current FAQ item
            if (isActive) {
                this.classList.remove('active');
                answer.classList.remove('active');
            } else {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });

    // Service card click effect
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove active class from all cards
            serviceCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
        });
    });

    // Feature card click effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove active class from all cards
            featureCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
        });
    });

    // Value card click effect
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove active class from all cards
            valueCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Get the selected country display text
            const countrySelect = document.getElementById('country');
            const countryText = countrySelect.options[countrySelect.selectedIndex].text;

            // Get service name based on selected value
            const serviceOptions = {
                'strategic-planning': currentLang === 'ar' ? 'التخطيط الاستراتيجي' : 'Strategic Planning',
                'feasibility-studies': currentLang === 'ar' ? 'دراسات الجدوى' : 'Feasibility Studies',
                'brand-development': currentLang === 'ar' ? 'تطوير العلامة التجارية' : 'Brand Development',
                'growth-investment': currentLang === 'ar' ? 'استراتيجيات النمو والاستثمار' : 'Growth and Investment Strategies',
                'financial-advisory': currentLang === 'ar' ? 'استشارة مالية' : 'Financial Advisory',
                'other': currentLang === 'ar' ? 'أخرى' : 'Other'
            };

            const serviceName = serviceOptions[data.service] || data.service;

            // Disable submit button while sending
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

            const successMessage = document.getElementById('formSuccessMessage');
            successMessage.style.display = 'none';

            // Send data to webhook
            fetch('https://agent.hemoagent.site/webhook/b92633f9-3fff-431b-837c-277c42e58b77', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    country: countryText,
                    country_code: data.country,
                    phone: data.phone,
                    service: serviceName,
                    service_code: data.service,
                    message: data.message,
                    language: currentLang,
                    submitted_at: new Date().toISOString()
                })
            }).then(response => {
                // Show inline success message
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }).catch(err => {
                console.log('Webhook error:', err);
                // Still show success to user
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }).finally(() => {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });

            // Reset form
            this.reset();

            // Update placeholders after reset
            setTimeout(() => {
                updateTexts();
            }, 100);
        });
    }

    // Subscribe form submission
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;

            // Here you would normally send the email to a server
            console.log('Subscribe:', email);

            const successMsg = currentLang === 'ar'
                ? 'شكرًا لك على الاشتراك!'
                : 'Thank you for subscribing!';

            alert(successMsg);
            this.reset();

            // Update placeholder after reset
            setTimeout(() => {
                updateTexts();
            }, 100);
        });
    }

    // Header scroll effect
    let lastScroll = 0;
    const header = document.getElementById('header');

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Initial animation
    setTimeout(() => {
        document.querySelectorAll('section')[0].style.opacity = '1';
        document.querySelectorAll('section')[0].style.transform = 'translateY(0)';
    }, 300);

    // Initialize statistics animation
    initStatisticsAnimation();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();

        // Wait a bit for icons to render
        setTimeout(() => {
            // Set icon stroke color to inherit from parent
            document.querySelectorAll('[data-lucide]').forEach(icon => {
                const svg = icon.querySelector('svg');
                if (svg) {
                    svg.setAttribute('stroke', 'currentColor');
                    svg.setAttribute('fill', 'none');
                    svg.style.stroke = 'currentColor';
                    svg.style.color = 'currentColor';
                }
            });

            // Add hover listeners to update icon colors
            const primaryColor = '#561269';
            const iconWrappers = document.querySelectorAll('.service-icon-wrapper, .feature-icon-wrapper, .value-icon-wrapper');
            iconWrappers.forEach(wrapper => {
                const updateIconColor = (isHover) => {
                    const svg = wrapper.querySelector('svg');
                    if (svg) {
                        if (isHover) {
                            svg.style.stroke = '#ffffff';
                            svg.style.color = '#ffffff';
                            svg.setAttribute('stroke', '#ffffff');
                            // Also update any path elements inside
                            const paths = svg.querySelectorAll('path, circle, line, polyline, polygon');
                            paths.forEach(path => {
                                path.style.stroke = '#ffffff';
                                path.setAttribute('stroke', '#ffffff');
                            });
                        } else {
                            svg.style.stroke = primaryColor;
                            svg.style.color = primaryColor;
                            svg.setAttribute('stroke', primaryColor);
                            // Also update any path elements inside
                            const paths = svg.querySelectorAll('path, circle, line, polyline, polygon');
                            paths.forEach(path => {
                                path.style.stroke = primaryColor;
                                path.setAttribute('stroke', primaryColor);
                            });
                        }
                    }
                };

                wrapper.addEventListener('mouseenter', () => updateIconColor(true));
                wrapper.addEventListener('mouseleave', () => updateIconColor(false));
            });

            // Also handle card hover
            const cards = document.querySelectorAll('.service-card, .feature-card, .value-card');
            cards.forEach(card => {
                const iconWrapper = card.querySelector('.service-icon-wrapper, .feature-icon-wrapper, .value-icon-wrapper');
                if (iconWrapper) {
                    card.addEventListener('mouseenter', function () {
                        const svg = iconWrapper.querySelector('svg');
                        if (svg) {
                            svg.style.stroke = '#ffffff';
                            svg.style.color = '#ffffff';
                            svg.setAttribute('stroke', '#ffffff');
                            const paths = svg.querySelectorAll('path, circle, line, polyline, polygon');
                            paths.forEach(path => {
                                path.style.stroke = '#ffffff';
                                path.setAttribute('stroke', '#ffffff');
                            });
                        }
                    });
                    card.addEventListener('mouseleave', function () {
                        const svg = iconWrapper.querySelector('svg');
                        if (svg) {
                            svg.style.stroke = primaryColor;
                            svg.style.color = primaryColor;
                            svg.setAttribute('stroke', primaryColor);
                            const paths = svg.querySelectorAll('path, circle, line, polyline, polygon');
                            paths.forEach(path => {
                                path.style.stroke = primaryColor;
                                path.setAttribute('stroke', primaryColor);
                            });
                        }
                    });
                }
            });

            // Font Awesome icons don't need JavaScript manipulation - CSS handles the colors
        }, 100);
    }
});

// Update texts when window loads (in case of dynamic content)
window.addEventListener('load', function () {
    updateTexts();

    // Initialize Impact Swiper
    if (typeof Swiper !== 'undefined') {
        new Swiper('.impact-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                }
            }
        });
    }
});
