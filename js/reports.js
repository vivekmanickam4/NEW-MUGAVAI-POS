import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let allBills = [];

/* FORMAT DATE SAFE */
function parseDate(input) {
  try {
    if (input?.seconds) return new Date(input.seconds * 1000);
    if (input) return new Date(input);
    return null;
  } catch {
    return null;
  }
}

/* LOAD DATA */
async function load() {

  const snap = await getDocs(collection(db, "bills"));

  allBills = [];

  snap.forEach(d => {
    let b = d.data();
    let date = parseDate(b.createdAt);

    if (!date) return;

    allBills.push({
      total: Number(b.total) || 0,
      date
    });
  });

  render();
}

/* CALCULATE REPORT */
function calculate(selectedDate = null, selectedMonth = null) {

  let todayTotal = 0;
  let monthTotal = 0;
  let dateTotal = 0;
  let customMonthTotal = 0;

  let todayCount = 0;
  let monthCount = 0;

  const now = new Date();

  allBills.forEach(b => {

    const d = b.date;

    // TODAY
    if (d.toDateString() === now.toDateString()) {
      todayTotal += b.total;
      todayCount++;
    }

    // CURRENT MONTH
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      monthTotal += b.total;
      monthCount++;
    }

    // SELECTED DATE
    if (selectedDate) {
      let sel = new Date(selectedDate);
      if (d.toDateString() === sel.toDateString()) {
        dateTotal += b.total;
      }
    }

    // SELECTED MONTH
    if (selectedMonth) {
      let [y, m] = selectedMonth.split("-");
      if (
        d.getFullYear() == y &&
        d.getMonth() == Number(m) - 1
      ) {
        customMonthTotal += b.total;
      }
    }
  });

  return {
    todayTotal,
    monthTotal,
    dateTotal,
    customMonthTotal,
    todayCount,
    monthCount
  };
}

/* RENDER UI */
function render() {

  const result = calculate();

  document.body.innerHTML = `
    <h2>📊 SALES REPORT</h2>

    <hr>

    <h3>📅 Today</h3>
    <p>Total: ₹${result.todayTotal.toFixed(2)}</p>
    <p>Bills: ${result.todayCount}</p>

    <hr>

    <h3>📆 This Month</h3>
    <p>Total: ₹${result.monthTotal.toFixed(2)}</p>
    <p>Bills: ${result.monthCount}</p>

    <hr>

    <h3>🔍 Search by Date</h3>
    <input type="date" id="datePicker"/>
    <button onclick="filterDate()">Check</button>
    <p id="dateResult"></p>

    <hr>

    <h3>📅 Search by Month</h3>
    <input type="month" id="monthPicker"/>
    <button onclick="filterMonth()">Check</button>
    <p id="monthResult"></p>

    <hr>

    <button onclick="goBack()">⬅ Back</button>
  `;
}

/* FILTER DATE */
window.filterDate = function () {

  const val = document.getElementById("datePicker").value;

  if (!val) return alert("Select date");

  const result = calculate(val);

  document.getElementById("dateResult").innerText =
    `Sales: ₹${result.dateTotal.toFixed(2)}`;
};

/* FILTER MONTH */
window.filterMonth = function () {

  const val = document.getElementById("monthPicker").value;

  if (!val) return alert("Select month");

  const result = calculate(null, val);

  document.getElementById("monthResult").innerText =
    `Sales: ₹${result.customMonthTotal.toFixed(2)}`;
};

/* BACK */
window.goBack = function () {
  window.history.back();
};

/* INIT */
load();
