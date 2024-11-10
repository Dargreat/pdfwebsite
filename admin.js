// admin.js

// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// Fetch and display PDFs on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayPDFs);

// Handle PDF upload
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const file = pdfInput.files[0];
    if (!file) {
        alert("Please select a PDF to upload.");
        return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const response = await fetch('/api/pdfs/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF uploaded successfully!");
            pdfInput.value = ""; // Clear the input
            fetchAndDisplayPDFs(); // Refresh the PDF list
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

// Fetch PDFs from backend and display them
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch('/api/pdfs');
        const pdfs = await response.json();

        pdfs.forEach(pdf => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${pdf.title}</span>
                <button onclick="deletePDF('${pdf.id}')">Delete</button>
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
        const response = await fetch(`/api/pdfs/${pdfId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF deleted successfully!");
            fetchAndDisplayPDFs(); // Refresh the PDF list
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}
