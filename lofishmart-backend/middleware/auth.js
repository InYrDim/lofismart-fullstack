const jwt = require('jsonwebtoken');

const userController = require('../controllers/userController');
const sessionData = [];

module.exports = (permissions = []) => {
  return async(req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token not found" });
      }

      const token = authHeader.split(" ")[1];
      let sessionFilter = sessionData.find(item => item.id === token);
      if (!sessionFilter) {
        await userController.sessionDeleteExpired()
        console.log('Mencari session di database');
        const searchSession = await userController.sessionById(token);
        if(searchSession){
          sessionData.push(searchSession)
          sessionFilter = searchSession
        } else {
          // Melemparkan error untuk menghentikan proses dan langsung menuju catch(err)
          const error = new Error("The session is invalid or has expired.");
          error.status = 401; // Tambahkan properti status agar bisa ditangani di error handler
          throw error;
        }
      }

      const decoded = jwt.verify(
        sessionFilter.payload,
        process.env.JWT_SECRET || "secretKey123"
      );

      // --- FRESH USER DATA ---
      // Fetch fresh user data from DB to handle stale assignments (like market_id)
      const AppDataSource = require('../config/data-source');
      const User = require('../db/entities/User');
      const userRepo = AppDataSource.getRepository(User);
      
      const freshUser = await userRepo.findOne({
        where: { id: decoded.id },
        relations: ['role', 'market']
      });

      if (!freshUser) {
        const error = new Error("User record not found in database.");
        error.status = 401;
        throw error;
      }

      const HasPermit = require('../db/entities/HasPermit');
      const hasPermitRepo = AppDataSource.getRepository(HasPermit);
      const freshPermits = await hasPermitRepo.find({
        where: { role: { id: freshUser.role?.id || freshUser.role_id } },
        relations: ['permission']
      });
      const userPermissions = freshPermits.map(p => p.permission.name);

      // Populate req.user with fresh data while keeping original JWT payload fields
      req.user = { 
        ...decoded, 
        role: freshUser.role?.id || freshUser.role_id || decoded.role,
        role_id: freshUser.role_id || freshUser.role?.id || decoded.role_id,
        market_id: freshUser.market?.id || freshUser.market_id || null,
        market: freshUser.market || null,
        hasPermit: userPermissions
      };

      // --- OTORISASI BERDASARKAN PERMISSION ---

      // 2. Periksa apakah endpoint ini memerlukan izin tertentu (permissions.length > 0)
      if (permissions.length > 0) {
        
        // Super Admin (ADMN) bypass semua permission check
        const userRoleId = decoded.role?.id || decoded.role_id;
        if (userRoleId === 'ADMN') {
          return next();
        }

        // 3. Cek apakah user memiliki SETIDAKNYA SATU izin yang diperlukan
        const hasRequiredPermission = permissions.some(requiredPermit => 
          userPermissions.includes(requiredPermit)
        );

        if (!hasRequiredPermission) {
          // Jika tidak memiliki izin yang diperlukan
          return res.status(403).json({ 
            message: "Do not have permission for this operation.",
            login: true 
          });
        }
      }

      // Lanjut ke handler berikutnya jika autentikasi dan otorisasi berhasil
      next();

    } catch (err) {
      //Tangani error yang dilempar, atau teruskan ke error handler global
      if (err.status) {
        return res.status(err.status).json({ message: err.message, login: false });
      }
      // Menangani error token (misalnya: token tidak valid, format salah, atau expired)
      return res.status(401).json({ 
        message: "Token invalid atau expired",
        login: false
      });
    }
  };
};