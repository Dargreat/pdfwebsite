// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// Backend URL configuration
const backendUrl = 'https://backend-for-dragreat.onrender.com'; // Active backend
let token = ''; // Authentication token

// Handle PDF upload
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

    // Validate file type
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
            formData.append('title', `${title} - Part ${i + 1}`); // Append chunk info to title
            formData.append('pages', pages);
            formData.append('file', chunkBlob);

            const response = await fetch(`${backendUrl}/api/pdf/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Chunk ${i + 1} uploaded successfully!`);
            } else {
                console.error(`Error uploading chunk ${i + 1}:`, result.message);
                throw new Error(`Chunk ${i + 1} failed to upload.`);
            }
        }

        // Reset input fields and reload the list
        fileInput.value = "";
        fetchAndDisplayPDFs();
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Function to split PDF into chunks using pdf-lib
async function splitPDFIntoChunks(file, chunkSize) {
    const { PDFDocument } = PDFLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPages().length;

    const chunks = [];
    let currentChunk = await PDFDocument.create();
    let currentSize = 0;

    for (let i = 0; i < totalPages; i++) {
        const [page] = await currentChunk.copyPages(pdfDoc, [i]);
        currentChunk.addPage(page);

        const chunkBytes = await currentChunk.save(); // Save the current chunk to calculate size
        currentSize = chunkBytes.byteLength;

        // If chunk exceeds size limit, finalize and start a new chunk
        if (currentSize >= chunkSize || i === totalPages - 1) {
            chunks.push(chunkBytes);
            currentChunk = await PDFDocument.create(); // Create a new chunk
            currentSize = 0;
        }
    }

    return chunks;
}

// Delete a PDF
async function deletePDF(pdfId) {
    const confirmDelete = confirm("Are you sure you want to delete? It can't be recovered unless re-uploaded.");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${backendUrl}/api/pdf/delete/${pdfId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF deleted successfully!");
            fetchAndDisplayPDFs();
        } else {
            console.error("Error deleting PDF:", result.message);
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}

// Fetch and display PDFs
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch(`${backendUrl}/api/pdf`);
        if (!response.ok) {
            throw new Error('Failed to fetch PDFs');
        }
        const pdfs = await response.json();

        pdfs.forEach((pdf) => {
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

// Initialize page and check auth token
window.onload = function () {
    (() => {
        let localToken = localStorage.getItem('authToken');
        if (!localToken) {
            alert('Invalid or expired auth token');
            window.location.href = '/login.html';
            return;
        }
        token = localToken;
    })();

    fetchAndDisplayPDFs();
};
