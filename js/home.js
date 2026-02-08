// ==========================================
// Home Page JavaScript
// ==========================================

// Load departments for homepage
async function loadHomeDepartments() {
    const container = document.getElementById('departments-grid');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('departments', { limit: 6 });
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No departments available at the moment.');
        return;
    }
    
    container.innerHTML = result.data.map(dept => `
        <div class="department-card" onclick="window.location.href='departments.html'">
            <div class="department-icon">
                <i class="fas ${dept.icon}"></i>
            </div>
            <h3>${dept.name}</h3>
            <p>${dept.description.substring(0, 100)}...</p>
            <a href="appointments.html?department=${dept.id}" class="btn btn-primary" onclick="event.stopPropagation()">
                <i class="fas fa-calendar-check"></i> Book Appointment
            </a>
        </div>
    `).join('');
}

// Load doctors for homepage
async function loadHomeDoctors() {
    const container = document.getElementById('doctors-grid');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('doctors', { limit: 6 });
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No doctors available at the moment.');
        return;
    }
    
    // Also fetch departments to show department names
    const deptsResult = await fetchData('departments');
    const departments = {};
    if (deptsResult && deptsResult.data) {
        deptsResult.data.forEach(dept => {
            departments[dept.id] = dept.name;
        });
    }
    
    container.innerHTML = result.data.map(doctor => `
        <div class="doctor-card">
            <img src="${doctor.photo_url}" alt="${doctor.name}" class="doctor-image">
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p class="doctor-specialty">${doctor.specialization}</p>
                <p>${doctor.qualification}</p>
                <div class="doctor-meta">
                    <span><i class="fas fa-building"></i> ${departments[doctor.department_id] || 'N/A'}</span>
                    <span><i class="fas fa-briefcase"></i> ${doctor.experience_years} years</span>
                </div>
                <div class="doctor-fee">$${doctor.consultation_fee}</div>
                <a href="appointments.html?doctor=${doctor.id}" class="btn btn-primary">
                    <i class="fas fa-calendar-check"></i> Book Appointment
                </a>
            </div>
        </div>
    `).join('');
}

// Load testimonials for homepage
async function loadTestimonials() {
    const container = document.getElementById('testimonials-slider');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('testimonials', { limit: 6 });
    
    if (!result || !result.data || result.data.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center;">No testimonials available yet.</p>';
        return;
    }
    
    // Filter approved testimonials
    const approved = result.data.filter(t => t.status === 'approved');
    
    container.innerHTML = approved.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-header">
                <img src="${testimonial.patient_photo}" alt="${testimonial.patient_name}" class="testimonial-avatar">
                <div>
                    <h4 style="color: white; margin: 0;">${testimonial.patient_name}</h4>
                    <div class="testimonial-rating">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                    </div>
                </div>
            </div>
            <p class="testimonial-comment">"${testimonial.comment}"</p>
        </div>
    `).join('');
}

// Load blog posts for homepage
async function loadBlogPosts() {
    const container = document.getElementById('blog-grid');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('blogs', { limit: 3, sort: '-published_date' });
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No blog posts available at the moment.');
        return;
    }
    
    // Filter published posts
    const published = result.data.filter(post => post.status === 'published');
    
    container.innerHTML = published.map(post => `
        <div class="blog-card">
            <img src="${post.featured_image}" alt="${post.title}" class="blog-image">
            <div class="blog-content">
                <span class="blog-category">${post.category}</span>
                <h3>${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-meta">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="fas fa-eye"></i> ${post.views} views</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    loadHomeDepartments();
    loadHomeDoctors();
    loadTestimonials();
    loadBlogPosts();
});
