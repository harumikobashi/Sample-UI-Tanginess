"use strict";

/* ================================================================================================
   ORDER LOGS — MODULE 1 of 3: TRANSACTION RECORDING MODULE
   File: admin/orderlogs/transactionRecording.js
   ------------------------------------------------------------------------------------------------
   MODULE NAME         : Transaction Recording Module
   PROCESS DESCRIPTION : Accepts a completed order from the POS/cashier side the moment the cashier
                          marks an order "Completed," validates it, and stores it permanently as a
                          digital transaction record.
   INPUT                : A raw order payload object built by the POS module:
                             {
                               orderId       : string  (optional — auto-generated if missing)
                               paymentMethod : string  ("Cash" | "Gcash" | "Cashless")
                               orderDate     : string  ("YYYY-MM-DD")
                               lineItems     : [
                                 {
                                   cupSize         : "Mini"|"Demi"|"Triple"|"Short"|"Tall"|"Grande"
                                   itemQuantity    : number
                                   selectedToppings: [ { toppingName: string, toppingQuantity: number } ]
                                   lineItemTotal   : number (Php)
                                 }, ...
                               ]
                             }
   PROCESS              : 1. Validate the payload (required fields, valid cup sizes, positive numbers).
                           2. If valid, enqueue it into the TransactionIngestionQueue (FIFO buffer
                              that decouples the POS module from this module).
                           3. Immediately dequeue it and append it to the OrderTransactionLog
                              (permanent, append-only linked list of all completed orders).
                           4. Ask the view layer to refresh the on-screen table.
   OUTPUT                : { isSuccessful: boolean, assignedOrderId: string|null, statusMessage: string }
   PSEUDOCODE            :
       FUNCTION receiveCompletedOrderFromPOS(rawOrderPayload)
           validationResult <- validateIncomingOrderPayload(rawOrderPayload)
           IF validationResult.isValid = FALSE THEN
               RETURN failure(validationResult.errorMessage)
           IF rawOrderPayload.orderId IS EMPTY THEN
               rawOrderPayload.orderId <- generateNextOrderId(orderTransactionLog)
           transactionIngestionQueue.enqueueOrder(rawOrderPayload)
           dequeuedOrder <- transactionIngestionQueue.dequeueOrder()
           orderTransactionLog.appendOrder(dequeuedOrder)
           refreshOrderLogDisplay()
           RETURN success(dequeuedOrder.orderId)
   DATA STRUCTURE(S)    : Linked Queue (ingestion buffer) + Singly Linked List (permanent log),
                           both built from one custom LinkedListNode class — no ready-made library.
   TIME COMPLEXITY      : enqueueOrder O(1), dequeueOrder O(1), appendOrder O(1) (head/tail pointers
                           maintained). buildArrayViewFromLog() is O(n) — must visit every node once.
   SPACE COMPLEXITY     : O(n), one node per stored transaction.
   JUSTIFICATION        : The Queue decouples the POS module from this one — the POS fires a
                           completed order without waiting on this module's bookkeeping, and extra
                           POS terminals could enqueue into the same buffer with no redesign. The
                           Linked List is the right permanent store because this module only appends
                           at the tail and deletes by node (never inserts by numeric position), so it
                           never pays the resize-and-copy cost an array would.
   ================================================================================================ */


/* ---- Shared building block: one reusable node class for every linked structure ---- */
class LinkedListNode {
  constructor(storedValue) {
    this.storedValue = storedValue;
    this.nextNode = null;
  }
}


/* ---- Linked Queue: the POS ingestion buffer ---- */
class TransactionIngestionQueue {
  constructor() {
    this.frontNode = null;
    this.backNode = null;
    this.queueLength = 0;
  }

  enqueueOrder(orderPayload) {
    const newQueueNode = new LinkedListNode(orderPayload);
    if (this.frontNode === null) {
      this.frontNode = newQueueNode;
      this.backNode = newQueueNode;
    } else {
      this.backNode.nextNode = newQueueNode;
      this.backNode = newQueueNode;
    }
    this.queueLength = this.queueLength + 1;
  }

  dequeueOrder() {
    if (this.frontNode === null) {
      return null;
    }
    const dequeuedNode = this.frontNode;
    this.frontNode = this.frontNode.nextNode;
    if (this.frontNode === null) {
      this.backNode = null;
    }
    this.queueLength = this.queueLength - 1;
    return dequeuedNode.storedValue;
  }

  isQueueEmpty() {
    return this.queueLength === 0;
  }
}


/* ---- Singly Linked List: the permanent order log ---- */
class OrderTransactionLog {
  constructor() {
    this.firstNode = null;
    this.lastNode = null;
    this.totalOrdersStored = 0;
  }

  // O(1) append — the only way new orders enter the permanent log
  appendOrder(orderRecord) {
    const newLogNode = new LinkedListNode(orderRecord);
    if (this.firstNode === null) {
      this.firstNode = newLogNode;
      this.lastNode = newLogNode;
    } else {
      this.lastNode.nextNode = newLogNode;
      this.lastNode = newLogNode;
    }
    this.totalOrdersStored = this.totalOrdersStored + 1;
  }

  // O(n) traversal — builds the temporary Array view used by Modules 2 and 3.
  // The linked list itself is never reordered or mutated by search/sort.
  buildArrayViewFromLog() {
    const orderArrayView = [];
    let currentNode = this.firstNode;
    while (currentNode !== null) {
      orderArrayView.push(currentNode.storedValue);
      currentNode = currentNode.nextNode;
    }
    return orderArrayView;
  }
}


/* ---- Menu rules taken straight from the Tanginess menu board ---- */
const CUP_SIZE_RULES = {
  Mini:   { allowedToppingCount: 1, basePrice: 38 },
  Demi:   { allowedToppingCount: 2, basePrice: 98 },
  Triple: { allowedToppingCount: 3, basePrice: 128 },
  Short:  { allowedToppingCount: 4, basePrice: 138 },
  Tall:   { allowedToppingCount: 5, basePrice: 168 },
  Grande: { allowedToppingCount: 6, basePrice: 198 },
};

const VALID_PAYMENT_METHODS = ["Cash", "Gcash", "Cashless"];


/* ---- Manual validation helpers (no regex, no built-in shortcuts) ---- */
function isTextAllDigits(textValue) {
  if (textValue.length === 0) {
    return false;
  }
  for (let charIndex = 0; charIndex < textValue.length; charIndex = charIndex + 1) {
    const characterCode = textValue.charCodeAt(charIndex);
    const isDigitCharacter = characterCode >= 48 && characterCode <= 57; // '0'..'9'
    if (isDigitCharacter === false) {
      return false;
    }
  }
  return true;
}

function isValidOrderDateFormat(dateText) {
  if (typeof dateText !== "string" || dateText.length !== 10) {
    return false;
  }
  const yearPart = dateText.substring(0, 4);
  const monthSeparator = dateText.charAt(4);
  const monthPart = dateText.substring(5, 7);
  const daySeparator = dateText.charAt(7);
  const dayPart = dateText.substring(8, 10);
  return (
    isTextAllDigits(yearPart) &&
    monthSeparator === "-" &&
    isTextAllDigits(monthPart) &&
    daySeparator === "-" &&
    isTextAllDigits(dayPart)
  );
}

function validateIncomingOrderPayload(rawOrderPayload) {
  if (rawOrderPayload === null || typeof rawOrderPayload !== "object") {
    return { isValid: false, errorMessage: "Order payload is missing or malformed." };
  }

  let isPaymentMethodValid = false;
  for (let methodIndex = 0; methodIndex < VALID_PAYMENT_METHODS.length; methodIndex = methodIndex + 1) {
    if (VALID_PAYMENT_METHODS[methodIndex] === rawOrderPayload.paymentMethod) {
      isPaymentMethodValid = true;
    }
  }
  if (isPaymentMethodValid === false) {
    return { isValid: false, errorMessage: "paymentMethod must be Cash, Gcash, or Cashless." };
  }

  if (isValidOrderDateFormat(rawOrderPayload.orderDate) === false) {
    return { isValid: false, errorMessage: "orderDate must be formatted as YYYY-MM-DD." };
  }

  if (Array.isArray(rawOrderPayload.lineItems) === false || rawOrderPayload.lineItems.length === 0) {
    return { isValid: false, errorMessage: "lineItems must be a non-empty array." };
  }

  for (let itemIndex = 0; itemIndex < rawOrderPayload.lineItems.length; itemIndex = itemIndex + 1) {
    const currentLineItem = rawOrderPayload.lineItems[itemIndex];
    const cupSizeRule = CUP_SIZE_RULES[currentLineItem.cupSize];
    if (cupSizeRule === undefined) {
      return { isValid: false, errorMessage: `Unknown cup size "${currentLineItem.cupSize}" in line item ${itemIndex + 1}.` };
    }
    if (typeof currentLineItem.itemQuantity !== "number" || currentLineItem.itemQuantity <= 0) {
      return { isValid: false, errorMessage: `itemQuantity must be a positive number in line item ${itemIndex + 1}.` };
    }
    if (typeof currentLineItem.lineItemTotal !== "number" || currentLineItem.lineItemTotal <= 0) {
      return { isValid: false, errorMessage: `lineItemTotal must be a positive number in line item ${itemIndex + 1}.` };
    }
    if (Array.isArray(currentLineItem.selectedToppings) === false) {
      return { isValid: false, errorMessage: `selectedToppings must be an array in line item ${itemIndex + 1}.` };
    }
  }

  return { isValid: true, errorMessage: "" };
}

// Auto-generates the next Order ID by manually scanning for the highest numeric suffix.
function generateNextOrderId(orderTransactionLogInstance) {
  const existingOrders = orderTransactionLogInstance.buildArrayViewFromLog();
  let highestOrderNumberFound = 1000;
  for (let orderIndex = 0; orderIndex < existingOrders.length; orderIndex = orderIndex + 1) {
    const currentOrderIdText = existingOrders[orderIndex].orderId;
    let separatorIndex = -1;
    for (let charIndex = 0; charIndex < currentOrderIdText.length; charIndex = charIndex + 1) {
      if (currentOrderIdText.charAt(charIndex) === "-") {
        separatorIndex = charIndex;
      }
    }
    const numericSuffixText = currentOrderIdText.substring(separatorIndex + 1);
    const numericSuffixValue = Number(numericSuffixText);
    if (!Number.isNaN(numericSuffixValue) && numericSuffixValue > highestOrderNumberFound) {
      highestOrderNumberFound = numericSuffixValue;
    }
  }
  return "ORD-" + (highestOrderNumberFound + 1);
}


/* ---- Module-level instances shared by the other Order Logs files ---- */
const transactionIngestionQueue = new TransactionIngestionQueue();
const orderTransactionLog = new OrderTransactionLog();


/**
 * PUBLIC INTEGRATION POINT for the POS / cashier side.
 *
 * Your teammate's POS code can record a completed order either way:
 *
 *   1) Direct call:
 *        TangiFroyoOrderLogs.receiveCompletedOrder({ ...payload });
 *
 *   2) Decoupled browser event (useful because the teammate's script.js is type="module"):
 *        window.dispatchEvent(new CustomEvent("pos:orderCompleted", { detail: payload }));
 */
function receiveCompletedOrderFromPOS(rawOrderPayload) {
  const validationResult = validateIncomingOrderPayload(rawOrderPayload);
  if (validationResult.isValid === false) {
    if (typeof showOrderLogsStatus === "function") {
      showOrderLogsStatus(validationResult.errorMessage, "error");
    }
    return { isSuccessful: false, assignedOrderId: null, statusMessage: validationResult.errorMessage };
  }

  const orderPayloadWithId = rawOrderPayload;
  if (!orderPayloadWithId.orderId) {
    orderPayloadWithId.orderId = generateNextOrderId(orderTransactionLog);
  }

  // Reshape the POS payload into this module's internal order-record shape
  const newOrderRecord = {
    orderId: orderPayloadWithId.orderId,
    payment: orderPayloadWithId.paymentMethod,
    orderDate: orderPayloadWithId.orderDate,
    items: orderPayloadWithId.lineItems.map(function (lineItem) {
      return {
        cupSize: lineItem.cupSize,
        quantity: lineItem.itemQuantity,
        toppings: lineItem.selectedToppings.map(function (topping) {
          return { name: topping.toppingName, qty: topping.toppingQuantity };
        }),
        total: lineItem.lineItemTotal,
      };
    }),
  };

  transactionIngestionQueue.enqueueOrder(newOrderRecord);
  const dequeuedOrderRecord = transactionIngestionQueue.dequeueOrder();
  orderTransactionLog.appendOrder(dequeuedOrderRecord);

  const successMessage = `Order ${dequeuedOrderRecord.orderId} received and logged.`;
  if (typeof showOrderLogsStatus === "function") {
    showOrderLogsStatus(successMessage, "success");
  }
  if (typeof refreshOrderLogDisplay === "function") {
    refreshOrderLogDisplay();
  }

  return { isSuccessful: true, assignedOrderId: dequeuedOrderRecord.orderId, statusMessage: successMessage };
}

// Loosely-coupled alternative entry point for POS code in a different file/module scope.
window.addEventListener("pos:orderCompleted", function (posEvent) {
  receiveCompletedOrderFromPOS(posEvent.detail);
});