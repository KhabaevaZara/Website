from django_filters import rest_framework as filters

from .models import Good


class CharFilterInFilter(filters.BaseInFilter, filters.CharFilter):
    pass


class GoodFilter(filters.FilterSet):
    name = filters.CharFilter(method='filter_name')
    class Meta:
        model = Good
        fields =('name',)

    def filter_name(self, queryset, name, value):
        return queryset.filter(name__icontains=value)