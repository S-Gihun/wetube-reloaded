import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true, maxLength: 80},
  fileUrl: {type: String, required: true},
  description: {type: String, required: true, trim: true, minLength:20},
  createdAt: { type: Date, required: true, default: Date.now}, //Date.now() 를 하지 않은 이유는 바로 실행하지않고 비디오를 만들었을 때 실행하기 위해서
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true}, 
    rating:{ type: Number, default: 0, required: true}, 
  },
  owner : { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
});

videoSchema.static("formatHashtags", function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
})

/*
videoSchema.pre("save", async function() {
    this.hashtags = this.hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})
*/
const Video = mongoose.model("Video", videoSchema);
export default Video;