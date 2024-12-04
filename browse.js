const backendUrl = 'https://dargreat.vercel.app';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

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

// Function to render PDFs on the page
async function renderPDFs(pdfs) {
    const pdfListContainer = document.getElementById('pdfList');
    pdfListContainer.innerHTML = ''; // Clear existing PDFs

    for (const pdf of pdfs) {
        const pdfElement = document.createElement('div');
        pdfElement.classList.add('pdf-item');

        // Create a canvas for the thumbnail
        const canvas = document.createElement('canvas');
        canvas.classList.add('pdf-thumbnail'); // Add the class here
        const context = canvas.getContext('2d');

        // Generate the thumbnail using PDF.js
        try {
            const loadingTask = pdfjsLib.getDocument(pdf.url); // Load the PDF
            const pdfDoc = await loadingTask.promise;
            const page = await pdfDoc.getPage(1); // Get the first page
            const viewport = page.getViewport({ scale: 0.3 }); // Scale for the thumbnail

            // Set canvas dimensions
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render the first page into the canvas
            await page.render({ canvasContext: context, viewport: viewport }).promise;
        } catch (error) {
            console.error('Error generating thumbnail for PDF:', error);
        }

        // Add the title, thumbnail, and download button
        pdfElement.innerHTML = `
            <h3>${pdf.title}</h3>
            <a href="${pdf.url}" download="${pdf.title}" class="download-button">Download</a>
        `;
        pdfElement.prepend(canvas); // Add the thumbnail above the title and button

        pdfListContainer.appendChild(pdfElement);
    }
}

// Function to filter PDFs based on search input
function searchPDFs() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    
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

// Fetch and display PDFs when the page loads
window.onload = fetchPDFs;
