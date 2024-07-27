import Video from "../models/video";
import User from "../models/User";
/*
Video.find({}, (error, videos) =>{
    if(error){
        return res.render("server-error");
    }
    return res.render("home", {pageTitle: "Home", videos: []}); //render (view이름 , 템플릿에 보낼 변수)
})
*/
export const home = async(req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc"}).populate("owner");
    return res.render("home", {pageTitle: "Home", videos}); //render (view이름 , 템플릿에 보낼 변수)

}

export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await(await Video.findById(id)).populate("owner"); //populate id로 유저 전체를 불러올 수 있다.
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    return res.render("watch", { pageTitle : video.title, video}); //video:video === video
}
export const getEdit = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const { user: { _id}, } = req.session;
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    if (String(video.owner) !== _id) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video});
}
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const { user: { _id}, } = req.session;
    const video = await Video.exists({_id : id}); // ture or false 를 반환 !!
    // const video = await Video.findById(id);
    if(!video){
        return res.render("404", {pageTitle:"Video not found."});
    }
    if (String(video.owner) !== _id) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title, description, hashtags : Video.formatHashtags(hashtags),
    })
    return res.redirect(`/videos/${id}`);
}

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle : "Upload Video"})
}

export const postUpload = async (req, res) => {
    // here we will add a video to the vidoes array.
    const { user: { _id }, } = req.session;
    const { file } = req;
    const {title, hashtags, description } = req.body;
    try{
        const newVideo = await Video.create({
            title: title,  //왼쪽은 스키마의 title 오른쪽은 위 title 을 의미 req.body
            description: description,
            fileUrl: file.path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id)
        user.videos.push(newVideo._id);
        user.save();
        //위에 const video = new Video{}로 하고 await video.save(); //데이터를 database에 전송하는데 시간이 걸린다. await async을 통해 database에 파일이 저장되는 것을 기다릴 수 있다.
        return res.redirect("/");
    } catch(error) {
        return res.status(400).render("upload", {pageTitle: "Upload Video", errorMessage: error._message, });
    }
}

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const { user: { _id}, } = req.session;
    const video = await Video.findById(id);
    const user = await User.findById(_id);
    if (String(video.owner) !== _id) {
        return res.status(403).redirect("/");
    }
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    await Video.findByIdAndDelete(id); // findByIdAndDelete(id) = findOneAndDelete({ _id : id })
    user.videos.splice(user.videos.indexOf(id), 1);
    user.save();
    return res.redirect("/");
}

export const search = async(req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`${keyword}$`, "i"),
            },
        }).poplulate("owenr");
    }
    return res.render("search", {pageTitle: "Search", videos});
}