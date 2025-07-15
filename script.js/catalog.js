const catalog = document.getElementById('catalog');
const menuBurger = document.getElementById('menuBurger');
const popup = document.getElementById('popup');

menuBurger.onclick = function(event) {
    event.stopPropagation(); 
    catalog.style.display = catalog.style.display === 'none' ? 'block' : 'none';
};
let isPopupOpen = false;
document.querySelectorAll('.category-button').forEach(button => {
    button.addEventListener('mouseenter', function(event) {
        event.stopPropagation(); 
        const categoryNum = this.getAttribute('data-category');
        let content = '';

        switch (categoryNum) {
            case '1':
            content = 
            '<a  href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Бумажные обои</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Виниловые обои</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Флизелиновые обои</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Текстильные обои</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Метализированные обои</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Жидкие обои</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Фотообои</button></a>';
            break;
        case '2':
            content = 
                '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Ванны и комплектующие</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Раковины</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Смесители</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')"> Душевые кабины и поддоны</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Сантехника для отопления</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Унитазы</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Аксессуары и дополнительные элементы</button></a>';
                '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Ванны и комплектующие</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Раковины</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Смесители</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')"> Душевые кабины и поддоны</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Сантехника для отопления</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Унитазы</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Аксессуары и дополнительные элементы</button></a>';
            break; 
        case '3':
            content = 
          
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Деревянные покрытия</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Плитка</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Камень</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Покрытия из ПВХ</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Ковровые покрытия</button></a>';

            break;

            case '4':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Столы</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Диваны</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Кресла</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Стулья</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Шкафы</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Кровати</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Пуфы</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Кушетки</button></a>';
            break;

            case '5':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Кухонная посуда</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Столовая посуда</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Питьевая посуда</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Столовые приборы</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Посуда для храниения</button></a>';
            break;
            case '6':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Шторы</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Домашний текстиль</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Постельное белье </button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Ткани</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Постельные принадлежности</button></a>' ;
            break;
            case '7':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Бытовая техника для кухни</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Мелкая бытовая техника для кухни</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Бытовая техника для</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Техника для дома</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Техника для красты</button></a>' ;
            break;
            case '8':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Декро для стен </button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Декро для потолка и лепнина</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Часы</button></a>' +
                '<a href="wallpaper4.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.4\')">Лампы</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Люстры</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Корнизы для штор</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Вазы</button></a>';
            break;
            case '9':
            content = 
            '<a href="wallpaper1.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.1\')">Электроиснтрументы</button></a>' +
                '<a href="wallpaper2.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.2\')">Отвертки</button></a>' +
                '<a href="wallpaper3.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.3\')">Клей</button></a>' +
                '<a href="wallpaper5.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.5\')">Краски</button></a>' +
                '<a href="wallpaper6.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.6\')">Розетки</button></a>' +
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Гвозди,шурупы, болты ,гайки,ключи </button></a>'+
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Шпатели</button></a>'+
                '<a href="wallpaper7.html"><button class="button-style" onclick="showPopup(\'Подкатегория 1.7\')">Концелярские ножи</button></a>';
            break;
           
        }
        document.getElementById('popupContent').innerHTML = content;
        showPopup(this.querySelector('span').textContent);  
    });
});

function showPopup(title, popupClass = '') {
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    
    // Устанавливаем заголовок
    popupTitle.textContent = title;
    
    if (popupClass) {
        popup.classList.add(popupClass);
    }
    
    popup.style.display = 'block';
    isPopupOpen = true;
    
    return {
        hide: function() {
            popup.style.display = 'none';
            isPopupOpen = false;
            if (popupClass) {
                popup.classList.remove(popupClass);
            }
        },
        isOpen: function() {
            return isPopupOpen;
        }
    };
}

function closePopup() {
    popup.style.display = 'none'; 
    isPopupOpen = false; 
}
document.addEventListener('click', function() {
    if (catalog.style.display === 'block') {
        catalog.style.display = 'none'; 
    }
    if (isPopupOpen) {
        closePopup();
    }
});