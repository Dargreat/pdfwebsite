<script>
// Menu Toggle Functions
function showMenu() {
    document.getElementById("menu").classList.add("active");
}

function hideMenu() {
    document.getElementById("menu").classList.remove("active");
}

// Search Functionality
function handleSearch(event) {
    if (event.key === "Enter") {
        const searchQuery = document.getElementById("searchQuery").value;
        if (searchQuery.trim()) {
            window.location.href = `browse.html?query=${encodeURIComponent(searchQuery.trim())}`;
        }
    }
}

// FAQ Toggle Function
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');
    
    // Toggle answer visibility
    answer.classList.toggle('active');
    
    // Toggle arrow rotation
    arrow.classList.toggle('rotated');
    
    // Smooth height transition
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
    } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
    }
}
</script>
