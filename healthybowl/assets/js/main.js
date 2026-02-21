import {
  auth,
  db,
  collection,
  addDoc
} from "./firebase.js";

/* =====================================================
   GO HEALTHY MASTER SCRIPT
===================================================== */

/* ================= CART SYSTEM ================= */

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart(){

  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("total");

  if(!box || !totalBox) return;

  box.innerHTML="";
  let total = 0;

  if(cart.length === 0){
    box.innerHTML="Cart empty";
  }

  cart.forEach((item,index)=>{
    total += item.price;

    box.innerHTML += `
      <div class="cart-item">
        ${item.name} - ₹${item.price}
        <button onclick="removeItem(${index})">❌</button>
      </div>`;
  });

  totalBox.innerText = total;
}

window.addToCart = function(name,price){
  cart.push({name,price});
  saveCart();
  renderCart();
}

window.removeItem = function(index){
  cart.splice(index,1);
  saveCart();
  renderCart();
}

/* ================= ORDER CREATOR ================= */

function generateOrderId(){
  return "GH" + Date.now();
}

function createOrder(paymentId,total){

  const order = {
    orderId: generateOrderId(),
    items: [...cart],
    amount: total,
    paymentId: paymentId,
    status: "Confirmed",
    date: new Date().toLocaleString()
  };

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  return order;
}

/* ================= FIREBASE SAVE ================= */

async function saveOrderToFirebase(order){

  const user = auth.currentUser;

  if(!user){
    alert("Please login first");
    window.location = "login.html";
    return;
  }

  await addDoc(collection(db,"orders"),{
    userId: user.uid,
    ...order
  });
}

/* ================= RAZORPAY CHECKOUT ================= */

window.checkout = function(){

  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  let total = cart.reduce((sum,i)=>sum+i.price,0);

  var options = {
    key: "RAZORPAY_PUBLIC_KEY_HERE",
    amount: total * 100,
    currency: "INR",
    name: "Go Healthy",
    description: "Subscription Order",

    handler: async function(response){

      // CREATE ORDER
      const order = createOrder(
        response.razorpay_payment_id,
        total
      );

      // SAVE TO FIREBASE
      await saveOrderToFirebase(order);

      // INVOICE
      generateInvoice(order);

      // WHATSAPP
      sendWhatsAppConfirmation(order.orderId,total);

      alert("✅ Payment Successful!\nOrder ID: "+order.orderId);

      cart=[];
      saveCart();
      renderCart();
    },

    theme:{ color:"#2e7d32" }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

/* ================= TRACK ORDER ================= */

window.trackOrder = function(){

  const input = document.getElementById("orderInput");
  const resultBox = document.getElementById("orderResult");
  if(!input || !resultBox) return;

  const orderId = input.value.trim();
  const order = orders.find(o => o.orderId === orderId);

  if(!order){
    resultBox.innerHTML =
      "<div class='card'>❌ Order not found</div>";
    return;
  }

  let itemsHTML="";
  order.items.forEach(item=>{
    itemsHTML += `<li>${item.name} - ₹${item.price}</li>`;
  });

  resultBox.innerHTML = `
    <div class="card">
      <h2>✅ Order Found</h2>
      <p>Status: ${order.status}</p>
      <p>Date: ${order.date}</p>
      <p>Total: ₹${order.amount}</p>
      <p>Payment ID: ${order.paymentId}</p>
      <ul>${itemsHTML}</ul>
    </div>
  `;
}

/* ================= ADMIN PANEL ================= */

function loadAdminOrders(){

  const container = document.getElementById("ordersContainer");
  if(!container) return;

  if(orders.length === 0){
    container.innerHTML="<p>No orders yet.</p>";
    return;
  }

  container.innerHTML="";

  orders.forEach((order,index)=>{

    container.innerHTML += `
      <div class="card">
        <h3>${order.orderId}</h3>
        <p>Status: ${order.status}</p>
        <p>Total: ₹${order.amount}</p>

        <button onclick="updateStatus(${index},'Preparing')">Preparing</button>
        <button onclick="updateStatus(${index},'Out for Delivery')">Out for Delivery</button>
        <button onclick="updateStatus(${index},'Delivered')">Delivered</button>
      </div>`;
  });
}

window.updateStatus = function(index,status){
  orders[index].status = status;
  localStorage.setItem("orders", JSON.stringify(orders));
  loadAdminOrders();
}

/* ================= PDF INVOICE ================= */

function generateInvoice(order){

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Go Healthy Invoice",20,20);

  doc.setFontSize(12);
  doc.text("Order ID: "+order.orderId,20,40);
  doc.text("Date: "+order.date,20,50);
  doc.text("Payment ID: "+order.paymentId,20,60);

  let y=80;
  doc.text("Items:",20,y);

  order.items.forEach(item=>{
    y+=10;
    doc.text(`${item.name} - ₹${item.price}`,25,y);
  });

  y+=15;
  doc.text("Total Amount: ₹"+order.amount,20,y);

  doc.save("Invoice_"+order.orderId+".pdf");
}

/* ================= WHATSAPP ================= */

function sendWhatsAppConfirmation(orderId,total){

  const message =
`✅ Go Healthy Order Confirmed!

Order ID: ${orderId}
Amount Paid: ₹${total}

Track here:
https://yourdomain.com/track.html`;

  window.open(
    `https://wa.me/917887640076?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

/* ================= AUTO LOAD ================= */

document.addEventListener("DOMContentLoaded", ()=>{
  renderCart();
  loadAdminOrders();
});