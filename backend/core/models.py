from django.contrib.auth.hashers import make_password
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from sortedm2m.fields import SortedManyToManyField


class User(AbstractUser):
    salary = models.PositiveIntegerField(default=0, verbose_name='Заработная плата')
    personal_discount = models.PositiveIntegerField(default=0, verbose_name='Персональная скидка')
    image = models.ImageField(verbose_name='Картинка',  upload_to='profile/%Y/%m/%d/', blank=True, null=True)


    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.username}"


    def save(self, *args, **kwargs):

        if self.password and not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2')):
            self.password = make_password(self.password)

        super().save(*args, **kwargs)


class Category(models.Model):
    name = models.CharField(max_length=250, verbose_name='Категория', unique=True)
    description = models.TextField(verbose_name='Описание', blank=True, null=True)
    image = models.ImageField(verbose_name='Картинка', upload_to='images/%Y/%m/%d/', blank=True, null=True)
    main_category = models.BooleanField(default=False, verbose_name='Основная категория')
    nested_categories = SortedManyToManyField('Category', blank=True, verbose_name='Дочерние категории')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'


    def __str__(self):
        return f"{self.name}"


class Image(models.Model):
    image = models.ImageField(verbose_name='Картинка', upload_to='images/%Y/%m/%d/')

    class Meta:
        verbose_name = 'Картинка'
        verbose_name_plural = 'Картинки'


class Good(models.Model):
    name = models.CharField(verbose_name='Название', max_length=150, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, verbose_name='Категория', null=True, blank=True)
    images = SortedManyToManyField(Image, verbose_name='Картинки', blank=True)
    start_price = models.PositiveIntegerField(verbose_name='Начальная цена')
    discount = models.PositiveIntegerField(verbose_name='Скидка',  default=0)
    price = models.PositiveIntegerField(verbose_name='Цена', blank=True, null=True)
    description = models.TextField(verbose_name='Описание', blank=True, null=True)

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.price = int(self.start_price - (self.start_price * (self.discount / 100)))
        super(Good, self).save(*args, **kwargs)

    def get_first_img(self):
        return self.images.all().first()


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    rating = models.PositiveIntegerField(verbose_name='Рейтинг')
    good = models.ForeignKey(Good, on_delete=models.CASCADE, verbose_name='Продукт', blank=True, null=True)
    text = models.TextField(verbose_name='Сообщение', blank=True, null=True)
    created = models.DateTimeField(verbose_name='Дата и время создания', auto_now_add=True,)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ('-created',)


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    good = models.ForeignKey(Good, on_delete=models.CASCADE, verbose_name='Продукт', blank=True, null=True)
    quantity = models.PositiveIntegerField(verbose_name='Количество', default=1)
    price = models.PositiveIntegerField(verbose_name='Цена', blank=True, null=True)

    class Meta:
        verbose_name = 'Корзина'
        verbose_name_plural = 'Корзины'


    def __str__(self):
        return f'{self.good} x {self.quantity}'


    def save(self, *args, **kwargs):
        self.price = self.good.price * self.quantity
        super(Cart, self).save(*args, **kwargs)




class OrderPoint(models.Model):
    good = models.ForeignKey(Good, on_delete=models.CASCADE, verbose_name='Продукт', blank=True, null=True)
    quantity = models.PositiveIntegerField(verbose_name='Количество', default=1)
    price = models.PositiveIntegerField(verbose_name='Цена', blank=True, null=True)

    class Meta:
        verbose_name = "Пункт заказа"
        verbose_name_plural = "Пункты заказов"

    def save(self, *args, **kwargs):
        self.price = self.good.price * self.quantity
        super(OrderPoint, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.good} x {self.quantity}'



class Order(models.Model):
    status_field = (
        ("Не оплачено", "Не оплачено"),
        ("Оплачено", "Оплачено"),

    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, verbose_name='Пользователь', null=True, blank=True)
    order_points = SortedManyToManyField(OrderPoint, verbose_name="Пункт заказа")
    price = models.PositiveIntegerField(blank=True, null=True, verbose_name='Цена заказа', )
    status = models.CharField(max_length=50, verbose_name='Статус', default='Не оплачено', choices=status_field)
    created = models.DateTimeField(verbose_name='Дата и время создания', auto_now_add=True, )

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f'Заказ {self.pk}'


class AboutUS(models.Model):
    content = models.TextField(verbose_name="Контент", blank=True, null=True)

    class Meta:
        verbose_name = 'О компании'
        verbose_name_plural = 'О компании'

    def __str__(self):
        return self.content


class Message(models.Model):
    client  = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Клиент", blank=True, null=True, related_name="client")
    created = models.DateTimeField(verbose_name='Дата и время создания', auto_now_add=True, )
    question = models.TextField(verbose_name='Вопрос', blank=True, null=True)
    answer = models.TextField(verbose_name='Ответ', blank=True, null=True)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"Сообщения {self.pk}"




@receiver(m2m_changed, sender=Order.order_points.through)
def block_m2m_changed_handler(sender, instance, action, *args, **kwargs):

    price = 0
    for point in instance.order_points.all():

        price += point.price
    instance.price = price
    instance.save()


@receiver(post_save, sender=Order)
def update_personal_discount(sender,  instance, **kwargs):
    user_id = instance.user.id
    orders_price = 0

    user_data = User.objects.filter(id=user_id).first()

    orders = Order.objects.filter(user = user_id)

    for order in orders:
        try:
            orders_price += order.price
        except:
            pass

    if 20000 >= orders_price:
        user_data.personal_discount = 0
    elif 20000 < orders_price <= 50000:
        user_data.personal_discount = 1

    elif  50000  < orders_price <= 100000:
        user_data.personal_discount = 2

    elif 100000 < orders_price <= 200000:
        user_data.personal_discount = 3

    else:
        user_data.personal_discount = 5

    user_data.save()
    return None
