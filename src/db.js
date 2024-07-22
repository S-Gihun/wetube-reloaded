import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL); // database에 연결


const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB"); 
const handleError = (error) => console.log("❌ DB ERROR", error);
db.on("error", handleError);  //on 은 click 마냥 여러번 호출이 가능
db.once("open", handleOpen);  //once는 한 번만 호출.  

//CRUD Create Read Update Delete