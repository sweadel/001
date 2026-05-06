// ZOLNGEN Storefront Intelligence PRO v20 - ULTIMATE STABILITY
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

    const productContainer = document.getElementById('product-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCount = document.getElementById('cart-count');
    const cartTotalVal = document.getElementById('cart-total-val');
    const cartItemsContainer = document.getElementById('cart-items');
    const orderModal = document.getElementById('order-modal');
    
    // --- PREMIUM UX SETUP ---
    // Load System Settings
    if (DB.getSettings) {
        const settings = DB.getSettings();
        document.documentElement.style.setProperty('--gold', settings.primaryColor);
        document.title = settings.storeName;
    }

    // Scroll Progress Indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'position:fixed; top:0; left:0; height:4px; background:var(--gold); z-index:9999; transition:width 0.2s;';
    document.body.appendChild(progressBar);
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = (winScroll / height) * 100 + "%";
    });

    window.setupPremiumUX = () => {
        if (!document.getElementById('toast-container')) {
            const toastCont = document.createElement('div');
            toastCont.id = 'toast-container';
            document.body.appendChild(toastCont);
        }
        if (!document.getElementById('scroll-top')) {
            const btn = document.createElement('button');
            btn.id = 'scroll-top';
            btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.appendChild(btn);
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) btn.classList.add('visible');
                else btn.classList.remove('visible');
            });
        }
        if (!document.getElementById('qv-modal')) {
            const qv = document.createElement('div');
            qv.id = 'qv-modal';
            qv.className = 'qv-modal';
            qv.innerHTML = `
                <div class="qv-content">
                    <button class="qv-close" onclick="document.getElementById('qv-modal').style.display='none'">&times;</button>
                    <div class="qv-img"><img id="qv-img-src" src=""></div>
                    <div class="qv-details">
                        <p class="category" id="qv-cat" style="color:#999; font-size:0.9rem; text-transform:uppercase;"></p>
                        <h2 id="qv-name" style="font-size:2rem; margin-bottom:10px; color:var(--gold);"></h2>
                        <h3 id="qv-price" style="font-size:1.5rem; margin-bottom:15px;"></h3>
                        <ul class="qv-specs" id="qv-specs-list"></ul>
                        <button class="btn btn-gold" id="qv-add-btn" style="width:100%; justify-content:center; margin-top:1rem;">أضف إلى الطلب</button>
                    </div>
                </div>
            `;
            document.body.appendChild(qv);
        }
        
        // Particles Spawn
        const pCont = document.getElementById('hero-particles');
        if (pCont && pCont.children.length === 0) {
            for(let i=0; i<12; i++) {
                let p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + '%';
                let size = Math.random() * 5 + 2;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.animationDelay = Math.random() * 8 + 's';
                p.style.animationDuration = Math.random() * 5 + 6 + 's';
                pCont.appendChild(p);
            }
        }
        
        // Success Modal
        if (!document.getElementById('success-modal')) {
            const sm = document.createElement('div');
            sm.id = 'success-modal';
            sm.className = 'success-modal';
            sm.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:9999; display:none; align-items:center; justify-content:center; backdrop-filter:blur(5px);';
            sm.innerHTML = `
                <div class="success-content" style="background:var(--surface); padding:3rem; border-radius:20px; text-align:center; border:1px solid var(--gold); max-width:400px; width:90%; box-shadow:0 10px 40px rgba(0,0,0,0.8);">
                    <i class="fas fa-check-circle success-icon" style="font-size:4rem; color:var(--success); margin-bottom:20px;"></i>
                    <h2 style="color:var(--gold); margin-bottom:10px;" id="success-title">تم استلام الطلب</h2>
                    <p style="color:var(--text-muted); font-size:1.1rem; margin-bottom:5px;">هذا هو إيصال وتأكيد طلبكم المعتمد. يرجى الاحتفاظ بالرقم المرجعي:</p>
                    <div class="success-ref" id="success-ref-code" style="font-size:2rem; font-weight:900; color:#fff; letter-spacing:2px; margin:15px 0;">ORD-0000</div>
                    <div id="success-details-box"></div>
                    <button class="btn btn-gold" style="width:100%; justify-content:center; margin-top:20px;" onclick="document.getElementById('success-modal').style.display='none'">موافق، إغلاق الإيصال</button>
                </div>
            `;
            document.body.appendChild(sm);
        }

        // Global Chat Widget Injection
        if (!document.getElementById('chat-widget')) {
            const cw = document.createElement('div');
            cw.id = 'chat-widget';
            cw.style.cssText = 'position:fixed; bottom:30px; left:30px; z-index:8000;';
            cw.innerHTML = `
                <button id="chat-toggle" class="btn btn-gold" style="border-radius:50%; width:60px; height:60px; padding:0; box-shadow:0 10px 20px rgba(0,0,0,0.5);" onclick="const win = document.getElementById('chat-window'); win.style.display = win.style.display === 'none' ? 'flex' : 'none'; if(window.renderClientChat) window.renderClientChat();"><i class="fas fa-comments" style="font-size:1.8rem;"></i></button>
                <div id="chat-window" style="display:none; position:absolute; bottom:80px; left:0; width:350px; height:450px; background:var(--surface); border:1px solid var(--gold); border-radius:20px; box-shadow:0 10px 40px rgba(0,0,0,0.8); flex-direction:column; overflow:hidden;">
                    <div style="background:var(--grad); padding:1rem; color:#000; font-weight:800; display:flex; justify-content:space-between; align-items:center;">
                        <span>الدعم الفني المباشر</span>
                        <button onclick="document.getElementById('chat-window').style.display='none'" style="background:none; border:none; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="client-chat-box" style="flex:1; padding:1.5rem; overflow-y:auto; display:flex; flex-direction:column; gap:10px; background:#050505;"></div>
                    <div style="padding:1rem; border-top:1px solid var(--border); display:flex; gap:10px;">
                        <input type="text" id="client-chat-input" placeholder="اكتب رسالتك..." style="width:100%; padding:0.8rem; background:#111; border:1px solid #333; border-radius:10px; color:#fff; outline:none;" onkeypress="if(event.key==='Enter') window.sendClientChat()">
                        <button class="btn btn-gold" style="padding:0 1.2rem;" onclick="window.sendClientChat()"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            `;
            document.body.appendChild(cw);
        }

        // Global Client Auth Modal
        if (!document.getElementById('client-auth-modal')) {
            const authMod = document.createElement('div');
            authMod.id = 'client-auth-modal';
            authMod.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:9000; display:none; align-items:center; justify-content:center; backdrop-filter:blur(10px);';
            authMod.innerHTML = `
                <div style="background:var(--surface); border:2px solid var(--gold); border-radius:30px; width:95%; max-width:500px; padding:3rem; max-height:90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <h2 style="color:var(--gold); margin:0;" id="auth-modal-title">تسجيل دخول مؤسسي</h2>
                        <button onclick="document.getElementById('client-auth-modal').style.display='none'" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div id="client-login-view">
                        <form id="client-login-form">
                            <input type="text" id="l-user" placeholder="اسم المستخدم" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="password" id="l-pass" placeholder="كلمة المرور" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.5rem; outline:none;">
                            <button type="submit" class="btn btn-gold" style="width:100%; justify-content:center; padding:1.2rem; margin-bottom:1rem;">تسجيل الدخول</button>
                            <p style="text-align:center; color:#888;">ليس لديك حساب موظف؟ <a href="javascript:void(0)" onclick="window.toggleAuthView('register')" style="color:var(--gold);">إنشاء حساب</a></p>
                        </form>
                    </div>

                    <div id="client-register-view" style="display:none;">
                        <form id="client-register-form">
                            <input type="text" id="r-user" placeholder="اسم المستخدم (للدخول)" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="password" id="r-pass" placeholder="كلمة المرور" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <hr style="border-color:#333; margin:1.5rem 0;">
                            <input type="text" id="r-name" placeholder="الاسم الكامل" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="text" id="r-emp-id" placeholder="الرقم الوظيفي / رقم الموظف" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="tel" id="r-phone" placeholder="رقم الهاتف المباشر" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="text" id="r-inst" list="entities-list" placeholder="الجهة المستفيدة / المؤسسة" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:1.2rem; outline:none;">
                            <input type="text" id="r-role" placeholder="المسمى الوظيفي" required style="width:100%; padding:1.2rem; background:#000; border:1px solid #222; border-radius:12px; color:#fff; margin-bottom:2rem; outline:none;">
                            <button type="submit" class="btn btn-gold" style="width:100%; justify-content:center; padding:1.2rem; margin-bottom:1rem;">التسجيل كموظف معتمد</button>
                            <p style="text-align:center; color:#888;">لديك حساب بالفعل؟ <a href="javascript:void(0)" onclick="window.toggleAuthView('login')" style="color:var(--gold);">تسجيل الدخول</a></p>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(authMod);
            
            // Client Auth UI Setup
            const topBarRow = document.querySelector('.top-bar-content > div:first-child');
            if (topBarRow && !document.getElementById('client-auth-btn')) {
                const btn = document.createElement('button');
                btn.id = 'client-auth-btn';
                btn.className = 'btn btn-gold';
                btn.style.padding = '5px 15px';
                btn.style.fontSize = '0.8rem';
                btn.onclick = () => document.getElementById('client-auth-modal').style.display = 'flex';
                topBarRow.insertBefore(btn, topBarRow.firstChild);
            }
        }
    };
    
    window.showSuccessModal = (title, orderObj) => {
        const sm = document.getElementById('success-modal');
        document.getElementById('success-title').innerText = title;
        document.getElementById('success-ref-code').innerText = orderObj.id;
        
        const detailsBox = document.getElementById('success-details-box');
        if(detailsBox && orderObj.docId) {
            detailsBox.innerHTML = `
                <div style="text-align:right; font-size:0.95rem; color:#ccc; margin-bottom:15px; border-top:1px solid #333; border-bottom:1px solid #333; padding:15px 0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>الجهة المستفيدة:</span> <strong style="color:#fff;">${orderObj.entity}</strong></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>الرقم المرجعي للوثيقة:</span> <strong style="color:#fff;">${orderObj.docId}</strong></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>اسم المسؤول:</span> <strong style="color:#fff;">${orderObj.fullName}</strong></div>
                    <div style="display:flex; justify-content:space-between; margin-top:15px;"><span>إجمالي القيمة التقديرية:</span> <strong style="color:var(--gold); font-size:1.2rem;">${orderObj.total.toFixed(2)} JOD</strong></div>
                </div>
                <!-- Visual Timeline Tracking -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; position:relative;">
                    <div style="position:absolute; top:50%; left:10%; right:10%; height:2px; background:#333; z-index:1;"></div>
                    <div style="position:relative; z-index:2; background:var(--gold); color:#000; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;"><i class="fas fa-check"></i></div>
                    <div style="position:relative; z-index:2; background:#222; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;"><i class="fas fa-box"></i></div>
                    <div style="position:relative; z-index:2; background:#222; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;"><i class="fas fa-truck"></i></div>
                </div>
                <div style="display:flex; justify-content:space-between; color:#888; font-size:0.8rem; margin-top:5px;">
                    <span>مستلم</span>
                    <span>قيد التجهيز</span>
                    <span>مشحون</span>
                </div>
            `;
        } else if(detailsBox) {
            detailsBox.innerHTML = ''; // Clear for tickets
        }
        
        sm.style.display = 'flex';
    };
    
    window.showToast = (msg, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };
    
    setupPremiumUX();
    
    let currentCategoryFilter = '';

    window.openQuickView = (id) => {
        const p = DB.getProducts().find(x => String(x.id) === String(id));
        if (!p) return;
        document.getElementById('qv-img-src').src = p.img;
        document.getElementById('qv-name').innerText = p.name;
        document.getElementById('qv-cat').innerText = p.category || 'تجهيزات مؤسسية';
        document.getElementById('qv-price').innerText = p.price.toFixed(2) + ' JOD';
        
        const specsHtml = (p.specs || ['مواصفات قياسية معتمدة']).map(s => `<li><i class="fas fa-check"></i> ${s}</li>`).join('');
        document.getElementById('qv-specs-list').innerHTML = specsHtml + `
            <li style="margin-top:20px;">
                <label style="color:var(--gold); display:block; margin-bottom:5px;">تخصيص الأجهزة (Configurator):</label>
                <select id="qv-ram-upgrade" style="width:100%; padding:10px; background:#111; color:#fff; border:1px solid #333; border-radius:8px;">
                    <option value="0">بدون ترقية (المواصفات الأساسية)</option>
                    <option value="50">ترقية الذاكرة إلى 32GB (+50 JOD)</option>
                    <option value="120">ترقية الذاكرة إلى 64GB (+120 JOD)</option>
                </select>
            </li>
        `;
        
        let basePrice = p.price;
        const upgradeSelect = document.getElementById('qv-ram-upgrade');
        upgradeSelect.onchange = (e) => {
            document.getElementById('qv-price').innerText = (basePrice + parseFloat(e.target.value)).toFixed(2) + ' JOD';
        };

        const addBtn = document.getElementById('qv-add-btn');
        addBtn.onclick = () => { 
            addToCart(p.id); 
            if(upgradeSelect.value > 0) window.showToast('تم إضافة الترقية للطلب المبدئي');
            document.getElementById('qv-modal').style.display = 'none'; 
        };
        
        document.getElementById('qv-modal').style.display = 'flex';
    };

    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            currentCategoryFilter = e.target.dataset.cat;
            window.applyAdvancedFilters();
        });
    });

    window.searchProducts = () => window.applyAdvancedFilters();

    window.applyAdvancedFilters = () => {
        const prodContainer = document.getElementById('product-container');
        const fullProdContainer = document.getElementById('full-product-container');
        const targetContainer = fullProdContainer || prodContainer;
        if (!targetContainer) return;

        const nameFilter = (document.getElementById('prod-search')?.value || '').toLowerCase();
        const maxPrice = parseFloat(document.getElementById('price-filter')?.value || 100000);
        const ramFilter = document.getElementById('ram-filter')?.value || '';

        let products = DB.getProducts().filter(p => p.stock > 0);

        products = products.filter(p => {
            // Category Match
            if(currentCategoryFilter && p.category !== currentCategoryFilter) return false;
            
            // Name Match
            if(nameFilter && !p.name.toLowerCase().includes(nameFilter) && !(p.category || '').toLowerCase().includes(nameFilter)) return false;
            
            // Price Match
            if(p.price > maxPrice) return false;

            // RAM Specs Match
            if(ramFilter) {
                const specs = p.specs ? p.specs.join(' ') : '';
                if(!specs.includes(ramFilter)) return false; // Mock exact match for simplicity
            }

            return true;
        });

        // Limit to 4 items on the home page preview
        if (prodContainer && !fullProdContainer && !nameFilter && !currentCategoryFilter) {
            products = products.slice(0, 4);
        }

        renderProductsHTML(products, targetContainer);
    };

    // --- RENDER LOGIC ---
    const renderProductsHTML = (products, targetContainer) => {
        targetContainer.innerHTML = products.length ? products.map(p => `
            <div class="product-card reveal active">
                <div class="img-container" style="cursor:pointer; position:relative;" onclick="openQuickView('${p.id}')" title="معاينة سريعة">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                    <button onclick="event.stopPropagation(); window.toggleWL('${p.id}')" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.5); border:none; color:${(DB.getWishlist && DB.getWishlist().includes(String(p.id))) ? 'var(--gold)' : '#fff'}; width:35px; height:35px; border-radius:50%; cursor:pointer; font-size:1.2rem; transition:0.3s; z-index:10;"><i class="fas fa-heart"></i></button>
                    ${p.stock < 10 ? `<span style="position:absolute; top:10px; left:10px; background:var(--danger); color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8rem; z-index:10;">كمية محدودة</span>` : ''}
                </div>
                <h3 style="cursor:pointer;" onclick="openQuickView('${p.id}')">${p.name}</h3>
                <div style="color:var(--gold); font-size:0.8rem; margin:5px 0;">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating || 5))}
                    ${(p.rating || 5) % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span style="color:#888;">(${(p.rating || 5).toFixed(1)})</span>
                </div>
                <p class="category">${p.category || 'تجهيزات تقنية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add" data-id="${p.id}">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لا توجد أجهزة مطابقة.</p>';

        targetContainer.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
        });
    };

    window.toggleWL = (id) => {
        if(DB.toggleWishlist) {
            DB.toggleWishlist(id);
            window.showToast('تم تحديث المفضلة بنجاح');
            window.applyAdvancedFilters();
        }
    };

    let appliedDiscount = 0;

    window.applyCoupon = () => {
        const input = document.getElementById('coupon-code');
        if(!input || !input.value.trim()) return;
        const code = input.value.trim().toUpperCase();
        const coupons = DB.getCoupons ? DB.getCoupons() : [];
        const valid = coupons.find(c => c.code === code);
        
        if(valid) {
            appliedDiscount = valid.discount;
            window.showToast(`تم تطبيق خصم المؤسسة: ${valid.discount * 100}% بنجاح`);
            updateCartUI();
        } else {
            window.showToast('كود الخصم غير صالح أو منتهي الصلاحية', 'error');
            appliedDiscount = 0;
            updateCartUI();
        }
    };

    const updateCartUI = () => {
        localStorage.setItem('zolngen_cart', JSON.stringify(cart));
        const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
        let rawTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
        
        // Volume Discount (10% if > 5 items) OR Coupon Discount
        let discountRate = totalItems >= 5 ? 0.1 : 0;
        if(appliedDiscount > discountRate) discountRate = appliedDiscount;
        
        let finalDiscount = rawTotal * discountRate;
        
        if (cartCount) cartCount.innerText = totalItems;
        if (cartTotalVal) {
            cartTotalVal.innerText = (rawTotal - finalDiscount).toFixed(2);
        }
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cart.length ? cart.map(item => `
                <div style="display:flex; gap:12px; margin-bottom:20px; padding:15px; background:rgba(255,255,255,0.03); border-radius:15px; align-items:center;">
                    <img src="${item.img}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:8px;" onerror="this.src='https://placehold.co/60x60'">
                    <div style="flex:1;">
                        <h4 style="font-size:0.9rem; color:#fff; margin-bottom:5px;">${item.name}</h4>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:#222; border:none; color:#fff; width:25px; height:25px; border-radius:5px; cursor:pointer;">-</button>
                            <span style="font-weight:700;">${item.qty}</span>
                            <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:#222; border:none; color:#fff; width:25px; height:25px; border-radius:5px; cursor:pointer;">+</button>
                            <span style="margin-right:auto; color:var(--gold); font-weight:900;">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" style="background:none; border:none; color:#ff4757; cursor:pointer; padding:5px;"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('') : '<div style="text-align:center; color:#444; margin-top:100px;"><i class="fas fa-shopping-basket" style="font-size:3rem; margin-bottom:1rem;"></i><p>قائمة التوريد فارغة</p></div>';

            cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', (e) => updateQty(e.target.dataset.id, parseInt(e.target.dataset.delta))));
            cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', (e) => removeFromCart(e.target.closest('button').dataset.id)));
        }
    };

    const addToCart = (id) => {
        const prod = DB.getProducts().find(p => String(p.id) === String(id));
        if (!prod) return;
        const existing = cart.find(i => String(i.id) === String(id));
        if (existing) existing.qty++;
        else cart.push({ ...prod, qty: 1 });
        updateCartUI();
        
        if (cartCount) {
            cartCount.classList.remove('pop-anim');
            void cartCount.offsetWidth; // trigger reflow
            cartCount.classList.add('pop-anim');
        }
        
        window.showToast(`تمت إضافة ${prod.name} لقائمة التوريد`);
        toggleCart(true);
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) removeFromCart(id);
            else updateCartUI();
        }
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => String(i.id) !== String(id));
        updateCartUI();
    };

    const toggleCart = (force = null) => {
        if (!cartSidebar) return;
        if (force === true) cartSidebar.style.right = '0';
        else if (force === false) cartSidebar.style.right = '-450px';
        else cartSidebar.style.right = cartSidebar.style.right === '0px' ? '-450px' : '0';
    };

    // --- EVENTS & FORMS ---
    document.getElementById('cart-trigger')?.addEventListener('click', () => toggleCart());
    document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
    document.getElementById('btn-order-trigger')?.addEventListener('click', () => {
        if (!cart.length) return window.showToast('يرجى إضافة أجهزة لقائمة التوريد أولاً.', 'error');
        orderModal.style.display = 'flex';
    });
    document.getElementById('modal-close')?.addEventListener('click', () => orderModal.style.display = 'none');

    let lastOrderTime = 0;
    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Spam Protection (60 seconds cooldown)
        const now = Date.now();
        if (now - lastOrderTime < 60000) {
            window.showToast('يرجى الانتظار دقيقة قبل إرسال طلب جديد لحماية النظام', 'error');
            return;
        }
        lastOrderTime = now;

        const docId = document.getElementById('doc-id')?.value || 'غير محدد';
        const order = DB.placeOrder({
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            docId: docId,
            entity: document.getElementById('university').value,
            notes: document.getElementById('notes').value,
            items: [...cart],
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0) * (1 - appliedDiscount)
        });
        cart = []; updateCartUI();
        orderModal.style.display = 'none';
        window.showSuccessModal('تم تأكيد طلب التوريد بنجاح', order);
        e.target.reset();
    });

    // Maintenance Ticket Logic
    const maintenanceForm = document.getElementById('maintenance-form') || document.getElementById('maintenance-form-page');
    maintenanceForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const entityVal = document.getElementById('m-entity-p')?.value || document.getElementById('m-entity')?.value;
        const typeVal = document.getElementById('m-type-p')?.value || document.getElementById('m-type')?.value;
        const issueVal = document.getElementById('m-issue-p')?.value || document.getElementById('m-issue')?.value;

        const ticket = DB.createTicket({
            entity: entityVal,
            type: typeVal,
            issue: issueVal
        });
        window.showSuccessModal('تم تسجيل التذكرة الفنية بنجاح', ticket);
        e.target.reset();
    });

    document.getElementById('btn-track')?.addEventListener('click', () => {
        const id = document.getElementById('track-id').value.trim().toUpperCase();
        const res = document.getElementById('track-result');
        if (!res || !id) return;

        let found = null;
        let type = '';

        if (id.startsWith('ORD-')) {
            found = DB.getOrders().find(o => String(o.id) === id);
            type = 'طلب توريد مؤسسي';
        } else if (id.startsWith('TCK-')) {
            found = DB.getTickets().find(t => String(t.id) === id);
            type = 'تذكرة صيانة ودعم';
        }

        if (found) {
            let statusText = '';
            let progress = 50;
            if (found.status === 'pending') { statusText = 'قيد المعالجة (Pending)'; progress = 30; }
            else if (found.status === 'delivered') { statusText = 'مكتمل (Delivered)'; progress = 100; }
            else if (found.status === 'open') { statusText = 'مفتوحة (قيد المراجعة)'; progress = 20; }
            else if (found.status === 'resolved') { statusText = 'تم الحل (Resolved)'; progress = 100; }

            res.innerHTML = `
                <div class="tracking-card" style="text-align:right;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <div>
                            <span style="background:rgba(212,175,55,0.1); color:var(--gold); padding:5px 15px; border-radius:20px; font-size:0.8rem; font-weight:800;">${type}</span>
                            <h3 style="color:var(--text); margin-top:10px; font-size:1.5rem;">المرجع: <span style="font-family:monospace; color:var(--gold);">${found.id}</span></h3>
                        </div>
                        <i class="fas ${id.startsWith('ORD') ? 'fa-box' : 'fa-tools'}" style="font-size:3rem; color:var(--border-gold);"></i>
                    </div>
                    
                    <p style="color:var(--text-muted); font-size:1.1rem; margin-bottom:2rem;">الجهة المستفيدة: <strong style="color:var(--text);">${found.entity}</strong> | التاريخ: <strong style="color:var(--text);">${found.date}</strong></p>
                    
                    <h4 style="color:var(--gold); margin-bottom:10px; font-size:1.2rem;">الحالة الحالية: ${statusText}</h4>
                    <div style="height:8px; background:var(--surface); border:1px solid #333; border-radius:4px; position:relative; overflow:hidden;">
                        <div style="position:absolute; height:100%; width:${progress}%; background:var(--grad); transition:1s ease-out;"></div>
                    </div>
                </div>
            `;
        } else {
            res.innerHTML = '<p style="color:#ff4757; margin-top:2rem; font-size:1.2rem; font-weight:800;"><i class="fas fa-exclamation-triangle"></i> عذراً، رقم المرجع غير صحيح أو غير مسجل في النظام.</p>';
        }
    });

    // --- INITIALIZE ---
    window.applyAdvancedFilters();
    updateCartUI();
    
    // Load Entities for autocomplete globally
    if(DB.getEntitiesList) {
        const ents = DB.getEntitiesList();
        let dl = document.getElementById('entities-list');
        if(!dl) {
            dl = document.createElement('datalist');
            dl.id = 'entities-list';
            document.body.appendChild(dl);
        }
        dl.innerHTML = ents.map(e => `<option value="${e}">`).join('');
    }

    window.generatePDFQuote = () => {
        if (!cart.length) return window.showToast('قائمة التوريد فارغة!', 'error');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text("ZOLNGEN - Official Quote", 20, 20);
        let y = 40;
        cart.forEach(i => { doc.text(`${i.name} (Qty: ${i.qty}) - ${(i.price * i.qty).toFixed(2)} JOD`, 20, y); y += 10; });
        doc.text(`Total Estimate: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 15);
        doc.save(`ZOLNGEN_Estimate.pdf`);
    };

    // --- CHAT SYSTEM ---
    window.renderClientChat = () => {
        const chats = DB.getChats();
        const box = document.getElementById('client-chat-box');
        if(!box) return;
        box.innerHTML = chats.map(c => `
            <div style="background:${c.isClient ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)'}; padding:10px; border-radius:10px; width:fit-content; max-width:85%; margin-${c.isClient ? 'right' : 'left'}:auto; border:1px solid ${c.isClient ? 'var(--gold)' : '#333'}; text-align:${c.isClient ? 'right' : 'left'};">
                <div style="font-size:0.7rem; color:${c.isClient ? 'var(--gold)' : '#aaa'}; margin-bottom:3px; font-weight:bold;">${c.sender}</div>
                <div style="font-size:0.9rem; color:#fff;">${c.message}</div>
            </div>
        `).join('');
        box.scrollTop = box.scrollHeight;
    };

    window.sendClientChat = () => {
        const input = document.getElementById('client-chat-input');
        if(!input || !input.value.trim()) return;
        
        let senderName = 'عميل مؤسسي';
        const sessionClient = sessionStorage.getItem('zolngen_client_user');
        if (sessionClient) {
            senderName = JSON.parse(sessionClient).name;
        }

        DB.addChatMessage(senderName, input.value, true);
        input.value = '';
        window.renderClientChat();
    };

    setInterval(() => {
        if(document.getElementById('chat-window')?.style.display === 'flex') window.renderClientChat();
    }, 2000);

    // --- CLIENT AUTHENTICATION LOGIC ---
    window.toggleAuthView = (view) => {
        document.getElementById('client-login-view').style.display = view === 'login' ? 'block' : 'none';
        document.getElementById('client-register-view').style.display = view === 'register' ? 'block' : 'none';
        document.getElementById('auth-modal-title').innerText = view === 'login' ? 'تسجيل دخول مؤسسي' : 'تسجيل موظف جديد';
    };

    document.getElementById('client-register-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('r-user').value;
        const pass = document.getElementById('r-pass').value;
        const name = document.getElementById('r-name').value;
        const empId = document.getElementById('r-emp-id').value;
        const phone = document.getElementById('r-phone').value;
        const inst = document.getElementById('r-inst').value;
        const role = document.getElementById('r-role').value;

        const accounts = DB.getClientAccounts();
        if (accounts.some(a => a.user === user)) {
            window.showToast('اسم المستخدم مستخدم مسبقاً', 'error');
            return;
        }

        const newAcc = { user, pass, name, empId, phone, inst, role };
        DB.saveClientAccount(newAcc);
        DB.saveEntity(inst); // Save as new entity globally
        sessionStorage.setItem('zolngen_client_user', JSON.stringify(newAcc));
        
        document.getElementById('client-auth-modal').style.display = 'none';
        window.showToast('تم التسجيل وتسجيل الدخول بنجاح');
        window.updateClientAuthUI();
        e.target.reset();
    });

    document.getElementById('client-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('l-user').value;
        const p = document.getElementById('l-pass').value;
        
        const acc = DB.getClientAccounts().find(a => a.user === u && a.pass === p);
        if (acc) {
            sessionStorage.setItem('zolngen_client_user', JSON.stringify(acc));
            document.getElementById('client-auth-modal').style.display = 'none';
            window.showToast(`مرحباً بك ${acc.name}`);
            window.updateClientAuthUI();
            e.target.reset();
        } else {
            window.showToast('بيانات الدخول غير صحيحة', 'error');
        }
    });

    window.updateClientAuthUI = () => {
        const btn = document.getElementById('client-auth-btn');
        if (!btn) return;

        const sessionClient = sessionStorage.getItem('zolngen_client_user');
        const parentDiv = btn.parentElement;

        if (sessionClient) {
            const acc = JSON.parse(sessionClient);
            btn.innerHTML = `<i class="fas fa-user-circle"></i> ${acc.name}`;
            btn.onclick = () => {
                if(confirm('هل تريد تسجيل الخروج؟')) {
                    sessionStorage.removeItem('zolngen_client_user');
                    window.updateClientAuthUI();
                    window.showToast('تم تسجيل الخروج بنجاح');
                }
            };

            // Add My Orders Button if it doesn't exist
            if(!document.getElementById('my-orders-btn')) {
                const myOrdersBtn = document.createElement('button');
                myOrdersBtn.id = 'my-orders-btn';
                myOrdersBtn.innerHTML = `<i class="fas fa-receipt"></i> أرشيف الطلبات`;
                myOrdersBtn.style.cssText = `background:none; border:1px solid var(--gold); color:var(--gold); padding:8px 15px; border-radius:8px; cursor:pointer; margin-right:10px; font-weight:bold; transition:0.3s;`;
                myOrdersBtn.onclick = window.openMyOrders;
                parentDiv.insertBefore(myOrdersBtn, btn);
            }

            // Pre-fill Order Form
            if(document.getElementById('full-name')) document.getElementById('full-name').value = acc.name;
            if(document.getElementById('phone')) document.getElementById('phone').value = acc.phone;
            if(document.getElementById('doc-id')) document.getElementById('doc-id').value = acc.empId;
            if(document.getElementById('university')) document.getElementById('university').value = acc.inst;

            // Pre-fill Maintenance Form
            if(document.getElementById('m-entity-p')) document.getElementById('m-entity-p').value = acc.inst;

        } else {
            btn.innerHTML = `تسجيل المؤسسات`;
            btn.onclick = () => document.getElementById('client-auth-modal').style.display = 'flex';
            
            // Remove My Orders Button
            const moBtn = document.getElementById('my-orders-btn');
            if(moBtn) moBtn.remove();

            // Clear Order Form
            if(document.getElementById('full-name')) document.getElementById('full-name').value = '';
            if(document.getElementById('phone')) document.getElementById('phone').value = '';
            if(document.getElementById('doc-id')) document.getElementById('doc-id').value = '';
            if(document.getElementById('university')) document.getElementById('university').value = '';
        }
    };

    window.openMyOrders = () => {
        const sessionClient = sessionStorage.getItem('zolngen_client_user');
        if(!sessionClient) return;
        const acc = JSON.parse(sessionClient);
        
        const orders = DB.getOrders().filter(o => o.entity === acc.inst || o.fullName === acc.name);
        const listDiv = document.getElementById('my-orders-list');
        
        if(listDiv) {
            listDiv.innerHTML = orders.length ? orders.map(o => `
                <div style="background:#111; border-left:4px solid var(--gold); padding:20px; border-radius:10px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong style="color:var(--gold); font-size:1.2rem;">رقم الطلب: #${o.id}</strong>
                        <span style="color:#888;">${o.date}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>القيمة الإجمالية: <strong>${o.total.toFixed(2)} JOD</strong></span>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button class="btn btn-outline btn-sm" onclick="window.printInvoice('${o.id}')"><i class="fas fa-print"></i> طباعة الفاتورة</button>
                            <span class="badge bg-${o.status === 'delivered' ? 'success' : 'pending'}">${o.status === 'delivered' ? 'مكتمل' : 'نشط'}</span>
                        </div>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:#888;">لا توجد طلبات سابقة في سجلك المؤسسي.</p>';
        }

        const modal = document.getElementById('my-orders-modal');
        if(modal) modal.style.display = 'flex';
    };

    window.printInvoice = (orderId) => {
        const order = DB.getOrders().find(o => String(o.id) === String(orderId));
        if(!order) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18); 
        doc.text("ZOLNGEN ENTERPRISE - OFFICIAL INVOICE", 20, 20);
        doc.setFontSize(12);
        doc.text(`Order Number: #${order.id}`, 20, 35);
        doc.text(`Entity: ${order.entity}`, 20, 45);
        doc.text(`Date: ${order.date}`, 20, 55);
        
        let y = 70;
        doc.text("Items:", 20, y);
        y += 10;
        if(order.items && order.items.length) {
            order.items.forEach(i => {
                doc.text(`- ${i.name} (Qty: ${i.qty}) = ${(i.price * i.qty).toFixed(2)} JOD`, 25, y);
                y += 10;
            });
        }
        
        y += 10;
        doc.setFontSize(14);
        doc.text(`Grand Total: ${order.total.toFixed(2)} JOD`, 20, y);
        doc.save(`Invoice_${order.id}.pdf`);
        window.showToast('تم تحميل الفاتورة بنجاح');
    };

    // Run auth UI init
    setTimeout(window.updateClientAuthUI, 500);

});
