import { productsData } from "./products.js";

const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const clearCartBtn = document.querySelector(".clear-cart");

let cart = [];

let buttonsDOM = [];
//1.get peoducts:
class Products {
    getProducts() {
        return productsData;
    }
}

//2.display products:
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
            <div class="product necklace">
                <div class="img-container">
                    <img src=${product.imageUrl} class="product-img"/>
                </div>
                <div class="product-desc">
                    <p class="product-title">${product.title}</p>
                    <br>
                    <p class="product-price"> تومان ${product.price} </p>
                </div>
                <button class="btn add-to-cart" data-id=${product.id}>افزودن به سبد خرید</button>
            </div>`
        });
        productsDOM.innerHTML = result;
    }
    getCartBtns() {
        const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
        buttonsDOM = addToCartBtns;
        addToCartBtns.forEach((btn) => {
            const id = btn.dataset.id;
            //check if this product id is in cart or not!
            const isInCart = cart.find((item) => item.id === parseInt(id));
            if (isInCart) {
                btn.innerHTML = "افزوده شد";
                btn.disabled = true;
            }
            btn.addEventListener("click", (event) => {
                //console.log(event.target.dataset.id);
                event.target.innerText = "افزوده شد"
                event.target.disabled = true;
                //get product from products:
                const addedProduct = {...Storage.getProduct(id), quantity: 1 };
                //add to cart
                cart = [...cart, {...addedProduct }

                ];
                //save cart to local storage
                Storage.saveCart(cart);
                //update cart value:
                this.setCartValue(cart);
                //add to cart item:
                this.addCartItem(addedProduct);
            });
        });
    }

    setCartValue(cart) {
        //1.cart items:
        //2.cart total price:
        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItems += curr.quantity; //1+2=3
            return curr.quantity * curr.price + acc;
        }, 0);

        cartTotal.innerText = `مجموع قیمت :${parseFloat(totalPrice).toFixed(
            2
          )} تومان`;
        cartItems.innerText = tempCartItems;

    }
    addCartItem(cart) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<div>
        <img class="cart-item-img" src=${cart.imageUrl}></div>
        <div class="cart-item-desc">
            <h4>${cart.title}</h4>
            <h5>${cart.price} تومان</h5>
        </div>
        <div class="cart-item-controller">
            <i class="fa fa-chevron-up" data-id=${cart.id}></i>
            <p class="item-quantity">${cart.quantity}</p>
            <i class="fa fa-chevron-down" data-id=${cart.id}></i></div>
            <i class="far fa-trash-alt remove-item" data-id=${cart.id}></i>`;
        cartContent.appendChild(div);

    }
    setupApp() {
        //get cart from storage
        cart = Storage.getCart();
        //add cart Item:
        this.setCartValue(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
    }

    cartLogic() {
        //clear cart:

        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        //cart functionality:

        cartContent.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-item")) {
                const removeItem = event.target;
                const id = removeItem.dataset.id;
                const removedItem = cart.find((c) => c.id == id);
                this.removeItem(id);
                console.log(id);
                // remove from DOM :
                // console.log(removeItem.parentElement);
                cartContent.removeChild(removeItem.parentElement);

                // remove item from cart not DOM !
            } else if (event.target.classList.contains("fa-chevron-up")) {
                const addQuantity = event.target;
                const id = addQuantity.dataset.id;
                const addedItem = cart.find((c) => c.id == id);
                addedItem.quantity++;
                // update storage
                Storage.saveCart(cart);
                // update total price
                this.setCartValue(cart);
                // update item quantity :
                // console.log(addQuantity.nextElementSibling);
                addQuantity.nextElementSibling.innerText = addedItem.quantity;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                const subQuantity = event.target;
                const id = subQuantity.dataset.id;
                const substractedItem = cart.find((c) => c.id == id);

                if (substractedItem.quantity === 1) {
                    this.removeItem(id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                    return;
                }

                substractedItem.quantity--;
                // update storage
                Storage.saveCart(cart);
                // update total price
                this.setCartValue(cart);
                // update item quantity :
                // console.log(subQuantity.nextElementSibling);
                subQuantity.previousElementSibling.innerText = substractedItem.quantity;
            }
        });

    }

    clearCart() {
        // loop on all the item and tigger remove for each one
        cart.forEach((item) => this.removeItem(item.id));
        // console.log(cartContent.children[0]);
        while (cartContent.children.length) {
            cartContent.removeChild(cartContent.children[0]);
        }
        closeModalFunction();
    }

    removeItem(id) {
        //update cart:
        // console.log(id);
        cart = cart.filter((cartItem) => cartItem.id != id);
        //total price and cart items:
        this.setCartValue(cart);
        //update storage:
        Storage.saveCart(cart);
        //get add to cart btns =>update text and disable:
        const button = this.getSingleButton(id);

        button.innerText = "افزودن به سبد خرید";
        button.disabled = false;
    }
    getSingleButton(id) {

        return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
    }

}

//3.storage:
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));

    }
    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id == parseInt(id));
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));

    }

    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];

    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    ui.setupApp();
    const products = new Products();
    const productsData = products.getProducts();
    ui.displayProducts(productsData);
    ui.getCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);

});

function showModalFunction() {
    backDrop.style.display = "block";
    cartModal.style.opacity = "1";
    cartModal.style.top = "5%";

}

function closeModalFunction() {
    backDrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";

}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);