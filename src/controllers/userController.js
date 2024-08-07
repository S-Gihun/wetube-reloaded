import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import Video from "../models/video";
import { errorMonitor } from "connect-mongo";

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
    const user = await User.findOne({ username, socialOnly: false }); //req.body에서 가져온 username을 가지는 User을 찾다.
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

export const startGithubLogin = (req, res) => {
    const baseUrl = 'https://github.com/login/oauth/authorize?';
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email", //scope에서 정보를 받아왔기 때문에 token에 정보가 저장되고 그 token을 통해 fetch (url)이 가능한 것
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async(req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id : process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(await fetch(finalUrl, { // fetch = url에서 정보를 가져오는 방법 
        method:"POST",
        headers: {
            Accept: "application/json",
        }
    })).json();

    // const json = await data.json(); // .json() data에 들어있는 정보가 json이라고 생각하면 편하다.
    if("access_token" in tokenRequest){
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await(await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })).json();
        console.log(userData);
        const emailData = await(await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            }
        })).json();
        const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if(!user){
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name ? userData.name: "Unknown",
                username: userData.login,
                email: emailObj.email,
                password:"",
                socialOnly: true,
                location:userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
    
}
export const logout = (req, res) => {
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;
    req.flash("info", "Bye Bye");
    return res.redirect("/");
}
export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit profile"});
}
export const postEdit = async(req, res) => {
    const pageTitle = "Edit Profile";
    const {
        session: {
            user: {_id, email: sessionEmail, username: sessionUsername, avatarUrl},
        },
        file,
    } = req; // const _id = req.session.user._id
    const {name, email, username, location} = req.body;
    
    const currentUser = req.session.user;

    if (currentUser.email !== email && (await User.exists({ email }))) {
      return res.status(400).render('edit-profile', {
        pageTitle,
        errorMessage: 'This email is already taken.',
      });
    }
  
    if (currentUser.username !== username && (await User.exists({ username }))) {
      return res.status(400).render('edit-profile', {
        pageTitle,
        errorMessage: 'This username is already taken.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,
        name, 
        email, 
        username, 
        location, 
    }, {new: true})
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    if (req.session.user.socailOnly === true) {
        req.flash("error", "Can't change password");
        return res.redirect("/");
    }
    return res.render("user/change-password", { pageTitle: "Change Password"});
}

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: {_id, password},
        },
        body: {oldPassword, newPassword, newPasswordConfirmation},
    } = req;
    const ok = await bcrypt.compare(oldPassword, password); // form에서 가져온 비밀번호랑 현재 로그인된 사용자의 비밀번호 비교
    if(!ok) {
        return res.status(400).render("user/change-password", { pageTitle: "Change Password", errorMessage: "The current password is incorrect",});
    }
    if (newPassword !== newPasswordConfirmation){
        return res.status(400).render("user/change-password", { pageTitle: "Change Password", errorMessage: "The password does not match the confirmation",});
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save() // pre("save") hash 작업 하기 위해 !
    req.session.user.password = user.password //session 업데이트 해주기
    req.flash("info", "Password updated");
    return res.redirect("/users/logout");
}

export const see = async(req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("videos");
    if(!user) {
        return res.status(404).render("404", {pageTitle: "User not found."});
    }
    
    
    return res.render("user/profile", { pageTitle: `${user.name}의 Profile`, user});
}
