const subcategoryContainer = document.getElementById("subcategoryContainer");

// Функция для получения параметров URL (остаётся без изменений)
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Модифицированная функция создания элементов подкатегории
function createSubcategoryElement(subcategory) {
    const subcategoryDiv = document.createElement("div");
    subcategoryDiv.className = "subcategory";
    
    const innerDiv = document.createElement("div");
    innerDiv.className = "bosubcategory";

    const link = document.createElement("a");
    // Изменяем параметр в URL на subcategoryId
    link.href = `products.html?subcategoryId=${subcategory.id}`;
    
    const image = document.createElement("img");
    image.src = subcategory.image || 'https://via.placeholder.com/100';
    image.alt = subcategory.name;
    image.className = "imges";

    link.appendChild(image);
    innerDiv.appendChild(link);

    const paragraph = document.createElement("p");
    paragraph.className = "categorytitle";
    paragraph.textContent = subcategory.name;
    innerDiv.appendChild(paragraph);
    subcategoryDiv.appendChild(innerDiv);

    return subcategoryDiv;
}

// Основная логика остаётся без изменений
const categoryId = getParameterByName('categoryId');

if (categoryId) {
    const apiUrl = 'http://127.0.0.1:8000/api-core/api-category/';
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            subcategoryContainer.innerHTML = '';
            
            const selectedCategory = data.categories.find(category => category.id == categoryId);
            
            if (selectedCategory) {
                const categoryTitle = document.createElement('h1');
                categoryTitle.className = 'categoryt';
                categoryTitle.textContent = selectedCategory.name;
                subcategoryContainer.appendChild(categoryTitle);
        
                const subcategories = selectedCategory.nested_categories;
                
                const subcategoriesWrapper = document.createElement('div');
                subcategoriesWrapper.className = 'subcategories-wrapper';
                
                if (Array.isArray(subcategories)) {
                    subcategories.forEach(subcategory => {
                        const subcategoryElement = createSubcategoryElement(subcategory);
                        subcategoriesWrapper.appendChild(subcategoryElement);
                    });
                    subcategoryContainer.appendChild(subcategoriesWrapper);
                } else {
                    subcategoryContainer.innerHTML = '<p>Подкатегории отсутствуют.</p>';
                }
            } else {
                subcategoryContainer.innerHTML = '<p>Категория не найдена.</p>';
            }
        })
        .catch(error => {
            subcategoryContainer.innerHTML = `<p>Ошибка загрузки данных. (${error.message})</p>`;
        });
} else {
    subcategoryContainer.innerHTML = '<p>Категория не выбрана.</p>';
}