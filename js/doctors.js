// Doctors Page JavaScript

let allDoctorsData = [];
let allDepartmentsData = {};

document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    setupSearch();
});

async function loadDoctors() {
    const container = document.getElementById('doctors-list');
    if (!container) return;
    
    showLoading(container);
    
    // Load departments first
    const deptsResult = await fetchData('departments');
    if (deptsResult && deptsResult.data) {
        deptsResult.data.forEach(dept => {
            allDepartmentsData[dept.id] = dept.name;
        });
        
        // Populate filter dropdown
        const filterSelect = document.getElementById('department-filter');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Departments</option>' +
                deptsResult.data.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('');
        }
    }
    
    // Load doctors
    const result = await fetchData('doctors');
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No doctors available');
        return;
    }
    
    allDoctorsData = result.data.filter(doc => doc.status === 'active');
    displayDoctors(allDoctorsData);
}

function displayDoctors(doctors) {
    const container = document.getElementById('doctors-list');
    const noResults = document.getElementById('no-results');
    
    if (doctors.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    container.innerHTML = doctors.map(doctor => `
        <div class="doctor-detailed-card">
            <img src="${doctor.photo_url}" alt="${doctor.name}" class="doctor-photo-large">
            <div class="doctor-details-full">
                <h2>${doctor.name}</h2>
                <p class="doctor-specialty">${doctor.specialization}</p>
                <p class="doctor-qualification">${doctor.qualification}</p>
                
                <div class="doctor-meta-grid">
                    <div class="meta-item">
                        <i class="fas fa-building"></i>
                        <span>${allDepartmentsData[doctor.department_id] || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${doctor.experience_years} years experience</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${doctor.consultation_fee}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${doctor.available_days ? doctor.available_days.join(', ') : 'N/A'}</span>
                    </div>
                </div>
                
                <p class="doctor-bio">${doctor.bio}</p>
                
                <div class="doctor-actions">
                    <a href="appointments.html?doctor=${doctor.id}" class="btn btn-primary">
                        <i class="fas fa-calendar-check"></i> Book Appointment
                    </a>
                    <a href="mailto:${doctor.email}" class="btn btn-outline">
                        <i class="fas fa-envelope"></i> Email
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('doctor-search');
    const filterSelect = document.getElementById('department-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDoctors);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterDoctors);
    }
}

function filterDoctors() {
    const searchQuery = document.getElementById('doctor-search').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    
    let filtered = allDoctorsData;
    
    // Apply search
    if (searchQuery) {
        filtered = filtered.filter(doc => 
            doc.name.toLowerCase().includes(searchQuery) ||
            doc.specialization.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply department filter
    if (departmentFilter) {
        filtered = filtered.filter(doc => doc.department_id === departmentFilter);
    }
    
    displayDoctors(filtered);
}

// Add styling
const style = document.createElement('style');
style.textContent = `
    .search-filter-bar {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1rem;
    }
    
    .search-box {
        position: relative;
    }
    
    .search-box i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
    }
    
    .search-box input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 3rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
    }
    
    .filter-box {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .filter-box select {
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
    }
    
    .doctors-detailed-grid {
        display: grid;
        gap: 2rem;
    }
    
    .doctor-detailed-card {
        background: white;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
        transition: all 0.3s ease;
    }
    
    .doctor-detailed-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .doctor-photo-large {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .doctor-details-full {
        padding: 2rem;
    }
    
    .doctor-meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
    }
    
    .meta-item i {
        color: #2563eb;
    }
    
    .doctor-bio {
        color: #6b7280;
        line-height: 1.6;
        margin: 1.5rem 0;
    }
    
    .doctor-actions {
        display: flex;
        gap: 1rem;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .no-results i {
        font-size: 4rem;
        color: #d1d5db;
        margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
        .search-filter-bar {
            grid-template-columns: 1fr;
        }
        
        .doctor-detailed-card {
            grid-template-columns: 1fr;
        }
        
        .doctor-photo-large {
            height: 300px;
        }
        
        .doctor-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);
