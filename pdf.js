// JavaScript to handle the menu toggle functionality
  function showMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'block'; // Show the menu when the hamburger icon is clicked
  }

  function hideMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'none'; // Hide the menu when the close icon is clicked
  }
  // Capture the Enter key and redirect to browse.html with search query
  function handleSearch(event) {
    if (event.key === 'Enter') {
      let searchQuery = document.getElementById("searchQuery").value;
      if (searchQuery) {
        // Redirect to browse.html and append the search query as a URL parameter
        window.location.href = `browse.html?search=${encodeURIComponent(searchQuery)}`;
      }
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



  
  
