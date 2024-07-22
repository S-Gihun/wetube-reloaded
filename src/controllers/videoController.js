import Video from "../models/video";

/*
Video.find({}, (error, videos) =>{
    if(error){
        return res.render("server-error");
    }
    return res.render("home", {pageTitle: "Home", videos: []}); //render (view이름 , 템플릿에 보낼 변수)
})
*/
export const home = async(req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc"});
    return res.render("home", {pageTitle: "Home", videos}); //render (view이름 , 템플릿에 보낼 변수)

}

export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    return res.render("watch", { pageTitle : video.title, video}); //video:video === video
}
export const getEdit = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video});
}
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({_id : id}); // ture or false 를 반환 !!
    // const video = await Video.findById(id);
    if(!video){
        return res.render("404", {pageTitle:"Video not found."});
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
    const {title, hashtags, description } = req.body;
    try{
        await Video.create({
            title: title,  //왼쪽은 스키마의 title 오른쪽은 위 title 을 의미 req.body
            description: description,
            hashtags: Video.formatHashtags(hashtags),
        })
        //위에 const video = new Video{}로 하고 await video.save(); //데이터를 database에 전송하는데 시간이 걸린다. await async을 통해 database에 파일이 저장되는 것을 기다릴 수 있다.
        return res.redirect("/");
    } catch(error) {
        return res.status(400).render("upload", {pageTitle: "Upload Video", errorMessage: error._message, });
    }
}

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    await Video.findByIdAndDelete(id); // findByIdAndDelete(id) = findOneAndDelete({ _id : id })
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
        });
    }
    return res.render("search", {pageTitle: "Search", videos});
}