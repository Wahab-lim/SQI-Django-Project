/**
 * TaskHero Main JavaScript File
 * Handles interactive functionality across the application
 */

// Global TaskHero object
const TaskHero = {
    init: function() {
        this.initializeTooltips();
        this.initializeConfirmDialogs();
        this.initializeFormValidation();
        this.initializeTaskCards();
        this.initializeNavigation();
        this.initializeNotifications();
    },

    // Initialize Bootstrap tooltips
    initializeTooltips: function() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
            new bootstrap.Tooltip(tooltipTriggerEl)
        );
    },

    // Initialize confirmation dialogs for destructive actions
    initializeConfirmDialogs: function() {
        // Add event listeners for delete buttons
        document.addEventListener('click', function(e) {
            if (e.target.matches('[onclick*="confirmDelete"]') || 
                e.target.closest('[onclick*="confirmDelete"]')) {
                e.preventDefault();
                
                const element = e.target.matches('[onclick*="confirmDelete"]') ? 
                    e.target : e.target.closest('[onclick*="confirmDelete"]');
                
                const onclickAttr = element.getAttribute('onclick');
                const matches = onclickAttr.match(/confirmDelete\('([^']+)',\s*'([^']+)'\)/);
                
                if (matches) {
                    const url = matches[1];
                    const taskTitle = matches[2];
                    TaskHero.showDeleteConfirmation(url, taskTitle);
                }
            }
        });
    },

    // Show delete confirmation modal
    showDeleteConfirmation: function(deleteUrl, taskTitle) {
        const confirmed = confirm(
            `Are you sure you want to delete "${taskTitle}"?\n\n` +
            "This action cannot be undone and will permanently remove the task and all its data."
        );
        
        if (confirmed) {
            window.location.href = deleteUrl;
        }
    },

    // Initialize form validation
    initializeFormValidation: function() {
        // Real-time validation for task forms
        const forms = document.querySelectorAll('.needs-validation');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    this.classList.add('was-validated');
                });
                
                input.addEventListener('input', function() {
                    if (this.classList.contains('was-validated')) {
                        this.setCustomValidity('');
                        this.checkValidity();
                    }
                });
            });

            // Custom validation for due date
            const dueDateInput = form.querySelector('input[type="datetime-local"]');
            if (dueDateInput) {
                dueDateInput.addEventListener('change', function() {
                    const selectedDate = new Date(this.value);
                    const now = new Date();
                    
                    if (selectedDate <= now) {
                        this.setCustomValidity('Due date must be in the future');
                    } else {
                        this.setCustomValidity('');
                    }
                });
            }
        });
    },

    // Initialize task card interactions
    initializeTaskCards: function() {
        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(card => {
            // Add priority-based styling
            const priorityBadge = card.querySelector('.priority-badge');
            if (priorityBadge) {
                const priorityText = priorityBadge.textContent.toLowerCase();
                if (priorityText.includes('high')) {
                    card.classList.add('priority-high');
                } else if (priorityText.includes('medium')) {
                    card.classList.add('priority-medium');
                } else if (priorityText.includes('low')) {
                    card.classList.add('priority-low');
                }
            }

            // Click to view task details (except on buttons)
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.btn') && !e.target.closest('.dropdown')) {
                    const detailLink = this.querySelector('a[href*="task/"][href*="/"]');
                    if (detailLink) {
                        window.location.href = detailLink.href;
                    }
                }
            });

            // Add hover effects
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    },

    // Initialize navigation features
    initializeNavigation: function() {
        // Active page highlighting
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        // Mobile menu auto-close
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
            document.addEventListener('click', function(e) {
                if (!navbarToggler.contains(e.target) && 
                    !navbarCollapse.contains(e.target) && 
                    navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        }
    },

    // Initialize notification system
    initializeNotifications: function() {
        // Auto-dismiss alerts after 5 seconds
        const alerts = document.querySelectorAll('.alert:not(.alert-danger)');
        alerts.forEach(alert => {
            if (!alert.querySelector('.btn-close')) return;
            
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });

        // Check for overdue tasks and show notification
        this.checkOverdueTasks();
    },

    // Check for overdue tasks on dashboard
    checkOverdueTasks: function() {
        const overdueCards = document.querySelectorAll('.task-card .badge.bg-danger');
        const overdueCount = overdueCards.length;
        
        if (overdueCount > 0 && window.location.pathname.includes('dashboard')) {
            this.showNotification(
                `You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}. Please review them.`,
                'warning'
            );
        }
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    },

    // Utility function to format dates
    formatDate: function(dateString) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Utility function to calculate time remaining
    getTimeRemaining: function(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        
        if (diff < 0) {
            const overdue = Math.abs(diff);
            const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
            const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
                return `Overdue by ${days} day${days > 1 ? 's' : ''}`;
            } else if (hours > 0) {
                return `Overdue by ${hours} hour${hours > 1 ? 's' : ''}`;
            } else {
                return 'Overdue';
            }
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        } else {
            return 'Due soon';
        }
    }
};

// Global function for delete confirmation (called from templates)
function confirmDelete(url, taskTitle) {
    TaskHero.showDeleteConfirmation(url, taskTitle);
}

// Utility function to show loading state
function showLoading(element) {
    const originalText = element.innerHTML;
    element.innerHTML = '<span class="loading me-2"></span>Loading...';
    element.disabled = true;
    
    return function hideLoading() {
        element.innerHTML = originalText;
        element.disabled = false;
    };
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N for new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const newTaskLink = document.querySelector('a[href*="task/new"]');
        if (newTaskLink) {
            window.location.href = newTaskLink.href;
        }
    }
    
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            const button = dropdown.previousElementSibling;
            if (button) {
                button.click();
            }
        });
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    TaskHero.init();
});

// Handle page visibility change to update overdue tasks
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.location.pathname.includes('dashboard')) {
        setTimeout(() => {
            TaskHero.checkOverdueTasks();
        }, 1000);
    }
});

// Service Worker registration for PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskHero;
}
