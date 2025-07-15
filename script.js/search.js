 // Пример базы данных товаров (потом  это будет AJAX запрос к серверу)
 const productsDatabase = [

    "Обои",
    "Ванны",
    "Текстиль",
    "Сантехника",


];

const searchInput = document.getElementById('productSearch');
const suggestionsContainer = document.getElementById('searchSuggestions');
const errorContainer = document.getElementById('searchError');

searchInput.addEventListener('input', function() {
    const inputValue = this.value.trim();
    
    // Очищаем предыдущие подсказки и ошибки
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    searchInput.classList.remove('error', 'success');
    
    if (inputValue.length < 3) {
        return;
    }
    
    // Конвертируем возможную транслитерацию (английские буквы для русских слов)
    const normalizedInput = transliterate(inputValue.toLowerCase());
    
    // Ищем совпадения в базе данных
    const matchedProducts = productsDatabase.filter(product => {
        const normalizedProduct = transliterate(product.toLowerCase());
        return normalizedProduct.includes(normalizedInput) || 
               product.toLowerCase().includes(inputValue.toLowerCase());
    });
    
    if (matchedProducts.length > 0) {
        // Показываем подсказки
        matchedProducts.forEach(product => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = product;
            suggestionItem.addEventListener('click', function() {
                searchInput.value = product;
                suggestionsContainer.style.display = 'none';
                searchInput.classList.add('success');
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
        
        suggestionsContainer.style.display = 'block';
        searchInput.classList.add('success');
    } else {
        // Если нет точных совпадений, ищем похожие товары
        const similarProducts = findSimilarProducts(inputValue);
        
        if (similarProducts.length > 0) {
            errorContainer.innerHTML = `Может быть, вы имели в виду: <strong>${similarProducts[0]}</strong>`;
            errorContainer.style.display = 'block';
        } else {
            errorContainer.textContent = 'Товар не найден';
            errorContainer.style.display = 'block';
        }
        
        searchInput.classList.add('error');
    }
});

// Функция для поиска похожих товаров (по алгоритму Левенштейна )
function findSimilarProducts(input) {
const normalizedInput = transliterate(input.toLowerCase());

return productsDatabase
    .map(product => ({
        name: product,
        similarity: calculateSimilarity(normalizedInput, transliterate(product.toLowerCase()))
    }))
    .filter(item => item.similarity > 0.5) // Порог схожести (можно  настроить, если надо будет )
    .sort((a, b) => b.similarity - a.similarity)
    .map(item => item.name);
}
function transliterate(str) {
const charMap = {
    // Русский → латиница (основные варианты)
    'а': 'a', 'б': 'b', 'в': 'v|w', 'г': 'g', 'д': 'd', 
    'е': 'e|ye|je', 'ё': 'e|yo|jo', 'ж': 'zh|j', 'з': 'z', 
    'и': 'i', 'й': 'y|j|i', 'к': 'k|c', 'л': 'l', 'м': 'm', 
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 
    'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh|h|x', 'ц': 'ts|c', 
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch|shch', 'ъ': '', 'ы': 'y|i', 
    'ь': '', 'э': 'e', 'ю': 'yu|ju', 'я': 'ya|ja',
    
    // Обратная транслитерация (латиница → русский) и распространённые ошибки
    'a': 'а', 'b': 'б', 'c': 'к|ц', 'd': 'д', 'e': 'е|э', 
    'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и', 'j': 'ж|й', 
    'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 
    'p': 'п', 'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 
    'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс|х', 'y': 'й|ы', 
    'z': 'з'
};

// Специальные случаи (сочетания букв)
const multiCharMap = {
    'zh': 'ж', 'yo': 'ё', 'jo': 'ё', 'ye': 'е', 'je': 'е',
    'kh': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'sch': 'щ',
    'yu': 'ю', 'ju': 'ю', 'ya': 'я', 'ja': 'я'
};

let result = str.toLowerCase();

// Сначала обрабатываем многобуквенные сочетания
for (const [lat, cyr] of Object.entries(multiCharMap)) {
    result = result.replace(new RegExp(lat, 'g'), cyr);
}

// Затем одиночные символы
result = result.split('').map(char => {
    for (const [cyr, latVariants] of Object.entries(charMap)) {
        const variants = latVariants.split('|');
        if (variants.includes(char)) {
            return cyr;
        }
    }
    return char;
}).join('');

return result;
}

// Функция для расчета схожести строк (упрощенный алгоритм)
// Функция для расчета расстояния Левенштейна
function levenshteinDistance(str1, str2) {
const m = str1.length;
const n = str2.length;
const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

for (let i = 0; i <= m; i++) dp[i][0] = i;
for (let j = 0; j <= n; j++) dp[0][j] = j;

for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // Удаление
            dp[i][j - 1] + 1,     // Вставка
            dp[i - 1][j - 1] + cost  // Замена
        );
    }
}

return dp[m][n];
}

// Функция для нормализованной схожести (0–1)
function calculateSimilarity(str1, str2) {
const maxLen = Math.max(str1.length, str2.length);
if (maxLen === 0) return 1; // Если обе строки пустые

const distance = levenshteinDistance(str1, str2);
return 1 - distance / maxLen;
}

// Скрываем подсказки при клике вне поля поиска
document.addEventListener('click', function(e) {
    if (e.target !== searchInput) {
        suggestionsContainer.style.display = 'none';
    }
});