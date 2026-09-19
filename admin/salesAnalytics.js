// ===== SAMPLE ORDER DATA =====
const branchOrders = {
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

function getSelectedBranchOrders() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";
  return branchOrders[selectedBranch] || branchOrders.general;
}

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
    <div class="analytics-shell">
      <div class="analytics-summary-grid">
        <div class="analytics-metric">
          <span class="metric-label">Total Orders</span>
          <span class="metric-value">${stats.totalOrders}</span>
          <span class="metric-subtext">Completed orders</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Items Sold</span>
          <span class="metric-value">${stats.totalItemsSold}</span>
          <span class="metric-subtext">Units sold</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Revenue</span>
          <span class="metric-value">Php ${stats.totalRevenue}</span>
          <span class="metric-subtext">Gross sales</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Avg. Order</span>
          <span class="metric-value">Php ${stats.averageOrderValue.toFixed(2)}</span>
          <span class="metric-subtext">Per order</span>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const applyFilterButton = document.getElementById("applySalesFilterButton");
  const branchSelect = document.getElementById("branchFilterSelect");

  function renderBranchSales() {
    const orders = getSelectedBranchOrders();
    const startDate = document.getElementById("salesStartDate").value;
    const endDate = document.getElementById("salesEndDate").value;

    const filtered = startDate && endDate ? filterOrdersByDate(orders, startDate, endDate) : orders;
    renderSalesAnalytics(calculateSalesAnalytics(filtered));
  }

  renderBranchSales();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchSales);
  }

  applyFilterButton.addEventListener("click", () => {
    const startDate = document.getElementById("salesStartDate").value;
    const endDate = document.getElementById("salesEndDate").value;
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    renderBranchSales();
  });
});