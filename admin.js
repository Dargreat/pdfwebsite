// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// Backend URL configuration
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';
let token = '';

// Initialize on page load
window.onload = function () {
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

// Handle PDF upload
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('pdfTitle').value;
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF to upload.");
        return;
    }

    // Check if the file is a valid PDF
    if (file.type !== 'application/pdf') {
        alert("Only PDF files are allowed.");
        return;
    }

    try {
        // Split and upload the PDF in chunks
        await splitAndUploadPDF(file, title);
        fileInput.value = "";
        fetchAndDisplayPDFs(); // Refresh PDF list after upload
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Split and upload PDF
async function splitAndUploadPDF(file, title) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        console.log(`PDF loaded: ${pdfDoc.numPages} pages.`);

        // Split into chunks of 10 pages and upload each
        for (let i = 0; i < pdfDoc.numPages; i += 10) {
            const chunkTitle = `${title} (Part ${Math.floor(i / 10) + 1})`;
            console.log(`Extracting pages ${i + 1} to ${Math.min(i + 10, pdfDoc.numPages)} for ${chunkTitle}.`);

            const chunkBlob = await extractPDFPages(pdfDoc, i, i + 10);
            console.log(`Chunk created: ${chunkTitle}. Uploading...`);

            await uploadPDF(chunkBlob, chunkTitle);
            console.log(`Successfully uploaded ${chunkTitle}.`);
        }
    } catch (error) {
        console.error("Error during PDF splitting and uploading:", error);
        throw error;
    }
}

// Extract specific pages from PDF
async function extractPDFPages(pdfDoc, start, end) {
    try {
        const pdfWriter = await PDFLib.PDFDocument.create();

        for (let i = start; i < Math.min(end, pdfDoc.numPages); i++) {
            const page = await pdfDoc.getPage(i + 1); // pdf.js is 1-indexed
            const [pdfPage] = await pdfWriter.copyPages(page, [0]);
            pdfWriter.addPage(pdfPage);
        }

        const pdfBytes = await pdfWriter.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
        console.error("Error during PDF page extraction:", error);
        throw error;
    }
}

// Upload PDF chunk to backend
async function uploadPDF(file, title) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
        const response = await fetch(`${backendUrl}/api/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to upload PDF chunk.");
        }
        console.log(`Upload successful for: ${title}`);
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

// Fetch and display PDFs
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch(`${backendUrl}/api/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
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

// Delete a PDF
async function deletePDF(pdfId) {
    if (!confirm("Are you sure you want to delete? It can't be recovered unless re-uploaded.")) {
        return;
    }

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
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}
