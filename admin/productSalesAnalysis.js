// ===== PRODUCT SALES ANALYSIS =====
// Reuses the same sample order data structure as Sales Analytics.
// Later, both files will pull from the same real order source instead of duplicating data.
const productSampleOrders = [
  { orderId: 1, date: "2026-09-01", items: [{ name: "Strawberry", qty: 2, price: 50 }], total: 100, status: "Completed" },
  { orderId: 2, date: "2026-09-01", items: [{ name: "Mango", qty: 1, price: 55 }], total: 55, status: "Completed" },
  { orderId: 3, date: "2026-09-02", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed" },
  { orderId: 4, date: "2026-09-02", items: [{ name: "Strawberry", qty: 1, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 105, status: "Completed" },
  { orderId: 5, date: "2026-09-03", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed" },
];

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
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    rowsHtml += `
      <tr>
        <td>${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>Php ${p.revenue}</td>
      </tr>
    `;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Quantity Sold</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductSalesTable(analyzeProductSales(productSampleOrders));
});