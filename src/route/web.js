import express from "express";
import HomeController from "../controller/HomeController";
import multer from "multer";
import path from "path";
var appRoot = require("app-root-path");
let router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/src/public/image/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter });
let uploadMultipleFiles = multer({
  storage: storage,
  fileFilter: imageFilter,
}).array("multiple_images", 3);

const initWebRoute = (app) => {
  router.get("/", HomeController.getHomepage);
  router.get("/detail/user/:userId", HomeController.getDetailPage);
  router.post("/create-new-user", HomeController.createNewUSer);
  router.get("/upload", HomeController.getUploadfile);

  router.post("/delete-user", HomeController.deleteUser);
  router.get("/edit-user/:id", HomeController.editUser);
  router.post("/update-user", HomeController.UpdateUser);
  router.post(
    "/upload-profile-pic",
    upload.single("profile_pic"),
    HomeController.handleUploadfile
  );
  router.post(
    "/upload-multiple-images",
    (req, res, next) => {
      uploadMultipleFiles(req, res, (err) => {
        if (
          err instanceof multer.MulterError &&
          err.code === "LIMIT_UNEXPECTED_FILE"
        ) {
          // handle multer file limit error here
          res.send("LIMIT_UNEXPECTED_FILE");
        } else if (err) {
          res.send(err);
        } else {
          // make sure to call next() if all was well
          next();
        }
      });
    },
    HomeController.handleUploadMulti
  );

  router.get("/about", (req, res) => {
    res.send("helo");
  });
  return app.use("/", router);
};

export default initWebRoute;
