// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// const backendUrl = 'https://dargreat.vercel.app';
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';
let token = '';

// Fetch and display PDFs on page load
// document.addEventListener('DOMContentLoaded', fetchAndDisplayPDFs);

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
        // Create FormData and append the file and other fields
        const formData = new FormData();
        formData.append('title', title);
        formData.append('pages', pages);
        formData.append('file', file);

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
            alert("PDF uploaded successfully!");
            fileInput.value = "";
            fetchAndDisplayPDFs();
        } else {
            alert(`Error: ${result.message}`);
        }
        console.log(result);
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});


// Function to convert file to Base64
const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Extract only Base64 data (without prefix)
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
    const localToken = localStorage.getItem('authToken');
    if (!localToken) {
        alert('Invalid or expired auth token');
        window.location.href = '/login.html';
        return;
    }
    // Ensure `token` is properly scoped (e.g., declared globally or within a module).
    token = localToken; 
    fetchAndDisplayPDFs(); // Assumes this function is defined and handles errors.
};
