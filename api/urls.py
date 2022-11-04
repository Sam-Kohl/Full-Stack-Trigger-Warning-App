from django.urls import path
from . import views

urlpatterns = [
	path('', views.apiOverview, name="api-overview"),
	path('word-list/', views.wordList, name="word-list"),
	path('word-detail/<str:pk>/', views.wordDetail, name="word-detail"),
	path('word-create/', views.wordCreate, name="word-create"),

	path('word-update/<str:pk>/', views.wordUpdate, name="word-update"),
	path('word-delete/<str:pk>/', views.wordDelete, name="word-delete"),
]
