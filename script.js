// LPU Hostel Allotment System - JavaScript

const studentDatabase = {
    'admin@lpu.in': { password: 'admin123', name: 'Admin User', rollNo: 'ADMIN' }
};

let currentUser = null;
let captchaText = '';

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', function () {
    generateCaptcha();
    setupEventListeners();
});

// ================== CAPTCHA ==================
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    captchaText = '';
    for (let i = 0; i < 6; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captchaText').textContent = captchaText;
}

// ================== EVENT LISTENERS ==================
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('refreshCaptcha').addEventListener('click', generateCaptcha);
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    document.getElementById('resetForm').addEventListener('submit', handlePasswordReset);
}

// ================== USER DATA HELPERS ==================
function getUserData(key) {
    const prefix = /^\d{8}$/.test(key) ? 'user_id_' : 'user_';
    return JSON.parse(localStorage.getItem(prefix + key) || '{}');
}

function saveUserData(key, data) {
    const prefix = /^\d{8}$/.test(key) ? 'user_id_' : 'user_';
    localStorage.setItem(prefix + key, JSON.stringify(data));
}


// ================== LOGIN ==================
// ================== LOGIN ==================
function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captcha').value;

    if (captcha.toUpperCase() !== captchaText) {
        showError('Invalid captcha. Please try again.');
        generateCaptcha();
        document.getElementById('captcha').value = '';
        return;
    }

    const isEightDigitID = /^\d{8}$/.test(emailInput);
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput);

    if (isEightDigitID || isValidEmail) {
        let userData = getUserData(emailInput);

        if (!userData.email && isValidEmail) {
            userData = { email: emailInput, name: '', rollNo: '', application: false, allocated: false };
        } else if (!userData.id && isEightDigitID) {
            userData = { email: '', id: emailInput, name: '', application: false, allocated: false };
        }

        currentUser = userData;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
        return;
    }

    if (studentDatabase[emailInput] && studentDatabase[emailInput].password === password) {
        currentUser = {
            email: emailInput,
            name: studentDatabase[emailInput].name,
            rollNo: studentDatabase[emailInput].rollNo
        };

        // ✅ Store admin profile
        saveUserData(emailInput, currentUser);

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        showError('Invalid email or ID. Please try again.');
        generateCaptcha();
        document.getElementById('captcha').value = '';
    }
}

// ================== FORGOT PASSWORD ==================
function handlePasswordReset(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;
    if (studentDatabase[email]) {
        showSuccess('Password reset link has been sent to your email address.');
        document.getElementById('forgotPasswordModal').style.display = 'none';
        document.getElementById('resetForm').reset();
    } else {
        showError('Email not found in our database.');
    }
}

// ================== DASHBOARD ==================
function showDashboard() {
    const container = document.querySelector('.container');
    let key = currentUser.email || currentUser.id;
    let userData = getUserData(key);

    if ((!userData || !userData.name) && currentUser) {
        userData = currentUser;
    }

    let allocationStatus = '';
    if (userData && userData.application) {
        allocationStatus = `<div class='allocation-status'><strong>Status:</strong> ✅ Hostel Allocated</div>`;
    }

    let statusLabel = '';
    if (userData.status) {
        statusLabel = `<div class='allocation-status'><strong>Admin Status:</strong> ${userData.status}</div>`;
    }

    container.innerHTML = `
        <div class="header">
    <div class="logo">
        <img src="lpulogo.png" alt="LPU Logo" class="logo-img">
        <div class="logo-text">
            <h1>Admin</h1>
            <h2>Hostel Allotment - LPU</h2>
        </div>
    </div>
    ${
        currentUser.email === 'admin@lpu.in' ? `
        <div class="admin-panel-link">
            <a href="admin.html" class="btn-primary">🔐 Go to Admin Panel</a>
        </div>` : ''
    }
</div>


        <div class="dashboard">
            <div class="dashboard-header">
                <h2>${
                    currentUser.email === 'admin@lpu.in'
                        ? (userData.application ? 'Welcome back, Sir' : 'Welcome, Sir')
                        : (userData.application ? `Welcome back, ${userData.name || 'Student'}` : 'Welcome, New Student')
                }</h2>
                <div class="user-info">
                    <div class="user-avatar">${(userData.name || 'N').charAt(0)}</div>
                    <span>${currentUser.email || currentUser.id}</span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
            ${allocationStatus}
            ${statusLabel}
            <div class="progress-container">
                <h3>Application Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <p id="progressText">Step 1 of 4: Personal Information</p>
            </div>
        </div>

        <div class="form-section" id="personalInfoSection">
            <h3>Personal Information</h3>
            <form id="personalInfoForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="rollNumber">Roll Number</label>
                        <input type="text" id="rollNumber" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="department">Department</label>
                        <select id="department" required>
                            <option value="">Select Department</option>
                            <option>Computer Science</option>
                            <option>Electrical</option>
                            <option>Mechanical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="yearOfStudy">Year of Study</label>
                        <select id="yearOfStudy" required>
                            <option value="">Select Year</option>
                            <option>1st</option>
                            <option>2nd</option>
                            <option>3rd</option>
                            <option>4th</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="emergencyContact">Emergency Contact</label>
                        <input type="tel" id="emergencyContact" required>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Next: Room Preferences</button>
            </form>
        </div>

        <div class="form-section" id="roomPreferencesSection" style="display: none;">
            <h3>Room Preferences</h3>
            <form id="roomPreferencesForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="roomType">Room Type</label>
                        <select id="roomType" required>
                            <option value="">Select</option>
                            <option>Single</option>
                            <option>Double</option>
                            <option>Triple</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="floorPreference">Floor Preference</label>
                        <select id="floorPreference" required>
                            <option value="">Select Floor</option>
                            <option>Ground</option>
                            <option>First</option>
                            <option>Second</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="disabilityAccess"> Disability Access Needed
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="previousStep()">Previous</button>
                    <button type="submit" class="btn-primary">Next</button>
                </div>
            </form>
        </div>

        <div class="form-section" id="reviewSection" style="display: none;">
            <h3>Review & Submit Application</h3>
            <div id="reviewContent"></div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="previousStep()">Previous</button>
                <button type="button" class="btn-primary" onclick="submitApplication()">Submit</button>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2024 LPU - Hostel Allotment System</p>
        </div>
    `;

    setupDashboardEventListeners();
    updateProgress(1);

    if (userData && userData.application) {
        hideAllSections();
        document.getElementById('reviewSection').style.display = 'block';
        showReview(userData);
    }
}

// ================== FORMS ==================
function setupDashboardEventListeners() {
    document.getElementById('personalInfoForm').addEventListener('submit', handlePersonalInfo);
    document.getElementById('roomPreferencesForm').addEventListener('submit', handleRoomPreferences);
}

function handlePersonalInfo(event) {
    event.preventDefault();
    const data = {
        fullName: document.getElementById('fullName').value,
        rollNumber: document.getElementById('rollNumber').value,
        department: document.getElementById('department').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        phone: document.getElementById('phone').value,
        emergencyContact: document.getElementById('emergencyContact').value
    };
    let key = currentUser.email || currentUser.id;
    let userData = getUserData(key);
    userData.name = data.fullName;
    userData.rollNo = data.rollNumber;
    userData.personalInfo = data;
    saveUserData(key, userData);
    document.getElementById('personalInfoSection').style.display = 'none';
    document.getElementById('roomPreferencesSection').style.display = 'block';
    updateProgress(2);
}

function handleRoomPreferences(event) {
    event.preventDefault();
    const data = {
        roomType: document.getElementById('roomType').value,
        floorPreference: document.getElementById('floorPreference').value,
        disabilityAccess: document.getElementById('disabilityAccess').checked
    };
    let key = currentUser.email || currentUser.id;
    let userData = getUserData(key);
    userData.roomPreferences = data;
    saveUserData(key, userData);
    document.getElementById('roomPreferencesSection').style.display = 'none';
    document.getElementById('reviewSection').style.display = 'block';
    updateProgress(3);
    showReview(userData);
}

// ================== REVIEW & SUBMIT ==================
function showReview(userData) {
    const info = userData.personalInfo || {};
    const room = userData.roomPreferences || {};
    document.getElementById('reviewContent').innerHTML = `
        <p><strong>Name:</strong> ${info.fullName}</p>
        <p><strong>Roll No:</strong> ${info.rollNumber}</p>
        <p><strong>Department:</strong> ${info.department}</p>
        <p><strong>Year:</strong> ${info.yearOfStudy}</p>
        <p><strong>Phone:</strong> ${info.phone}</p>
        <p><strong>Emergency Contact:</strong> ${info.emergencyContact}</p>
        <hr>
        <p><strong>Room Type:</strong> ${room.roomType}</p>
        <p><strong>Floor Preference:</strong> ${room.floorPreference}</p>
        <p><strong>Disability Access:</strong> ${room.disabilityAccess ? 'Yes' : 'No'}</p>
    `;
}

function submitApplication() {
    showSuccess('Application submitted successfully!');
    let key = currentUser.email || currentUser.id;
    let userData = getUserData(key);
    userData.application = true;
    userData.allocated = true;
    saveUserData(key, userData);

    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// ================== UTILITIES ==================
function previousStep() {
    document.getElementById('reviewSection').style.display = 'none';
    document.getElementById('roomPreferencesSection').style.display = 'block';
    updateProgress(2);
}

function updateProgress(step) {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    fill.style.width = `${(step / 4) * 100}%`;
    const steps = [
        'Step 1 of 4: Personal Information',
        'Step 2 of 4: Room Preferences',
        'Step 3 of 4: Review',
        'Step 4 of 4: Submitted'
    ];
    text.textContent = steps[step - 1] || steps[0];
}

function hideAllSections() {
    ['personalInfoSection', 'roomPreferencesSection', 'reviewSection'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function logout() {
    sessionStorage.clear();
    window.location.reload();
}

function showError(msg) {
    alert("❌ " + msg);
}

function showSuccess(msg) {
    alert("✅ " + msg);
}

function showForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
}
