const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors);
app.use("/", express.static("public"));

app.listen(8888, () => {
  console.log("Start server");
});

const data = [
  {
    name: "",
    image: "http://103.207.38.161:3000/km.png",
    zalo: "https://zalo.me/g/sevthi083",
  },
];

app.post("/login", (req, res) => {
  res.json({
    status: 1,
    code: 200,
    message: "Thành công",
    data: {
      userName: "Nguyễn Trường Thăng",
      token: "thisisatokenforapi",
    },
  });
});

app.get("/list", (req, res) => {
  console.log(Date());
  res.json({
    status: 1,
    code: 200,
    message: "Thành công",
    data: data,
  });
});
