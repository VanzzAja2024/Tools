// script.js (Update API Key HD sesuai permintaan terbaru)

const API_CONFIG = {
    removeBgKey: "2ojdAyn5iV1fkhdjcPbc9Wnd",
    tikwmUrl: "https://www.tikwm.com/api/?url=",
    hdApiKey: "R8_PUoSRElBfqU0Z9ysQAEaIR3vyZLc1o842iaST" 
};

function startApp(){
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    
    let text = [
        "BOOTING VANN CORE...",
        "LOADING API MODULE...",
        "CHECKING SECURITY...",
        "SYSTEM ONLINE"
    ];
    let i = 0;
    let box = document.getElementById("text");
    
    let timer = setInterval(()=>{
        if(i < text.length) {
            box.innerHTML = text[i];
            i++;
        } else {
            clearInterval(timer);
        }
    }, 700);
}

function downloadFile(fileUrl, filename) {
    let box = document.getElementById("text");
    box.innerHTML = "[SYSTEM] Mengunduh file...";

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) throw new Error("Gagal mengambil file.");
            return response.blob();
        })
        .then(blob => {
            let blobUrl = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            box.innerHTML = "[SUCCESS] Unduhan selesai!";
        })
        .catch(err => {
            box.innerHTML = "[WARNING] Mengalihkan ke metode unduh aman...";
            let a = document.createElement('a');
            a.href = fileUrl;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
}

function runFeature(type) {
    let box = document.getElementById("text");
    
    if (type === 'tt') {
        let url = prompt("Masukkan Link Video TikTok secara lengkap:");
        if (url && url.trim() !== "") {
            box.innerHTML = "[SYSTEM] Sedang memproses video TikTok...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if(data.code === 0 && data.data && data.data.play) {
                        downloadFile(data.data.play, 'tiktok_video.mp4');
                    } else {
                        box.innerHTML = "[ERROR] Gagal mengambil video. Periksa kembali linknya.";
                    }
                })
                .catch(err => {
                    box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
                    console.error(err);
                });
        }
    } else if (type === 'mp3') {
        let url = prompt("Masukkan Link Video TikTok untuk Audio MP3:");
        if (url && url.trim() !== "") {
            box.innerHTML = "[SYSTEM] Sedang mengambil audio MP3...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if(data.code === 0 && data.data && data.data.music) {
                        downloadFile(data.data.music, 'tiktok_audio.mp3');
                    } else {
                        box.innerHTML = "[ERROR] Gagal mengambil audio MP3.";
                    }
                })
                .catch(err => {
                    box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
                    console.error(err);
                });
        }
    } else if (type === 'rbg') {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
            let file = e.target.files[0];
            if (file) {
                box.innerHTML = "[SYSTEM] Mengunggah gambar ke Remove.bg...";
                let formData = new FormData();
                formData.append('image_file', file);
                formData.append('size', 'auto');

                fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': API_CONFIG.removeBgKey
                    },
                    body: formData
                })
                .then(response => {
                    if(response.ok) return response.blob();
                    throw new Error("Gagal memproses gambar dengan Remove.bg.");
                })
                .then(blob => {
                    let blobUrl = URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = 'no-background.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                    box.innerHTML = "[SUCCESS] Background berhasil dihapus!";
                })
                .catch(err => {
                    box.innerHTML = "[ERROR] Gagal menghapus background.";
                    console.error(err);
                });
            }
        };
        fileInput.click();
    } else if (type === 'hd') {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
            let file = e.target.files[0];
            if (file) {
                box.innerHTML = "[SYSTEM] Mengunggah gambar ke server sementara...";
                
                let formData = new FormData();
                formData.append('file', file);

                fetch('https://file.io', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(uploadRes => {
                    if (uploadRes.success && uploadRes.link) {
                        let publicImageUrl = uploadRes.link;
                        box.innerHTML = "[SYSTEM] Memproses HD Boost (api-faa)...";

                        let faaApiUrl = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(publicImageUrl)}&apikey=${API_CONFIG.hdApiKey}`;
                        return fetch(faaApiUrl);
                    } else {
                        throw new Error("Gagal mengunggah gambar ke host sementara.");
                    }
                })
                .then(response => response.json())
                .then(data => {
                    let hasilUrl = data.url || data.result || data.data || (data.data && data.data.url);
                    if(hasilUrl) {
                        box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(hasilUrl, 'hd-boosted-image.jpg');
                    } else {
                        box.innerHTML = "[ERROR] API HD tidak mengembalikan URL file.";
                        console.log("Respon API:", data);
                    }
                })
                .catch(err => {
                    box.innerHTML = "[ERROR] HD Boost gagal: " + err.message;
                    console.error(err);
                });
            }
        };
        fileInput.click();
    }
}
