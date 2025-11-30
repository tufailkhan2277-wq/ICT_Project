let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// ============================================
// NAVIGATION & PAGE INITIALIZATION FUNCTIONS
// ============================================

// Active nav link on page load
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    updateCartCount();
});

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-menu');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    // close when clicking a link
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    // close when tapping outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // set active link based on file name
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
});

// ============================================
// CONTACT FORM FUNCTIONS
// ============================================

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// ============================================
// SHOPPING CART FUNCTIONS
// ============================================

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Add product to cart
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const product = e.target.closest('.product-card');
        const id = product.dataset.id;
        const name = product.dataset.name;
        const price = parseFloat(product.dataset.price);
        
        const existingItem = cart.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Added to cart!');
    }
});

// ============================================
// SHOPPING CART MODAL FUNCTIONS
// ============================================

// Initialize cart modal
const cartModal = document.getElementById('cart-modal');
const cartIcon = document.querySelector('.cart-icon');
const closeModal = document.querySelector('.close');

if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        displayCart();
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => cartModal.style.display = 'none');
}

window.onclick = function(event) {
    if (event.target == cartModal) cartModal.style.display = 'none';
}

// Display cart items in modal
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// ============================================
// CHECKOUT FUNCTIONS
// ============================================

// Process checkout and create order
document.getElementById('checkout-btn')?.addEventListener('click', function() {
    if (cart.length === 0) return;
    
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        timestamp: new Date().toLocaleString()
    };
    
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.removeItem('cart');
    cart = [];
    updateCartCount();
    cartModal.style.display = 'none';
    alert('Order placed successfully! Check admin panel.');
});

// ============================================
// ADMIN AUTHENTICATION FUNCTIONS
// ============================================

// Check admin login credentials
function checkAdminLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === 'admin123') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        showDashboard();
    } else {
        alert('Wrong password!');
    }
}

// Logout from admin panel
function logout() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// ============================================
// ADMIN DASHBOARD & VIEW FUNCTIONS
// ============================================

let currentView = 'dashboard'; // Track current view

// Show dashboard view
function showDashboard() {
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('sales-section').style.display = 'none';
    document.getElementById('dashboard-tab').classList.add('active');
    document.getElementById('sales-tab').classList.remove('active');
    document.getElementById('page-title').textContent = 'Admin Dashboard';
    currentView = 'dashboard';
    if (document.getElementById('dashboard-section').style.display === 'block') {
        loadAdminDashboard();
    }
}

// Show sales view
function showSales() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('sales-section').style.display = 'block';
    document.getElementById('dashboard-tab').classList.remove('active');
    document.getElementById('sales-tab').classList.add('active');
    document.getElementById('page-title').textContent = 'Sales Overview';
    currentView = 'sales';
    drawSalesChart();
    showSalesSummary();
}

// ============================================
// ADMIN DASHBOARD STATS FUNCTIONS
// ============================================

// Load and display dashboard statistics
function loadAdminDashboard() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const approvedOrders = orders.filter(o => o.status === 'approved').length;
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('approved-orders').textContent = approvedOrders;
    
    displayOrders();
}

// ============================================
// ADMIN ORDERS MANAGEMENT FUNCTIONS
// ============================================

// Display all orders
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div>
                <h4>Order #${order.id}</h4>
                <p>${order.items.map(i => i.name + ' (x' + i.quantity + ')').join(', ')}</p>
                <p>Total: $${order.total.toFixed(2)} | ${order.timestamp}</p>
            </div>
            <div>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                ${order.status === 'pending' ? `<button onclick="approveOrder(${order.id})" style="margin-left:1rem;">Approve</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Approve pending order
function approveOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'approved';
        localStorage.setItem('orders', JSON.stringify(orders));
        loadAdminDashboard();
    }
}

// ============================================
// SALES ANALYTICS FUNCTIONS
// ============================================

// Draw sales chart using canvas
function drawSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate sales data for approved orders only
    const salesData = {};
    orders.forEach(order => {
        if (order.status !== 'approved') return;
        order.items.forEach(item => {
            if (!salesData[item.name]) salesData[item.name] = 0;
            salesData[item.name] += item.quantity * item.price;
        });
    });

    const productNames = Object.keys(salesData);
    const salesValues = Object.values(salesData);

    if (productNames.length === 0) {
        ctx.fillStyle = "#666";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No approved sales yet", canvas.width/2, canvas.height/2);
        return;
    }

    // Chart dimensions
    const padding = 50;
    const extraLabelSpace = 60; // px reserved for labels (adjustable)
    const baseHeight = parseInt(canvas.getAttribute('data-base-height') || canvas.height);
    if (!canvas.getAttribute('data-base-height')) canvas.setAttribute('data-base-height', baseHeight);
    // Set canvas height to base + extra (this resets the drawing buffer, so safe here)
    canvas.height = baseHeight + extraLabelSpace;

    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 1.5 - extraLabelSpace/2;
    const barWidth = chartWidth / productNames.length * 0.7;
    const maxValue = Math.max(...salesValues);
    const barHeightFactor = chartHeight / maxValue;

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - (i * chartHeight / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        ctx.fillStyle = "#666";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.fillText((i * maxValue / 5).toFixed(0), padding - 10, y + 4);
    }

    // Draw bars
    productNames.forEach((name, index) => {
        const value = salesData[name];
        const barHeight = value * barHeightFactor;
        const x = padding + index * (chartWidth / productNames.length);
        const y = canvas.height - padding - barHeight;

        // Bar rectangle
        ctx.fillStyle = "#3498db";
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.strokeStyle = "#2980b9";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Value label on bar
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText('$' + value.toFixed(0), x + barWidth/2, y - 5);

        // Product name label - draw diagonally (-45deg) for improved readability
        ctx.save();
        ctx.fillStyle = "#333";
        // slightly smaller font for diagonal labels
        ctx.font = "12px Arial";
        // rotation angle: -45 degrees (diagonal)
        const angle = -Math.PI / 4;
        // position for label: center under the bar, a bit below the padding
        const labelX = x + barWidth / 2;
        const labelY = canvas.height - padding + (extraLabelSpace / 2);
        // translate to label position and rotate
        ctx.translate(labelX, labelY);
        ctx.rotate(angle);
        // When rotated, align text to the left so it reads nicely from bottom-left to top-right
        ctx.textAlign = 'left';
        // Slight offset so text doesn't overlap the bar
        ctx.fillText(name, - (ctx.measureText(name).width / 4), 0);
        ctx.restore();
    });

    // Chart title
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Total Sales by Product ($)", canvas.width/2, 25);
}

// ============================================
// SALES SUMMARY TABLE FUNCTIONS
// ============================================

// Generate and display sales summary table
function showSalesSummary() {
    const salesData = {};
    orders.forEach(order => {
        if (order.status !== 'approved') return;
        order.items.forEach(item => {
            if (!salesData[item.name]) {
                salesData[item.name] = { qty: 0, total: 0 };
            }
            salesData[item.name].qty += item.quantity;
            salesData[item.name].total += item.quantity * item.price;
        });
    });

    const summaryDiv = document.getElementById('sales-products');
    if (Object.keys(salesData).length === 0) {
        summaryDiv.innerHTML = '<p>No approved sales yet</p>';
        return;
    }

    // Create table structure
    const tableHTML = `
        <table class="sales-table">
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Units Sold</th>
                    <th>Total Sales</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(salesData).map(([name, data]) => `
                    <tr>
                        <td>${name}</td>
                        <td>${data.qty}</td>
                        <td>$${data.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    summaryDiv.innerHTML = tableHTML;
}
