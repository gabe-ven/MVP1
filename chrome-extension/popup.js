// Load saved API URL
chrome.storage.sync.get(['apiUrl'], (result) => {
  if (result.apiUrl) {
    document.getElementById('apiUrl').value = result.apiUrl;
  } else {
    document.getElementById('apiUrl').value = 'http://localhost:3000/api/extract';
  }
});

// Save API URL when changed
document.getElementById('apiUrl').addEventListener('change', (e) => {
  chrome.storage.sync.set({ apiUrl: e.target.value });
});

// Main scan button
document.getElementById('scanBtn').addEventListener('click', async () => {
  const scanBtn = document.getElementById('scanBtn');
  const btnText = document.getElementById('btnText');
  const statusDiv = document.getElementById('status');
  const apiUrl = document.getElementById('apiUrl').value;

  if (!apiUrl) {
    showStatus('Please enter your API URL', 'error');
    return;
  }

  // Disable button
  scanBtn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> Authenticating...';

  // Reset stats
  updateStats(0, 0, 0, 0);

  try {
    // Get OAuth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Failed to authenticate with Gmail');
    }

    btnText.innerHTML = '<span class="spinner"></span> Searching Gmail...';
    showStatus('Searching for rate confirmations...');

    // Search Gmail for rate confirmations
    const messages = await searchGmail(token);

    if (messages.length === 0) {
      showStatus('No rate confirmation emails found', 'info');
      btnText.textContent = 'Scan Gmail for Rate Confirmations';
      scanBtn.disabled = false;
      return;
    }

    showStatus(`Found ${messages.length} email(s). Scanning for PDFs...`);

    // Process each message and track load-level stats
    let totalPDFs = 0;
    let failed = 0;
    let totalExtracted = 0;
    let totalDuplicates = 0;
    
    // Initialize stats display
    updateStats(0, 0, 0, 0);

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      try {
        // Update UI before processing
        btnText.innerHTML = `<span class="spinner"></span> Scanning email ${i + 1}/${messages.length}...`;
        
        // Process message with callback for real-time updates
        const onPdfProcessed = (pdfResult) => {
          totalPDFs++;
          totalExtracted += pdfResult.extracted || 0;
          totalDuplicates += pdfResult.duplicates || 0;
          failed += pdfResult.failed || 0;
          
          // Update stats immediately after each PDF
          updateStats(totalPDFs, totalExtracted, totalDuplicates, failed);
          showStatus(`Processing • ${totalPDFs} PDFs • ${totalExtracted} loads added`);
        };
        
        await processMessage(message.id, token, apiUrl, onPdfProcessed);
        
      } catch (error) {
        console.error('Error processing message:', error);
        failed++;
        updateStats(totalPDFs, totalExtracted, totalDuplicates, failed);
        showStatus(`Processing ${i + 1}/${messages.length} emails • ${failed} errors`);
      }
    }

    // Final status
    if (failed === 0) {
      showStatus(`Successfully added ${totalExtracted} load(s)!${totalDuplicates > 0 ? ` (${totalDuplicates} duplicates skipped)` : ''}`, 'success');
    } else {
      showStatus(`Added ${totalExtracted} loads, ${totalDuplicates} duplicates, ${failed} failed.`, 'warning');
    }

    // Send notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Load Insights - Scan Complete',
      message: `Processed ${totalPDFs} PDF(s) • ${totalExtracted} loads added${totalDuplicates > 0 ? ` • ${totalDuplicates} duplicates` : ''}${failed > 0 ? ` • ${failed} failed` : ''}`
    });

  } catch (error) {
    console.error('Scan error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    btnText.textContent = 'Scan Gmail for Rate Confirmations';
    scanBtn.disabled = false;
  }
});

// Get OAuth token
function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

// Search Gmail for rate confirmations
async function searchGmail(token) {
  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const afterDate = sixMonthsAgo.toISOString().split('T')[0].replace(/-/g, '/');
  
  // Search by PDF FILENAME - find PDFs with "rate" AND "confirmation" (or similar) in the filename
  // Include date filter for last 6 months
  const queries = [
    `has:attachment filename:pdf filename:rate filename:confirmation after:${afterDate}`,
    `has:attachment filename:pdf filename:load filename:confirmation after:${afterDate}`,
    `has:attachment filename:pdf filename:carrier filename:rate after:${afterDate}`,
    `has:attachment filename:pdf filename:freight filename:confirmation after:${afterDate}`,
    `has:attachment filename:pdf filename:rate filename:sheet after:${afterDate}`,
    `has:attachment filename:pdf filename:load filename:tender after:${afterDate}`,
    // Fallback: any PDF with "rate" in filename
    `has:attachment filename:pdf filename:rate after:${afterDate}`,
    // Fallback: any PDF with "confirmation" in subject
    `has:attachment filename:pdf subject:rate subject:confirmation after:${afterDate}`
  ];

  const allMessages = [];

  for (const query of queries) {
    let pageToken = null;
    
    // Paginate through all results (Gmail API max is 500 per request)
    do {
      let searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=500`;
      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const response = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.messages) {
        // Add unique messages only
        for (const msg of data.messages) {
          if (!allMessages.find(m => m.id === msg.id)) {
            allMessages.push(msg);
          }
        }
      }
      
      pageToken = data.nextPageToken;
    } while (pageToken);
  }

  return allMessages;
}

// Process a single Gmail message
async function processMessage(messageId, token, apiUrl, onPdfProcessed) {
  // Get message details
  const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
  const msgResponse = await fetch(msgUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!msgResponse.ok) {
    throw new Error('Failed to fetch message details');
  }

  const msgData = await msgResponse.json();

  // Find PDF attachments
  const pdfs = await findPDFAttachments(msgData, token, msgUrl);

  if (pdfs.length === 0) {
    return; // No PDFs found in this message
  }

  // Process each PDF and call the callback for real-time updates
  for (const pdf of pdfs) {
    const formData = new FormData();
    formData.append('files', pdf.blob, pdf.filename);

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Call callback immediately after each PDF is processed
    if (onPdfProcessed) {
      onPdfProcessed({
        extracted: data.extracted || 0,
        duplicates: data.duplicates || 0,
        failed: data.failed || 0
      });
    }
  }
}

// Find PDF attachments in a message
async function findPDFAttachments(msgData, token, msgUrl) {
  const pdfs = [];

  // Recursive function to find attachments in nested parts
  const findParts = (parts) => {
    if (!parts) return;

    for (const part of parts) {
      // Check if this part has nested parts
      if (part.parts) {
        findParts(part.parts);
      }

      // Check if this is a PDF attachment
      if (part.filename && part.filename.toLowerCase().endsWith('.pdf')) {
        pdfs.push({
          filename: part.filename,
          attachmentId: part.body.attachmentId
        });
      }
    }
  };

  findParts(msgData.payload.parts);

  // Download each PDF
  const downloadedPDFs = [];

  for (const pdf of pdfs) {
    const attachUrl = `${msgUrl}/attachments/${pdf.attachmentId}`;
    const attachResponse = await fetch(attachUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (attachResponse.ok) {
      const attachData = await attachResponse.json();
      const blob = base64ToBlob(attachData.data, 'application/pdf');
      downloadedPDFs.push({
        filename: pdf.filename,
        blob: blob
      });
    }
  }

  return downloadedPDFs;
}

// Convert base64 to Blob
function base64ToBlob(base64, contentType) {
  // Gmail returns URL-safe base64, convert it
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  } catch (error) {
    console.error('Error decoding base64:', error);
    throw error;
  }
}

// Show status message
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `show ${type}`;
}

// Update stats
function updateStats(found, extracted, duplicates, failed) {
  document.getElementById('foundCount').textContent = found;
  document.getElementById('extractedCount').textContent = extracted;
  document.getElementById('duplicatesCount').textContent = duplicates;
  document.getElementById('failedCount').textContent = failed;
}

