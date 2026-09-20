"use strict";

/* ================================================================================================
   ORDER LOGS — MODULE 2 of 3: SORTING MODULE
   File: admin/orderlogs/sortingModule.js
   ------------------------------------------------------------------------------------------------
   MODULE NAME         : Sorting Module
   PROCESS DESCRIPTION : Lets the owner reorder the displayed transactions by Order Date, Total,
                          Order ID, or Cup Size, in either direction, without ever touching the
                          underlying Linked List storage from Module 1.
   INPUT                : orderArrayToSort (Array — a disposable view built from the log),
                           sortFieldName    ("orderDate" | "orderTotal" | "orderId" | "cupSize"),
                           sortDirection    ("ascending" | "descending")
   PROCESS              : 1. Look up the base comparator function for the requested field.
                           2. If direction is "descending," wrap it so the comparison is negated
                              (avoids calling Array.reverse() afterwards).
                           3. Run a manually-written Merge Sort using that comparator.
   OUTPUT                : A new sorted Array; orderTransactionLog is never modified.
   PSEUDOCODE            :
       FUNCTION sortOrderArrayByField(orderArray, fieldName, direction)
           comparator <- baseComparatorsByField[fieldName]
           IF direction = "descending" THEN
               comparator <- negate(comparator)
           RETURN mergeSortOrders(orderArray, comparator)

       FUNCTION mergeSortOrders(array, compareFn)
           IF length(array) <= 1 THEN RETURN array
           mid       <- length(array) / 2
           leftHalf  <- mergeSortOrders(array[0..mid), compareFn)
           rightHalf <- mergeSortOrders(array[mid..end), compareFn)
           RETURN mergeTwoSortedArrays(leftHalf, rightHalf, compareFn)
   DATA STRUCTURE(S)     : Array (temporary view only).
   TIME COMPLEXITY       : O(n log n) in every case — best, average, and worst.
   SPACE COMPLEXITY      : O(n) auxiliary space for the merge buffers.
   STABILITY             : Stable — records with equal keys keep their original relative order.
   JUSTIFICATION          : Order Date and Order ID usually arrive already near-sorted, which is
                            Quicksort's O(n^2) worst case but has no effect on Merge Sort. Cup Size
                            is sorted by a numeric rank derived from the menu board (Mini=1 ...
                            Grande=6), so real business order is respected instead of alphabetical
                            order. No built-in Array.prototype.sort() is used anywhere below.
   ================================================================================================ */


const CUP_SIZE_RANK = { Mini: 1, Demi: 2, Triple: 3, Short: 4, Tall: 5, Grande: 6 };


/* ---- Order-level rollups: one order can hold several line items ---- */
function calculateOrderGrandTotal(orderRecord) {
  let grandTotal = 0;
  for (let itemIndex = 0; itemIndex < orderRecord.items.length; itemIndex = itemIndex + 1) {
    grandTotal = grandTotal + orderRecord.items[itemIndex].total;
  }
  return grandTotal;
}

function calculateOrderLargestCupSizeRank(orderRecord) {
  let largestRankFound = 0;
  for (let itemIndex = 0; itemIndex < orderRecord.items.length; itemIndex = itemIndex + 1) {
    const currentRank = CUP_SIZE_RANK[orderRecord.items[itemIndex].cupSize];
    if (currentRank > largestRankFound) {
      largestRankFound = currentRank;
    }
  }
  return largestRankFound;
}


/* ---- Manual text comparison for Order IDs (no localeCompare, no built-in sort helpers) ---- */
function compareOrderIdText(firstOrderIdText, secondOrderIdText) {
  const shorterLength = Math.min(firstOrderIdText.length, secondOrderIdText.length);
  for (let charIndex = 0; charIndex < shorterLength; charIndex = charIndex + 1) {
    const firstCharCode = firstOrderIdText.charCodeAt(charIndex);
    const secondCharCode = secondOrderIdText.charCodeAt(charIndex);
    if (firstCharCode !== secondCharCode) {
      return firstCharCode - secondCharCode;
    }
  }
  return firstOrderIdText.length - secondOrderIdText.length;
}


const baseComparatorsByField = {
  orderDate: function (orderA, orderB) {
    return new Date(orderA.orderDate) - new Date(orderB.orderDate);
  },
  orderTotal: function (orderA, orderB) {
    return calculateOrderGrandTotal(orderA) - calculateOrderGrandTotal(orderB);
  },
  orderId: function (orderA, orderB) {
    return compareOrderIdText(orderA.orderId, orderB.orderId);
  },
  cupSize: function (orderA, orderB) {
    return calculateOrderLargestCupSizeRank(orderA) - calculateOrderLargestCupSizeRank(orderB);
  },
};


/* ---- Manual Merge Sort ---- */
function mergeSortOrders(arrayToSort, compareFn) {
  if (arrayToSort.length <= 1) {
    return arrayToSort;
  }
  const middleIndex = Math.floor(arrayToSort.length / 2);
  const leftHalfSorted = mergeSortOrders(arrayToSort.slice(0, middleIndex), compareFn);
  const rightHalfSorted = mergeSortOrders(arrayToSort.slice(middleIndex), compareFn);
  return mergeTwoSortedArrays(leftHalfSorted, rightHalfSorted, compareFn);
}

function mergeTwoSortedArrays(leftArray, rightArray, compareFn) {
  const mergedResult = [];
  let leftPointer = 0;
  let rightPointer = 0;

  while (leftPointer < leftArray.length && rightPointer < rightArray.length) {
    if (compareFn(leftArray[leftPointer], rightArray[rightPointer]) <= 0) {
      mergedResult.push(leftArray[leftPointer]);
      leftPointer = leftPointer + 1;
    } else {
      mergedResult.push(rightArray[rightPointer]);
      rightPointer = rightPointer + 1;
    }
  }
  while (leftPointer < leftArray.length) {
    mergedResult.push(leftArray[leftPointer]);
    leftPointer = leftPointer + 1;
  }
  while (rightPointer < rightArray.length) {
    mergedResult.push(rightArray[rightPointer]);
    rightPointer = rightPointer + 1;
  }
  return mergedResult;
}


/**
 * PUBLIC sort entry point — versatile: works on any array of order records handed to it,
 * whether that is the full log or an already-searched/filtered subset.
 */
function sortOrderArrayByField(orderArrayToSort, sortFieldName, sortDirection) {
  const baseComparator = baseComparatorsByField[sortFieldName];
  if (baseComparator === undefined) {
    return orderArrayToSort;
  }
  const directionalComparator = (sortDirection === "descending")
    ? function (orderA, orderB) { return -1 * baseComparator(orderA, orderB); }
    : baseComparator;
  return mergeSortOrders(orderArrayToSort, directionalComparator);
}