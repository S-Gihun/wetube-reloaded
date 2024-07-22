import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/videoController";


const videoRouter = express.Router();


videoRouter.get("/:id([0-9a-f]{24})", watch); // : 파라미터 -> 변수라는 것을 알려주는 것

videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);

videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);


videoRouter.route("/upload").get(getUpload).post(postUpload);


/*
videoRouter.get("/:id(\\d+)/edit", getEdit); // (\\d+) 숫자만 가능하게 정규식
videoRouter.post("/:id(\\d+)/edit", postEdit)
*/


export default videoRouter;