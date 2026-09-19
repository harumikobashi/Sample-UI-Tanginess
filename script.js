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
  salesAnalytics: document.getElementById("adminSalesAnalyticsTab"),
  productSales: document.getElementById("adminProductSalesTab"),
  feedback: document.getElementById("adminFeedbackAnalysisTab"),
};

// Every clickable sidebar link/sublink lives here, so we can clear
// "active" highlighting before applying it to the one just clicked.
const adminNavButtons = [
  document.getElementById("sidebarDashboardButton"),
  document.getElementById("sidebarQueueButton"),
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