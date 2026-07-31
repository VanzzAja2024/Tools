// script.js (HD Boost menggunakan Imglarger API langsung di browser)

const API_CONFIG = {
    removeBgKey: "2ojdAyn5iV1fkhdjcPbc9Wnd",
    tikwmUrl: "https://www.tikwm.com/api/?url="
};

function downloadFile(fileUrl, filename) {
    let box = document.getElementById("text");
    if (box) box.innerHTML = "[SYSTEM] Mengunduh file...";

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
            if (box) box.innerHTML = "[SUCCESS] Unduhan selesai!";
        })
        .catch(err => {
            if (box) box.innerHTML = "[WARNING] Mengalihkan ke metode unduh aman...";
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
            if (box) box.innerHTML = "[SYSTEM] Sedang memproses video TikTok...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data && data.data.play) {
                        downloadFile(data.data.play, 'tiktok_video.mp4');
                    } else {
                        if (box) box.innerHTML = "[ERROR] Gagal mengambil video. Periksa kembali linknya.";
                    }
                })
                .catch(err => {
                    if (box) box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
                    console.error(err);
                });
        }
    } else if (type === 'mp3') {
        let url = prompt("Masukkan Link Video TikTok untuk Audio MP3:");
        if (url && url.trim() !== "") {
            if (box) box.innerHTML = "[SYSTEM] Sedang mengambil audio MP3...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data && data.data.music) {
                        downloadFile(data.data.music, 'tiktok_audio.mp3');
                    } else {
                        if (box) box.innerHTML = "[ERROR] Gagal mengambil audio MP3.";
                    }
                })
                .catch(err => {
                    if (box) box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
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
                if (box) box.innerHTML = "[SYSTEM] Mengunggah gambar ke Remove.bg...";
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
                    if (response.ok) return response.blob();
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
                    window.URL.revokeObjectURL(blobUrl);
                    if (box) box.innerHTML = "[SUCCESS] Background berhasil dihapus!";
                })
                .catch(err => {
                    if (box) box.innerHTML = "[ERROR] Gagal menghapus background.";
                    console.error(err);
                });
            }
        };
        fileInput.click();
    } else if (type === 'hd') {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async e => {
            let file = e.target.files[0];
            if (file) {
                try {
                    if (box) box.innerHTML = "[SYSTEM] Mengunggah gambar ke Imglarger...";
                    
                    let form = new FormData();
                    form.append("file", file);
                    form.append("type", 13);
                    form.append("scaleRadio", 2);

                    let uploadRes = await fetch("https://photoai.imglarger.com/api/PhoAi/Upload", {
                        method: "POST",
                        body: form
                    });
                    let uploadData = await uploadRes.json();
                    
                    if (!uploadData || !uploadData.data || !uploadData.data.code) {
                        throw new Error("Gagal mendapatkan kode dari server.");
                    }

                    let code = uploadData.data.code;
                    if (box) box.innerHTML = "[SYSTEM] Memproses AI Enhancer (Imglarger)...";

                    // Loop pengecekan status (polling) sampai gambar selesai diproses
                    let finalUrl = null;
                    for (let attempt = 0; attempt < 15; attempt++) {
                        await new Promise(r => setTimeout(r, 2000)); // Jeda 2 detik per cek

                        let checkRes = await fetch("https://photoai.imglarger.com/api/PhoAi/CheckStatus", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: code, type: 13 })
                        });
                        let checkData = await checkRes.json();

                        if (checkData && checkData.data) {
                            // Cek status selesai (biasanya status 1 atau ada URL download-nya)
                            if (checkData.data.url || checkData.data.status === 3 || checkData.data.status === "done") {
                                finalUrl = checkData.data.url || checkData.data.downloadUrl;
                                break;
                            }
                        }
                    }

                    if (finalUrl) {
                        if (box) box.innerHTML = "[SUCCESS] HD Boost Berhasil!";
                        downloadFile(finalUrl, 'hd-boosted-imglarger.jpg');
                    } else {
                        throw new Error("Waktuproses habis atau server sibuk.");
                    }

                } catch (err) {
                    if (box) box.innerHTML = "[ERROR] HD Boost gagal: " + err.message;
                    console.error(err);
                }
            }
        };
        fileInput.click();
    }
}
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
                box.innerHTML = "[SYSTEM] Mengunggah gambar sementara...";
                
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

                        let faaApiUrl = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(publicImageUrl)}`;
                        return fetch(faaApiUrl);
                    } else {
                        throw new Error("Gagal mengunggah gambar.");
                    }
                })
                .then(response => response.json())
                .then(data => {
                    let hasilUrl = data.url || data.result || data.data;
                    if(hasilUrl) {
                        box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(hasilUrl, 'hd-boosted-image.jpg');
                    } else {
                        box.innerHTML = "[ERROR] API HD tidak mengembalikan file.";
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
