# ZOLNGEN Enterprise Pro | Sovereign Systems V143.0

## 🏛️ Technical Overview
ZOLNGEN is a high-performance, full-stack institutional hardware registry designed for professional enterprise nodes. The system integrates a robust Python backend with an immutable SQLite engine and a cinematic GSAP-powered frontend.

## 🚀 Inspection Instructions
To initiate the system for inspection and testing, execute the following:
1. Ensure **Python 3.x** is installed.
2. Run the master launcher:
   ```bash
   python launch.py
   ```
3. The system will automatically:
   - Initialize and seed the SQLite database (`backend/enterprise.db`).
   - Start the REST API server on port `8000`.
   - Open the **Storefront** in your default browser.

## 🔐 Credentials (Admin Console)
- **URL:** `http://localhost:8000/admin.html`
- **Username:** `admin`
- **Password:** `1234`

## 🛠️ Stack Architecture
- **Backend:** Python (SocketServer), SQLite3 (Persistence).
- **Frontend:** Vanilla JS, Tailwind CSS, GSAP (Animations), Chart.js (Analytics).
- **Protocol:** RESTful API (JSON) with Bearer Token Authentication.

## 📑 Core Features for Testing
1. **Asset Registry:** Add, Edit, and Delete products via the Admin Dashboard.
2. **Order Management:** Place orders from the Storefront and update status in Admin.
3. **Institutional Support:** Submit inquiries from `contact.html` and review them in Admin.
4. **Live Audit:** View real-time system logs and revenue analytics.

---
**ZOLNGEN ENTERPRISE | ZERO-DEFECT MASTERPIECE**
