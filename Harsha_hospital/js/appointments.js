// ==========================================
// Appointments Booking System
// ==========================================

let bookingData = {
    department: null,
    doctor: null,
    date: null,
    timeSlot: null,
    patient: {}
};

let currentStep = 1;
let allDoctors = [];
let allDepartments = [];

// Initialize appointments page
document.addEventListener('DOMContentLoaded', () => {
    loadDepartmentsForBooking();
    initializeDatePicker();
});

// Load departments for step 1
async function loadDepartmentsForBooking() {
    const container = document.getElementById('department-selection');
    if (!container) return;
    
    showLoading(container);
    
    const result = await fetchData('departments');
    
    if (!result || !result.data || result.data.length === 0) {
        showError(container, 'No departments available');
        return;
    }
    
    allDepartments = result.data.filter(dept => dept.status === 'active');
    
    container.innerHTML = allDepartments.map(dept => `
        <div class="selection-card" onclick="selectDepartment('${dept.id}')">
            <div class="selection-icon">
                <i class="fas ${dept.icon}"></i>
            </div>
            <h3>${dept.name}</h3>
            <p>${dept.description.substring(0, 80)}...</p>
        </div>
    `).join('');
}

// Select department and move to step 2
async function selectDepartment(departmentId) {
    const department = allDepartments.find(d => d.id === departmentId);
    if (!department) return;
    
    bookingData.department = department;
    document.getElementById('selected-dept-name').textContent = department.name;
    
    await loadDoctorsForDepartment(departmentId);
    nextStep();
}

// Load doctors for selected department
async function loadDoctorsForDepartment(departmentId) {
    const container = document.getElementById('doctor-selection');
    showLoading(container);
    
    const result = await fetchData('doctors');
    
    if (!result || !result.data) {
        showError(container, 'No doctors available');
        return;
    }
    
    allDoctors = result.data.filter(doc => 
        doc.department_id === departmentId && doc.status === 'active'
    );
    
    displayDoctors(allDoctors);
    
    // Setup search functionality
    const searchInput = document.getElementById('doctor-search-booking');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allDoctors.filter(doc => 
                doc.name.toLowerCase().includes(query) ||
                doc.specialization.toLowerCase().includes(query)
            );
            displayDoctors(filtered);
        });
    }
}

// Display doctors in grid
function displayDoctors(doctors) {
    const container = document.getElementById('doctor-selection');
    
    if (doctors.length === 0) {
        container.innerHTML = '<p>No doctors found.</p>';
        return;
    }
    
    container.innerHTML = doctors.map(doctor => `
        <div class="doctor-selection-card" onclick="selectDoctor('${doctor.id}')">
            <img src="${doctor.photo_url}" alt="${doctor.name}">
            <div class="doctor-selection-info">
                <h4>${doctor.name}</h4>
                <p class="specialty">${doctor.specialization}</p>
                <p class="qualification">${doctor.qualification}</p>
                <div class="doctor-details">
                    <span><i class="fas fa-briefcase"></i> ${doctor.experience_years} years</span>
                    <span><i class="fas fa-dollar-sign"></i> $${doctor.consultation_fee}</span>
                </div>
                <div class="availability">
                    <i class="fas fa-calendar"></i> ${doctor.available_days ? doctor.available_days.join(', ') : 'N/A'}
                </div>
            </div>
        </div>
    `).join('');
}

// Select doctor and move to step 3
function selectDoctor(doctorId) {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    bookingData.doctor = doctor;
    
    // Update summary
    document.getElementById('summary-doctor-photo').src = doctor.photo_url;
    document.getElementById('summary-doctor-name').textContent = doctor.name;
    document.getElementById('summary-doctor-specialty').textContent = doctor.specialization;
    document.getElementById('summary-doctor-fee').textContent = doctor.consultation_fee;
    
    nextStep();
}

// Initialize date picker
function initializeDatePicker() {
    const dateInput = document.getElementById('appointment-date');
    if (!dateInput) return;
    
    // Set min date to today
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
    
    // Set max date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    dateInput.addEventListener('change', () => {
        generateTimeSlots();
    });
}

// Generate available time slots
function generateTimeSlots() {
    const dateInput = document.getElementById('appointment-date');
    const container = document.getElementById('time-slots');
    
    if (!dateInput.value || !bookingData.doctor) {
        container.innerHTML = '<p class="info-text">Please select a date first</p>';
        return;
    }
    
    const selectedDate = new Date(dateInput.value);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if doctor is available on this day
    if (!bookingData.doctor.available_days || !bookingData.doctor.available_days.includes(dayName)) {
        container.innerHTML = `<p class="info-text">Doctor is not available on ${dayName}. Please select another date.</p>`;
        return;
    }
    
    // Parse doctor's working hours (e.g., "09:00-17:00")
    const [startTime, endTime] = bookingData.doctor.available_hours.split('-');
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    // Generate 30-minute slots
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    container.innerHTML = slots.map(slot => `
        <button class="time-slot-btn" onclick="selectTimeSlot('${slot}')">
            ${slot}
        </button>
    `).join('');
}

// Select time slot
function selectTimeSlot(timeSlot) {
    bookingData.timeSlot = timeSlot;
    
    // Highlight selected slot
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Enable next button (we'll add this functionality)
    setTimeout(() => nextStep(), 500);
}

// Toggle patient form type
function togglePatientForm() {
    const guestForm = document.getElementById('guest-form');
    const registeredForm = document.getElementById('registered-form');
    const selectedType = document.querySelector('input[name="patient-type"]:checked').value;
    
    if (selectedType === 'guest') {
        guestForm.classList.remove('hidden');
        registeredForm.classList.add('hidden');
    } else {
        guestForm.classList.add('hidden');
        registeredForm.classList.remove('hidden');
    }
}

// Navigation between steps
function nextStep() {
    // Validate current step before moving
    if (currentStep === 4) {
        if (!validatePatientInfo()) {
            return;
        }
        populateConfirmation();
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show next step
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousStep() {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show previous step
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate patient information
function validatePatientInfo() {
    const patientType = document.querySelector('input[name="patient-type"]:checked').value;
    
    if (patientType === 'guest') {
        const name = document.getElementById('guest-name').value.trim();
        const email = document.getElementById('guest-email').value.trim();
        const phone = document.getElementById('guest-phone').value.trim();
        const age = document.getElementById('guest-age').value;
        const reason = document.getElementById('guest-reason').value.trim();
        
        if (!name || !email || !phone || !age) {
            showToast('Please fill in all required fields', 'error');
            return false;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!validatePhone(phone)) {
            showToast('Please enter a valid phone number', 'error');
            return false;
        }
        
        bookingData.patient = {
            name: name,
            email: email,
            phone: phone,
            age: parseInt(age),
            reason: reason,
            type: 'guest'
        };
    } else {
        // For registered patients, would need authentication
        showToast('Please login or continue as guest', 'info');
        return false;
    }
    
    return true;
}

// Populate confirmation summary
function populateConfirmation() {
    document.getElementById('final-department').textContent = bookingData.department.name;
    document.getElementById('final-doctor').textContent = bookingData.doctor.name;
    
    const appointmentDate = document.getElementById('appointment-date').value;
    document.getElementById('final-date').textContent = formatDate(appointmentDate);
    document.getElementById('final-time').textContent = bookingData.timeSlot;
    
    document.getElementById('final-patient-name').textContent = bookingData.patient.name;
    document.getElementById('final-contact').textContent = `${bookingData.patient.email} | ${bookingData.patient.phone}`;
    document.getElementById('final-fee').textContent = bookingData.doctor.consultation_fee;
}

// Confirm and book appointment
async function confirmAppointment() {
    const termsAccepted = document.getElementById('terms-accept').checked;
    
    if (!termsAccepted) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Prepare appointment data
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentDateTime = new Date(`${appointmentDate}T${bookingData.timeSlot}:00`).toISOString();
    
    const appointmentData = {
        id: generateId(),
        patient_id: bookingData.patient.type === 'guest' ? 'guest-' + generateId() : bookingData.patient.id,
        patient_name: bookingData.patient.name,
        patient_email: bookingData.patient.email,
        patient_phone: bookingData.patient.phone,
        doctor_id: bookingData.doctor.id,
        doctor_name: bookingData.doctor.name,
        department_id: bookingData.department.id,
        department_name: bookingData.department.name,
        appointment_date: appointmentDateTime,
        time_slot: bookingData.timeSlot,
        consultation_fee: bookingData.doctor.consultation_fee,
        payment_status: paymentMethod === 'online' ? 'paid' : 'pending',
        payment_method: paymentMethod,
        status: 'scheduled',
        reason: bookingData.patient.reason || '',
        notes: '',
        cancellation_reason: ''
    };
    
    try {
        const result = await createRecord('appointments', appointmentData);
        
        // Show success message
        document.getElementById('step-5').classList.remove('active');
        document.getElementById('success-message').classList.remove('hidden');
        document.getElementById('appointment-id').textContent = result.id;
        
        showToast('Appointment booked successfully!', 'success');
        
        // Reset booking data
        bookingData = { department: null, doctor: null, date: null, timeSlot: null, patient: {} };
        currentStep = 1;
        
    } catch (error) {
        showToast('Failed to book appointment. Please try again.', 'error');
        console.error('Booking error:', error);
    }
}

// Lookup appointments by email
async function lookupAppointments() {
    const email = document.getElementById('lookup-email').value.trim();
    
    if (!email || !validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const container = document.getElementById('appointments-list');
    showLoading(container);
    container.classList.remove('hidden');
    
    try {
        const result = await fetchData('appointments', { search: email });
        
        if (!result || !result.data || result.data.length === 0) {
            container.innerHTML = '<p>No appointments found for this email.</p>';
            return;
        }
        
        // Filter appointments for this email
        const userAppointments = result.data.filter(apt => apt.patient_email === email);
        
        if (userAppointments.length === 0) {
            container.innerHTML = '<p>No appointments found for this email.</p>';
            return;
        }
        
        displayUserAppointments(userAppointments);
        
    } catch (error) {
        showError(container, 'Failed to load appointments');
    }
}

// Display user appointments
function displayUserAppointments(appointments) {
    const container = document.getElementById('appointments-list');
    
    container.innerHTML = `
        <h3>Your Appointments</h3>
        ${appointments.map(apt => `
            <div class="appointment-item">
                <div class="appointment-header">
                    <h4>${apt.doctor_name} - ${apt.department_name}</h4>
                    <span class="status-badge ${apt.status}">${apt.status}</span>
                </div>
                <div class="appointment-details">
                    <p><i class="fas fa-calendar"></i> ${formatDateTime(apt.appointment_date)}</p>
                    <p><i class="fas fa-clock"></i> ${apt.time_slot}</p>
                    <p><i class="fas fa-dollar-sign"></i> $${apt.consultation_fee} - ${apt.payment_status}</p>
                </div>
                <div class="appointment-actions">
                    ${apt.status === 'scheduled' ? `
                        <button class="btn btn-secondary btn-sm" onclick="rescheduleAppointment('${apt.id}')">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="cancelAppointment('${apt.id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    `;
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
        await patchRecord('appointments', appointmentId, {
            status: 'cancelled',
            cancellation_reason: reason
        });
        
        showToast('Appointment cancelled successfully', 'success');
        
        // Reload appointments
        const email = document.getElementById('lookup-email').value;
        if (email) {
            lookupAppointments();
        }
        
    } catch (error) {
        showToast('Failed to cancel appointment', 'error');
    }
}

// Reschedule appointment (simplified)
function rescheduleAppointment(appointmentId) {
    showToast('Please contact us at +1-555-EMERGENCY to reschedule', 'info');
}

// Add CSS for appointment components
const appointmentStyle = document.createElement('style');
appointmentStyle.textContent = `
    .selection-card {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
    }
    
    .selection-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .selection-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: white;
        margin: 0 auto 1rem;
    }
    
    .booking-steps {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3rem;
        padding: 0 2rem;
    }
    
    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }
    
    .step::after {
        content: '';
        position: absolute;
        top: 20px;
        left: 50%;
        width: 100%;
        height: 2px;
        background: #e5e7eb;
        z-index: -1;
    }
    
    .step:last-child::after {
        display: none;
    }
    
    .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e5e7eb;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    .step.active .step-number {
        background: #2563eb;
        color: white;
    }
    
    .step-label {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .step.active .step-label {
        color: #2563eb;
        font-weight: 600;
    }
    
    .booking-step {
        display: none;
        animation: fadeIn 0.5s ease;
    }
    
    .booking-step.active {
        display: block;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    
    .doctors-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .doctor-selection-card {
        background: white;
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .doctor-selection-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .doctor-selection-card img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }
    
    .doctor-selection-info {
        padding: 1.5rem;
    }
    
    .time-slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
    }
    
    .time-slot-btn {
        padding: 1rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
    }
    
    .time-slot-btn:hover {
        border-color: #2563eb;
        background: #eff6ff;
    }
    
    .time-slot-btn.selected {
        background: #2563eb;
        color: white;
        border-color: #2563eb;
    }
    
    .doctor-info-summary {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .doctor-info-summary img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .radio-card {
        display: block;
        cursor: pointer;
    }
    
    .radio-card input {
        display: none;
    }
    
    .radio-card-content {
        padding: 1.5rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        transition: all 0.3s ease;
    }
    
    .radio-card input:checked + .radio-card-content {
        border-color: #2563eb;
        background: #eff6ff;
    }
    
    .patient-type-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .appointment-summary {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-item.total {
        border-top: 2px solid #e5e7eb;
        border-bottom: none;
        padding-top: 1.5rem;
        margin-top: 1rem;
    }
    
    .summary-label {
        font-weight: 600;
        color: #6b7280;
    }
    
    .summary-value {
        color: #1f2937;
    }
    
    .fee-amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: #10b981;
    }
    
    .success-message {
        text-align: center;
        padding: 3rem;
        animation: fadeIn 0.5s ease;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1.5rem;
    }
    
    .appointment-id {
        padding: 1rem;
        background: #f3f4f6;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
    }
    
    .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }
    
    .appointment-item {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }
    
    .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .appointment-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
    
    .step-navigation {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }
    
    .datetime-selection {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 2rem;
        margin-top: 2rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #1f2937;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        font-family: inherit;
    }
    
    .terms-checkbox {
        margin: 1.5rem 0;
    }
    
    .terms-checkbox label {
        display: flex;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .payment-section {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }
    
    .payment-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .my-appointments-section {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-top: 3rem;
    }
    
    .appointment-lookup {
        margin: 1.5rem 0;
    }
    
    .input-with-button {
        display: flex;
        gap: 1rem;
    }
    
    .input-with-button input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .booking-steps {
            padding: 0;
        }
        
        .step-label {
            display: none;
        }
        
        .datetime-selection {
            grid-template-columns: 1fr;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(appointmentStyle);
