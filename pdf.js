// Function to handle the search
function searchPDFs() {
    const query = document.getElementById('searchQuery').value.trim(); // Get search query and trim any extra spaces
    if (query !== "") { // Check if the input is not empty
        // Redirect to the Browse PDFs page with the query parameter
        // This assumes that your browse page reads the URL parameter and handles the search
        window.location.href = `browse.html?search=${encodeURIComponent(query)}`;
    } else {
        alert("Please enter a search term!"); // Show an alert if the input is empty
    }
}

// Toggle the FAQ answer display and arrow direction
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');

    // Toggle the display of the answer using classList for better flexibility
    answer.classList.toggle('show'); // Assuming 'show' class sets display: block;
    
    // Toggle the arrow direction
    arrow.classList.toggle('up');
}

var menu = document.getElementById("menu");

// Show menu
function showMenu() {
    menu.style.right = "0"; // Slide the menu in
}

// Hide menu
function hideMenu() {
    menu.style.right = "-200px"; // Slide the menu out
}



  
  
