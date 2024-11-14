// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

const backendUrl = 'https://dargreat.vercel.app';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6eyJpZCI6IjY3MzBlZTRhZWIyODUzMGY5YjI2ZTgxYiJ9LCJpYXQiOjE3MzEyODMzMjUsImV4cCI6MTczMTM2OTcyNX0.RxOkhKtRW9C4Wvd2DuORPfiisxrR2vms-khjdjQnUV0';

// Fetch and display PDFs on page load
// document.addEventListener('DOMContentLoaded', fetchAndDisplayPDFs);

// Handle PDF upload
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

    // Convert the file to Base64
    const fileBase64 = await toBase64(file);

    // Create the request payload
    const payload = {
        title,
        pages: pages ? parseInt(pages, 10) : null,
        pdfImageBase64: fileBase64
    };

    try {
        const response = await fetch(`${backendUrl}/api/pdf/upload `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF uploaded successfully!");
            fileInput.value = ""; // Clear the input
            fetchAndDisplayPDFs(); // Refresh the PDF list
        } else {

            alert(`Error: ${result.message}`);
        }
        console.log(result);
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Helper function to convert file to Base64
const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Get only Base64 part
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
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
}
