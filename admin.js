// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');

// Backend URLs
const backendUrl = 'https://backend-for-dragreat.onrender.com';
let token = '';

// Prevent form refresh and handle PDF upload
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const title = document.getElementById('pdfTitle').value.trim();
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    // Validate inputs
    if (!title) {
        alert("Please provide a title for the PDF.");
        return;
    }

    if (!file || file.type !== 'application/pdf') {
        alert("Please upload a valid PDF file.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        // Send the file to the backend
        const response = await fetch(`${backendUrl}/api/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF uploaded successfully!");
            fetchAndDisplayPDFs(); // Refresh the list of PDFs
        } else {
            alert(`Error: ${result.message || 'Failed to upload PDF.'}`);
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("An error occurred while uploading the PDF. Please try again.");
    }
});

// Fetch and display PDFs on page load
async function fetchAndDisplayPDFs() {
    pdfList.innerHTML = ''; // Clear existing list

    try {
        const response = await fetch(`${backendUrl}/api/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch PDFs.");

        const pdfs = await response.json();
        if (pdfs.length === 0) {
            pdfList.innerHTML = "<li>No PDFs uploaded yet.</li>";
            return;
        }

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
        alert("Unable to load PDFs. Please try again later.");
    }
}

// Delete a PDF
async function deletePDF(pdfId) {
    if (!confirm("Are you sure you want to delete? This cannot be undone.")) return;

    try {
        const response = await fetch(`${backendUrl}/api/pdf/delete/${pdfId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (response.ok) {
            alert("PDF deleted successfully!");
            fetchAndDisplayPDFs(); // Refresh the list
        } else {
            alert(`Error: ${result.message || 'Failed to delete PDF.'}`);
        }
    } catch (error) {
        console.error("Delete failed:", error);
        alert("An error occurred while deleting the PDF. Please try again.");
    }
}

// Initialize page
window.onload = function () {
    (() => {
        const localToken = localStorage.getItem('authToken');
        if (!localToken) {
            alert('Invalid or expired auth token. Redirecting to login.');
            window.location.href = '/login.html';
            return;
        }
        token = localToken;
    })();

    fetchAndDisplayPDFs(); // Load PDFs
};
