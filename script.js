// Function to handle game play button clicks
function playGame(gameId) {
    console.log(`Playing ${gameId} game`);
    // You would add game launch logic here
    alert(`Starting ${gameId} game!`);
}

// Function to handle navigation
function navigate(section) {
    console.log(`Navigating to ${section}`);
    
    // Remove active class from all navigation items
    const navItems = document.querySelectorAll('.bottom-nav li');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to the clicked navigation item
    const currentNavItem = document.querySelector(`.bottom-nav li a[onclick="navigate('${section}')"]`).parentElement;
    currentNavItem.classList.add('active');
    
    // You would add actual navigation logic here
    // For now, just show which section was clicked
    if (section !== 'home') {
        alert(`Navigating to ${section} section. This feature is coming soon!`);
    }
}

// Add animation effects to game cards
document.addEventListener('DOMContentLoaded', function() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        // Add subtle animation when hovering over game cards
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
});