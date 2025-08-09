

const jwt = require('jsonwebtoken');


const auth= (requiredRole=null) => {

    return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
            if (err) {
              
                return res.status(400).json({ message: "Invalid token." });
            }else {
                 console.log("Token decoded successfully:", decoded);
                req.user = decoded;

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }
               
                   next();

            }

        });
       

       
     
    } catch (error) {       
        console.error("Token verification failed:", error);
        res.status(400).json({ message: "Invalid token." });
    }
};

}



export default auth;