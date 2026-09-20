"use strict";

/* ================================================================================================
   ORDER LOGS — VIEW LAYER (not one of the three graded algorithm modules)
   File: admin/orderlogs/orderLogsView.js
   ------------------------------------------------------------------------------------------------
   This file owns ONLY the presentation side:
     - It builds the Order Logs interface inside the dashboard's existing #orderLogsContainer.
     - It calls Module 3 (search) then Module 2 (sort) and renders whatever Array they return.
     - It never stores data itself. The table is a VIEW of the Linked List in Module 1.

   It deliberately does not touch any of the teammate's dashboard styles or elements — it only
   writes inside the empty <div id="orderLogsContainer"> that already exists in index.html, and
   every CSS class it emits is prefixed "olg-" and scoped in admin/orderlogs/orderLogs.css.
   ================================================================================================ */


/* ---- The interface markup injected into the dashboard's Order Logs tab ---- */
const ORDER_LOGS_INTERFACE_HTML = `
  <div class="olg-root">

    <div class="olg-panel">
      <h3 class="olg-panel-title">Search &amp; Sort</h3>
      <div class="olg-controls">
        <div class="olg-field">
          <label for="orderLogsSearchInput">Search (Order ID, size, toppings, mode, date...)</label>
          <input type="text" id="orderLogsSearchInput" placeholder="e.g. Demi, 2026-09-12, Gcash, 1005">
        </div>
        <div class="olg-field">
          <label for="orderLogsSortFieldSelect">Sort by</label>
          <select id="orderLogsSortFieldSelect">
            <option value="orderDate">Order Date</option>
            <option value="orderTotal">Total</option>
            <option value="orderId">Order ID</option>
            <option value="cupSize">Cup Size</option>
          </select>
        </div>
        <div class="olg-field">
          <label for="orderLogsSortDirectionSelect">Direction</label>
          <select id="orderLogsSortDirectionSelect">
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>
        <button type="button" class="olg-btn olg-btn-primary" id="orderLogsApplyButton">Apply</button>
        <button type="button" class="olg-btn olg-btn-ghost" id="orderLogsResetButton">Reset</button>
      </div>
    </div>

    <div class="olg-panel">
      <div class="olg-panel-head">
        <h3 class="olg-panel-title">Transaction Records</h3>
        <span class="olg-count" id="orderLogsResultCount"></span>
      </div>
      <div class="olg-table-scroll">
        <table class="olg-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Order ID</th>
              <th>Cup Size</th>
              <th>Quantity</th>
              <th>Toppings</th>
              <th>Total</th>
              <th>Mode of Payment</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody id="orderLogsTableBody"></tbody>
        </table>
      </div>
      <p class="olg-status" id="orderLogsStatusText"></p>
      <p class="olg-note">
        Storage is a <code>Linked List</code> fed by a <code>Linked Queue</code> from the POS.
        Every search/sort builds a fresh <code>Array</code> view and runs a manual Linear Search and
        Merge Sort on it, so the stored records are never reordered.
      </p>
    </div>

  </div>
`;


/* ---- Small display helpers ---- */

// Tags a topping with "(quantity)" only when it was added more than once on that line item.
function formatToppingsForDisplay(toppingsArray) {
  let formattedText = "";
  for (let toppingIndex = 0; toppingIndex < toppingsArray.length; toppingIndex = toppingIndex + 1) {
    const currentTopping = toppingsArray[toppingIndex];
    const toppingText = currentTopping.qty > 1
      ? `${currentTopping.name} (${currentTopping.qty})`
      : currentTopping.name;
    formattedText = formattedText + (toppingIndex === 0 ? "" : ", ") + toppingText;
  }
  return formattedText;
}

function formatOrderDateForDisplay(isoDateText) {
  const parsedDate = new Date(isoDateText + "T00:00:00");
  return parsedDate.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

// Called by Module 1 when an order is accepted or rejected.
function showOrderLogsStatus(messageText, statusType) {
  const statusElement = document.getElementById("orderLogsStatusText");
  if (!statusElement) {
    return;
  }
  statusElement.textContent = messageText;
  statusElement.className = "olg-status olg-status-" + statusType;
}


/* ---- The main pipeline: Linked List -> Array view -> Module 3 -> Module 2 -> table ---- */
function refreshOrderLogDisplay() {
  const tableBodyElement = document.getElementById("orderLogsTableBody");
  if (!tableBodyElement) {
    return; // interface not mounted yet (owner has not opened the Order Logs tab)
  }

  const fullOrderArrayView = orderTransactionLog.buildArrayViewFromLog();

  const searchQueryText = document.getElementById("orderLogsSearchInput").value;
  const searchedOrderArray = searchOrderArrayByKeyword(fullOrderArrayView, searchQueryText);

  const sortFieldName = document.getElementById("orderLogsSortFieldSelect").value;
  const sortDirection = document.getElementById("orderLogsSortDirectionSelect").value;
  const finalDisplayArray = sortOrderArrayByField(searchedOrderArray, sortFieldName, sortDirection);

  renderOrderLogsTable(finalDisplayArray, fullOrderArrayView.length);
}

function renderOrderLogsTable(orderArrayToDisplay, totalOrdersInLog) {
  const tableBodyElement = document.getElementById("orderLogsTableBody");
  const resultCountElement = document.getElementById("orderLogsResultCount");

  tableBodyElement.innerHTML = "";
  resultCountElement.textContent =
    `${orderArrayToDisplay.length} of ${totalOrdersInLog} order${totalOrdersInLog === 1 ? "" : "s"} shown`;

  if (orderArrayToDisplay.length === 0) {
    tableBodyElement.innerHTML = `<tr class="olg-empty-row"><td colspan="8">No matching orders found.</td></tr>`;
    return;
  }

  orderArrayToDisplay.forEach(function (orderRecord, orderDisplayIndex) {
    const numberOfLineItems = orderRecord.items.length;

    orderRecord.items.forEach(function (lineItem, lineItemIndex) {
      const tableRowElement = document.createElement("tr");
      let rowHtml = "";

      // Order-level columns render once and span all of that order's line item rows
      if (lineItemIndex === 0) {
        rowHtml += `<td class="olg-anchor" rowspan="${numberOfLineItems}">${orderDisplayIndex + 1}</td>`;
        rowHtml += `<td class="olg-anchor" rowspan="${numberOfLineItems}"><span class="olg-pill">${orderRecord.orderId}</span></td>`;
      }

      // Line-item columns render on every row
      rowHtml += `<td>${lineItem.cupSize}</td>`;
      rowHtml += `<td>${lineItem.quantity}</td>`;
      rowHtml += `<td class="olg-toppings">${formatToppingsForDisplay(lineItem.toppings)}</td>`;
      rowHtml += `<td>Php ${lineItem.total}</td>`;

      if (lineItemIndex === 0) {
        rowHtml += `<td class="olg-anchor" rowspan="${numberOfLineItems}">${orderRecord.payment}</td>`;
        rowHtml += `<td class="olg-anchor" rowspan="${numberOfLineItems}">${formatOrderDateForDisplay(orderRecord.orderDate)}</td>`;
      }

      tableRowElement.innerHTML = rowHtml;
      tableBodyElement.appendChild(tableRowElement);
    });
  });
}


/* ---- Sample transactions, as if they already arrived from the POS queue ---- */
const seedOrderPayloads = [
  { orderId: "ORD-1001", paymentMethod: "Cashless", orderDate: "2026-09-13",
    lineItems: [{ cupSize: "Mini", itemQuantity: 1,
      selectedToppings: [{ toppingName: "Strawberry", toppingQuantity: 1 }, { toppingName: "Oreo", toppingQuantity: 1 }],
      lineItemTotal: 53 }] },
  { orderId: "ORD-1002", paymentMethod: "Cash", orderDate: "2026-09-10",
    lineItems: [{ cupSize: "Grande", itemQuantity: 1,
      selectedToppings: [{ toppingName: "Mango", toppingQuantity: 2 }, { toppingName: "Strawberry", toppingQuantity: 1 }],
      lineItemTotal: 248 }] },
  { orderId: "ORD-1003", paymentMethod: "Gcash", orderDate: "2026-09-12",
    lineItems: [
      { cupSize: "Tall", itemQuantity: 1,
        selectedToppings: [{ toppingName: "Dragonfruit", toppingQuantity: 1 }, { toppingName: "Kiwi", toppingQuantity: 1 }, { toppingName: "Granola", toppingQuantity: 1 }, { toppingName: "Peanuts", toppingQuantity: 1 }, { toppingName: "Caramel", toppingQuantity: 1 }],
        lineItemTotal: 168 },
      { cupSize: "Mini", itemQuantity: 2,
        selectedToppings: [{ toppingName: "Oreo", toppingQuantity: 2 }],
        lineItemTotal: 76 },
    ] },
  { orderId: "ORD-1004", paymentMethod: "Cash", orderDate: "2026-09-12",
    lineItems: [{ cupSize: "Demi", itemQuantity: 1,
      selectedToppings: [{ toppingName: "Strawberry", toppingQuantity: 1 }, { toppingName: "Granola", toppingQuantity: 1 }],
      lineItemTotal: 98 }] },
  { orderId: "ORD-1005", paymentMethod: "Cash", orderDate: "2026-07-08",
    lineItems: [
      { cupSize: "Triple", itemQuantity: 1,
        selectedToppings: [{ toppingName: "Choco Syrup", toppingQuantity: 2 }, { toppingName: "Flakes", toppingQuantity: 1 }],
        lineItemTotal: 38 },
      { cupSize: "Demi", itemQuantity: 1,
        selectedToppings: [{ toppingName: "Choco Syrup", toppingQuantity: 2 }],
        lineItemTotal: 48 },
    ] },
  { orderId: "ORD-1006", paymentMethod: "Cash", orderDate: "2026-07-08",
    lineItems: [{ cupSize: "Demi", itemQuantity: 1,
      selectedToppings: [{ toppingName: "Choco Syrup", toppingQuantity: 1 }, { toppingName: "Flakes", toppingQuantity: 1 }],
      lineItemTotal: 38 }] },
  { orderId: "ORD-1007", paymentMethod: "Cash", orderDate: "2026-07-08",
    lineItems: [{ cupSize: "Demi", itemQuantity: 2,
      selectedToppings: [{ toppingName: "Choco Syrup", toppingQuantity: 1 }, { toppingName: "Flakes", toppingQuantity: 1 }],
      lineItemTotal: 38 }] },
  { orderId: "ORD-1008", paymentMethod: "Cashless", orderDate: "2026-09-13",
    lineItems: [{ cupSize: "Grande", itemQuantity: 1,
      selectedToppings: [{ toppingName: "Biscoff Sauce", toppingQuantity: 1 }, { toppingName: "Cornflakes", toppingQuantity: 1 }, { toppingName: "Kiwi", toppingQuantity: 1 }, { toppingName: "Mango", toppingQuantity: 1 }, { toppingName: "Oreo", toppingQuantity: 1 }, { toppingName: "Strawberry", toppingQuantity: 1 }],
      lineItemTotal: 198 }] },
];

let hasSeededSampleOrders = false;

function seedSampleOrdersOnce() {
  if (hasSeededSampleOrders === true) {
    return;
  }
  hasSeededSampleOrders = true;
  for (let seedIndex = 0; seedIndex < seedOrderPayloads.length; seedIndex = seedIndex + 1) {
    receiveCompletedOrderFromPOS(seedOrderPayloads[seedIndex]);
  }
  showOrderLogsStatus("", "info"); // clear the seeding messages
}


/* ---- Mounting: build the interface inside the dashboard's Order Logs tab ---- */
let isOrderLogsInterfaceMounted = false;

function mountOrderLogsInterface() {
  const orderLogsContainer = document.getElementById("orderLogsContainer");
  if (!orderLogsContainer) {
    return;
  }

  // Remount if the container was emptied by other dashboard code (e.g. a branch-filter refresh).
  if (isOrderLogsInterfaceMounted === true && document.getElementById("orderLogsTableBody")) {
    refreshOrderLogDisplay();
    return;
  }

  orderLogsContainer.innerHTML = ORDER_LOGS_INTERFACE_HTML;
  isOrderLogsInterfaceMounted = true;

  document.getElementById("orderLogsApplyButton").addEventListener("click", refreshOrderLogDisplay);
  document.getElementById("orderLogsSearchInput").addEventListener("input", refreshOrderLogDisplay);
  document.getElementById("orderLogsSortFieldSelect").addEventListener("change", refreshOrderLogDisplay);
  document.getElementById("orderLogsSortDirectionSelect").addEventListener("change", refreshOrderLogDisplay);
  document.getElementById("orderLogsResetButton").addEventListener("click", function () {
    document.getElementById("orderLogsSearchInput").value = "";
    document.getElementById("orderLogsSortFieldSelect").value = "orderDate";
    document.getElementById("orderLogsSortDirectionSelect").value = "ascending";
    refreshOrderLogDisplay();
  });

  seedSampleOrdersOnce();
  refreshOrderLogDisplay();
}

document.addEventListener("DOMContentLoaded", function () {
  // Mounted after the current task queue so it runs AFTER the dashboard's own
  // DOMContentLoaded handler, which clears #orderLogsContainer on load.
  setTimeout(mountOrderLogsInterface, 0);

  // The dashboard clears the container again whenever the branch filter changes,
  // so re-mount after that handler finishes too.
  const branchFilterSelect = document.getElementById("branchFilterSelect");
  if (branchFilterSelect) {
    branchFilterSelect.addEventListener("change", function () {
      setTimeout(mountOrderLogsInterface, 0);
    });
  }

  // Re-check when the owner opens the Order Logs page from the sidebar.
  const sidebarOrderLogsButton = document.getElementById("sidebarOrderLogsButton");
  if (sidebarOrderLogsButton) {
    sidebarOrderLogsButton.addEventListener("click", function () {
      setTimeout(mountOrderLogsInterface, 0);
    });
  }
});


/* ---- PUBLIC API — how the POS side and other teammates' modules talk to Order Logs ---- */
window.TangiFroyoOrderLogs = {
  receiveCompletedOrder: receiveCompletedOrderFromPOS,
  getAllOrders: function () { return orderTransactionLog.buildArrayViewFromLog(); },
  searchOrders: searchOrderArrayByKeyword,
  sortOrders: sortOrderArrayByField,
  filterOrders: filterOrderArrayByCriteria,
  refreshDisplay: refreshOrderLogDisplay,
};