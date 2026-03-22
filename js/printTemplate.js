export function getInvoiceHTML(bill, isThermal = false) {

  // ✅ DATE FIX (handles all cases)
  let date = "";
  if (bill.createdAt?.seconds) {
    date = new Date(bill.createdAt.seconds * 1000).toLocaleString();
  } else if (bill.createdAt) {
    date = new Date(bill.createdAt).toLocaleString();
  } else {
    date = new Date().toLocaleString();
  }

  let subtotal = 0;
  let gstTotal = 0;

  // ✅ SAFE CALCULATION
  bill.items.forEach(i => {
    let price = Number(i.price) || 0;
    let qty = Number(i.qty) || 0;
    let gstPercent = Number(i.gst) || 0;

    let sub = price * qty;
    let gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;
  });

  let total = subtotal + gstTotal;

  // =====================================================
  // 🧾 THERMAL PRINT (TAMIL SAFE)
  // =====================================================
  if (isThermal) {
    return `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Noto Sans Tamil', monospace;
          font-size: 12px;
        }
      </style>
    </head>

    <body>
    <div style="width:260px;">

      <center><b>NEW MUGAVAI MANICKAM MALIGAI</b></center>
      <center>GST No: XXXXXXXXXXXXX</center>

      <p>${date}</p>

      <p>Inv: ${bill.invoiceNo || "-"}</p>
      <p>CUSTOMER: ${bill.customerName || "-"}</p>

      <hr>

      ${bill.items.map(i => `
        ${i.name || "-"}<br>
        ${i.qty || 0} x ₹${i.price || 0}<br>
      `).join("")}

      <hr>

      <b>Subtotal: ₹${subtotal.toFixed(2)}</b><br>
      ${bill.gstEnabled ? `<b>GST: ₹${gstTotal.toFixed(2)}</b><br>` : ""}
      <b>Total: ₹${total.toFixed(2)}</b>

      <hr>

      <center>Thank you 🙏</center>

    </div>
    </body>
    </html>
    `;
  }

  // =====================================================
  // 🧾 NORMAL INVOICE (TAMIL + BACKGROUND SUPPORT)
  // =====================================================
  return `
  <html>
  <head>
    <meta charset="UTF-8">

    <!-- ✅ TAMIL FONT -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">

    <style>
      body {
        font-family: 'Noto Sans Tamil', Arial, sans-serif;
      }

      .invoice-box {
        position: relative;
        padding: 20px;
      }

      /* ✅ WATERMARK BACKGROUND */
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
        border-collapse: collapse;
        width: 100%;
        text-align: center;
      }

      table, th, td {
        border: 1px solid black;
        padding: 6px;
      }

    </style>
  </head>

  <body>

  <div class="invoice-box">

    <!-- ✅ OPTIONAL LOGO WATERMARK -->
    <!-- Replace with your image -->
    <img src="logo.png" class="watermark" />

    <div class="content">

      <h2 style="text-align:center;">NEW MUGAVAI MANICKAM MALIGAI</h2>
      <p><b>GST No:</b> XXXXXXXXXXXXX</p>

      <hr>

      <p><b>Date:</b> ${date}</p>
      <p><b>Invoice No:</b> ${bill.invoiceNo || "-"}</p>
      <p><b>CUSTOMER :</b> ${bill.customerName || "-"}</p>

      <br>

      <table>
        <tr>
          <th>Item's</th>
          <th>HSN</th>
          <th>Qty.</th>
          <th>Price</th>
          <th>GST %</th>
          <th>Total</th>
        </tr>

        ${bill.items.map(i => {
          let price = Number(i.price) || 0;
          let qty = Number(i.qty) || 0;
          let gstPercent = Number(i.gst) || 0;

          let sub = price * qty;
          let gst = bill.gstEnabled ? (sub * gstPercent) / 100 : 0;

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

      <br>

      <p><b>Subtotal:</b> ₹${subtotal.toFixed(2)}</p>
      ${bill.gstEnabled ? `<p><b>GST:</b> ₹${gstTotal.toFixed(2)}</p>` : ""}
      <h3>Total: ₹${total.toFixed(2)}</h3>

      <br>

      <p style="text-align:center;">Thank you 🙏 Visit Again</p>

    </div>

  </div>

  </body>
  </html>
  `;
}
