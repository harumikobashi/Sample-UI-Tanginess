// ===== PRODUCT SALES ANALYSIS =====
// Reuses the same sample order data structure as Sales Analytics.
// Later, both files will pull from the same real order source instead of duplicating data.
const productBranchOrders = {
  general: [
    { orderId: 1, date: "2026-09-01", items: [{ name: "Strawberry", qty: 2, price: 50 }], total: 100, status: "Completed", branch: "General" },
    { orderId: 2, date: "2026-09-01", items: [{ name: "Mango", qty: 1, price: 55 }], total: 55, status: "Completed", branch: "General" },
    { orderId: 3, date: "2026-09-02", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "General" },
    { orderId: 4, date: "2026-09-02", items: [{ name: "Strawberry", qty: 1, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 105, status: "Completed", branch: "General" },
    { orderId: 5, date: "2026-09-03", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed", branch: "General" },
  ],
  plaridel: [
    { orderId: 11, date: "2026-09-01", items: [{ name: "Strawberry", qty: 3, price: 50 }], total: 150, status: "Completed", branch: "Plaridel" },
    { orderId: 12, date: "2026-09-02", items: [{ name: "Mango", qty: 2, price: 55 }], total: 110, status: "Completed", branch: "Plaridel" },
    { orderId: 13, date: "2026-09-02", items: [{ name: "Blueberry", qty: 2, price: 60 }, { name: "Strawberry", qty: 1, price: 50 }], total: 170, status: "Completed", branch: "Plaridel" },
    { orderId: 14, date: "2026-09-03", items: [{ name: "Mango", qty: 3, price: 55 }], total: 165, status: "Completed", branch: "Plaridel" },
  ],
  malolos: [
    { orderId: 21, date: "2026-09-01", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed", branch: "Malolos" },
    { orderId: 22, date: "2026-09-01", items: [{ name: "Strawberry", qty: 2, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 155, status: "Completed", branch: "Malolos" },
    { orderId: 23, date: "2026-09-02", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "Malolos" },
    { orderId: 24, date: "2026-09-03", items: [{ name: "Strawberry", qty: 3, price: 50 }], total: 150, status: "Completed", branch: "Malolos" },
    { orderId: 25, date: "2026-09-03", items: [{ name: "Mango", qty: 2, price: 55 }, { name: "Blueberry", qty: 1, price: 60 }], total: 170, status: "Completed", branch: "Malolos" },
  ],
};

function getSelectedBranchProducts() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";
  return productBranchOrders[selectedBranch] || productBranchOrders.general;
}

// STEP 1 & 2: TRAVERSAL + GROUPING
// This function goes through every order, then every item inside each order,
// and groups quantities/revenue by product name.
function analyzeProductSales(orders) {
  // "productMap" is like a dictionary/box labeled by product name.
  // Example: { "Strawberry": { quantity: 3, revenue: 150 } }
  const productMap = {};

  // TRAVERSAL: go through every order one by one.
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== "Completed") continue;

    // TRAVERSAL (nested): go through every item inside this order.
    for (let j = 0; j < order.items.length; j++) {
      const item = order.items[j];

      // If we haven't seen this product before, create a fresh entry for it.
      if (!productMap[item.name]) {
        productMap[item.name] = { quantity: 0, revenue: 0 };
      }

      // AGGREGATION: add this item's quantity and revenue to its product's totals.
      productMap[item.name].quantity += item.qty;
      productMap[item.name].revenue += item.qty * item.price;
    }
  }

  // Convert the productMap into a plain array so we can sort it.
  // Each entry becomes: { name: "Strawberry", quantity: 3, revenue: 150 }
  let productArray = Object.keys(productMap).map(name => ({
    name: name,
    quantity: productMap[name].quantity,
    revenue: productMap[name].revenue,
  }));

  // SORTING: arrange products from highest revenue to lowest.
  // This is a simple comparison-based sort (JavaScript's built-in sort,
  // which behaves like an efficient version of bubble/merge sort under the hood).
  productArray.sort((a, b) => b.revenue - a.revenue);

  // Add rank (1st, 2nd, 3rd...) based on the sorted order.
  for (let i = 0; i < productArray.length; i++) {
    productArray[i].rank = i + 1;
  }

  return productArray;
}

// ===== RENDER FUNCTION =====
function renderProductSalesTable(products) {
  const container = document.getElementById("productSalesContainer");

  let rowsHtml = "";
  let topProduct = null;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (i === 0) topProduct = p;

    rowsHtml += `
      <tr>
        <td>#${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>Php ${p.revenue}</td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div class="analytics-shell">
      <div class="data-card top-product-highlight">
        <div>
          <span class="top-product-label">Top Product</span>
          <h3>${topProduct ? topProduct.name : "No product yet"}</h3>
        </div>
        <div class="top-product-badge">#${topProduct ? topProduct.rank : "-"}</div>
      </div>

      <div class="data-card table-card">
        <h3>Top performing products</h3>
        <table class="product-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Qty Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="4">No product sales data available.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");

  function renderBranchProductSales() {
    renderProductSalesTable(analyzeProductSales(getSelectedBranchProducts()));
  }

  renderBranchProductSales();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchProductSales);
  }
});