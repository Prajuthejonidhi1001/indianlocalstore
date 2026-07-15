from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Admin configuration for the User model.
    Architectural Note: The User model uses a custom AbstractUser.
    Roles ('customer', 'seller', 'admin') dictate permissions throughout the application.
    """
    list_display = ['username', 'email', 'phone', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'phone']
    list_editable = ['role', 'is_active']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Account Info', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Details', {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        ('Permissions & Roles', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    readonly_fields = ['last_login', 'date_joined']
