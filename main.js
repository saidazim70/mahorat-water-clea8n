document.addEventListener('DOMContentLoaded', () => {

    // Umumiy utilitlar
    const getElement = (id) => document.getElementById(id);
    const getAllElements = (selector) => document.querySelectorAll(selector);

    // Observerlar
    const setupIntersectionObserver = (selector, className, options = { threshold: 0.1 }) => {
        const elements = getAllElements(selector);
        const observer = new IntersectionObserver((entries, self) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(className);
                    self.unobserve(entry.target); // Bir marta ko'rsatgandan keyin kuzatishni to'xtatish
                }
            });
        }, options);
        elements.forEach(el => observer.observe(el));
    };

    // 1. Dark Mode Toggle
    const toggleButton = getElement('toggleMode');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            toggleButton.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            toggleButton.textContent = '☀️';
        }
    }

    // 2. Scroll to Top Button
    const scrollTopBtn = getElement('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
                scrollTopBtn.classList.remove('hidden');
            } else {
                scrollTopBtn.classList.add('hidden');
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 3. "Batafsil ma'lumot" Popupi
    const learnMoreBtn = getElement('learnMoreBtn');
    const infoPopup = getElement('infoPopup');

    const togglePopup = (popupElement, show) => {
        if (show) {
            popupElement.classList.add('active');
        } else {
            popupElement.classList.remove('active');
        }
    };

    if (learnMoreBtn && infoPopup) {
        learnMoreBtn.addEventListener('click', () => togglePopup(infoPopup, true));

        infoPopup.querySelectorAll('.close-popup, .action-button').forEach(button => {
            button.addEventListener('click', () => togglePopup(infoPopup, false));
        });

        infoPopup.addEventListener('click', (e) => {
            if (e.target === infoPopup) {
                togglePopup(infoPopup, false);
            }
        });
    }

    // 4. "Buyurtma berish" Popupi va Forma Yuborish
    const orderPopup = getElement('orderPopup');
    const orderButtons = getAllElements('.order-button');
    const orderedProductNameSpan = getElement('orderedProductName');
    const orderForm = getElement('orderForm');

    // Dinamik qo'shiladigan tugmalar uchun ham tinglovchi
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('order-button')) {
            const productName = e.target.dataset.product;
            if (orderedProductNameSpan) {
                orderedProductNameSpan.textContent = productName;
            }
            togglePopup(orderPopup, true);
        }
    });


    if (orderPopup) {
        orderPopup.querySelectorAll('.close-popup').forEach(button => {
            button.addEventListener('click', () => togglePopup(orderPopup, false));
        });

        orderPopup.addEventListener('click', (e) => {
            if (e.target === orderPopup) {
                togglePopup(orderPopup, false);
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productName = orderedProductNameSpan ? orderedProductNameSpan.textContent : 'Noma\'lum mahsulot';
            const userName = getElement('userName').value;
            const userPhone = getElement('userPhone').value;
            const userAddress = getElement('userAddress').value;

            const botToken = '7956847362:AAGVseNspmWcUfkixpcVc3HIThH-cY-QDrs';
            const chatId = '-1002014467554';

            const message = `
*Yangi Buyurtma!*
*Mahsulot:* ${productName}
*Ism:* ${userName}
*Telefon:* ${userPhone}
*Manzil:* ${userAddress}
            `;

            try {
                const response = await fetch(`https://Mahoratcleanwater.uz/bot${7956847362:AAGVseNspmWcUfkixpcVc3HIThH-cY-QDrs}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'Markdown'
                    }),
                });
                const data = await response.json();

                if (data.ok) {
                    alert('Buyurtmangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
                    orderForm.reset();
                    togglePopup(orderPopup, false);
                } else {
                    alert('Buyurtmani yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring. Xato: ' + data.description);
                }
            } catch (error) {
                console.error('Buyurtmani yuborishda xatolik:', error);
                alert('Buyurtmani yuborishda server bilan bog\'lanishda xatolik yuz berdi.');
            }
        });
    }

    // 5. "Ko'proq mahsulot ko'rish" tugmasi orqali dinamik kontent yuklash
    const productsData = [
        {
            id: 5,
            image: "./photo_2025-07-22_01-08-07.jpg",
            name: "MAHORAT CLEAN WATER – Premium to'plam!",
            description: "Eng yuqori tozalik va minerallar. Sog'lom turmush tarzi uchun eng yaxshi tanlov!",
            volume: "20L (maxsus)"
        },
        {
            id: 4,
            name: "MAHORAT CLEAN WATER – Qulaylik to'plami!",
            description: "Sayohatingizda yoki sportda qulaylik uchun maxsus kichik hajm. Har bir yutumda quvvat!",
            image: "./photo_2025-07-22_01-08-00.jpg",
            volume: "1L (qo'shimcha)"
        },
        {
            id: 6,
            image: "./photo_2025-07-22_01-07-55.jpg",
            name: "MAHORAT CLEAN WATER – Sport Edition!",
            description: "Mashg'ulotlar paytida quvvat beruvchi, minerallarga boy suv. Energingizni oshiradi!",
            volume: "0.5L (sport)"
        }
    ];

    let productsLoadedCount = 0;
    const loadMoreProductsBtn = getElement('loadMoreProductsBtn');
    const productsContainer = getElement('products-container');

    const loadMoreProducts = () => {
        if (!productsContainer) return;

        const productsToAdd = productsData.slice(productsLoadedCount, productsLoadedCount + 2); // Har safar 2 ta qo'shamiz
        
        if (productsToAdd.length > 0) {
            productsToAdd.forEach(productData => {
                const newProductDiv = document.createElement('div');
                // Dinamik qo'shiladigan mahsulotlarga 'card-with-effect' qo'shilmaydi
                newProductDiv.classList.add('water-1', 'scale-up', 'product-item', 'dynamic-product'); 
                newProductDiv.dataset.id = productData.id;
                newProductDiv.innerHTML = `
                    <div class="water-text">
                        <p style="width: 600px;font-size: 24px;">${productData.name}</p>
                        <p>${productData.description}</p>
                        <button class="action-button order-button" data-product="${productData.volume}">Buyurtma berish</button>
                    </div>  
                    <div class="water-img">
                        <img style="border-radius: 50px;" src="${productData.image}" alt="${productData.name}" width="300px" height="400px">
                    </div>
                `;
                productsContainer.appendChild(newProductDiv);
                
                setTimeout(() => newProductDiv.classList.add('show'), 50);

                // LoadMore orqali qo'shilgan elementlarga ham IntersectionObserver qo'llash
                setupIntersectionObserver('.dynamic-product', 'active', { threshold: 0.2 });
            });
            productsLoadedCount += productsToAdd.length;
        }

        if (productsLoadedCount >= productsData.length) {
            if (loadMoreProductsBtn) {
                loadMoreProductsBtn.classList.add('hidden');
            }
        }
    };

    if (loadMoreProductsBtn) {
        loadMoreProductsBtn.addEventListener('click', loadMoreProducts);
    }

    // 6. Header sarlavhasini interaktiv qilish (matnni o'zgartirish)
    const mainHeaderH2 = getElement('mainHeading');
    if (mainHeaderH2) {
        mainHeaderH2.style.cursor = 'pointer';
        mainHeaderH2.addEventListener('click', () => {
            if (mainHeaderH2.textContent.includes('Tozalik va Sog‘lik Manbai!')) {
                mainHeaderH2.textContent = 'Sizning sog‘ligingiz uchun eng yaxshi tanlov! ✅';
            } else {
                mainHeaderH2.textContent = '100% Filtrlangan Sifatli Suv — Tozalik va Sog‘lik Manbai!';
            }
            mainHeaderH2.style.transition = 'transform 0.3s ease, color 0.3s ease';
            mainHeaderH2.style.transform = 'scale(1.05)';
            setTimeout(() => {
                mainHeaderH2.style.transform = 'scale(1)';
            }, 300);
        });
    }

    // 7. Mahsulot kartasini o'chirish funksiyasi (faqat product-item uchun qoldirildi)
    const productItems = getAllElements('.product-item');
    productItems.forEach(item => {
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm("Bu mahsulot kartasini o'chirmoqchimisiz?")) {
                item.remove();
                alert("Mahsulot kartasi o'chirildi!");
            }
        });
    });

    // 8. Rasmlarni "Lazy Load" qilish
    const lazyLoadImages = getAllElements('.mahorat-water .fade-in img, .img-clean img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imgElement = entry.target;
                const parentDiv = imgElement.closest('.fade-in');
                
                if (parentDiv && parentDiv.dataset.src && imgElement.src !== parentDiv.dataset.src) {
                    imgElement.src = parentDiv.dataset.src;
                    imgElement.onload = () => {
                        parentDiv.classList.add('active');
                    };
                } else if (parentDiv) {
                    parentDiv.classList.add('active');
                }
                observer.unobserve(imgElement);
            }
        });
    }, {
        rootMargin: '0px 0px 100px 0px',
        threshold: 0.01
    });

    lazyLoadImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Boshqa elementlar uchun umumiy fade-in animatsiyasini ishga tushirish
    setupIntersectionObserver('.text-clean, .mahorat-text-p', 'active');
    setupIntersectionObserver('.ikta-div .img-clean', 'active');
    setupIntersectionObserver('.product-item', 'active', { threshold: 0.2 });

    // Headerdagi rasmlarga maxsus RGB effektini olib tashladik.
    // Endi faqat CSS orqali '.card-with-effect' ishlaydi.

});