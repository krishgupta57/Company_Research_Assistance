from django.urls import path
from . import views

urlpatterns = [
    path('research/', views.research, name='research'),
    path('discord/', views.send_to_discord, name='discord'),
]
