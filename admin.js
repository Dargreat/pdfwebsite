// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// const backendUrl = 'https://dargreat.vercel.app';
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';
let token = '';

// Upload form event listener
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('pdfTitle').value;
    const pages = document.getElementById('pages').value;
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
            formData.append('title', `${title} - Chunk ${i + 1}`);
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
                alert("PDF chunk uploaded successfully!");
            } else {
                alert(`Error: ${result.message}`);
            }
        }

        fileInput.value = "";
        fetchAndDisplayPDFs();
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Function to split PDF file into chunks of a specific size (in bytes)
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
        console.log(pdfs);

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
}
