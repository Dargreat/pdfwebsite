// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfList = document.getElementById('pdfList');

// const backendUrl = 'https://dargreat.vercel.app';
const backendUrl = 'https://backend-for-dragreat.onrender.com';
// const backendUrl = 'http://localhost:3000';
let token = '';

// Handle form submission
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
        const formData = new FormData();
        formData.append('title', title);
        formData.append('pages', pages);
        formData.append('file', file);

        const response = await fetch(`${backendUrl}/api/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        let result;
        try {
            result = await response.json();
        } catch {
            const errorText = await response.text();
            result = { message: errorText };
        }

        if (response.ok) {
            alert('PDF uploaded successfully!');
            fileInput.value = '';
            fetchAndDisplayPDFs();
        } else {
            alert(`Error uploading PDF: ${result.message || 'Unknown error'}`);
        }

    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload PDF. Please try again.");
    }
});

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
                'Authorization': `Bearer ${token}`
            },
        });

        let result;
        try {
            result = await response.json();
        } catch {
            const errorText = await response.text();
            result = { message: errorText };
        }

        if (response.ok) {
            alert("PDF deleted successfully!");
            fetchAndDisplayPDFs();
        } else {
            alert(`Error: ${result.message || 'Unknown error'}`);
        }

    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete PDF. Please try again.");
    }
}

// Fetch and display PDFs
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = '<li>Loading...</li>'; // Optional loading text

    try {
        const response = await fetch(`${backendUrl}/api/pdf`);
        if (!response.ok) {
            throw new Error('Failed to fetch PDFs');
        }

        const pdfs = await response.json();
        pdfList.innerHTML = ''; // Clear list

        pdfs.forEach(pdf => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${pdf.title} (${pdf.pages} pages)</span>
                <button onclick="deletePDF('${pdf._id}')">Delete</button>
            `;
            pdfList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Fetch failed:", error);
        alert("Unable to load PDFs. Please refresh the page.");
    }
}

// Check token on page load and fetch PDFs
window.onload = function () {
    const localToken = localStorage.getItem('authToken');
    if (!localToken) {
        alert('Invalid or expired auth token');
        window.location.href = '/login.html';
        return;
    }

    token = localToken;
    fetchAndDisplayPDFs();
};
