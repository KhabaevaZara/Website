from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import *
from .permissions import UserAdminPermission
from .serializers import *
from .utils import GoodFilter


class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer


class CategoryListView(ListAPIView):
    queryset = Category.objects.filter(main_category=True).prefetch_related('nested_categories')
    serializer_class = CategorySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({'categories': serializer.data}, status=status.HTTP_200_OK)


class CategoryDetailListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryDetailSerializer

    def get_queryset(self):
        if self.kwargs['id'] == 0:
            return self.queryset.filter(main_category=True)
        category = Category.objects.filter(id=self.kwargs['id']).first()
        return category.nested_categories.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({'categories': serializer.data}, status=status.HTTP_200_OK)


class DiscountedGoodListView(ListAPIView):
    queryset = Good.objects.filter(discount__gt=0)
    serializer_class = GoodCardSerializer

class GoodListView(ListAPIView):
    queryset = Good.objects.all()
    serializer_class = GoodCardSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = GoodFilter



class CartListView(ListAPIView):
    queryset = Cart.objects.all().select_related('user', 'good')
    serializer_class = CartSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class GoodRetrieveView(RetrieveAPIView):
    queryset = Good.objects.all()
    serializer_class = GoodSerializer
    lookup_field = 'id'


class CartCreateView(CreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CreateCartSerializer
    permission_classes = (IsAuthenticated,)


class CartRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = UpdateDeleteCartSerializer
    permission_classes =  (IsAuthenticated, UserAdminPermission)
    lookup_field = 'id'

class ReviewListView(ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return self.queryset.filter(good=self.kwargs['good_id'])


class ReviewCreateView(CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticated,)


class ReviewRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticated, UserAdminPermission)
    lookup_field = 'id'


class OrderCreateView(CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = CreateOrderSerializer

class UserRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = None

    def get_object(self):

        return self.request.user

class OrderListView(ListAPIView):
    queryset = Order.objects.all()
    serializer_class = CreateOrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class OrderRetrieveView(RetrieveAPIView):
    queryset = Order.objects.all().prefetch_related(
        Prefetch('order_points', queryset=OrderPoint.objects.all())
    )
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated, UserAdminPermission)
    lookup_field = 'id'


class MessageCreateView(CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = CreateMessageSerializer
    permission_classes = (IsAuthenticated,)


class MessageListView(ListAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(client=self.request.user)

