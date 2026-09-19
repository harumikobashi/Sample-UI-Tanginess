// ===== VIEW SWITCHING (Cashier <-> Owner) =====
const customerView = document.getElementById("customerView");
const adminView = document.getElementById("adminView");
const switchToAdminButton = document.getElementById("switchToAdminButton");
const switchToCustomerButton = document.getElementById("switchToCustomerButton");

switchToAdminButton.addEventListener("click", () => {
  customerView.hidden = true;
  adminView.hidden = false;
});

switchToCustomerButton.addEventListener("click", () => {
  adminView.hidden = true;
  customerView.hidden = false;
});

// ===== CUSTOMER TABS (Create Order <-> Order Status) =====
const customerOrderTab = document.getElementById("customerOrderTab");
const customerStatusTab = document.getElementById("customerStatusTab");
const showOrderTabButton = document.getElementById("showOrderTabButton");
const showCustomerStatusTabButton = document.getElementById("showCustomerStatusTabButton");

showOrderTabButton.addEventListener("click", () => {
  customerOrderTab.hidden = false;
  customerStatusTab.hidden = true;
});

showCustomerStatusTabButton.addEventListener("click", () => {
  customerOrderTab.hidden = true;
  customerStatusTab.hidden = false;
});

// ===== OWNER SIDEBAR NAVIGATION =====
const adminShell = document.getElementById("adminShell");
const sidebarToggleButton = document.getElementById("sidebarToggleButton");

sidebarToggleButton.addEventListener("click", () => {
  adminShell.classList.toggle("sidebar-open");
});

// Every admin "page" section lives here. Hiding all, then showing one,
// is the same traversal pattern we used for the top tabs before.
const adminPages = {
  dashboard: document.getElementById("adminDashboardTab"),
  queue: document.getElementById("adminQueueTab"),
  orderLogs: document.getElementById("adminOrderLogsTab"),
  salesAnalytics: document.getElementById("adminSalesAnalyticsTab"),
  productSales: document.getElementById("adminProductSalesTab"),
  feedback: document.getElementById("adminFeedbackAnalysisTab"),
};

// Every clickable sidebar link/sublink lives here, so we can clear
// "active" highlighting before applying it to the one just clicked.
const adminNavButtons = [
  document.getElementById("sidebarDashboardButton"),
  document.getElementById("sidebarQueueButton"),
  document.getElementById("sidebarOrderLogsButton"),
  document.getElementById("sidebarSalesAnalyticsButton"),
  document.getElementById("sidebarProductSalesButton"),
  document.getElementById("sidebarFeedbackAnalysisButton"),
];

function showAdminPage(pageKey, buttonClicked) {
  for (const key in adminPages) {
    adminPages[key].hidden = true;
  }
  adminPages[pageKey].hidden = false;

  for (let i = 0; i < adminNavButtons.length; i++) {
    adminNavButtons[i].classList.remove("active");
  }
  buttonClicked.classList.add("active");

  // On mobile, close the sidebar after picking a page.
  adminShell.classList.remove("sidebar-open");
}

document.getElementById("sidebarDashboardButton").addEventListener("click", (e) => showAdminPage("dashboard", e.currentTarget));
document.getElementById("sidebarQueueButton").addEventListener("click", (e) => showAdminPage("queue", e.currentTarget));
document.getElementById("sidebarOrderLogsButton").addEventListener("click", (e) => showAdminPage("orderLogs", e.currentTarget));
document.getElementById("sidebarSalesAnalyticsButton").addEventListener("click", (e) => showAdminPage("salesAnalytics", e.currentTarget));
document.getElementById("sidebarProductSalesButton").addEventListener("click", (e) => showAdminPage("productSales", e.currentTarget));
document.getElementById("sidebarFeedbackAnalysisButton").addEventListener("click", (e) => showAdminPage("feedback", e.currentTarget));

document.getElementById("dashboardScannerButton").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardSalesTabButton").addEventListener("click", () => {
  showAdminPage("salesAnalytics", document.getElementById("sidebarSalesAnalyticsButton"));
});
document.getElementById("dashboardProductSalesTabButton").addEventListener("click", () => {
  showAdminPage("productSales", document.getElementById("sidebarProductSalesButton"));
});
document.getElementById("dashboardFeedbackTabButton").addEventListener("click", () => {
  showAdminPage("feedback", document.getElementById("sidebarFeedbackAnalysisButton"));
});

document.getElementById("dashboardQueueLink").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardSalesLink").addEventListener("click", () => {
  showAdminPage("salesAnalytics", document.getElementById("sidebarSalesAnalyticsButton"));
});
document.getElementById("dashboardProductSalesLink").addEventListener("click", () => {
  showAdminPage("productSales", document.getElementById("sidebarProductSalesButton"));
});
document.getElementById("dashboardRecentOrdersLink").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardFeedbackLink").addEventListener("click", () => {
  showAdminPage("feedback", document.getElementById("sidebarFeedbackAnalysisButton"));
});

// ===== EXPANDABLE SUBMENUS (Orders / Sales / Feedback groups) =====
function wireSubmenuToggle(toggleId, submenuId) {
  const toggleButton = document.getElementById(toggleId);
  const submenu = document.getElementById(submenuId);
  toggleButton.addEventListener("click", () => {
    submenu.classList.toggle("collapsed");
    toggleButton.classList.toggle("open");
  });
}

wireSubmenuToggle("sidebarOrdersToggle", "sidebarOrdersSubmenu");
wireSubmenuToggle("sidebarSalesToggle", "sidebarSalesSubmenu");
wireSubmenuToggle("sidebarFeedbackToggle", "sidebarFeedbackSubmenu");

// ===== ORDER LOGS (separate from analytics reports) =====
const orderLogsByBranch = {
  general: [
    { orderId: 1001, date: "2026-09-01", customer: "Maria D.", items: [{ name: "Strawberry", qty: 2, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 155, status: "Completed", branch: "General" },
    { orderId: 1002, date: "2026-09-02", customer: "Jhen P.", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "General" },
    { orderId: 1003, date: "2026-09-03", customer: "Alex C.", items: [{ name: "Strawberry", qty: 1, price: 50 }, { name: "Blueberry", qty: 2, price: 60 }], total: 170, status: "Completed", branch: "General" },
    { orderId: 1004, date: "2026-09-04", customer: "Nina L.", items: [{ name: "Mango", qty: 2, price: 55 }], total: 110, status: "Completed", branch: "General" },
  ],
  plaridel: [
    { orderId: 2001, date: "2026-09-01", customer: "Rico T.", items: [{ name: "Strawberry", qty: 3, price: 50 }], total: 150, status: "Completed", branch: "Plaridel" },
    { orderId: 2002, date: "2026-09-02", customer: "Ella S.", items: [{ name: "Mango", qty: 2, price: 55 }, { name: "Blueberry", qty: 1, price: 60 }], total: 170, status: "Completed", branch: "Plaridel" },
    { orderId: 2003, date: "2026-09-03", customer: "Paul R.", items: [{ name: "Blueberry", qty: 2, price: 60 }, { name: "Strawberry", qty: 1, price: 50 }], total: 170, status: "Completed", branch: "Plaridel" },
    { orderId: 2004, date: "2026-09-04", customer: "Grace M.", items: [{ name: "Mango", qty: 3, price: 55 }], total: 165, status: "Completed", branch: "Plaridel" },
  ],
  malolos: [
    { orderId: 3001, date: "2026-09-01", customer: "Kenneth A.", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed", branch: "Malolos" },
    { orderId: 3002, date: "2026-09-02", customer: "Dianne F.", items: [{ name: "Strawberry", qty: 2, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 155, status: "Completed", branch: "Malolos" },
    { orderId: 3003, date: "2026-09-03", customer: "Theo N.", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "Malolos" },
    { orderId: 3004, date: "2026-09-04", customer: "Yna B.", items: [{ name: "Strawberry", qty: 3, price: 50 }, { name: "Mango", qty: 2, price: 55 }], total: 260, status: "Completed", branch: "Malolos" },
  ],
};

function getSelectedOrderLogs() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";
  return orderLogsByBranch[selectedBranch] || orderLogsByBranch.general;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function renderRecentOrders() {
  const container = document.getElementById("dashboardRecentOrdersContainer");
  if (!container) return;

  const orders = getSelectedOrderLogs()
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  if (!orders.length) {
    container.innerHTML = `
      <div class="dashboard-empty-state">
        <strong>No orders yet</strong>
        <span>New orders will appear here after checkout.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map((order) => {
    const itemSummary = order.items.map((item) => `${item.name} x${item.qty}`).join(" • ");
    return `
      <div class="dashboard-order-item">
        <div class="dashboard-order-main">
          <span class="dashboard-order-id">#${order.orderId}</span>
          <strong>${order.customer}</strong>
        </div>
        <div class="dashboard-order-meta">${order.date} • ${itemSummary}</div>
        <div class="dashboard-order-footer">
          <span class="dashboard-order-status">${order.status}</span>
          <span class="dashboard-order-total">${formatCurrency(order.total)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderOrderQueue() {
  const container = document.getElementById("orderQueueContainer");
  const nextOrderText = document.getElementById("nextOrderText");
  if (!container) return;

  const orders = getSelectedOrderLogs().slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!orders.length) {
    container.innerHTML = '<p>No orders in queue.</p>';
    if (nextOrderText) nextOrderText.textContent = "No next order.";
    return;
  }

  const nextOrder = orders[0];
  if (nextOrderText) {
    nextOrderText.textContent = `Next order: #${nextOrder.orderId} • ${nextOrder.customer} • ${formatCurrency(nextOrder.total)}`;
  }

  const rows = orders.map((order) => `
    <tr>
      <td>#${order.orderId}</td>
      <td>${order.customer}</td>
      <td>${order.date}</td>
      <td>${order.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</td>
      <td>${formatCurrency(order.total)}</td>
      <td><span class="order-status-pill">${order.status}</span></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table class="order-queue-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function refreshOrderLogs() {
  renderRecentOrders();
  renderOrderQueue();

  const orderLogsContainer = document.getElementById("orderLogsContainer");
  if (orderLogsContainer) {
    orderLogsContainer.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");

  refreshOrderLogs();

  if (branchSelect) {
    branchSelect.addEventListener("change", refreshOrderLogs);
  }
});