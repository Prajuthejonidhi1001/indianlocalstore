from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import JsonResponse
from django.views.static import serve


def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Indian Local Store API! The server is running perfectly.",
        "status": "online",
    })


urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/products/', include('products.urls')),
    path('api/shops/', include('shops.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/users/', include('users.urls')),

    # Category and subcategory images are committed under backend/media/ and
    # served from here. Django's static serve view is not built for high
    # traffic -- if image load becomes a bottleneck, move these to Cloudinary
    # (already wired up in settings.STORAGES, just needs CLOUDINARY_CLOUD_NAME)
    # and this route can go away.
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
