const multer = require('multer');

/**
 * Mengembalikan middleware Multer yang menggunakan Memory Storage.
 * Ini memungkinkan controller untuk membuat ID terlebih dahulu, 
 * kemudian menyimpan file secara manual menggunakan ID tersebut sebagai nama file.
 * * Catatan: Karena menggunakan Memory Storage, penanganan file (penyimpanan 
 * ke disk dan penghapusan saat error) HARUS dilakukan di controller.
 * * @returns {function} Middleware Multer yang siap digunakan (misalnya: upload.single('image'))
 */
const getMemoryUploader = () => {
    // 1. Konfigurasi Memory Storage
    // File disimpan sebagai buffer di RAM (req.file.buffer) sebelum diproses controller
    const storage = multer.memoryStorage();

    // 2. Mengembalikan Middleware Multer yang sudah dikonfigurasi
    const upload = multer({ 
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 } // Batas default 5MB
    });

    return upload;
};

// Ubah eksport default menjadi fungsi baru ini
module.exports = getMemoryUploader;