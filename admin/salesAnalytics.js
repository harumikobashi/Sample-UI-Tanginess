// ===== SAMPLE ORDER DATA =====
const sampleOrders = [
  { orderId: 1, date: "2026-09-01", items: [{ name: "Strawberry", qty: 2, price: 50 }], total: 100, status: "Completed" },
  { orderId: 2, date: "2026-09-01", items: [{ name: "Mango", qty: 1, price: 55 }], total: 55, status: "Completed" },
  { orderId: 3, date: "2026-09-02", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed" },
  { orderId: 4, date: "2026-09-02", items: [{ name: "Strawberry", qty: 1, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 105, status: "Completed" },
  { orderId: 5, date: "2026-09-03", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed" },
];

function calculateSalesAnalytics(orders) {
  let totalOrders = 0;
  let totalItemsSold = 0;
  let totalRevenue = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== "Completed") continue;
    totalOrders++;
    for (let j = 0; j < order.items.length; j++) {
      totalItemsSold += order.items[j].qty;
    }
    totalRevenue += order.total;
  }

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  return { totalOrders, totalItemsSold, totalRevenue, averageOrderValue };
}

function filterOrdersByDate(orders, startDate, endDate) {
  return orders.filter(order => order.date >= startDate && order.date <= endDate);
}

function renderSalesAnalytics(stats) {
  const container = document.getElementById("salesAnalyticsContainer");
  container.innerHTML = `
    <div>
      <h3>Total Orders</h3>
      <p>${stats.totalOrders}</p>
    </div>
    <div>
      <h3>Total Items Sold</h3>
      <p>${stats.totalItemsSold}</p>
    </div>
    <div>
      <h3>Total Revenue</h3>
      <p>Php ${stats.totalRevenue}</p>
    </div>
    <div>
      <h3>Average Order Value</h3>
      <p>Php ${stats.averageOrderValue.toFixed(2)}</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const applyFilterButton = document.getElementById("applySalesFilterButton");

  renderSalesAnalytics(calculateSalesAnalytics(sampleOrders));

  applyFilterButton.addEventListener("click", () => {
    const startDate = document.getElementById("salesStartDate").value;
    const endDate = document.getElementById("salesEndDate").value;
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    const filtered = filterOrdersByDate(sampleOrders, startDate, endDate);
    renderSalesAnalytics(calculateSalesAnalytics(filtered));
  });
});