const CARDS_PER_PAGE = 27;
let currentPage = 0;
const container = document.querySelector('.container');
let quickViewWindow = null;


// функция создания элементов
function createElement(tag, {classes = [], attributes = {}, children = [], eventListeners = {}} = {}) {
  const element = document.createElement(tag);
  if (classes.length) element.classList.add(...classes);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  children.forEach(child => element.appendChild(child));
  
  Object.entries(eventListeners).forEach(([event, handler]) => {
    element.addEventListener(event, handler);
  });

  return element;
}



function createCardData(good) {
  return {
    id: good.id,
    title: good.name,
    image: good.get_first_img?.image || 'default-image.jpg',
    price: good.price,
    delprice: good.start_price,
    detailsUrl: `productcard.html?id=${good.id}`,
    discount: good.discount,
    description: good.description || 'Описание товара отсутствует'
  };
}

//  функция загрузки товаров
async function loadGoods() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIdParam = urlParams.get('categoryId');
    let categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : null;
    
    currentCategoryName = 'Все товары'; 
    
    let apiUrl = 'http://127.0.0.1:8000/api-core/api-good/';
    if (categoryId && !isNaN(categoryId)) {
      apiUrl += `?category=${categoryId}`;
      
      try {
        const categoryResponse = await fetch('http://127.0.0.1:8000/api-core/api-category/');
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          
          let foundCategory = null;
          for (const mainCategory of categoryData.categories) {
            foundCategory = mainCategory.nested_categories.find(
              sub => sub.id === categoryId
            );
            if (foundCategory) break;
          }
          
          currentCategoryName = foundCategory 
            ? foundCategory.name 
            : `Категория ${categoryId}`;
        }
      } catch (e) {
        console.error('Ошибка загрузки данных категории:', e);
        currentCategoryName = `Категория ${categoryId}`;
      }
    }
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const goodsData = await response.json();
    const cardsData = goodsData.map(createCardData);
    
    container.innerHTML = '';
  
    generateCards(cardsData);
    initPagination(cardsData.length);
    initQuickViewWindow();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    container.innerHTML = '<p class="error">Ошибка загрузки товаров. Пожалуйста, попробуйте позже.</p>';
    displayCategoryName();
  }
}
    
   




//Создание карточки
function generateCards(cardsData) {
  const fragment = document.createDocumentFragment();
  
  cardsData.forEach(cardData => {
    const card = createCardElement(cardData);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
function createCardElement(cardData) {
  const title = createElement('p', {
    classes: ['product-title'],
    attributes: {textContent: cardData.title}
  });
  const card = createElement('div', {
    classes: ['product-card'],
    children: [
      // Сначала добавляем изображение
      createFigureElement(cardData),
      // Затем блок с названием
      createElement('div', { classes: ['product-title'], children: [title] }),
      createPriceElement(cardData),
      createButtonElements(cardData),
      createDetailsLink(cardData.detailsUrl)
    ]
  });
  addCardEventListeners(card, cardData);
  return card;
}
function createFigureElement(cardData) {
  const img = createElement('img', {
    attributes: {
      src: cardData.image,
      alt: `Изображение товара: ${cardData.title}`
    }
  });
  const figureChildren = [img];
  if (cardData.discount > 0) {
    figureChildren.push(
      createElement('div', {
        classes: ['discount'],
        attributes: {textContent: `Скидка: ${cardData.discount}%`}
      })
    );
  }
  figureChildren.push(
    createElement('button', {
      classes: ['quick-view-button'],
      attributes: {
        type: 'button',
        textContent: 'Быстрый просмотр'
      }
    })
  );
  return createElement('figure', {children: figureChildren});
}
function createPriceElement(cardData) {
  const priceText = createElement('div', {
    classes: ['prider'],
    attributes: {textContent: 'Цена за штуку'}
  });
  const priceValue = createElement('span', {
    attributes: {textContent: `${cardData.price} ₽`}
  });
  const money = createElement('p', {classes: ['money'], children: [priceValue]});
  if (cardData.delprice) {
    money.appendChild(
      createElement('del', {
        attributes: {textContent: `${cardData.delprice} ₽`}
      })
    );
  }
  return createElement('figcaption', {
    children: [priceText, money]
  });
}
function createButtonElements(cardData) {
  const numberInput = createElement('input', {
    classes: ['js-number'],
    attributes: {
      type: 'text',
      value: '1',
      readonly: true
    }
  });
 // В функции createButtonElements
const cartBtn = createElement('button', {
  classes: ['btn'],
  attributes: {
    type: 'button',
    'data-id': cardData.id,
    'data-title': cardData.title,
    'data-price': cardData.price,
    textContent: 'В корзину'
  },
  eventListeners: {
    click: (e) => addToCart(e.target)
  }
});
  return createElement('div', {
    classes: ['Buttons'],
    children: [
      cartBtn,
      createQuantityControls(cardData.id, numberInput)
    ]
  });
}
function createQuantityControls(itemId, numberInput) {
  const subtractBtn = createElement('button', {
    classes: ['subtract'],
    attributes: {
      type: 'button',
      textContent: '–'
    },
    eventListeners: {
      click: () => updateQuantity(-1, numberInput)
    }
  });
  const addBtn = createElement('button', {
    classes: ['add'],
    attributes: {
      type: 'button',
      textContent: '+'
    },
    eventListeners: {
      click: () => updateQuantity(1, numberInput)
    }
  });
  return createElement('div', {
    classes: ['quantity-controls'],
    children: [subtractBtn, numberInput, addBtn]
  });
}
function updateQuantity(delta, input) {
  const current = parseInt(input.value) || 0;
  const newValue = Math.max(0, current + delta);
  input.value = newValue;
}
function createDetailsLink(url) {
  return createElement('div', {
    classes: ['details-container'],
    children: [
      createElement('a', {
        classes: ['details-button'],
        attributes: {
          href: url,
          textContent: 'Подробнее'
        }
      })
    ]
  });
}
// Обработчики событий
function addCardEventListeners(card, cardData) {
  const quickViewBtn = card.querySelector('.quick-view-button');
  card.addEventListener('mouseenter', () => 
    quickViewBtn.style.display = 'block');
  card.addEventListener('mouseleave', () => 
    quickViewBtn.style.display = 'none');
  quickViewBtn.addEventListener('click', () => 
    showQuickView(cardData));
}

// Быстрый просмотр
function initQuickViewWindow() {
  if (quickViewWindow) return;
  quickViewWindow = createElement('div', {
    classes: ['quick-view-window'],
    attributes: {style: 'display: none;'}
  });
const content = createElement('div', {classes: ['window-content']});
  quickViewWindow.appendChild(content);
  document.body.appendChild(quickViewWindow);
}
function showQuickView(cardData) {
  const content = quickViewWindow.querySelector('.window-content');
  content.innerHTML = ''; 

  const closeBtn = createElement('div', {
    classes: ['close'],
    attributes: {textContent: '×'},
    eventListeners: {
      click: () => quickViewWindow.style.display = 'none'
    }
  });
  const image = createElement('img', {
    classes: ['proimage'],
    attributes: {
      src: cardData.image,
      alt: cardData.title
    }
  });
  const description = createElement('p', {
    classes: ['prodescription'],
    attributes: {textContent: cardData.description}
  });
  
  const detailsLink = createElement('a', {
    attributes: {href: cardData.detailsUrl},
    children: [
      createElement('button', {
        classes: ['procardbutton'],
        attributes: {textContent: 'Больше информации о товаре'}
      })
    ]
  });
  content.appendChild(
    createElement('div', {
      classes: ['cartpodrobno'],
      children: [
        closeBtn,
        createElement('div', {
          classes: ['procard'],
          children: [
            image,
            createElement('div', {
              classes: ['tpd'],
              children: [
                createElement('h2', {
                  classes: ['protitle'],
                  attributes: {textContent: cardData.title}
                }),
                description,
                createElement('p', {
                  classes: ['proprice'],
                  attributes: {textContent: `${cardData.price} ₽`}
                }),
                
                
                detailsLink
              ].filter(Boolean) 
            })
          ]
        })
      ]
    })
  );

  initImageZoom(image);
  quickViewWindow.style.display = 'flex';
}

function initImageZoom(imageElement) {
  let zoomed = false;
  const zoomLevel = 2;

  imageElement.style.cursor = 'zoom-in';
  imageElement.style.transition = 'transform 0.3s';

  const zoomHandler = (e) => {
    zoomed = !zoomed;
    imageElement.style.transform = zoomed ? `scale(${zoomLevel})` : 'scale(1)';
    imageElement.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
  };

  const moveHandler = (e) => {
    if (!zoomed) return;
    
    const rect = imageElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    imageElement.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  };
  imageElement.replaceWith(imageElement.cloneNode(true));
  const newImage = quickViewWindow.querySelector('.proimage');
  
  newImage.addEventListener('click', zoomHandler);
  newImage.addEventListener('mousemove', moveHandler);
}




// Пагинация
function initPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / CARDS_PER_PAGE);
  const cards = container.querySelectorAll('.product-card');

  const updateVisibility = () => {
    cards.forEach((card, index) => {
      card.style.display = (index >= currentPage * CARDS_PER_PAGE && 
                          index < (currentPage + 1) * CARDS_PER_PAGE) ? 
                          'block' : 'none';
    });
  };

  const handlePagination = (direction) => {
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage < totalPages) {
      currentPage = newPage;
      updateVisibility();
    }
  };

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  prevBtn.replaceWith(prevBtn.cloneNode(true));
  nextBtn.replaceWith(nextBtn.cloneNode(true));

  document.getElementById('prevBtn').addEventListener('click', () => handlePagination(-1));
  document.getElementById('nextBtn').addEventListener('click', () => handlePagination(1));
  
  updateVisibility();
}


document.addEventListener('DOMContentLoaded', loadGoods);