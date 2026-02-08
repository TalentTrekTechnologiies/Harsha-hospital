// ==========================================
// MediCare Hospital - Main JavaScript
// Shared functions across all pages
// ==========================================

// API Base URL - using relative paths for RESTful Table API
const API_BASE = 'tables';

// Utility function to fetch data from API
async function fetchData(tableName, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE}/${tableName}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Utility function to fetch single record
async function fetchRecord(tableName, recordId) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`);
        if (!response.ok) throw new Error('Record not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching record:', error);
        return null;
    }
}

// Utility function to create a record
async function createRecord(tableName, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create record');
        return await response.json();
    } catch (error) {
        console.error('Error creating record:', error);
        throw error;
    }
}

// Utility function to update a record
async function updateRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update record');
        return await response.json();
    } catch (error) {
        console.error('Error updating record:', error);
        throw error;
    }
}

// Utility function to partially update a record
async function patchRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to patch record');
        return await response.json();
    } catch (error) {
        console.error('Error patching record:', error);
        throw error;
    }
}

// Utility function to delete a record
async function deleteRecord(tableName, recordId) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete record');
        return true;
    } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
    }
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate unique ID
function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Show loading spinner
function showLoading(element) {
    element.innerHTML = '<div class="spinner"></div>';
}

// Show error message
function showError(element, message) {
    element.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Mobile Navigation Toggle
function toggleMobileNav() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

// Emergency Widget Toggle
function toggleEmergencyInfo() {
    const emergencyInfo = document.getElementById('emergency-info');
    emergencyInfo.classList.toggle('hidden');
}

// Chat Widget Toggle
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    const chatButton = document.getElementById('chat-button');
    
    if (chatWidget) {
        chatWidget.classList.toggle('hidden');
    }
}

// Send Chat Message
function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    const messagesContainer = document.getElementById('chat-messages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<p>${message}</p>`;
    messagesContainer.appendChild(userMessage);
    
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate bot response
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.innerHTML = `<p>Thank you for your message. Our team will assist you shortly. For immediate medical assistance, please call our emergency number: +1-555-EMERGENCY</p>`;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

// Handle chat enter key
function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Animate stat numbers
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Intersection Observer for animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.stat-card, .department-card, .doctor-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats if present
    if (document.querySelector('.stat-number')) {
        const statsSection = document.querySelector('.stats-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStatNumbers();
                    observer.unobserve(entry.target);
                }
            });
        });
        if (statsSection) observer.observe(statsSection);
    }
    
    // Initialize intersection observer
    observeElements();
});

// Form validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchData,
        fetchRecord,
        createRecord,
        updateRecord,
        patchRecord,
        deleteRecord,
        formatDate,
        formatDateTime,
        generateId,
        showLoading,
        showError,
        validateEmail,
        validatePhone,
        showToast
    };
}
