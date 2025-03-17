// Funcționalitate coș - versiune corectată
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.initCart();
    }

    initCart() {
        // Adaugă verificare existență elemente
        const cartLink = document.querySelector('.cart-link');
        if (!cartLink) return;

        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('cart-open');
        });

        // Actualizare selector pentru butoane
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productElement = e.target.closest('.top-item');
                if (!productElement) return;
                
                const product = this.getProductData(productElement);
                this.addToCart(product);
            });
        });

        this.updateCartUI();
    }

    getProductData(productElement) {
        // Adaugă verificare elemente
        const priceElement = productElement.querySelector('.price');
        return {
            name: productElement.querySelector('h3')?.textContent || 'Produs fără nume',
            price: parseFloat(priceElement?.textContent.replace(/[^0-9.]/g, '') || 0),
            image: productElement.querySelector('img')?.src || '',
            quantity: 1
        };
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.name === product.name);
        existingItem ? existingItem.quantity++ : this.cart.push(product);
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartUI();
    }

    updateCartUI() {
        // Actualizează numărul de produse
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = totalItems;

        // Actualizează lista de produse și mesajul pentru coș gol
        const cartContainer = document.querySelector('.cart-items-container');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContainer) cartContainer.innerHTML = '';
        } else {
            if (emptyCart) emptyCart.style.display = 'none';
            if (cartContainer) {
                cartContainer.innerHTML = this.cart.map((item, index) => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price.toFixed(2)} Lei x ${item.quantity}</p>
                            <div class="cart-item-controls">
                                <button data-action="decrease" data-index="${index}">-</button>
                                <button data-action="increase" data-index="${index}">+</button>
                                <button data-action="remove" data-index="${index}">Șterge</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Actualizează totalul
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.querySelector('.cart-total');
        if (totalElement) totalElement.textContent = total.toFixed(2);
    }

    updateQuantity(index, change) {
        if (!this.cart[index]) return;
        
        this.cart[index].quantity += change;
        if (this.cart[index].quantity < 1) {
            this.removeItem(index);
        } else {
            this.saveCart();
        }
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
    }
}

// Inițializare corectă
let shoppingCart;
document.addEventListener('DOMContentLoaded', () => {
    shoppingCart = new ShoppingCart();
    
    // Delegare evenimente pentru controalele din coș
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        
        if (action === 'decrease') shoppingCart.updateQuantity(index, -1);
        if (action === 'increase') shoppingCart.updateQuantity(index, 1);
        if (action === 'remove') shoppingCart.removeItem(index);
    });

    // Închidere coș modificată
    document.addEventListener('click', (e) => {
        const isCart = e.target.closest('.cart-sidebar');
        const isCartLink = e.target.closest('.cart-link');
        const isCartControl = e.target.closest('[data-action]');
        
        if (!isCart && !isCartLink && !isCartControl) {
            document.body.classList.remove('cart-open');
        }
    });

    // Eveniment pentru finalizare comandă
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.body.classList.remove('cart-open');
            alert('Comanda a fost plasată! Total: ' + 
                document.querySelector('.cart-total').textContent + ' Lei');
            localStorage.removeItem('cart');
            shoppingCart.cart = [];
            shoppingCart.updateCartUI();
        });
    }
});