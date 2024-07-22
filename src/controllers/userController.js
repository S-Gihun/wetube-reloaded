import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
export const postJoin = async(req, res) => {
    const { email, password, password2, username, name, location} = req.body;
    if(password !== password2){
        return res.render("join", {
            pageTitle: "Join", errorMessage: "Password confirmation does not match.",
        })
    }
    const exists = await User.exists({$or: [{ username },{ email }]});  //username: req.body.username을 username:username 을 username으로 단축할 수 있다. $
    if(exists){
        return res.status(400).render("join", {pageTitle: "Join", errorMessage: "This username/email is already taken.", });
    }
    try{
        await User.create({
            name, username, email, password, password2, location,
        })
        return res.redirect("/login");
    } catch(error) {
        return res.status(400).render("join", {pageTitle: "Join", errorMessage: error._message, });
    }
}

export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async(req,res) => {
    // check if account exists
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username }); //req.body에서 가져온 username을 가지는 User을 찾다.
    if(!user){
        return res.status(400).render("login", { pageTitle, errorMessage: "An account with this username does not exists.",})
    }
    // check if password correct
    const ok = await bcrypt.compare(password, user.password); // password 유저가 입력한 비밀번호 user.password === username과 일치하는 user의 hash된 비밀번호 값
    if(!ok){
        return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password",})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Logout")
export const see = (req, res) => res.send("See User")
