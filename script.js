// BC99 Gaming Platform JavaScript

// Get DOM elements
const authPage = document.getElementById('auth-page');
const homePage = document.getElementById('home-page');
const accountPage = document.getElementById('account-page');

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginLink = document.getElementById('show-login');
const showRegisterLink = document.getElementById('show-register');

const navItems = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logout-btn');

// Mock user data for GitHub Pages
let currentUser = null;

// Helper functions
function showPage(pageId) {
    // Hide all pages
    authPage.classList.add('hidden');
    homePage.classList.add('hidden');
    accountPage.classList.add('hidden');
    
    // Show selected page
    document.getElementById(pageId).classList.remove('hidden');
    
    // Update navigation
    navItems.forEach(item => {
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function updateAccountPage() {
    if (!currentUser) return;
    
    // Update user info on account page
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('user-uid').textContent = currentUser.uid;
    document.getElementById('user-balance').textContent = `₹ ${currentUser.balance}`;
    
    // Set avatar initials
    const initials = currentUser.username.substring(0, 2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
}

// Check if user is logged in
function checkAuthStatus() {
    const savedUser = localStorage.getItem('bc99_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAccountPage();
        showPage('home-page');
    } else {
        showPage('auth-page');
    }
}

// Event Listeners
function setupEventListeners() {
    // Tab switching
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });
    
    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginTab.click();
    });
    
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerTab.click();
    });
    
    // Login form
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Mock login - in a real app, this would call an API
        if (username && password) {
            // Create mock user object
            currentUser = {
                id: 1,
                uid: Math.floor(10000 + Math.random() * 90000).toString(),
                username: username,
                balance: '1000.00',
                mobile: '1234567890'
            };
            
            // Save to localStorage
            localStorage.setItem('bc99_user', JSON.stringify(currentUser));
            
            // Update UI and navigate to home
            updateAccountPage();
            showPage('home-page');
        }
    });
    
    // Register form
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const mobile = document.getElementById('register-mobile').value;
        
        // Mock registration - in a real app, this would call an API
        if (username && password && mobile) {
            // Create mock user object
            currentUser = {
                id: 1,
                uid: Math.floor(10000 + Math.random() * 90000).toString(),
                username: username,
                balance: '1000.00',
                mobile: mobile
            };
            
            // Save to localStorage
            localStorage.setItem('bc99_user', JSON.stringify(currentUser));
            
            // Update UI and navigate to home
            updateAccountPage();
            showPage('home-page');
        }
    });
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (currentUser) {
                showPage(item.dataset.page);
            }
        });
    });
    
    // Logout
    logoutBtn.addEventListener('click', () => {
        // Clear user data
        currentUser = null;
        localStorage.removeItem('bc99_user');
        
        // Redirect to auth page
        showPage('auth-page');
    });
}

// Game functionality
function setupGameEvents() {
    const playButtons = document.querySelectorAll('.game-card .btn');
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const gameName = e.target.closest('.game-card').querySelector('h3').textContent;
            alert(`Game "${gameName}" will be available soon!`);
        });
    });
    
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.querySelector('h3').textContent;
            alert(`Game "${gameName}" will be available soon!`);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupGameEvents();
    checkAuthStatus();
});