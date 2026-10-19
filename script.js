const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const resultImg = document.getElementById('result-img');
const loading = document.getElementById('loading');
const downloadBtn = document.getElementById('download-btn');

// Sự kiện click để chọn ảnh
dropZone.addEventListener('click', () => fileInput.click());

// Xử lý hiệu ứng Kéo & Thả (Drag and Drop)
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#28a745';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#007bff';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007bff';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processImageWithAI(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processImageWithAI(e.target.files[0]);
    }
});

// Hàm xử lý ảnh trực tiếp bằng AI trên trình duyệt
async function processImageWithAI(file) {
    loading.classList.remove('hidden');
    resultImg.classList.add('hidden');
    downloadBtn.classList.add('hidden');

    try {
        if (typeof imglyRemoveBackground === 'undefined') {
            throw new Error("Chưa nạp được thư viện AI. Hãy kiểm tra kết nối Internet của bạn.");
        }

        const blobResult = await imglyRemoveBackground(file);

        const outputImageUrl = URL.createObjectURL(blobResult);

        resultImg.src = outputImageUrl;
        downloadBtn.href = outputImageUrl;

        loading.classList.add('hidden');
        resultImg.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra trong quá trình xử lý: ' + error.message);
        loading.classList.add('hidden');
    }
}