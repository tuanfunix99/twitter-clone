const User = require("../models/user.model");

exports.auth = async (req, res, next) => {
    if(req.session && req.session.user && req.session.user.isActive){
        const user = await User.findById(req.session.user._id, '_id avatar username isActive email')
        req.user = user;
        next();
    }
    else{
        res.redirect('/login');
    }
}