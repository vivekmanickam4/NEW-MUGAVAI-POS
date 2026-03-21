export function getInvoiceHTML(bill, isThermal = false) {

  const date = new Date(bill.createdAt || new Date()).toLocaleString();

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
      <div style="width:280px;font-family:monospace">
        <center><b>My Store</b></center>
        <p>${date}</p>
        <p>Inv: ${bill.invoiceNo}</p>
        <p>${bill.customerName}</p>
        <hr>
        ${bill.items.map(i => `${i.name} x${i.qty} ₹${i.price}`).join("<br>")}
        <hr>
        <b>Total ₹${total}</b>
        <p style="text-align:center">Thank you 🙏</p>
      </div>
    `;
  }

  return `
    <div style="padding:20px;font-family:Arial">

      <p><b>${date}</b></p>

      <h2>INVOICE</h2>

      <p>Invoice: ${bill.invoiceNo}</p>
      <p>Customer: ${bill.customerName}</p>

      <table border="1" width="100%" style="border-collapse:collapse;text-align:center">
        <tr>
          <th>Name</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Price</th>
          <th>GST%</th>
          <th>Total</th>
        </tr>
        ${rows}
      </table>

      <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
      <p>GST: ₹${gstTotal.toFixed(2)}</p>

      <h3>Total ₹${total.toFixed(2)}</h3>

    </div>
  `;
}
