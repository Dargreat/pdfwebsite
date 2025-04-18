// const backendUrl = 'https://dargreat.vercel.app';
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';


// Main function to load and display PDFs
async function loadPDFs() {
    try {
        const pdfs = await fetchPDFs();
        renderPDFs(pdfs);
    } catch (error) {
        console.error('Failed to load PDFs:', error);
        document.getElementById('pdf-list').innerHTML = 
            '<p class="error">Failed to load PDFs. Please try again later.</p>';
    }
}

// Fetch PDF data from backend
async function fetchPDFs() {
    const response = await fetch(`${backendUrl}/api/pdf`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
}

// Render PDF thumbnails
function renderPDFs(pdfs) {
    const container = document.getElementById('pdf-list');
    
    if (!pdfs || pdfs.length === 0) {
        container.innerHTML = '<p class="empty">No PDFs available at this time.</p>';
        return;
    }

    container.innerHTML = ''; // Clear previous content

    pdfs.forEach((pdf, index) => {
        const pdfElement = createPDFElement(pdf, index);
        container.appendChild(pdfElement);
    });
}

// Create individual PDF element with iframe preview
function createPDFElement(pdf, index) {
    const pdfElement = document.createElement('div');
    pdfElement.className = 'pdf-item';
    pdfElement.dataset.id = `pdf-${index}`;

    const title = document.createElement('h3');
    title.textContent = pdf.title || `Document ${index + 1}`;
    pdfElement.appendChild(title);

    const previewsContainer = document.createElement('div');
    previewsContainer.className = 'previews-container';

    pdf.urls.forEach((url, urlIndex) => {
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'preview-wrapper';

        // Create iframe for PDF preview
        const iframe = document.createElement('iframe');
        iframe.src = `${url}#view=fitH&toolbar=0&navpanes=0`;
        iframe.className = 'pdf-preview';
        iframe.title = `Preview of ${pdf.title || 'PDF'} ${urlIndex + 1}`;
        iframe.setAttribute('loading', 'lazy');
        
        // Fallback for iframes that don't load
        iframe.onerror = () => {
            iframe.replaceWith(createFallbackElement(url, pdf.title, urlIndex));
        };

        previewWrapper.appendChild(iframe);
        previewWrapper.appendChild(createDownloadButton(url, pdf.title, urlIndex));
        previewsContainer.appendChild(previewWrapper);
    });

    pdfElement.appendChild(previewsContainer);
    return pdfElement;
}

// Create fallback element when iframe fails
function createFallbackElement(url, title, index) {
    const fallback = document.createElement('div');
    fallback.className = 'pdf-fallback';
    
    const icon = document.createElement('div');
    icon.className = 'pdf-icon';
    icon.innerHTML = '📄';
    
    const text = document.createElement('p');
    text.textContent = 'PDF Preview';
    
    fallback.appendChild(icon);
    fallback.appendChild(text);
    fallback.onclick = () => window.open(url, '_blank');
    
    return fallback;
}

// Create download button
function createDownloadButton(url, title, index) {
    const button = document.createElement('button');
    button.className = 'download-btn';
    button.textContent = `Download ${index + 1}`;
    
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        await downloadPDF(url, `${title || 'document'}-${index + 1}.pdf`);
    });
    
    return button;
}

// Download PDF function
async function downloadPDF(url, filename) {
    try {
        const button = event.target;
        const originalText = button.textContent;
        
        // Update button state
        button.disabled = true;
        button.textContent = 'Downloading...';
        
        // Fetch the PDF
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to download');
        
        // Create download
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            button.textContent = originalText;
            button.disabled = false;
        }, 100);
    } catch (error) {
        console.error('Download failed:', error);
        event.target.textContent = 'Error! Try again';
        setTimeout(() => {
            event.target.textContent = 'Download';
            event.target.disabled = false;
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadPDFs);


// Enhanced Search Functionality
function searchPDFs() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    
    if (query === "") {
        // If search is empty, show all PDFs
        displayAllPDFs();
        return;
    }

    // Get all PDF items
    const pdfItems = document.querySelectorAll('.pdf-item');
    let foundResults = false;

    pdfItems.forEach(item => {
        const pdfName = item.querySelector('h3').textContent.toLowerCase();
        const pdfCourse = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        
        // Check if query matches name or course
        if (pdfName.includes(query) || pdfCourse.includes(query)) {
            item.style.display = 'flex'; // Show matching items
            foundResults = true;
        } else {
            item.style.display = 'none'; // Hide non-matching items
        }
    });

    // Show "no results" message if nothing found
    const noResultsMsg = document.getElementById('no-results');
    if (!foundResults) {
        if (!noResultsMsg) {
            const msg = document.createElement('p');
            msg.id = 'no-results';
            msg.className = 'no-results';
            msg.textContent = 'No matching PDFs found';
            document.getElementById('pdf-list').appendChild(msg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Function to display all PDFs (used when clearing search)
function displayAllPDFs() {
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        item.style.display = 'flex';
    });
    
    const noResultsMsg = document.getElementById('no-results');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Toggle FAQ answer function (unchanged from your original)
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');

    // Toggle the display of the answer
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    
    // Rotate arrow icon
    if (arrow) {
        arrow.style.transform = answer.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0)';
    }
}

// Add event listener for search input with debounce
let searchTimer;
document.getElementById('search-bar').addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(searchPDFs, 300); // 300ms delay after typing stops
});

// Handle URL search parameter on page load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        document.getElementById('search-bar').value = searchParam;
        searchPDFs();
    }
});
