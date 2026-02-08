// Departments Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    loadAllDepartments();
});

async function loadAllDepartments() {
    const container = document.getElementById('departments-list');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('departments');
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No departments available');
        return;
    }
    
    const active = result.data.filter(dept => dept.status === 'active');
    
    container.innerHTML = active.map(dept => `
        <div class="department-detailed-card">
            <img src="${dept.image_url}" alt="${dept.name}" class="dept-image">
            <div class="dept-content">
                <div class="dept-icon">
                    <i class="fas ${dept.icon}"></i>
                </div>
                <h2>${dept.name}</h2>
                <p>${dept.description}</p>
                <a href="appointments.html?department=${dept.id}" class="btn btn-primary">
                    <i class="fas fa-calendar-check"></i> Book Appointment
                </a>
            </div>
        </div>
    `).join('');
}

// Add styling
const style = document.createElement('style');
style.textContent = `
    .departments-detailed-grid {
        display: grid;
        gap: 2rem;
    }
    
    .department-detailed-card {
        background: white;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        transition: all 0.3s ease;
    }
    
    .department-detailed-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .dept-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .dept-content {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .dept-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: white;
        margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
        .department-detailed-card {
            grid-template-columns: 1fr;
        }
        
        .dept-image {
            height: 200px;
        }
    }
`;
document.head.appendChild(style);
