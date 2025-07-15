from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import *
# Register your models here.


class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name',  'email', )
    search_fields = ('username', 'email')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


class ImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_image')

    def get_image(self, obj):
        return mark_safe(f'<img src={obj.image.url} width="60" height="60"')

    get_image.short_description = "Изображение"

class GoodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category',  'start_price', 'discount', 'price', 'description')
    list_display_links = ('id', 'name',)
    search_fields = ('name', 'description')
    list_filter = ('category', 'discount')

class ReViewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user',  'rating', 'good', 'text', 'created')


class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'good', 'user', 'quantity', 'price')
    list_display_links = ('id', 'quantity', )
    list_filter = ('quantity', )
    search_fields = ('good__name', 'user__username')

class OrderPointAdmin(admin.ModelAdmin):
    list_display = ('id', 'good', 'quantity', 'price')
    list_display_links = ('id', 'quantity', )
    list_filter = ('quantity', )
    search_fields = ('good__name',)


class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user',  'get_order_points',  'status', 'price', 'created' )
    list_display_links = ('id', )
    search_fields = ('id', 'user__username', 'user__phone', )
    list_filter = ( 'status', 'created')


    @admin.display(description='Пункты заказа')
    def get_order_points(self, obj):
        return [order_point.good.name for order_point in obj.order_points.all()]


class AboutUSAdmin(admin.ModelAdmin):
    list_display = ('id', 'content')

class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'created', 'question', 'answer')
    list_filter = ('created', )

admin.site.register(Category, CategoryAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Image, ImageAdmin)
admin.site.register(Good, GoodAdmin)
admin.site.register(Review, ReViewAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(OrderPoint, OrderPointAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(AboutUS, AboutUSAdmin)
admin.site.register(Message, MessageAdmin)
