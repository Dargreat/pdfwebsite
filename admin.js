// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// Backend URL
const backendUrl = 'https://backend-for-dragreat.onrender.com';
let token = '';

// Fetch and display PDFs on page load
window.onload = function () {
    fetchAndDisplayPDFs();

    // Validate and set the auth token
    (() => {
        const localToken = localStorage.getItem('authToken');
        if (!localToken) {
            alert('Invalid or expired auth token');
            window.location.href = '/login.html';
            return;
        }
        token = localToken;
    })();
};

// Upload form submit handler
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

    if (file.type !== 'application/pdf') {
        alert("Only PDF files are allowed.");
        return;
    }

    try {
        // Use 9MB per chunk to account for metadata
        const chunks = await splitPDFIntoChunks(file, 9 * 1024 * 1024);

        for (let i = 0; i < chunks.length; i++) {
            const chunkBlob = new Blob([chunks[i]], { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('title', `${title} (Part ${i + 1})`);
            formData.append('pages', pages);
            formData.append('file', chunkBlob);

            const response = await fetch(`${backendUrl}/api/pdf/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const result = await response.json();
                console.error(`Error uploading chunk ${i + 1}: ${result.message}`);
                throw new Error(result.message);
            }

            console.log(`Chunk ${i + 1} uploaded successfully.`);
        }

        alert("PDF uploaded successfully!");
        fileInput.value = "";
        fetchAndDisplayPDFs(); // Refresh the PDF list immediately
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Split PDF file into chunks of a specific size (in bytes)
async function splitPDFIntoChunks(file, chunkSize) {
    const arrayBuffer = await file.arrayBuffer();
    const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);

    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, arrayBuffer.byteLength);
        const chunk = arrayBuffer.slice(start, end);
        chunks.push(chunk);
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
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const result = await response.json();
            console.error(`Error deleting PDF: ${result.message}`);
            throw new Error(result.message);
        }

        alert("PDF deleted successfully!");
        fetchAndDisplayPDFs(); // Refresh the PDF list immediately
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}

// Fetch PDFs from backend and display them
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = '<li>Loading PDFs...</li>'; // Show loading message

    try {
        const response = await fetch(`${backendUrl}/api/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch PDFs');
        }

        const pdfs = await response.json();
        pdfList.innerHTML = ''; // Clear loading message

        if (pdfs.length === 0) {
            pdfList.innerHTML = '<li>No PDFs uploaded yet.</li>';
            return;
        }

        pdfs.forEach((pdf, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${index + 1}. ${pdf.title}</span>
                <button onclick="deletePDF('${pdf._id}')">Delete</button>
            `;
            pdfList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Failed to fetch PDFs:", error);
        pdfList.innerHTML = '<li>Error loading PDFs. Please try again later.</li>';
    }
}
