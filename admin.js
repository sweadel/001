// ZOLNGEN COMMAND CENTER PRO v20 - THE ERP STANDARD
let mainChart;
let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    // --- PREMIUM UX SETUP ---
    window.setupPremiumUX = () => {
        if (!document.getElementById('toast-container')) {
            const toastCont = document.createElement('div');
            toastCont.id = 'toast-container';
            document.body.appendChild(toastCont);
        }
    };
    window.showToast = (msg, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 10));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
    };
    setupPremiumUX();

    // 0. Real-Time Admin Clock
    setInterval(() => {
        const clock = document.getElementById('real-time-clock');
        if (clock) clock.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    // 1. Auth & Session (Improved)
    if (sessionStorage.getItem('admin_pro_auth') === 'true') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        initProAdmin();
    }

    document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('admin-user').value;
        const p = document.getElementById('admin-pass').value;
        if (u === 'admin' && p === 'admin123') {
            sessionStorage.setItem('admin_pro_auth', 'true');
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-shell').style.display = 'grid';
            DB.logAction('تسجيل دخول ناجح للمنظومة الاحترافية');
            initProAdmin();
        } else window.showToast('خطأ في بيانات الدخول الصارمة', 'error');
    });

    function initProAdmin() {
        showTab('dashboard');
        checkLowStock();
    }

    // 2. Tab Navigation & Rendering
    function showTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        const target = document.getElementById(tab + '-tab');
        if (target) target.style.display = 'block';
        
        document.querySelectorAll('.nav-link[data-tab="'+tab+'"]').forEach(l => l.classList.add('active'));
        document.getElementById('page-title').innerText = document.querySelector('.nav-link.active').innerText;
        
        refreshData();
    }

    function refreshData() {
        if (currentTab === 'dashboard') renderDashboard();
        if (currentTab === 'orders') renderOrders();
        if (currentTab === 'inventory') renderInventory();
        if (currentTab === 'entities') renderEntities();
        if (currentTab === 'tickets') renderTickets();
        if (currentTab === 'accounts') renderAccounts();
        if (currentTab === 'chat') renderChats();
        if (currentTab === 'audit') renderAudit();
    }

    // 3. Dashboard Logic (Profit & Charts)
    function renderDashboard() {
        const stats = DB.getProStats();
        document.getElementById('stat-sales').innerText = stats.totalSales.toLocaleString() + ' JOD';
        document.getElementById('stat-profit').innerText = stats.totalProfit.toLocaleString() + ' JOD';
        document.getElementById('stat-active').innerText = stats.activeOrders;
        document.getElementById('stat-inv-val').innerText = stats.inventoryValue.toLocaleString() + ' JOD';
        
        const alertBox = document.getElementById('low-stock-alert');
        if (stats.lowStock > 0) {
            alertBox.innerText = `${stats.lowStock} منتجات منخفضة المخزون!`;
            alertBox.style.color = 'var(--danger)';
            document.getElementById('notif-dot').style.display = 'block';
        } else {
            alertBox.innerText = 'المخزون مستقر';
            alertBox.style.color = 'var(--success)';
            document.getElementById('notif-dot').style.display = 'none';
        }

        const ctx = document.getElementById('mainChart')?.getContext('2d');
        if (!ctx) return;
        if (mainChart) mainChart.destroy();
        mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل'],
                datasets: [
                    { label: 'المبيعات', data: [8000, 12000, 9500, stats.totalSales], borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.05)', fill: true, tension: 0.4 },
                    { label: 'الأرباح', data: [2000, 3500, 2800, stats.totalProfit], borderColor: '#2ecc71', borderDash: [5,5], tension: 0.4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });

        // Mini Audit
        const logs = DB.getAuditLog().slice(0, 5);
        document.getElementById('mini-audit').innerHTML = logs.map(l => `<div style="margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;">${l.action} <br><small>${l.date}</small></div>`).join('');
    }

    // 4. Advanced Table Rendering
    function renderOrders(filter = '') {
        const orders = DB.getOrders().filter(o => o.entity.includes(filter) || o.id.includes(filter));
        document.getElementById('orders-tbody').innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td><strong>${o.entity}</strong></td>
                <td>${o.date}</td>
                <td style="color:var(--primary); font-weight:700;">${o.total.toFixed(2)}</td>
                <td style="color:var(--success);">${(o.profit || 0).toFixed(2)}</td>
                <td><span class="badge bg-${o.status === 'delivered' ? 'success' : 'pending'}">${o.status === 'delivered' ? 'مكتمل' : 'نشط'}</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="deliverOrder('${o.id}')">تسليم</button></td>
            </tr>
        `).join('');
    }

    function renderInventory() {
        const prods = DB.getProducts();
        document.getElementById('inventory-tbody').innerHTML = prods.map(p => `
            <tr class="${p.stock < 10 ? 'low-stock-row' : ''}">
                <td><strong>${p.name}</strong><br><small>${p.category}</small></td>
                <td>${p.supplier || 'غير محدد'}</td>
                <td>${(p.cost || 0).toFixed(2)}</td>
                <td style="color:var(--primary); font-weight:700;">${p.price.toFixed(2)}</td>
                <td style="color:${p.stock < 10 ? 'var(--danger)' : 'var(--success)'}; font-weight:800;">${p.stock}</td>
                <td style="display:flex; gap:5px;">
                    <button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="deleteProduct('${p.id}')" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function renderEntities() {
        const ents = DB.getEntities();
        document.getElementById('entities-tbody').innerHTML = ents.map(e => `
            <tr>
                <td><strong>${e.name}</strong></td>
                <td>${e.totalOrders} طلبات</td>
                <td style="color:var(--primary);">${e.totalValue.toLocaleString()} JOD</td>
                <td><span class="badge bg-success">عميل نشط</span></td>
            </tr>
        `).join('');
    }

    function renderTickets() {
        const tickets = DB.getTickets();
        document.getElementById('tickets-tbody').innerHTML = tickets.length ? tickets.map(t => `
            <tr>
                <td>#${t.id.split('-')[1]}</td>
                <td><strong>${t.entity}</strong></td>
                <td>${t.issue}</td>
                <td>${t.date}</td>
                <td><span class="badge bg-${t.status === 'resolved' ? 'success' : 'pending'}">${t.status === 'resolved' ? 'تم الحل' : 'مفتوحة'}</span></td>
                <td>
                    ${t.status !== 'resolved' ? `<button class="btn btn-outline btn-sm" onclick="resolveTicket('${t.id}')"><i class="fas fa-check" style="color:var(--success);"></i> حل المشكلة</button>` : '<span style="color:var(--success); font-weight:800;"><i class="fas fa-check-circle"></i> مغلقة</span>'}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#666;">لا توجد تذاكر صيانة حالية</td></tr>';
    }

    function renderAudit() {
        const logs = DB.getAuditLog();
        document.getElementById('audit-full-log').innerHTML = logs.map(l => `
            <div style="padding:15px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between;">
                <span><i class="fas fa-history" style="color:var(--primary); margin-left:10px;"></i> ${l.action}</span>
                <span style="color:#666;">${l.date}</span>
            </div>
        `).join('');
    }

    function renderAccounts() {
        const accs = DB.getAccounts();
        document.getElementById('accounts-tbody').innerHTML = accs.map(a => `
            <tr>
                <td><strong>${a.user}</strong></td>
                <td><span class="badge bg-pending">${a.role}</span></td>
                <td>
                    ${a.user !== 'admin' ? `<button class="btn btn-outline btn-sm" onclick="deleteAccount('${a.user}')" style="color:var(--danger);"><i class="fas fa-trash"></i></button>` : '<span style="color:#666;">حساب أساسي</span>'}
                </td>
            </tr>
        `).join('');
    }

    function renderChats() {
        const chats = DB.getChats();
        const box = document.getElementById('chat-box');
        if(!box) return;
        box.innerHTML = chats.map(c => `
            <div style="background:${c.isClient ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)'}; padding:15px; border-radius:15px; width:fit-content; max-width:80%; margin-${c.isClient ? 'right' : 'left'}:auto; border:1px solid ${c.isClient ? 'var(--primary)' : 'var(--border)'};">
                <div style="font-size:0.8rem; color:var(--primary); margin-bottom:5px; font-weight:bold;">${c.sender} <span style="color:#666; margin-right:10px; font-weight:normal;">${c.date}</span></div>
                <div style="font-size:1rem; color:#fff;">${c.message}</div>
            </div>
        `).join('');
        box.scrollTop = box.scrollHeight;
    }

    // 5. Tool Implementations (Export, Backup, Theme)
    window.toggleTheme = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        document.querySelector('.nav-link[onclick="toggleTheme()"]').innerHTML = isLight ? '<i class="fas fa-sun"></i> الوضع النهاري' : '<i class="fas fa-moon"></i> الوضع الليلي';
    };

    window.exportOrdersToExcel = () => {
        const orders = DB.getOrders();
        let csv = "رقم الطلب,الجهة,التاريخ,الإجمالي,الربح,الحالة\n";
        orders.forEach(o => {
            csv += `${o.id},${o.entity},${o.date},${o.total},${o.profit},${o.status}\n`;
        });
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ZOLNGEN_Orders_${Date.now()}.csv`;
        link.click();
        DB.logAction('تصدير بيانات الطلبات لملف Excel');
        window.showToast('تم تصدير ملف Excel بنجاح');
    };

    window.generateReport = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const stats = DB.getProStats();
        doc.setFontSize(22); doc.text("ZOLNGEN ENTERPRISE REPORT", 20, 20);
        doc.setFontSize(14);
        doc.text(`Report Date: ${new Date().toLocaleString()}`, 20, 35);
        doc.text(`Total Sales: ${stats.totalSales} JOD`, 20, 50);
        doc.text(`Total Net Profit: ${stats.totalProfit} JOD`, 20, 60);
        doc.text(`Active Orders: ${stats.activeOrders}`, 20, 70);
        doc.text(`Inventory Asset Value: ${stats.inventoryValue} JOD`, 20, 80);
        doc.save(`ZOLNGEN_Pro_Report_${Date.now()}.pdf`);
        DB.logAction('توليد تقرير PDF شامل للمنظومة');
        window.showToast('تم حفظ تقرير PDF بنجاح');
    };

    window.backupSystem = () => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ZOLNGEN_System_Backup_${Date.now()}.json`;
        link.click();
        DB.logAction('إنشاء نسخة احتياطية كاملة للمنظومة');
        window.showToast('تم تفعيل النسخ الاحتياطي للنظام');
    };

    window.restoreSystem = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                DB.logAction('استعادة النظام من نسخة احتياطية سابقة');
                window.showToast('تم استعادة النظام بنجاح! سيتم التحديث...', 'success');
                setTimeout(() => location.reload(), 2000);
            } catch(err) {
                window.showToast('ملف النسخة الاحتياطية غير صالح', 'error');
            }
        };
        reader.readAsText(file);
    };

    window.deliverOrder = (id) => {
        if (confirm('تأكيد تسليم الطلب وتحويل حالته لمكتمل؟')) {
            DB.updateOrderStatus(id, 'delivered');
            refreshData();
            window.showToast('تم تحديث حالة الطلب إلى مكتمل');
        }
    };

    window.resolveTicket = (id) => {
        if (confirm('تأكيد حل المشكلة الفنية وإغلاق التذكرة؟')) {
            let tickets = DB.getTickets();
            let t = tickets.find(x => String(x.id) === String(id));
            if (t) {
                t.status = 'resolved';
                DB.set('zolngen_tickets', tickets);
                DB.logAction(`إغلاق تذكرة صيانة رقم: ${id}`);
                refreshData();
                window.showToast('تم إغلاق التذكرة بنجاح');
            }
        }
    };

    window.editProduct = (id) => {
        const p = DB.getProducts().find(x => String(x.id) === String(id));
        if (!p) return;
        document.getElementById('p-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-supplier').value = p.supplier || '';
        document.getElementById('p-cat').value = p.category || '';
        document.getElementById('p-cost').value = p.cost || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('modal-head').innerText = 'تعديل بيانات المنتج';
        document.getElementById('prod-modal').style.display = 'flex';
    };

    window.deleteProduct = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المستودع؟')) {
            DB.deleteProduct(id);
            refreshData();
            window.showToast('تم حذف المنتج بنجاح');
        }
    };

    document.getElementById('prod-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('p-img-upload');
        const existingId = document.getElementById('p-id').value;
        let imgVal = existingId ? (DB.getProducts().find(x => String(x.id) === String(existingId))?.img || 'category_laptops.png') : 'category_laptops.png';
        
        const finalizeSave = (finalImg) => {
            const p = {
                id: existingId || null,
                name: document.getElementById('p-name').value,
                supplier: document.getElementById('p-supplier').value,
                category: document.getElementById('p-cat').value,
                cost: parseFloat(document.getElementById('p-cost').value),
                price: parseFloat(document.getElementById('p-price').value),
                stock: parseInt(document.getElementById('p-stock').value),
                img: finalImg
            };
            DB.saveProduct(p);
            closeModal();
            refreshData();
            window.showToast('تم حفظ المنتج في المستودع');
        };

        if(fileInput && fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (ev) => finalizeSave(ev.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            finalizeSave(imgVal);
        }
    });

    document.getElementById('entity-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        DB.saveEntity(document.getElementById('e-name').value);
        closeModal();
        refreshData();
        window.showToast('تم إضافة المؤسسة بنجاح');
    });

    document.getElementById('account-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        DB.saveAccount({
            user: document.getElementById('a-user').value,
            pass: document.getElementById('a-pass').value,
            role: document.getElementById('a-role').value
        });
        closeModal();
        refreshData();
        window.showToast('تم حفظ الحساب بنجاح');
    });

    window.deleteAccount = (user) => {
        if(confirm('تأكيد حذف الحساب نهائياً؟')) {
            DB.deleteAccount(user);
            refreshData();
            window.showToast('تم حذف الحساب');
        }
    };

    window.sendAdminChat = () => {
        const input = document.getElementById('chat-input');
        if(!input.value.trim()) return;
        DB.addChatMessage('الإدارة (دعم)', input.value, false);
        input.value = '';
        renderChats();
    };

    window.toggleNotifications = () => {
        const drop = document.getElementById('notif-dropdown');
        if(drop) drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
    };

    // Sidebar Links
    document.querySelectorAll('.sidebar .nav-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => showTab(e.target.closest('.nav-link').dataset.tab));
    });

    window.closeModal = () => document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    window.openProductModal = () => {
        document.getElementById('prod-form').reset();
        document.getElementById('p-id').value = '';
        document.getElementById('modal-head').innerText = 'إضافة منتج جديد للمستودع';
        document.getElementById('prod-modal').style.display = 'flex';
    };
    window.openEntityModal = () => { document.getElementById('entity-form').reset(); document.getElementById('entity-modal').style.display='flex'; };
    window.openAccountModal = () => { document.getElementById('account-form').reset(); document.getElementById('account-modal').style.display='flex'; };

    window.filterOrders = (val) => renderOrders(val);

    function checkLowStock() {
        const stats = DB.getProStats();
        let listHTML = '';
        if (stats.lowStock > 0) {
            document.getElementById('notif-dot').style.display = 'block';
            listHTML += `<div style="padding:10px; border-bottom:1px solid var(--border); color:var(--danger);"><i class="fas fa-exclamation-triangle"></i> يوجد ${stats.lowStock} منتجات منخفضة المخزون!</div>`;
        }
        
        const pending = DB.getOrders().filter(o => o.status === 'pending');
        if(pending.length > 0) {
            document.getElementById('notif-dot').style.display = 'block';
            listHTML += `<div style="padding:10px; border-bottom:1px solid var(--border); color:var(--success);"><i class="fas fa-shopping-cart"></i> ${pending.length} طلبات جديدة بانتظار المعالجة.</div>`;
        }

        const openTck = DB.getTickets().filter(t => t.status !== 'resolved');
        if(openTck.length > 0) {
            document.getElementById('notif-dot').style.display = 'block';
            listHTML += `<div style="padding:10px; border-bottom:1px solid var(--border); color:var(--primary);"><i class="fas fa-tools"></i> ${openTck.length} تذاكر صيانة تحتاج تدخل.</div>`;
        }

        if(!listHTML) listHTML = '<div style="padding:10px; text-align:center;">لا توجد إشعارات جديدة.</div>';
        
        const notifList = document.getElementById('notif-list');
        if(notifList) notifList.innerHTML = listHTML;
    }
});
