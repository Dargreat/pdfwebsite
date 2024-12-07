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

    const title = document.getElementById('pdfTitle').value;
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
        // Check file size (10 MB = 10 * 1024 * 1024 bytes)
        const maxFileSize = 10 * 1024 * 1024;
        if (file.size > maxFileSize) {
            alert("File size exceeds 10 MB. Splitting PDF into smaller chunks...");
            await splitAndUploadPDF(file, title);
        } else {
            await uploadPDF(file, title); // Regular upload for small files
        }

        fileInput.value = ""; // Clear input field
        fetchAndDisplayPDFs();
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Upload a single PDF file
async function uploadPDF(file, title) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    const response = await fetch(`${backendUrl}/api/pdf/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to upload PDF");
    }

    alert(`Uploaded: ${title}`);
}

// Split large PDFs and upload each chunk
async function splitAndUploadPDF(file, title) {
    const pdfData = await toBase64(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: atob(pdfData.split(',')[1]) }).promise;

    for (let i = 0; i < pdfDoc.numPages; i += 10) { // Split every 10 pages
        const chunkTitle = `${title} (Part ${Math.floor(i / 10) + 1})`;
        const chunk = await extractPDFPages(pdfDoc, i, i + 10);
        await uploadPDF(chunk, chunkTitle);
    }
}

// Extract a range of pages from a PDF
async function extractPDFPages(pdfDoc, start, end) {
    const pdfWriter = await PDFLib.PDFDocument.create();
    const totalPages = pdfDoc.numPages;

    for (let i = start; i < Math.min(end, totalPages); i++) {
        const [page] = await pdfWriter.copyPages(pdfDoc, [i]);
        pdfWriter.addPage(page);
    }

    const pdfBytes = await pdfWriter.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

// Function to convert file to Base64
const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

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
};
