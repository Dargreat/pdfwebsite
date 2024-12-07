// Extract specific pages from PDF
async function extractPDFPages(srcDoc, start, end) {
    try {
        // Create a new PDF document for extracted pages
        const pdfWriter = await PDFLib.PDFDocument.create();

        for (let i = start; i < Math.min(end, srcDoc.getPageCount()); i++) {
            // Copy pages from source document to the new document
            const [pdfPage] = await pdfWriter.copyPages(srcDoc, [i]);
            pdfWriter.addPage(pdfPage);
        }

        // Save the extracted pages as a Blob
        const pdfBytes = await pdfWriter.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
        console.error("Error during PDF page extraction:", error);
        throw error;
    }
}

// Split and upload PDF
async function splitAndUploadPDF(file, title) {
    try {
        // Load PDF using PDFLib
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        console.log(`PDF loaded: ${pdfDoc.getPageCount()} pages.`);

        // Split into chunks of 10 pages and upload each
        for (let i = 0; i < pdfDoc.getPageCount(); i += 10) {
            const chunkTitle = `${title} (Part ${Math.floor(i / 10) + 1})`;
            console.log(`Extracting pages ${i + 1} to ${Math.min(i + 10, pdfDoc.getPageCount())} for ${chunkTitle}.`);

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

// Upload PDF chunk to backend
async function uploadPDF(file, title) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
        const response = await fetch(`${backendUrl}/api/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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
