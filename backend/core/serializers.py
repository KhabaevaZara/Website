from rest_framework import serializers
from .models import *



class CreateUserSerializer(serializers.ModelSerializer):
    repeat_password = serializers.CharField(max_length=100, write_only=True, )

    class Meta:
        model = User
        fields = ('id',  'username', 'first_name', 'last_name', 'email', 'password', 'repeat_password' )
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        password, repeat_password = attrs.get('password', None), attrs.pop('repeat_password', None)

        if password is None or repeat_password is None:
            raise serializers.ValidationError("Вы забыли заполнить пароль")
        if password != repeat_password:
            raise serializers.ValidationError("Пароль не совпадает")

        return attrs

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'personal_discount', 'image')
        extra_kwargs = {'personal_discount': {'read_only': True}}


class NestedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'image')


class CategorySerializer(serializers.ModelSerializer):
    nested_categories = NestedCategorySerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ('id', 'name', 'image', 'main_category', 'nested_categories')

class CategoryDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'image', )


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'image')

class GoodCardSerializer(serializers.ModelSerializer):
    get_first_img = ImageSerializer(read_only=True)
    class Meta:
        model = Good
        fields = ('id', 'name','get_first_img', 'category', 'start_price', 'discount', 'price', 'description')

class GoodSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Good
        fields = ('id', 'name','images', 'start_price', 'discount', 'price', 'description')

class GoodCartSerializer(serializers.ModelSerializer):
    get_first_img = ImageSerializer(read_only=True)

    class Meta:
        model = Good
        fields = ('id', 'name', 'get_first_img', 'price',)


class CartSerializer(serializers.ModelSerializer):
    good = GoodCartSerializer(read_only=True)
    class Meta:
        model = Cart
        fields = ('id', 'good', 'quantity', 'price')


class CreateCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ('id', 'good', 'quantity',)

    def create(self, validated_data):
        return Cart.objects.create(**validated_data, user=self.context['request'].user)


class UpdateDeleteCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ('id', 'quantity',)

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'user', 'rating', 'good', 'text', 'created')
        extra_kwargs = {'user': {'read_only': True}}

    def validate(self, attrs):
        rating = attrs.get('rating', 5)
        if 0 <= rating <= 5:
            return attrs
        raise serializers.ValidationError("rating validate error")

    def create(self, validated_data):
        return Review.objects.create(**validated_data, user=self.context['request'].user)


    def update(self, instance, validated_data):
        instance.rating = validated_data.get("rating", instance.rating)


class OrderPointSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderPoint
        fields = ('id', 'good', 'quantity', 'price')
        extra_kwargs = {'price': {'read_only': True}}

class CreateOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = ('id',  'price', 'status', 'created')
        extra_kwargs = {'price': {'read_only': True},
                        'status': {'read_only': True},
                        }

    def validate(self, attrs):
        user = self.context['request'].user
        user_carts = Cart.objects.filter(user=user)

        if len(user_carts) == 0:
            raise serializers.ValidationError("cart is empty ")
        return attrs



    def create(self, validated_data):
        user = self.context['request'].user
        user_carts =  Cart.objects.filter(user=user)
        order = Order.objects.create(user=user)
        for cart in user_carts:
            order.order_points.add(OrderPoint.objects.create(good=cart.good, quantity=cart.quantity))
            cart.delete()
        order.save()
        try:
            order.price = int(order.price - (order.price * (self.context['request'].user.personal_discount) / 100))
            order.save()
        except:
            pass
        return order


class OrderSerializer(serializers.ModelSerializer):
    order_points = OrderPointSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'price', 'order_points', 'status', 'created')
        extra_kwargs = {'price': {'read_only': True},
                        'status': {'read_only': True},
                        'order_points': {'read_only': True},
                        }


class CreateMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ('id', 'question')

    def create(self, validated_data):
        return Message.objects.create(question=validated_data.get('question'), client=self.context['request'].user)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'question', 'created', 'answer')