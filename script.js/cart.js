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

function getQuantityForButton(button) {
    const quantityInput = button.closest('.product-item')?.querySelector('.quantity-input');
    return quantityInput ? parseInt(quantityInput.value) || 1 : 1;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cart').style.display = 'none';
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const items = JSON.parse(savedCart);
        items.forEach(item => {
            const existingItem = document.querySelector(`.cart-item[data-id="${item.id}"]`);
            if (!existingItem) {
                const cartItem = createCartItemElement(item);
                document.getElementById('cart-items').appendChild(cartItem);
            }
        });
        updateTotal();
    }
});

async function addToCart(button) {
    const product = {
        id: parseInt(button.dataset.id),
        title: button.dataset.title,
        price: parseFloat(button.dataset.price), 
        quantity: getQuantityForButton(button)
    };

    const existingItem = document.querySelector(`.cart-item[data-id="${product.id}"]`);
    
    if (existingItem) {
        const quantityInput = existingItem.querySelector('.js-number');
        const newQuantity = parseInt(quantityInput.value) + product.quantity;
        quantityInput.value = newQuantity;
        
        await updateCartItemInDatabase(product.id, newQuantity);
    } else {
        const cartItem = createCartItemElement(product);
        document.getElementById('cart-items').appendChild(cartItem);
        
        await addCartItemToDatabase(product);
    }
    
    updateTotal();
}

async function addCartItemToDatabase(product) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api-core/api-add-good/', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',

                'X-CSRFToken': getCSRFToken(),
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
              },

            body: JSON.stringify({
                good: product.id,
                quantity: product.quantity
            })
        });
        
        if (response.status === 201) {  
            const responseData = await response.json();
            console.log('Товар успешно добавлен:', responseData);
        } else {
            console.error('Ошибка при добавлении товара в базу данных');
            const errorData = await response.json().catch(() => ({}));
            console.error('Детали ошибки:', errorData);
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
    }
}




async function updateCartItemInDatabase(productId, newQuantity) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api-core/api-cart-detail/${productId}/`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            // credentials: 'include',
            body: JSON.stringify({
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            console.log('Количество успешно обновлено');
        } else {
            console.error('Ошибка при обновлении количества товара');
            const errorData = await response.json().catch(() => ({}));
            console.error('Детали ошибки:', errorData);
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
    }
}

function createCartItemElement(product) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.dataset.id = product.id;
    
    cartItem.innerHTML = `
        <p class="tovar" data-price="${product.price}">${product.title} - ${product.price} ₽</p>
        <div class="boxadd">
            <button class='subtract'>–</button>
            <input type='text' class='js-number' value='${product.quantity}' readonly>
            <button class='add'>+</button>
        </div>
        <span class="remove-icon">🗑️</span>`;

    cartItem.querySelector('.subtract').addEventListener('click', async function() {
        await changeCartItemNumber(-1, this);
    });
    
    cartItem.querySelector('.add').addEventListener('click', async function() {
        await changeCartItemNumber(1, this);
    });
    
    cartItem.querySelector('.remove-icon').addEventListener('click', async function() {
        await removeItem(this);
    });

    return cartItem;
}


async function changeCartItemNumber(step, button) {
    const input = button.parentElement.querySelector('.js-number');
    let value = parseInt(input.value);
    value += step;
    if (value < 1) value = 1;
    input.value = value;
    
    const cartItem = button.closest('.cart-item');
    if (cartItem) {
        const productId = cartItem.dataset.id;
        await updateCartItemInDatabase(productId, value);
    }
    
    updateTotalPrice();
}

function updateTotalPrice() {
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