// Initialize PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let extractedData = { bulk: "", pending: "", returns: "" };

// Function to extract text from an uploaded PDF
async function extractText(file) {
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(s => s.str).join(" ");
            }
            resolve(fullText.toUpperCase());
        };
        reader.readAsArrayBuffer(file);
    });
}

async function reconcile() {
    const techInput = document.getElementById('techList').value.toUpperCase();
    const partsToFind = techInput.split('\n').filter(p => p.trim() !== "");
    
    // Get Files
    const bulkFile = document.getElementById('bulkPDF').files[0];
    const pendingFile = document.getElementById('pendingPDF').files[0];
    const returnsFile = document.getElementById('returnsPDF').files[0];

    // Extract text from all PDFs
    if (bulkFile) extractedData.bulk = await extractText(bulkFile);
    if (pendingFile) extractedData.pending = await extractText(pendingFile);
    if (returnsFile) extractedData.returns = await extractText(returnsFile);

    const resultsBody = document.getElementById('resultsTableBody');
    resultsBody.innerHTML = ""; // Clear old results

    partsToFind.forEach(part => {
        let status = "Unknown / Manual Review";
        let color = "text-red-400";
        let source = "None";

        if (extractedData.bulk.includes(part)) {
            status = "In Bulk Inventory";
            color = "text-emerald-400";
            source = "Bulk PDF";
        } else if (extractedData.pending.includes(part)) {
            status = "On Schedule";
            color = "text-sky-400";
            source = "Pending PDF";
        } else if (extractedData.returns.includes(part)) {
            status = "Pending Return";
            color = "text-amber-400";
            source = "Returns PDF";
        }

        const row = `
            <tr class="border-b border-gray-700">
                <td class="p-4 font-mono">${part}</td>
                <td class="p-4 ${color} font-bold">${status}</td>
                <td class="p-4 text-gray-400">${source}</td>
            </tr>
        `;
        resultsBody.innerHTML += row;
    });

    document.getElementById('resultsArea').classList.remove('hidden');
}

function exportCSV() {
    // Basic CSV export logic would go here
    alert("Exporting CSV...");
}
