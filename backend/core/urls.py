from django.urls import path

from .admin import OrderAdmin
from .views import *



urlpatterns = [
    # Категории
    path('api-category/', CategoryListView.as_view(), name='api-category'),
    # Категории 2
    path('api-category-detail/<int:id>/', CategoryDetailListView.as_view(), name='api-category-detail'),
    # Регистрация
    path('api-register/', UserCreateView.as_view(), name='api-register'),
    # Продукты со скидкой
    path('api-discounted-good/', DiscountedGoodListView.as_view(), name='api-discounted-good'),
    # Продукты
    path('api-good/', GoodListView.as_view(), name='api-good'),
    # О продукте
    path('api-good-detail/<int:id>/', GoodRetrieveView.as_view(), name='api-good-detail'),
    # Комментарии продукте
    path('api-review/<int:good_id>/', ReviewListView.as_view(), name='api-good-detail'),
    # Создание комментария
    path('api-create-review/', ReviewCreateView.as_view(), name='api-create-review'),
    # Редактирование и удаление комментария
    path('api-review-detail/<int:id>/', ReviewRetrieveUpdateDestroyView.as_view(), name='api-create-review'),
    # Корзина
    path('api-cart/', CartListView.as_view(), name='api-cart'),
    # Добавление продукта в корзину
    path('api-add-good/', CartCreateView.as_view(), name='api-add-good'),
    # Редактирование корзины
    path('api-cart-detail/<int:id>/', CartRetrieveUpdateDestroyView.as_view(), name='api-cart-detail'),
    #Создание заказа
    path('api-create-order/', OrderCreateView.as_view(), name='api-create-order'),
    #Профиль пользователя
    path('api-profile/', UserRetrieveUpdateDestroyView.as_view(), name='api-profile'),
    #Список заказов
    path('api-order-list/', OrderListView.as_view(), name='api-order-list'),
    #Информация о заказе
    path('api-order-detail/<int:id>/', OrderRetrieveView.as_view(), name='api-order-detail'),
    #Создание сообщения
    path('create-message/', MessageCreateView.as_view(), name='create-message'),
    #Список сообщений
    path('message-list/', MessageListView.as_view(), name='message-list')

]
