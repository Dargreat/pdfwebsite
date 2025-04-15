// Select elements from admin.html
const uploadForm = document.getElementById('uploadForm');
const pdfList = document.getElementById('pdfList');

const backendUrl = 'https://backend-for-dragreat.onrender.com';
let token = '';

// Enhanced upload handler with debugging
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        // Collect form data
        const title = document.getElementById('pdfTitle').value;
        const pages = document.getElementById('pages').value;
        const file = document.getElementById('pdfFile').files[0];

        // Validation
        if (!file) {
            alert("Please select a PDF to upload.");
            return;
        }

        console.log('Selected file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        if (file.type !== 'application/pdf') {
            alert(`Invalid file type: ${file.type}. Only PDF files are allowed.`);
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('pages', pages);
        formData.append('file', file, file.name);

        // Debug form data
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        // Get authentication token
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Authentication required');
            window.location.href = '/login.html';
            return;
        }

        // Send request
        console.log('Sending upload request...');
        const response = await fetch(`${backendUrl}/api/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        console.log('Response status:', response.status);
        
        // Handle response
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', {
                status: response.status,
                error: errorText
            });
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Upload success:', result);
        alert('PDF uploaded successfully!');
        document.getElementById('pdfFile').value = "";
        fetchAndDisplayPDFs();
    } catch (error) {
        console.error("Full error details:", error);
        alert(`Upload failed: ${error.message}`);
    }
});

// Enhanced PDF fetcher
async function fetchAndDisplayPDFs() {
    try {
        console.log('Fetching PDF list...');
        const response = await fetch(`${backendUrl}/api/pdf`);
        
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch PDFs: ${response.status} - ${errorText}`);
        }

        const pdfs = await response.json();
        console.log('Received PDFs:', pdfs);

        pdfList.innerHTML = '';
        pdfs.forEach(pdf => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${pdf.title} (${pdf.pages} pages)</span>
                <button onclick="deletePDF('${pdf._id}')">Delete</button>
            `;
            pdfList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to load PDFs. Check console for details.");
    }
}

// Rest of your code remains the same...
