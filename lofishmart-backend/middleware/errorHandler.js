// middlewares/errorHandler.js
const multer = require('multer');

/**
 * Middleware penanganan error global untuk Express.js.
 * Tugas: 
 * 1. Mencegah pengiriman header ganda (ERR_HTTP_HEADERS_SENT).
 * 2. Menangani error Multer spesifik.
 * 3. Membersihkan file yang diunggah jika terjadi error database (ketika menggunakan Memory Storage).
 * 4. Mengirim respons error yang terstruktur.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Mencegah ERR_HTTP_HEADERS_SENT
    if (res.headersSent) {
        // Jika header sudah terkirim, biarkan Express atau Node.js yang menanganinya
        return next(err);
    }
    
    // Tentukan status default dan pesan default
    let statusCode = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // --- 2. Penanganan Error Khusus (Multer/Validasi) ---

    // Penanganan Error Multer (misalnya, limit file size terlampaui)
    if (err instanceof multer.MulterError) {
        statusCode = 400; // Bad Request
        message = `File upload error: ${err.code}. ${err.message}`;
    } 
    
    // Penanganan Error Validasi/Custom (Anda bisa membuat kelas Error kustom)
    // Contoh: if (err instanceof ValidationError) { statusCode = 400; }
    
    // --- 3. Cleanup File (Jika Multer sukses tapi DB/Controller gagal) ---
    
    // Logika cleanup hanya berlaku jika Anda menggunakan Memory Storage (req.file.buffer) 
    // dan sudah membuat file secara manual di controller (seperti solusi sebelumnya).
    // File hanya dibersihkan jika status 500 (Server Error) atau error DB.
    if (req.file && statusCode >= 500) {
        
        // Karena kita menggunakan Memory Storage, kita HANYA membersihkan jika 
        // controller GAGAL, yang sudah di-handle di logic cleanup controller Anda.
        // Kita hanya mencatat jika ada req.file yang belum sempat dibersihkan.
        console.warn(`File buffer exists but cleanup should have been done in controller.`);
    }

    // --- 4. Mengirim Respons Terpusat ---
    
    // Output error ke konsol server (untuk debugging)
    console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`, err.stack);

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Tambahkan stack trace hanya di lingkungan development
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

module.exports = errorHandler;