from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from . import views

app_name = "taskhero"

urlpatterns = [
    path('', views.landing_page_view, name='index'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', views.register_view, name='register'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('task/new/', views.task_create_view, name='task_create'),
    path('task/<int:task_id>/', views.task_detail_view, name='task_detail'),
    path('task/<int:task_id>/edit/', views.task_edit_view, name='task_edit'),
    path('task/<int:task_id>/delete/', views.task_delete_view, name='task_delete'),
    path('task/<int:task_id>/complete/', views.task_complete_view, name='task_complete'),
]
