// Global variables
let currentUser = null;
let games = [];
let currentGameId = null;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth forms
    initAuthForms();
    
    // Check if user is already logged in
    checkLoggedInStatus();
    
    // Load games
    loadGames();
});

// Authentication functions
function initAuthForms() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Validate input
        if (!username || !password) {
            showMessage('login-message', 'Please enter both username and password', 'error');
            return;
        }
        
        // Submit login request
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.includes('Invalid')) {
                showMessage('login-message', data.message, 'error');
            } else {
                // Login successful
                currentUser = data;
                showAuthenticatedUI();
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showMessage('login-message', 'An error occurred. Please try again.', 'error');
        });
    });
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        // Validate input
        if (!username || !password || !confirm) {
            showMessage('register-message', 'Please fill out all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            showMessage('register-message', 'Passwords do not match', 'error');
            return;
        }
        
        // Submit registration request
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showMessage('register-message', data.message, 'error');
            } else {
                // Registration successful
                currentUser = data;
                showAuthenticatedUI();
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showMessage('register-message', 'An error occurred. Please try again.', 'error');
        });
    });
}

function showAuthTab(tab) {
    // Hide all forms
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    
    // Remove active class from all tabs
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.remove('active');
    
    // Show selected form and activate tab
    document.getElementById(`${tab}-form`).classList.remove('hidden');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    // Clear messages
    document.getElementById('login-message').textContent = '';
    document.getElementById('register-message').textContent = '';
}

function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `auth-message ${type}`;
}

function checkLoggedInStatus() {
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Not logged in, show auth forms
                    showUnauthenticatedUI();
                    return null;
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                // User is logged in
                currentUser = data;
                showAuthenticatedUI();
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            showUnauthenticatedUI();
        });
}

function showAuthenticatedUI() {
    // Hide auth section and show main content
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    
    // Update user info display
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('username-display').textContent = `User: ${currentUser.username}`;
    document.getElementById('balance-display').textContent = `Balance: ${formatCurrency(currentUser.balance)}`;
    
    // Update account section
    document.getElementById('account-username').textContent = currentUser.username;
    const createdDate = new Date(currentUser.created_at).toLocaleDateString();
    document.getElementById('account-created').textContent = createdDate;
    
    // Update wallet section
    document.getElementById('wallet-balance').textContent = formatCurrency(currentUser.balance);
    
    // Navigate to home by default
    navigate('home');
    
    // Load activity
    loadGameHistory();
}

function showUnauthenticatedUI() {
    // Show auth section and hide main content
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    
    // Hide all section content
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show login tab by default
    showAuthTab('login');
}

function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            showUnauthenticatedUI();
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        });
}

// Game functions
function loadGames() {
    fetch('/api/games')
        .then(response => response.json())
        .then(data => {
            games = data;
            renderGames();
        })
        .catch(error => {
            console.error('Error loading games:', error);
            
            // Fallback to static games for demonstration
            games = [
                { id: 1, name: 'BC99 Wingo', image_path: 'attached_assets/wingo.png' },
                { id: 2, name: 'BC99 Aviator', image_path: 'attached_assets/avaitor.png' },
                { id: 3, name: 'BC99 Slots', image_path: 'attached_assets/slots.png' }
            ];
            renderGames();
        });
}

function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.onclick = () => playGame(game.id);
        
        gameCard.innerHTML = `
            <h2>${game.name}</h2>
            <div class="game-logo">
                <img src="${game.image_path}" alt="${game.name}">
            </div>
            <button class="play-button">Play</button>
        `;
        
        container.appendChild(gameCard);
    });
}

function playGame(gameId) {
    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to play games.');
        return;
    }
    
    // Find game details
    const game = games.find(g => g.id === gameId);
    if (!game) {
        alert('Game not found.');
        return;
    }
    
    // Set current game and show modal
    currentGameId = gameId;
    document.getElementById('modal-game-name').textContent = game.name;
    document.getElementById('game-result').classList.add('hidden');
    document.getElementById('game-modal').classList.remove('hidden');
}

function placeBet() {
    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    
    // Validate bet amount
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Please enter a valid bet amount.');
        return;
    }
    
    if (betAmount > currentUser.balance) {
        alert('Insufficient balance for this bet.');
        return;
    }
    
    // Submit bet to server
    fetch('/api/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId: currentGameId, betAmount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message && !data.success) {
            alert(data.message);
            return;
        }
        
        // Update user balance
        currentUser.balance = data.newBalance;
        document.getElementById('balance-display').textContent = `Balance: ${formatCurrency(currentUser.balance)}`;
        document.getElementById('wallet-balance').textContent = formatCurrency(currentUser.balance);
        
        // Show game result
        const resultElement = document.getElementById('game-result');
        resultElement.classList.remove('hidden');
        
        document.getElementById('result-message').textContent = data.message;
        document.getElementById('winnings').textContent = data.isWin 
            ? `You won ${formatCurrency(data.winAmount)}!` 
            : 'Better luck next time!';
        
        // Update game history if on activity tab
        if (document.getElementById('activity-section').classList.contains('visible')) {
            loadGameHistory();
        }
    })
    .catch(error => {
        console.error('Game play error:', error);
        alert('An error occurred. Please try again.');
    });
}

function closeModal() {
    document.getElementById('game-modal').classList.add('hidden');
}

// Activity and Wallet functions
function loadGameHistory() {
    if (!currentUser) return;
    
    fetch('/api/history')
        .then(response => response.json())
        .then(data => {
            renderGameHistory(data);
        })
        .catch(error => {
            console.error('Error loading game history:', error);
        });
}

function renderGameHistory(history) {
    const activityList = document.getElementById('activity-list');
    const transactionList = document.getElementById('transaction-list');
    
    // Clear previous content
    activityList.innerHTML = '';
    transactionList.innerHTML = '';
    
    if (history.length === 0) {
        activityList.innerHTML = '<p class="empty-message">No recent activity to display.</p>';
        transactionList.innerHTML = '<p class="empty-message">No transactions to display.</p>';
        return;
    }
    
    // Populate activity list
    history.forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const isWin = item.win_amount > item.bet_amount;
        const result = isWin ? 'Won' : 'Lost';
        const resultClass = isWin ? 'win' : 'loss';
        
        activityItem.innerHTML = `
            <p>
                <strong>${item.game_name}</strong> - 
                <span class="${resultClass}">${result} ${formatCurrency(Math.abs(item.win_amount - item.bet_amount))}</span>
            </p>
            <p class="activity-date">${new Date(item.played_at).toLocaleString()}</p>
        `;
        
        activityList.appendChild(activityItem);
        
        // Also add to transaction list
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        const amount = item.win_amount - item.bet_amount;
        const amountClass = amount >= 0 ? 'positive' : 'negative';
        
        transactionItem.innerHTML = `
            <p>
                <strong>${item.game_name}</strong> - 
                <span class="${amountClass}">${amount >= 0 ? '+' : ''}${formatCurrency(amount)}</span>
            </p>
            <p class="transaction-date">${new Date(item.played_at).toLocaleString()}</p>
        `;
        
        transactionList.appendChild(transactionItem);
    });
}

function showDepositModal() {
    alert('Deposit functionality is coming soon!');
}

// Navigation function
function navigate(section) {
    console.log(`Navigating to ${section}`);
    
    // Remove active class from all navigation items
    const navItems = document.querySelectorAll('.bottom-nav li');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to the clicked navigation item
    const currentNavItem = document.querySelector(`.bottom-nav li a[onclick="navigate('${section}')"]`).parentElement;
    currentNavItem.classList.add('active');
    
    // Hide all section content
    document.getElementById('main-content').classList.add('hidden');
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    if (section === 'home') {
        document.getElementById('main-content').classList.remove('hidden');
    } else {
        document.getElementById(`${section}-section`).classList.remove('hidden');
        document.getElementById(`${section}-section`).classList.add('visible');
        
        // Load section specific data
        if (section === 'activity') {
            loadGameHistory();
        }
    }
}

// Utility functions
function formatCurrency(amount) {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });
}