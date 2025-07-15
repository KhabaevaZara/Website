function toggleCart() {
    const cart = document.getElementById('cart');
    cart.style.display = cart.style.display === 'none' ? 'block' : 'none';
}
function getCSRFToken() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  }

async function loadUserData() {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken || accessToken === "undefined") {
        window.location.href = 'index.html';
        return;
    }
}


//Отображение корзины пользователя

async function fetchCart() {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const response = await fetch('http://127.0.0.1:8000/api-core/api-cart/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            
        });
        if (!response.ok) throw new Error('Ошибка загрузки корзины');
        return await response.json();
    } catch (error) {
       
    }
}


//Удаление товара из корзины

async function deleteCartItem(itemId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api-core/api-cart-detail/${itemId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Ошибка удаления');
        }
        
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Не удалось удалить товар');
        return false;
    }
}




async function updateCartItem(itemId, newQuantity) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api-core/api-cart-detail/${itemId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alert('Не удалось обновить количество');
        return null;
    }
}


//Отрисовка корзины

function renderCartItem(item, container) {
    // Проверяем, не существует ли уже элемент с таким ID
    const existingItem = container.querySelector(`.cart-item[data-id="${item.id}"]`);
    if (existingItem) {
        // Если существует - просто обновляем количество
        const quantityInput = existingItem.querySelector('.js-number');
        quantityInput.value = item.quantity;
        updateTotal();
        return;
    }
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.id = item.id;
         cartItem.innerHTML = `
        <img class="cart-img" src="${item.good.get_first_img.image || 'https://via.placeholder.com/80'}" class="item-image" alt="${item.good.name}">
        <div>
            <h3 class="cart-name">${item.good.name}</h3>
            <p>${item.price} ₽ за шт. (${item.good.price} ₽/шт.)</p>
        </div>
        <div class="quantity-controls">
            <button class="quantity-btn minus-btn">-</button>
            <input type="text" class="js-number" value="${item.quantity}" readonly>
            <button class="quantity-btn plus-btn">+</button>        <span class="remove-icon">🗑️</span>
        </div>

    `;
     const plusBtn = cartItem.querySelector('.plus-btn');
    const minusBtn = cartItem.querySelector('.minus-btn');
    const removeBtn = cartItem.querySelector('.remove-icon');
    const quantityInput = cartItem.querySelector('.js-number');
     plusBtn.addEventListener('click', async () => {
        const newQuantity = parseInt(quantityInput.value) + 1;
        const updatedItem = await updateCartItem(item.id, newQuantity);
        if (updatedItem) {
            quantityInput.value = updatedItem.quantity;
            updateTotal();
        }
    });
     minusBtn.addEventListener('click', async () => {
        const currentQuantity = parseInt(quantityInput.value);
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            const updatedItem = await updateCartItem(item.id, newQuantity);
            if (updatedItem) {
                quantityInput.value = updatedItem.quantity;
                updateTotal();
            }
        }
    });
     removeBtn.addEventListener('click', async () => {
        const success = await deleteCartItem(item.id);
        if (success) {
            container.removeChild(cartItem);
            updateTotal();
        }
    });
     container.appendChild(cartItem);
}

//ИТОГО
function updateTotal() {
    const totalElements = document.querySelectorAll('.cart-item');
    let total = 0;
    totalElements.forEach(item => {
        const priceText = item.querySelector('p').textContent;

        const priceMatch = priceText.match(/\d+\.?\d*/);
        if (priceMatch) {
            const price = parseFloat(priceMatch[0]);
            const quantity = parseInt(item.querySelector('.js-number').value);
            total += price * quantity;
        }
    });
    document.getElementById('total-price').textContent = `Сумма заказа: ${total.toFixed(2)} ₽`;
}
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('cart-items');
    try {
        const cartItems = await fetchCart();
        container.innerHTML = '';
        cartItems.forEach(item => renderCartItem(item, container));
        updateTotal();
    } catch (error) {
        console.error('Error loading cart:', error);
    }

    // document.querySelector('.checkout-btn').addEventListener('click', async () => {
    //     try {
    //         const result = await checkoutCart();
    //         if (result && result.success) {
    //             alert('Заказ успешно оформлен!');
    //             container.innerHTML = '';
    //             updateTotal();
    //         }
    //     } catch (error) {
    //         console.error('Checkout error:', error);
    //         alert('Ошибка при оформлении заказа');
    //     }
    // });
});