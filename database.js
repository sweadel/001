/* database.js - ZOLNGEN OMNI-DATABASE V123.0 (ACTUAL LOGIC) */
const ZolngenDB = {
    key: "zolngen_enterprise_data",

    // INITIAL SEED DATA
    seed: {
        products: [
            { id: "Z-001", name: "ZOLNGEN Quantum Blade", category: "Hardware", price: 15000, stock: 12, status: "Active" },
            { id: "Z-002", name: "Nebula Core Processor", category: "Core Unit", price: 8500, stock: 5, status: "Active" },
            { id: "Z-003", name: "Obsidian Shield Wall", category: "Security", price: 4200, stock: 20, status: "Active" }
        ],
        sales: [],
        audit: [],
        tickets: []
    },

    // INITIALIZE DB
    init() {
        if (!localStorage.getItem(this.key)) {
            localStorage.setItem(this.key, JSON.stringify(this.seed));
            console.log("[DB] System Seeded Successfully.");
        }
    },

    // GET ALL DATA
    getData() {
        return JSON.parse(localStorage.getItem(this.key));
    },

    // SAVE DATA
    saveData(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
        // Trigger a custom event for real-time UI sync
        window.dispatchEvent(new Event('zolngen_db_update'));
    },

    // CRUD: CREATE PRODUCT
    addProduct(product) {
        const data = this.getData();
        data.products.push(product);
        this.saveData(data);
        SecurityCore.logAction("ADD_PRODUCT", `Added ${product.name}`);
    },

    // CRUD: DELETE PRODUCT
    deleteProduct(id) {
        const data = this.getData();
        data.products = data.products.filter(p => p.id !== id);
        this.saveData(data);
        SecurityCore.logAction("DELETE_PRODUCT", `Deleted product ID: ${id}`);
    },

    // CRUD: UPDATE STOCK
    updateStock(id, amount) {
        const data = this.getData();
        const p = data.products.find(p => p.id === id);
        if (p) {
            p.stock = amount;
            this.saveData(data);
        }
    }
};

ZolngenDB.init();
