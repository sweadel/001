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
            sm.innerHTML = `
                <div class="success-content">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h2 style="color:var(--gold); margin-bottom:10px;" id="success-title">تم بنجاح</h2>
                    <p style="color:var(--text-muted); font-size:1.1rem; margin-bottom:5px;">يرجى الاحتفاظ برقم المرجع أدناه لتتبع الحالة:</p>
                    <div class="success-ref" id="success-ref-code">ORD-0000</div>
                    <button class="btn btn-gold" style="width:100%; justify-content:center;" onclick="document.getElementById('success-modal').style.display='none'">حسنًا، متابعة</button>
                </div>
            `;
            document.body.appendChild(sm);
        }
    };
    
    window.showSuccessModal = (title, refCode) => {
        document.getElementById('success-title').innerText = title;
        document.getElementById('success-ref-code').innerText = refCode;
        document.getElementById('success-modal').style.display = 'flex';
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

    window.searchProducts = (val) => renderProducts(val);

    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            currentCategoryFilter = e.target.dataset.cat;
            renderProducts(document.getElementById('prod-search')?.value || '');
        });
    });

    // --- RENDER LOGIC ---
    const renderProducts = (filter = '') => {
        const prodContainer = document.getElementById('product-container');
        const fullProdContainer = document.getElementById('full-product-container');
        
        const targetContainer = fullProdContainer || prodContainer;
        if (!targetContainer) return;

        let products = DB.getProducts().filter(p => 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             (p.category || '').toLowerCase().includes(filter.toLowerCase())) &&
            (currentCategoryFilter === '' || (p.category || '') === currentCategoryFilter)
        );

        // Limit to 4 items on the home page preview
        if (prodContainer && !fullProdContainer && filter === '') {
            products = products.slice(0, 4);
        }

        targetContainer.innerHTML = products.length ? products.map(p => `
            <div class="product-card reveal active">
                <div class="img-container" style="cursor:pointer;" onclick="openQuickView('${p.id}')" title="معاينة سريعة">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <h3 style="cursor:pointer;" onclick="openQuickView('${p.id}')">${p.name}</h3>
                <p class="category">${p.category || 'تجهيزات تقنية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add" data-id="${p.id}">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لا توجد أجهزة مطابقة.</p>';

        targetContainer.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
        });
    };

    const updateCartUI = () => {
        localStorage.setItem('zolngen_cart', JSON.stringify(cart));
        const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
        let rawTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
        let discount = totalItems >= 5 ? rawTotal * 0.1 : 0;
        
        if (cartCount) cartCount.innerText = totalItems;
        if (cartTotalVal) {
            cartTotalVal.innerText = (rawTotal - discount).toFixed(2);
            if (discount > 0) {
                cartTotalVal.innerHTML += `<br><span style="font-size:1rem; color:#2ecc71; display:block; margin-top:10px;">خصم كميات مؤسسية (10%): -${discount.toFixed(2)} JOD</span>`;
            }
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

    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const order = DB.placeOrder({
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            entity: document.getElementById('university').value,
            notes: document.getElementById('notes').value,
            items: [...cart],
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
        });
        cart = []; updateCartUI();
        orderModal.style.display = 'none';
        window.showSuccessModal('تم استلام طلب التوريد بنجاح', order.id);
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
        window.showSuccessModal('تم تسجيل التذكرة الفنية بنجاح', ticket.id);
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
    renderProducts();
    updateCartUI();

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

    document.getElementById('chat-toggle')?.addEventListener('click', () => {
        const win = document.getElementById('chat-window');
        if(win.style.display === 'none') {
            win.style.display = 'flex';
            window.renderClientChat();
        } else {
            win.style.display = 'none';
        }
    });

    window.sendClientChat = () => {
        const input = document.getElementById('client-chat-input');
        if(!input || !input.value.trim()) return;
        DB.addChatMessage('عميل مؤسسي', input.value, true);
        input.value = '';
        window.renderClientChat();
    };

    setInterval(() => {
        if(document.getElementById('chat-window')?.style.display === 'flex') window.renderClientChat();
    }, 2000);

});
