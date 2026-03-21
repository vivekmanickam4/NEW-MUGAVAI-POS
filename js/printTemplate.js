export function getInvoiceHTML(bill, isThermal = false) {

  // ✅ DATE FIX
  let date = "";
  if (bill.createdAt?.seconds) {
    date = new Date(bill.createdAt.seconds * 1000).toLocaleString();
  } else {
    date = new Date(bill.createdAt || new Date()).toLocaleString();
  }

  let subtotal = 0;
  let gstTotal = 0;

  // ✅ CALCULATE TOTALS
  bill.items.forEach(i => {
    let sub = i.price * i.qty;
    let gst = bill.gstEnabled ? (sub * i.gst) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;
  });

  let total = subtotal + gstTotal;

  // =====================================================
  // 🧾 THERMAL PRINT (FIXED)
  // =====================================================
  if (isThermal) {
    return `
    <div style="width:260px; font-family:monospace; font-size:12px;">

      <center><b>NEW MUGAVAI MANICKAM MALIGAI</b></center>
      <center>GST No: XXXXXXXXXXXXX</center>

      <p>${date}</p>

      <p>Inv: ${bill.invoiceNo}</p>
      <p>CUSTOMER: ${bill.customerName}</p>

      <hr>

      ${bill.items.map(i => `
        ${i.name}<br>
        ${i.qty} x ₹${i.price}<br>
      `).join("")}

      <hr>

      <b>Subtotal: ₹${subtotal.toFixed(2)}</b><br>
      ${bill.gstEnabled ? `<b>GST: ₹${gstTotal.toFixed(2)}</b><br>` : ""}
      <b>Total: ₹${total.toFixed(2)}</b>

      <hr>

      <center>Thank you 🙏</center>

    </div>
    `;
  }

  // =====================================================
  // 🧾 NORMAL GST INVOICE (PRO FORMAT)
  // =====================================================
  return `
  <div style="padding:20px; font-family:Arial;">

    <h2 style="text-align:center;">NEW MUGAVAI MANICKAM MALIGAI</h2>
    <p><b>GST No:</b> XXXXXXXXXXXXX</p>

    <hr>

    <p><b>Date:</b> ${date}</p>
    <p><b>Invoice No:</b> ${bill.invoiceNo}</p>
    <p><b>CUSTOMER :</b> ${bill.customerName}</p>

    <br>

    <table border="1" width="100%" style="border-collapse:collapse; text-align:center;">
      <tr>
        <th>Item's</th>
        <th>HSN</th>
        <th>Qty.</th>
        <th>Price</th>
        <th>GST %</th>
        <th>Total</th>
      </tr>

      ${bill.items.map(i => {
        let sub = i.price * i.qty;
        let gst = bill.gstEnabled ? (sub * i.gst) / 100 : 0;

        return `
        <tr>
          <td>${i.name}</td>
          <td>${i.hsn || "-"}</td>
          <td>${i.qty}</td>
          <td>₹${i.price}</td>
          <td>${bill.gstEnabled ? i.gst + "%" : "0%"}</td>
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
  `;
}
