"use strict";

/* ================================================================================================
   ORDER LOGS — MODULE 3 of 3: SEARCHING MODULE
   File: admin/orderlogs/searchingModule.js
   ------------------------------------------------------------------------------------------------
   MODULE NAME         : Searching Module
   PROCESS DESCRIPTION : Lets the owner type one keyword and get back every order where that keyword
                          appears in ANY field — Order ID, cup size, quantity, toppings, payment
                          method, total, or date — including partial matches (e.g. "100" matching
                          ORD-1001, ORD-1005, ORD-1008).
   INPUT                : orderArrayToSearch (Array — a disposable view), searchQueryText (string)
   PROCESS               : For every order, build one combined lowercase text string out of all of
                            its searchable fields, then run a manually-written substring search
                            (naive pattern matching) instead of String.includes(). Keep the order
                            only if the pattern is found.
   OUTPUT                : A new Array containing only the matching orders.
   PSEUDOCODE             :
       FUNCTION searchOrderArrayByKeyword(orderArray, queryText)
           IF queryText is empty THEN RETURN orderArray
           matchingOrders <- empty array
           FOR EACH order IN orderArray
               combinedFieldText <- order.id + payment + date + every line item's fields
               IF manualStringContains(combinedFieldText, queryText) THEN
                   APPEND order TO matchingOrders
           RETURN matchingOrders

       FUNCTION manualStringContains(haystackText, needleText)
           FOR startIndex FROM 0 TO length(haystackText) - length(needleText)
               isMatch <- TRUE
               FOR offset FROM 0 TO length(needleText) - 1
                   IF haystackText[startIndex + offset] != needleText[offset] THEN
                       isMatch <- FALSE; BREAK
               IF isMatch THEN RETURN TRUE
           RETURN FALSE
   DATA STRUCTURE(S)      : Array (temporary view only).
   WHY NOT BINARY SEARCH   : Binary Search needs the collection pre-sorted on the exact field being
                             queried, but one query here can match seven different field types at
                             once, and it cannot find a substring inside a larger value at all —
                             "100" has no defined position among sorted IDs like 1001/1005/1008.
                             Linear Search across all fields is the only approach that naturally
                             supports fuzzy, partial, multi-field matching.
   TIME COMPLEXITY         : O(n * m), where n = number of orders and m = average combined field
                             text length — effectively O(n), since m is small and bounded.
   SPACE COMPLEXITY        : O(k), where k = number of matching orders returned.
   JUSTIFICATION           : Sorting before searching would not reduce this cost, because "does this
                             substring appear anywhere in this field" has no relationship to sort
                             order — so no sort step is run before searching.
   ================================================================================================ */


/* ---- Manual naive substring search — intentionally NOT using String.prototype.includes() ---- */
function manualStringContains(haystackText, needleText) {
  if (needleText.length === 0) {
    return true;
  }
  const lastPossibleStartIndex = haystackText.length - needleText.length;
  for (let startIndex = 0; startIndex <= lastPossibleStartIndex; startIndex = startIndex + 1) {
    let isMatchSoFar = true;
    for (let offset = 0; offset < needleText.length; offset = offset + 1) {
      if (haystackText.charAt(startIndex + offset) !== needleText.charAt(offset)) {
        isMatchSoFar = false;
        break;
      }
    }
    if (isMatchSoFar === true) {
      return true;
    }
  }
  return false;
}


/* ---- Builds one lowercase searchable string per order, covering order- and item-level fields ---- */
function buildSearchableTextForOrder(orderRecord) {
  let combinedText = orderRecord.orderId + " " + orderRecord.payment + " " + orderRecord.orderDate;
  for (let itemIndex = 0; itemIndex < orderRecord.items.length; itemIndex = itemIndex + 1) {
    const currentItem = orderRecord.items[itemIndex];
    combinedText = combinedText + " " + currentItem.cupSize + " " + currentItem.quantity + " " + currentItem.total;
    for (let toppingIndex = 0; toppingIndex < currentItem.toppings.length; toppingIndex = toppingIndex + 1) {
      combinedText = combinedText + " " + currentItem.toppings[toppingIndex].name;
    }
  }
  return combinedText.toLowerCase();
}


/**
 * PUBLIC search entry point — versatile: works on any array of order records handed to it,
 * so the owner can search the full log or search within an already-sorted/filtered view.
 */
function searchOrderArrayByKeyword(orderArrayToSearch, searchQueryText) {
  const normalizedQueryText = searchQueryText.trim().toLowerCase();
  if (normalizedQueryText.length === 0) {
    return orderArrayToSearch;
  }
  const matchingOrders = [];
  for (let orderIndex = 0; orderIndex < orderArrayToSearch.length; orderIndex = orderIndex + 1) {
    const currentOrder = orderArrayToSearch[orderIndex];
    const searchableText = buildSearchableTextForOrder(currentOrder);
    if (manualStringContains(searchableText, normalizedQueryText) === true) {
      matchingOrders.push(currentOrder);
    }
  }
  return matchingOrders;
}


/**
 * BONUS UTILITY: chained multi-criteria filtering, e.g.
 *     filterOrderArrayByCriteria(orders, { onDate: "2026-09-12", cupSize: "Tall" })
 * Each criterion narrows the array that the next one receives, so Date + Size + Payment
 * combinations all work without any extra code. Same manual-loop pattern as the search above.
 */
function filterOrderArrayByCriteria(orderArrayToFilter, filterCriteria) {
  const filteredOrders = [];
  for (let orderIndex = 0; orderIndex < orderArrayToFilter.length; orderIndex = orderIndex + 1) {
    const currentOrder = orderArrayToFilter[orderIndex];
    let matchesAllCriteria = true;

    if (filterCriteria.onDate && currentOrder.orderDate !== filterCriteria.onDate) {
      matchesAllCriteria = false;
    }
    if (filterCriteria.paymentMethod && currentOrder.payment !== filterCriteria.paymentMethod) {
      matchesAllCriteria = false;
    }
    if (filterCriteria.cupSize) {
      let orderContainsRequestedSize = false;
      for (let itemIndex = 0; itemIndex < currentOrder.items.length; itemIndex = itemIndex + 1) {
        if (currentOrder.items[itemIndex].cupSize === filterCriteria.cupSize) {
          orderContainsRequestedSize = true;
        }
      }
      if (orderContainsRequestedSize === false) {
        matchesAllCriteria = false;
      }
    }

    if (matchesAllCriteria === true) {
      filteredOrders.push(currentOrder);
    }
  }
  return filteredOrders;
}