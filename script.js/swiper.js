document.addEventListener('DOMContentLoaded', async () => {
    const wrapper = document.getElementById('swiper-wrapper');
    let quickViewWindow = null;

    // Функция создания элементов (без изменений)
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

    // Функция преобразования данных API (без изменений)
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

    // Создание карточки товара
    function createCardElement(cardData) {
        const card = createElement('div', {
            classes: ['swiper-slide', 'product-card'],
            children: [
                createFigureElement(cardData),
                createElement('h3', {
                    classes: ['product-title'],
                    attributes: { textContent: cardData.title }
                }),
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
                  cardData.delprice && createElement('p', {
                    classes: ['delprice'],
                    attributes: {textContent: `${cardData.delprice} ₽`}
                  }),
                  
                  createElement('button', {
                    classes: ['probutton'],
                    attributes: {textContent: 'В корзину'}
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
  



  
  try {
    const response = await fetch('http://127.0.0.1:8000/api-core/api-discounted-good/');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error('Invalid data format: expected array');
    if (data.length === 0) {
        wrapper.innerHTML = '<div class="empty">Нет товаров по акции</div>';
        return;
    }

    // Очищаем обертку перед добавлением новых карточек
    wrapper.innerHTML = '';

    // Создаем и добавляем карточки
    data.forEach(good => {
        const cardData = createCardData(good);
        const cardElement = createCardElement(cardData);
        wrapper.appendChild(cardElement);
    });

    // Инициализируем Swiper
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
            nextEl: '.next',
            prevEl: '.prev',
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        },
        loop: data.length >= 3
    });

} catch (error) {
    console.error('Error:', error);
    wrapper.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
}
});