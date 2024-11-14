const backendUrl = 'https://dargreat.vercel.app';

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
function renderPDFs(pdfs) {
    const pdfList = document.getElementById('pdf-list');
    pdfList.innerHTML = ''; // Clear previous PDFs

    pdfs.forEach(pdf => {
        const pdfElement = document.createElement('div');
        pdfElement.classList.add('pdf-item');
        
        const title = document.createElement('h3');
        title.innerText = pdf.title;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pdf.downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.innerText = 'Download';
        downloadLink.classList.add('download-button');
        
        pdfElement.appendChild(title);
        pdfElement.appendChild(downloadLink);
        pdfList.appendChild(pdfElement);
    });
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
