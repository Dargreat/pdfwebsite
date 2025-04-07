const backendUrl = 'https://dargreat.vercel.app';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

// Function to fetch PDFs from Firestore
async function fetchPDFs() {
    try {
        const response = await fetch(`${backendUrl}/api/pdf`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch PDFs');
        }
        
        const pdfs = await response.json();
        
        if (pdfs.length === 0) {
            displayNoPDFsFound();
        } else {
            renderPDFs(pdfs);
        }
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        displayNoPDFsFound();
    }
}

// Function to display a message when no PDFs are found
function displayNoPDFsFound() {
    const pdfList = document.getElementById('pdf-list');
    pdfList.innerHTML = '<p>No PDFs available at the moment.</p>';
}

// Function to render PDFs with thumbnails
function renderPDFs(pdfs) {
    const pdfList = document.getElementById('pdf-list');
    pdfList.innerHTML = ''; // Clear previous PDFs

    pdfs.forEach(pdf => {
        const pdfElement = document.createElement('div');
        pdfElement.classList.add('pdf-item');
        
        const title = document.createElement('h3');
        title.innerText = pdf.title;
        
        const thumbnail = document.createElement('canvas');
        thumbnail.classList.add('pdf-thumbnail'); // Add styling class
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pdf.url;
        downloadLink.target = '_blank';
        downloadLink.innerText = 'Download';
        downloadLink.classList.add('download-button');

        pdfElement.appendChild(thumbnail); // Add canvas (thumbnail)
        pdfElement.appendChild(title);
        pdfElement.appendChild(downloadLink);
        pdfList.appendChild(pdfElement);

        // Render the thumbnail using PDF.js
        renderPDFThumbnail(pdf.url, thumbnail);
    });
}

// Function to render the first page of a PDF as a thumbnail using PDF.js
async function renderPDFThumbnail(pdfUrl, canvas) {
    try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1); // Render the first page

        const viewport = page.getViewport({ scale: 0.5 }); // Scale the thumbnail
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext).promise;
    } catch (error) {
        console.error('Error rendering PDF thumbnail:', error);
    }
}

// Function to filter PDFs based on search input (search bar or URL parameter)
function searchPDFs(query) {
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        if (title.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Function to get the search query from URL parameters
function getSearchQueryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('search');  // Returns the value of 'search' parameter
}

// Fetch and display PDFs when the page loads
window.onload = async function() {
    // Fetch and display PDFs
    await fetchPDFs();

    // If there is a search query in the URL, trigger the search
    const searchQuery = getSearchQueryFromURL();
    if (searchQuery) {
        searchPDFs(searchQuery.toLowerCase());
    }
};

