import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import cities from "./cities/route";
import counties from "./counties/route";
import countries from "./countries/route";
import departments from "./departments/route";
import departmentCategories from "./departmentCategories/route";
import regions from "./regions/route";
import productCategories from "./productCategories/route";
import userCategories from "./userCategories/route";
import materialImpacts from "./materialImpact/route";
import auth from "./auth/route";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3001", "https://admin.ekoru.cl"],
    credentials: true,
  })
); // Update with your frontend URL
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Ekoru Admin Server is running");
});

app.use("/api", auth);
app.use("/api", cities);
app.use("/api", regions);
app.use("/api", counties);
app.use("/api", countries);
app.use("/api", departments);
app.use("/api", departmentCategories);
app.use("/api", productCategories);
app.use("/api", userCategories);
app.use("/api", materialImpacts);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
