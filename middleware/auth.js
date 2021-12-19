
const auth = (req, res, next) => {
    if(req.session && req.session.user){
        req.user = req.session.user;
        next();
    }
    else{
        res.redirect('/login');
    }
}

module.exports = auth;