export function getInvoiceHTML(bill, isThermal = false) {

  const date = new Date(bill.createdAt || new Date()).toLocaleString();

  let itemsHTML = "";

  bill.items.forEach(item => {
    let subtotal = item.price * item.qty;
    let gst = bill.gstEnabled ? (subtotal * item.gst) / 100 : 0;
    let total = subtotal + gst;

    itemsHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${total.toFixed(2)}</td>
      </tr>
    `;
  });

  // 🔥 THERMAL STYLE
  if (isThermal) {
    return `
    <div style="width:280px;font-family:monospace">
      <h3 style="text-align:center">My Store</h3>
      <p>${date}</p>
      <p>Invoice: ${bill.invoiceNo}</p>
      <p>Customer: ${bill.customerName}</p>
      <hr/>
      ${bill.items.map(i =>
        `${i.name}<br>${i.qty} x ${i.price}`
      ).join("<br>")}
      <hr/>
      <h3>Total: ₹${bill.total}</h3>
      <p style="text-align:center">Thank you 🙏</p>
    </div>
    `;
  }

  // 🧾 NORMAL INVOICE
  return `
  <div style="font-family:Arial;padding:20px">

    <p><b>${date}</b></p>

    <h2>INVOICE</h2>

    <p>Invoice: ${bill.invoiceNo}</p>
    <p>Customer: ${bill.customerName}</p>

    <table border="1" width="100%" style="border-collapse:collapse;text-align:center">
      <tr>
        <th>Name</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
      ${itemsHTML}
    </table>

    <h3>Total ₹${bill.total}</h3>

  </div>
  `;
}