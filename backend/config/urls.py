from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse
from django.core.management import call_command

def seed_db(request):
    try:
        import os
        from django.conf import settings
        file_path = os.path.join(settings.BASE_DIR, 'datadump.json')
        call_command('loaddata', file_path)
        return HttpResponse("<h1>SUCCESS! All 145 local database objects have been successfully injected into Supabase!</h1>")
    except Exception as e:
        return HttpResponse(f"<h1>Error:</h1><p>{str(e)}</p>")

def api_root(request):
    return JsonResponse({"message": "Welcome to the Indian Local Store API! The server is running perfectly.", "status": "online"})
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
