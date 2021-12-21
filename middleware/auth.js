
exports.auth = (req, res, next) => {
    if(req.session && req.session.user && req.session.user.isActive){
        req.user = req.session.user;
        next();
    }
    else{
        res.redirect('/login');
    }
}