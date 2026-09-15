// ===== VIEW SWITCHING (Customer <-> Admin) =====
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

// ===== ADMIN TABS (Scanner / Order Queue / Sales Analytics / Product Sales / Feedback) =====
const adminScannerTab = document.getElementById("adminScannerTab");
const adminQueueTab = document.getElementById("adminQueueTab");
const adminSalesAnalyticsTab = document.getElementById("adminSalesAnalyticsTab");
const adminProductSalesTab = document.getElementById("adminProductSalesTab");
const adminFeedbackAnalysisTab = document.getElementById("adminFeedbackAnalysisTab");

const showScannerTabButton = document.getElementById("showScannerTabButton");
const showQueueTabButton = document.getElementById("showQueueTabButton");
const showSalesAnalyticsTabButton = document.getElementById("showSalesAnalyticsTabButton");
const showProductSalesTabButton = document.getElementById("showProductSalesTabButton");
const showFeedbackAnalysisTabButton = document.getElementById("showFeedbackAnalysisTabButton");

// Every admin tab section lives in this list.
// Whenever we switch tabs, we hide ALL of them first, then reveal only the one clicked.
// This is what stops tabs from stacking on top of each other.
const allAdminTabs = [
  adminScannerTab,
  adminQueueTab,
  adminSalesAnalyticsTab,
  adminProductSalesTab,
  adminFeedbackAnalysisTab,
];

function showAdminTab(tabToShow) {
  for (let i = 0; i < allAdminTabs.length; i++) {
    allAdminTabs[i].hidden = true;
  }
  tabToShow.hidden = false;
}

showScannerTabButton.addEventListener("click", () => showAdminTab(adminScannerTab));
showQueueTabButton.addEventListener("click", () => showAdminTab(adminQueueTab));
showSalesAnalyticsTabButton.addEventListener("click", () => showAdminTab(adminSalesAnalyticsTab));
showProductSalesTabButton.addEventListener("click", () => showAdminTab(adminProductSalesTab));
showFeedbackAnalysisTabButton.addEventListener("click", () => showAdminTab(adminFeedbackAnalysisTab));