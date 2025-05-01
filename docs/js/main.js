/**
 * Non-technical: Handles drag-and-drop of a PDF file and upload with progress bar.
 * Version: 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('file-input');
  const submitBtn   = document.getElementById('submit-btn');
  const progressBar = document.getElementById('upload-progress');
  const statusDiv   = document.getElementById('status');
  let selectedFile  = null;

  // Replace this with your actual webhook URL if it changes
  const webhookUrl = 'https://n8n-fb69.onrender.com/webhook/parse-statement';
  
  // Open file picker when clicking the drop zone
  dropZone.addEventListener('click', () => fileInput.click());

  // Highlight drop zone on drag over
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  // Handle file drop
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length !== 1) {
      updateStatus('Please drop exactly one PDF file.', true);
      return;
    }
    if (files[0].type !== 'application/pdf') {
      updateStatus('Only PDF files are allowed.', true);
      return;
    }
    selectedFile = files[0];
    updateStatus(`Selected file: ${selectedFile.name}`);
  });

  // Handle manual selection
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length === 1 && fileInput.files[0].type === 'application/pdf') {
      selectedFile = fileInput.files[0];
      updateStatus(`Selected file: ${selectedFile.name}`);
    } else {
      updateStatus('Please select a single PDF file.', true);
    }
  });

  // Upload when the user clicks Submit
  submitBtn.addEventListener('click', () => {
    if (!selectedFile) {
      updateStatus('No file selected.', true);
      return;
    }
    uploadFile(selectedFile);
  });

  function uploadFile(file) {
    updateStatus(`Uploading ${file.name}...`);
    progressBar.style.display = 'block';
    progressBar.value        = 0;

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', webhookUrl);

    // Update progress bar
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        progressBar.value = (e.loaded / e.total) * 100;
      }
    });

    xhr.onload = () => {
      progressBar.style.display = 'none';
      if (xhr.status >= 200 && xhr.status < 300) {
        updateStatus('Upload successful!');
      } else {
        updateStatus(`Upload failed: ${xhr.statusText}`, true);
      }
    };

    xhr.onerror = () => {
      progressBar.style.display = 'none';
      updateStatus('Upload error occurred.', true);
      console.error(xhr.response);
    };

    xhr.send(formData);
  }

  function updateStatus(msg, isError = false) {
    statusDiv.textContent        = msg;
    statusDiv.style.color        = isError ? 'red' : 'green';
  }
});
