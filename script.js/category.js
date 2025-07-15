
const categoryContainer = document.getElementById("categorycontainer");

// Функция для создания HTML-элементов категории
function createCategoryElement(category) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";
    
    const innerDiv = document.createElement("div");
    innerDiv.className = "bocategory";

    const link = document.createElement("a");
    // Генерируем href на основе ID категории
    if (category.nested_categories && category.nested_categories.length > 0) {
        link.href = `subcategories.html?categoryId=${category.id}`;
    } else {
        link.href = `${category.id}.html`;
    }
    
    const image = document.createElement("img");
    image.src = category.image; 
    image.alt = category.name; 
    image.className = "imges";
    image.style = "align-items: center;";
    link.appendChild(image);
    innerDiv.appendChild(link);
    
    const paragraph = document.createElement("p");
    paragraph.textContent = category.name;
    paragraph.className = "categorytitle";
    innerDiv.appendChild(paragraph);
    categoryDiv.appendChild(innerDiv);
    
    return categoryDiv;
}

// Функция для загрузки и отображения категорий
function loadCategories(url, container) {
    container.innerHTML = '<div class="loading">Загрузка категорий...</div>';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Очистка контейнера
            container.innerHTML = '';
            
            const categories = data.categories || data;
            
            if (Array.isArray(categories)) {
                categories.forEach(category => {
                    const categoryElement = createCategoryElement(category);
                    container.appendChild(categoryElement);
                });
            } else {
                console.error('Categories data is not an array:', data);
                container.innerHTML = '<p>Ошибка формата данных. Попробуйте позже.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            container.innerHTML = '<p>Ошибка загрузки категорий. Пожалуйста, попробуйте позже.</p>';
        });
}

// Проверяем, находимся ли мы на странице подкатегорий
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get('categoryId');

if (categoryId) {
    // Если это страница подкатегорий, загружаем подкатегории для указанной категории
    loadCategories(`http://127.0.0.1:8000/api-core/api-category/${categoryId}/nested/`, categoryContainer);
} else {
    // Иначе загружаем основные категории
    loadCategories('http://127.0.0.1:8000/api-core/api-category/', categoryContainer);
}