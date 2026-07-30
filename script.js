const API_CONFIG = {
    removeBgKey: "2ojdAyn5iV1fkhdjcPbc9Wnd",
    tikwmUrl: "https://www.tikwm.com/api/?url=",
    hdApiKey: "R8_PUoSRElBfqU0Z9ysQAEaIR3vyZLc1o842iaST"
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
        fileInput.onchange = e => {
            let file = e.target.files[0];
            if (file) {
                if (box) box.innerHTML = "[SYSTEM] Memproses HD Boost...";
                
                let formData = new FormData();
                formData.append('image', file);

                fetch(`https://api-faa.my.id/faa/hdv4?apikey=${API_CONFIG.hdApiKey}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error("Server HD error");
                    return response.json();
                })
                .then(data => {
                    let hasilUrl = data.url || data.result || data.data || (data.data && data.data.url);
                    if (hasilUrl) {
                        if (box) box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(hasilUrl, 'hd-boosted-image.jpg');
                    } else {
                        throw new Error("Format URL tidak valid");
                    }
                })
                .catch(err => {
                    if (box) box.innerHTML = "[SYSTEM] Mengalihkan ke server HD Backup...";
                    
                    let backupData = new FormData();
                    backupData.append('image', file);

                    fetch('https://api.deepai.org/api/torch-srgan', {
                        method: 'POST',
                        headers: {
                            'api-key': 'quickstart-edbbe4'
                        },
                        body: backupData
                    })
                    .then(res => res.json())
                    .then(backupRes => {
                        if (backupRes && backupRes.output_url) {
                            if (box) box.innerHTML = "[SUCCESS] HD Boost Backup berhasil!";
                            downloadFile(backupRes.output_url, 'hd-boosted-image.jpg');
                        } else {
                            throw new Error("Gagal total pada semua server HD.");
                        }
                    })
                    .catch(backupErr => {
                        if (box) box.innerHTML = "[ERROR] HD Boost gagal: " + backupErr.message;
                    });
                });
            }
        };
        fileInput.click();
    }
}
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
                    URL.revokeObjectURL(blobUrl);
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
        fileInput.onchange = e => {
            let file = e.target.files[0];
            if (file) {
                if (box) box.innerHTML = "[SYSTEM] Memproses HD Boost...";
                
                let formData = new FormData();
                formData.append('image', file);

                fetch(`https://api-faa.my.id/faa/hdv4?apikey=${API_CONFIG.hdApiKey}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error("Server HD error");
                    return response.json();
                })
                .then(data => {
                    let hasilUrl = data.url || data.result || data.data || (data.data && data.data.url);
                    if (hasilUrl) {
                        if (box) box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(hasilUrl, 'hd-boosted-image.jpg');
                    } else {
                        throw new Error("Format URL tidak valid");
                    }
                })
                .catch(err => {
                    // Fallback otomatis jika server utama bermasalah
                    if (box) box.innerHTML = "[SYSTEM] Mengalihkan ke server HD Backup...";
                    
                    let backupData = new FormData();
                    backupData.append('image', file);

                    fetch('https://api.deepai.org/api/torch-srgan', {
                        method: 'POST',
                        headers: {
                            'api-key': 'quickstart-edbbe4'
                        },
                        body: backupData
                    })
                    .then(res => res.json())
                    .then(backupRes => {
                        if (backupRes && backupRes.output_url) {
                            if (box) box.innerHTML = "[SUCCESS] HD Boost Backup berhasil!";
                            downloadFile(backupRes.output_url, 'hd-boosted-image.jpg');
                        } else {
                            throw new Error("Gagal total pada semua server HD.");
                        }
                    })
                    .catch(backupErr => {
                        if (box) box.innerHTML = "[ERROR] HD Boost gagal: " + backupErr.message;
                    });
                });
            }
        };
        fileInput.click();
    }
}
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
        fileInput.onchange = e => {
            let file = e.target.files[0];
            if (file) {
                if (box) box.innerHTML = "[SYSTEM] Memproses HD Boost (Direct Post)...";
                
                let formData = new FormData();
                formData.append('image', file);

                // Langsung kirim file form-data ke API HD tanpa perantara file.io / catbox
                fetch(`https://api-faa.my.id/faa/hdv4?apikey=${API_CONFIG.hdApiKey}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error("Gagal terhubung ke server HD (Error " + response.status + ")");
                    return response.json();
                })
                .then(data => {
                    let hasilUrl = data.url || data.result || data.data || (data.data && data.data.url);
                    if (hasilUrl) {
                        if (box) box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(hasilUrl, 'hd-boosted-image.jpg');
                    } else {
                        if (box) box.innerHTML = "[ERROR] API HD tidak merespons URL gambar.";
                        console.log("Respon API:", data);
                    }
                })
                .catch(err => {
                    if (box) box.innerHTML = "[ERROR] HD Boost gagal: " + err.message;
                    console.error(err);
                });
            }
        };
        fileInput.click();
    }
}
    
    if (type === 'tt') {
        let url = prompt("Masukkan Link Video TikTok secara lengkap:");
        if (url && url.trim() !== "") {
            if(box) box.innerHTML = "[SYSTEM] Sedang memproses video TikTok...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if(data.code === 0 && data.data && data.data.play) {
                        downloadFile(data.data.play, 'tiktok_video.mp4');
                    } else {
                        if(box) box.innerHTML = "[ERROR] Gagal mengambil video. Periksa kembali linknya.";
                    }
                })
                .catch(err => {
                    if(box) box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
                    console.error(err);
                });
        }
    } else if (type === 'mp3') {
        let url = prompt("Masukkan Link Video TikTok untuk Audio MP3:");
        if (url && url.trim() !== "") {
            if(box) box.innerHTML = "[SYSTEM] Sedang mengambil audio MP3...";
            fetch(API_CONFIG.tikwmUrl + encodeURIComponent(url))
                .then(response => response.json())
                .then(data => {
                    if(data.code === 0 && data.data && data.data.music) {
                        downloadFile(data.data.music, 'tiktok_audio.mp3');
                    } else {
                        if(box) box.innerHTML = "[ERROR] Gagal mengambil audio MP3.";
                    }
                })
                .catch(err => {
                    if(box) box.innerHTML = "[ERROR] Jaringan atau API bermasalah.";
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
                if(box) box.innerHTML = "[SYSTEM] Mengunggah gambar ke Remove.bg...";
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
                    if(box) box.innerHTML = "[SUCCESS] Background berhasil dihapus!";
                })
                .catch(err => {
                    if(box) box.innerHTML = "[ERROR] Gagal menghapus background.";
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
                if(box) box.innerHTML = "[SYSTEM] Memproses HD Boost via DeepAI...";
                
                let formData = new FormData();
                formData.append('image', file);

                fetch('https://api.deepai.org/api/torch-srgan', {
                    method: 'POST',
                    headers: {
                        'api-key': 'quickstart-edbbe4'
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error("Gagal terhubung ke server HD (Error " + response.status + ")");
                    return response.json();
                })
                .then(data => {
                    if(data && data.output_url) {
                        if(box) box.innerHTML = "[SUCCESS] HD Boost berhasil diproses!";
                        downloadFile(data.output_url, 'hd-boosted-image.jpg');
                    } else {
                        if(box) box.innerHTML = "[ERROR] API HD tidak merespons URL gambar.";
                    }
                })
                .catch(err => {
                    if(box) box.innerHTML = "[ERROR] HD Boost gagal: " + err.message;
                    console.error(err);
                });
            }
        };
        fileInput.click();
    }
}
ground.png';
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
