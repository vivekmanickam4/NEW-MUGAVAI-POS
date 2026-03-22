export function getInvoiceHTML(bill, isThermal = false) {

  // =========================
  // ✅ DATE FIX
  // =========================
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

  // =========================
  // ✅ CALCULATIONS
  // =========================
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

  const total = subtotal + gstTotal;

  // =====================================================
  // 🧾 THERMAL PRINT (FINAL VERSION)
  // =====================================================
  if (isThermal) {
    return `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Print</title>

      <style>
        body {
          font-family: 'Noto Sans Tamil', monospace;
          font-size: 12px;
          width: 260px;
        }

        .center {
          text-align: center;
        }

        .row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .col {
          display: inline-block;
        }

        .name { width: 30%; text-align: left; }
        .qty { width: 15%; text-align: center; }
        .gstp { width: 15%; text-align: center; }
        .gsta { width: 20%; text-align: right; }
        .total { width: 20%; text-align: right; }

        .header {
          font-weight: bold;
        }

        hr {
          border: none;
          border-top: 1px dashed #000;
        }
      </style>

      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">
    </head>

    <body onload="window.print(); window.close();">

      <div>

        <div class="center"><b>NEW MUGAVAI MANICKAM MALIGAI</b></div>
        <div class="center">GST No: XXXXXXXXXXXXX</div>

        <br>

        <div>${date}</div>
        <div>Inv: ${bill.invoiceNo || "-"}</div>
        <div>Customer: ${bill.customerName || "-"}</div>

        <hr>

        <!-- ✅ HEADER -->
        <div class="row header">
          <span class="col name">Item</span>
          <span class="col qty">Qty</span>
          <span class="col gstp">GST%</span>
          <span class="col gsta">GST</span>
          <span class="col total">Total</span>
        </div>

        <hr>

        <!-- ✅ ITEMS -->
        ${items.map(i => {
          const price = Number(i.price) || 0;
          const qty = Number(i.qty) || 0;
          const gstPercent = Number(i.gst) || 0;

          const sub = price * qty;
          const gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;
          const total = sub + gst;

          return `
            <div class="row">
              <span class="col name">${i.name || "-"}</span>
              <span class="col qty">${qty}x${price}</span>
              <span class="col gstp">${bill.gstEnabled ? gstPercent + "%" : "-"}</span>
              <span class="col gsta">${bill.gstEnabled ? gst.toFixed(2) : "-"}</span>
              <span class="col total">₹${total.toFixed(2)}</span>
            </div>
          `;
        }).join("")}

        <hr>

        <!-- ✅ TOTALS -->
        <div class="row"><b>Subtotal</b><b>₹${subtotal.toFixed(2)}</b></div>
        ${bill.gstEnabled ? `<div class="row"><b>GST</b><b>₹${gstTotal.toFixed(2)}</b></div>` : ""}
        <div class="row"><b>Total</b><b>₹${total.toFixed(2)}</b></div>

        <hr>

        <div class="center">Thank you 🙏</div>

      </div>

    </body>
    </html>
    `;
  }

  // =====================================================
  // 🧾 NORMAL INVOICE (UNCHANGED + CLEAN)
  // =====================================================
  return `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Invoice</title>

    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">

    <style>
      body {
        font-family: 'Noto Sans Tamil', Arial;
      }

      .invoice-box {
        position: relative;
        padding: 20px;
      }

      .watermark {
        position: absolute;
        top: 30%;
        left: 25%;
        width: 300px;
        opacity: 0.05;
        z-index: 0;
      }

      .content {
        position: relative;
        z-index: 1;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
      }

      th, td {
        border: 1px solid black;
        padding: 6px;
      }
    </style>
  </head>

  <body>

    <div class="invoice-box">

      <img src="logo.png" class="watermark"/>

      <div class="content">

        <h2 style="text-align:center;">NEW MUGAVAI MANICKAM MALIGAI</h2>
        <p><b>GST No:</b> XXXXXXXXXXXXX</p>

        <hr>

        <p><b>Date:</b> ${date}</p>
        <p><b>Invoice No:</b> ${bill.invoiceNo || "-"}</p>
        <p><b>Customer:</b> ${bill.customerName || "-"}</p>

        <table>
          <tr>
            <th>Item</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Price</th>
            <th>GST</th>
            <th>Total</th>
          </tr>

          ${items.map(i => {
            const price = Number(i.price) || 0;
            const qty = Number(i.qty) || 0;
            const gstPercent = Number(i.gst) || 0;

            const sub = price * qty;
            const gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;

            return `
            <tr>
              <td>${i.name || "-"}</td>
              <td>${i.hsn || "-"}</td>
              <td>${qty}</td>
              <td>₹${price}</td>
              <td>${bill.gstEnabled ? gstPercent + "%" : "0%"}</td>
              <td>₹${(sub + gst).toFixed(2)}</td>
            </tr>
            `;
          }).join("")}

        </table>

        <p><b>Subtotal:</b> ₹${subtotal.toFixed(2)}</p>
        ${bill.gstEnabled ? `<p><b>GST:</b> ₹${gstTotal.toFixed(2)}</p>` : ""}
        <h3>Total: ₹${total.toFixed(2)}</h3>

        <p style="text-align:center;">Thank you 🙏 Visit Again</p>

      </div>

    </div>

  </body>
  </html>
  `;
}
