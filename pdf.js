
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
