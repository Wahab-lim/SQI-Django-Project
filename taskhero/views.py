from django.shortcuts import render,get_object_or_404, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import Http404, HttpResponseForbidden
from django.utils import timezone
from .models import Task
from .forms import TaskForm, UserRegistrationForm

# Create your views here.
def landing_page_view(request):
    return render(request, 'taskhero/index.html', {})

def register_view(request):
    if request.user.is_authenticated:
        return redirect('taskhero:dashboard')
    
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful! Welcome to TaskHero.')
            return redirect('taskhero:dashboard')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'registration/register.html', {'form': form})


@login_required
def dashboard_view(request):
    user_tasks = Task.objects.filter(owner=request.user)
    todo_tasks = user_tasks.filter(status='todo')
    in_progress_tasks = user_tasks.filter(status='in_progress')
    completed_tasks = user_tasks.filter(status='completed')
    
    context = {
        'todo_tasks': todo_tasks,
        'in_progress_tasks': in_progress_tasks,
        'completed_tasks': completed_tasks,
    }
    
    return render(request, 'taskhero/dashboard.html', context)


@login_required
def task_detail_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    if task.owner != request.user:
        return HttpResponseForbidden("You don't have permission to view this task.")
    
    return render(request, 'taskhero/task_detail.html', {'task': task})


@login_required
def task_create_view(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.owner = request.user
            task.save()
            messages.success(request, 'Task created successfully!')
            return redirect('taskhero:dashboard')
    else:
        form = TaskForm()
    
    return render(request, 'taskhero/task_form.html', {
        'form': form,
        'title': 'Create New Task'
    })


@login_required
def task_edit_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
 
    if task.owner != request.user:
        return HttpResponseForbidden("You don't have permission to edit this task.")
    
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, 'Task updated successfully!')
            return redirect('taskhero:task_detail', task_id=task.id)
    else:
        form = TaskForm(instance=task)
    
    return render(request, 'taskhero/task_form.html', {
        'form': form,
        'task': task,
        'title': 'Edit Task'
    })


@login_required
def task_delete_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    if task.owner != request.user:
        return HttpResponseForbidden("You don't have permission to delete this task.")
    
    if request.method == 'POST':
        task.delete()
        messages.success(request, 'Task deleted successfully!')
        return redirect('taskhero:dashboard')
    
    return render(request, 'taskhero/task_delete.html', {'task': task})


@login_required
def task_complete_view(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    if task.owner != request.user:
        return HttpResponseForbidden("You don't have permission to modify this task.")
    
    if request.method == 'POST':
        task.status = 'completed'
        task.save()
        messages.success(request, 'Task marked as completed!')
        return redirect('taskhero:task_detail', task_id=task.id)
    
    return redirect('taskhero:task_detail', task_id=task.id)
