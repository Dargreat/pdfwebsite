// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// const backendUrl = 'https://dargreat.vercel.app';
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';
let token = '';

// Fetch and display PDFs on page load
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('pdfTitle').value.trim();
    const pages = document.getElementById('pages').value.trim();
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF to upload.");
        return;
    }

    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
        alert("Only PDF files are allowed.");
        return;
    }

    try {
        // Split the PDF into chunks
        const chunks = await splitPDFIntoChunks(file, 10 * 1024 * 1024); // 10 MB per chunk

        // Upload each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunkBlob = new Blob([chunks[i]], { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('title', `${title} (${i + 1})`); // Dynamic chunk naming
            formData.append('pages', pages);
            formData.append('file', chunkBlob);

            // Send the form data to the backend
            const response = await fetch(`${backendUrl}/api/pdf/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Authorization header
                },
                body: formData, // FormData object
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Chunk ${i + 1} uploaded successfully!`);
            } else {
                alert(`Error uploading chunk ${i + 1}: ${result.message}`);
            }
        }

        fileInput.value = "";
        fetchAndDisplayPDFs();
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Function to split PDF file into chunks of a specific size (in bytes) using pdf-lib
async function splitPDFIntoChunks(file, chunkSize) {
    const { PDFDocument } = PDFLib; // Ensure pdf-lib is loaded
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPages().length;

    const chunks = [];
    let currentChunk = await PDFDocument.create(); // Create a new PDF for each chunk
    let currentSize = 0;

    for (let i = 0; i < totalPages; i++) {
        const [page] = await currentChunk.copyPages(pdfDoc, [i]); // Copy the page to the new chunk
        currentChunk.addPage(page);
        currentSize += page.size;

        // If the chunk exceeds the specified size, save it and start a new one
        if (currentSize >= chunkSize) {
            const chunkBytes = await currentChunk.save();
            chunks.push(chunkBytes);
            currentChunk = await PDFDocument.create(); // Start a new chunk
            currentSize = 0;
        }
    }

    // Add remaining pages to the last chunk
    if (currentSize > 0) {
        const chunkBytes = await currentChunk.save();
        chunks.push(chunkBytes);
    }

    return chunks;
}

// Delete a PDF
async function deletePDF(pdfId) {
    if (!confirm("Are you sure you want to delete? It can't be recovered unless re-uploaded.")) {
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/api/pdf/delete/${pdfId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF deleted successfully!");
            fetchAndDisplayPDFs();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}

// Fetch PDFs from backend and display them
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch(`${backendUrl}/api/pdf`);
        if (!response.ok) {
            throw new Error('Failed to fetch PDFs');
        }
        const pdfs = await response.json();

        pdfs.forEach(pdf => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${pdf.title}</span>
                <button onclick="deletePDF('${pdf._id}')">Delete</button>
            `;

            pdfList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Failed to fetch PDFs:", error);
        alert("Unable to load PDFs. Please refresh the page.");
    }
}

// Load PDFs and check authentication token on page load
window.onload = function() {
    fetchAndDisplayPDFs();
    (() => {
        let localToken = localStorage.getItem('authToken');
        if (!localToken || localToken == null || localToken == undefined) {
            alert('Invalid or expired auth token');
            window.location.href = '/login.html';
            return;
        }
        token = localToken;
    })();
};
