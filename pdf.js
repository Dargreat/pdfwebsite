// Navbar Mobile Toggle
function showMenu() {
    const menu = document.getElementById("menu");
    menu.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function hideMenu() {
    const menu = document.getElementById("menu");
    menu.classList.remove("active");
    document.body.style.overflow = "auto"; // Restore scrolling
}

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById("menu");
    const hamburger = document.querySelector('.fa-bars');
    
    if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
        hideMenu();
    }
});

// Your original unchanged code below
// Capture the Enter key and redirect to browse.html with search query
function handleSearch(event) {
    if (event.key === 'Enter') {
        let searchQuery = document.getElementById("searchQuery").value;
        if (searchQuery) {
            window.location.href = `browse.html?search=${encodeURIComponent(searchQuery)}`;
        }
    }
}

// Toggle the FAQ answer display and arrow direction
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');
    answer.classList.toggle('show');
    arrow.classList.toggle('up');
}
