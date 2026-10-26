const imageInput = document.getElementById('fileInput');
const removeBgBtn = document.getElementById('remove-bg-btn');
const sharpenBtn = document.getElementById('sharpen-btn');
const downloadBtn = document.getElementById('download-btn');
const resultImg = document.getElementById('result-img');
const statusText = document.getElementById('status');

// Dán API Key Remove.bg của bạn vào đây
const API_KEY = "8JEqXTNbkBPKQRUtQCZErFao";
let currentProcessedUrl = "";

// Khi chọn ảnh từ máy tính
function handleImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    resultImg.src = localUrl;
    resultImg.classList.remove('hidden');
    currentProcessedUrl = localUrl;

    // HIỆN CẢ HAI NÚT CHỨC NĂNG NGAY KHI CHỌN ẢNH
    removeBgBtn.classList.remove('hidden');
    sharpenBtn.classList.remove('hidden');
    downloadBtn.classList.add('hidden');
    
    if (statusText) {
        statusText.innerText = "Đã chọn ảnh thành công. Hãy chọn chức năng bên dưới:";
        statusText.classList.remove('hidden');
    }
}

// 1. Chức năng Tách nền AI
removeBgBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;

    if (statusText) statusText.innerText = "Đang tách nền AI, vui lòng đợi...";

    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: { 'X-Api-Key': API_KEY },
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            currentProcessedUrl = URL.createObjectURL(blob);
            resultImg.src = currentProcessedUrl;
            downloadBtn.href = currentProcessedUrl;
            downloadBtn.classList.remove('hidden');
            if (statusText) statusText.innerText = "Tách nền thành công!";
        } else {
            alert("Lỗi khi tách nền! Hãy kiểm tra lại API Key.");
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối máy chủ.");
    }
});

// 2. Chức năng Làm nét ảnh trực tiếp
sharpenBtn.addEventListener('click', () => {
    if (!resultImg.src) return;

    if (statusText) statusText.innerText = "Đang làm nét ảnh...";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = resultImg.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        
        const weights = [
             0, -1,  0,
            -1,  5, -1,
             0, -1,  0
        ];
        
        const outputData = ctx.createImageData(w, h);
        const dst = outputData.data;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        let px = x + kx;
                        let py = y + ky;
                        if (px >= 0 && px < w && py >= 0 && py < h) {
                            let idx = (py * w + px) * 4;
                            let wt = weights[(ky + 1) * 3 + (kx + 1)];
                            r += data[idx] * wt;
                            g += data[idx + 1] * wt;
                            b += data[idx + 2] * wt;
                        }
                    }
                }
                let idx = (y * w + x) * 4;
                dst[idx]     = Math.min(Math.max(r, 0), 255);
                dst[idx + 1] = Math.min(Math.max(g, 0), 255);
                dst[idx + 2] = Math.min(Math.max(b, 0), 255);
                dst[idx + 3] = data[idx + 3];
            }
        }

        ctx.putImageData(outputData, 0, 0);
        currentProcessedUrl = canvas.toDataURL('image/png');
        resultImg.src = currentProcessedUrl;
        downloadBtn.href = currentProcessedUrl;
        downloadBtn.classList.remove('hidden');
        if (statusText) statusText.innerText = "Làm nét ảnh thành công!";
    };
});