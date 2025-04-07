
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


  
  
