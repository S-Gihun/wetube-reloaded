import express from "express";
import morgan from "morgan"
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";



const app = express();  //express 어플리케이션 생성
const logger = morgan("dev");


app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true})); //express applicatio이 form의 value들을 이해할 수 있도록.  req.body 를 사용가능하게
// videoRouter보다 위에 있어야하는 이유는 poseEdit을 가지고 있는 videoRouter보다 위에 있어야 req.body 사용이 가능하기 때문이다.

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL })
})) // 브라우저가 우리의 backend와 상호작용할 때마다 session이라는 middleware가 브라우저에 cookie를 전송한다.
// cookie는 backend가 나의 브라우저에 주는 정보 

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/uploads", express.static("uploads"));
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;