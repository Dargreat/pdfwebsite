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