export function getInvoiceHTML(bill, isThermal = false) {

  function formatDate(input) {
    try {
      if (input?.seconds) return new Date(input.seconds * 1000).toLocaleString("en-IN");
      if (input) return new Date(input).toLocaleString("en-IN");
      return new Date().toLocaleString("en-IN");
    } catch {
      return new Date().toLocaleString("en-IN");
    }
  }

  const date = formatDate(bill.createdAt);

  let subtotal = 0;
  let gstTotal = 0;

  const items = bill.items || [];

  items.forEach(i => {
    const price = Number(i.price) || 0;
    const qty = Number(i.qty) || 0;
    const gstPercent = Number(i.gst) || 0;

    const sub = price * qty;
    const gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;
  });

  // ✅ ROUND OFF
  let rawTotal = subtotal + gstTotal;
  let roundedTotal = Math.round(rawTotal);
  let roundOff = roundedTotal - rawTotal;

  // ========================= THERMAL =========================
  if (isThermal) {
    return `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: monospace;
          font-size: 12px;
          width: 260px;
        }

        .center { text-align: center; }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .col { display:inline-block; }

        .name { width:30%; }
        .qty { width:15%; text-align:center; }
        .gstp { width:15%; text-align:center; }
        .gsta { width:20%; text-align:right; }
        .total { width:20%; text-align:right; }

        .header { font-weight:bold; }

        hr { border:none; border-top:1px dashed #000; }
      </style>
    </head>

    <body onload="window.print(); window.close();">

      <div class="center"><b>NEW MUGAVAI MANICKAM MALIGAI</b></div>
      <div class="center">GST No: XXXXXXXXXXXXX</div>

      <br>

      <div>${date}</div>
      <div>Inv: ${bill.invoiceNo}</div>
      <div>Customer: ${bill.customerName}</div>

      <hr>

      <div class="row header">
        <span class="col name">Item</span>
        <span class="col qty">Qty</span>
        <span class="col gstp">GST%</span>
        <span class="col gsta">GST</span>
        <span class="col total">Total</span>
      </div>

      <hr>

      ${items.map(i => {
        const price = Number(i.price) || 0;
        const qty = Number(i.qty) || 0;
        const gstPercent = Number(i.gst) || 0;

        const sub = price * qty;
        const gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;
        const total = sub + gst;

        return `
        <div class="row">
          <span class="col name">${i.name}</span>
          <span class="col qty">${qty}x${price}</span>
          <span class="col gstp">${bill.gstEnabled ? gstPercent + "%" : "-"}</span>
          <span class="col gsta">${bill.gstEnabled ? gst.toFixed(2) : "-"}</span>
          <span class="col total">₹${total.toFixed(2)}</span>
        </div>
        `;
      }).join("")}

      <hr>

      <div class="row"><b>Subtotal</b><b>₹${subtotal.toFixed(2)}</b></div>

      ${bill.gstEnabled ? `<div class="row"><b>GST</b><b>₹${gstTotal.toFixed(2)}</b></div>` : ""}

      <div class="row">
        <b>Round Off</b>
        <b>${roundOff >= 0 ? "+" : ""}${roundOff.toFixed(2)}</b>
      </div>

      <div class="row">
        <b>Total</b>
        <b>₹${roundedTotal.toFixed(2)}</b>
      </div>

      <hr>

      <div class="center">Thank you 🙏</div>

    </body>
    </html>
    `;
  }

  // ========================= NORMAL =========================
  return `
  <html>
  <body>

    <h2 style="text-align:center;">NEW MUGAVAI MANICKAM MALIGAI</h2>
    <p><b>Date:</b> ${date}</p>
    <p><b>Invoice:</b> ${bill.invoiceNo}</p>
    <p><b>Customer:</b> ${bill.customerName}</p>

    <table border="1" width="100%" style="border-collapse:collapse;text-align:center;">
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>GST</th>
        <th>Total</th>
      </tr>

      ${items.map(i => {
        const sub = i.price * i.qty;
        const gst = bill.gstEnabled ? (sub * i.gst) / 100 : 0;

        return `
        <tr>
          <td>${i.name}</td>
          <td>${i.qty}</td>
          <td>${i.price}</td>
          <td>${bill.gstEnabled ? i.gst + "%" : "0%"}</td>
          <td>₹${(sub + gst).toFixed(2)}</td>
        </tr>`;
      }).join("")}
    </table>

    <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
    ${bill.gstEnabled ? `<p>GST: ₹${gstTotal.toFixed(2)}</p>` : ""}
    <p>Round Off: ${roundOff >= 0 ? "+" : ""}${roundOff.toFixed(2)}</p>
    <h3>Total: ₹${roundedTotal.toFixed(2)}</h3>

  </body>
  </html>
  `;
}
