export function getInvoiceHTML(bill, isThermal = false) {

  let date = "";

if (bill.createdAt?.seconds) {
  date = new Date(bill.createdAt.seconds * 1000).toLocaleString();
} else {
  date = new Date().toLocaleString();
}

  let rows = "";
  let subtotal = 0;
  let gstTotal = 0;

  bill.items.forEach(i => {

    let sub = i.price * i.qty;
    let gst = bill.gstEnabled ? (sub * i.gst) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;

    rows += `
      <tr>
        <td>${i.name}</td>
        <td>${i.hsn || "-"}</td>
        <td>${i.qty}</td>
        <td>${i.price}</td>
        <td>${i.gst}%</td>
        <td>${(sub + gst).toFixed(2)}</td>
      </tr>
    `;
  });

  let total = subtotal + gstTotal;

  if (isThermal) {
  return `
  <div style="width:260px;font-family:monospace;font-size:12px">

    <center><b>My Store</b></center>
    <p>${date}</p>

    <p>Inv: ${bill.invoiceNo}</p>
    <p>CUSTOMER: ${bill.customerName}</p>

    <hr>

    ${bill.items.map(i => `
      ${i.name}
      <br>
      ${i.qty} x ₹${i.price}
      <br>
    `).join("")}

    <hr>

    <b>Total ₹${bill.total}</b>

    <center>Thank you 🙏</center>

  </div>
  `;
}
    return `
<div style="padding:20px;font-family:Arial">

  <p><b>${date}</b></p>

  <h2>INVOICE</h2>

  <p><b>Invoice No:</b> ${bill.invoiceNo}</p>
  <p><b>CUSTOMER :</b> ${bill.customerName}</p>

  <br>

  <table border="1" width="100%" style="border-collapse:collapse;text-align:center">
    <tr>
      <th>Item's</th>
      <th>Qty.</th>
      <th>Price</th>
    </tr>

    ${bill.items.map(i => `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty}</td>
        <td>₹${i.price}</td>
      </tr>
    `).join("")}

  </table>

  <br>

  <h3>Total ₹${bill.total}</h3>

</div>
`;
}
