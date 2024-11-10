// Function to handle the search
function searchPDFs() {
    const query = document.getElementById('searchQuery').value.trim(); // Get search query and trim any extra spaces
    if (query !== "") { // Check if the input is not empty
      // Redirect to the Browse PDFs page with the query parameter
      window.location.href = `#browse-pdfs?search=${encodeURIComponent(query)}`;
    } else {
      alert("Please enter a search term!"); // Show an alert if the input is empty
    }
  }

  function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');
  
    // Toggle the display of the answer
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
  
    // Toggle the arrow direction
    arrow.classList.toggle('up');
  }
  
  
  