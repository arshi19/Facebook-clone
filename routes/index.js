var express = require("express");
const upload = require("./multer");
var router = express.Router();
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");

const userDetail = require("../model/userDetail");
const Blog = require("../model/blogDetail");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const { url } = require("inspector");
const { array } = require("./multer");

// passport.use(new LocalStrategy(userDetail.authenticate()));

// passport.use(userDetail.createStrategy());

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
    },
    userDetail.authenticate()
  )
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("loginFacebook");
});

router.post("/register", function (req, res, next) {
  const { username, email, password } = req.body;

  const newUser = new userDetail({
    username,
    email,
  });

  userDetail
    .register(newUser, req.body.password)
    .then(() => res.redirect("/"))
    .catch((err) => res.send(err));
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/forgetFacebookPass",
  }),
  function (req, res, next) {}
);

router.get("/profile", isLoggedIn, function (req, res, next) {
  res.redirect("/home");
});

router.get("/writePost", isLoggedIn, function (req, res, next) {
  res.render("writePost", { user: req.user });
});
router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.render("loginFacebook");
  });
});
router.get("/contact", isLoggedIn, function (req, res, next) {
  res.render("contact", { user: req.user });
});


//@#$%@#%@#$%@#$%@#%^@#%^@  ERROR !@#$%!@%@#%$%!#@!#!~!@#$^$%^$%##^#

router.get("/ownProfile", isLoggedIn, function (req, res, next) {

  Blog.find({author:req.user._id})
  .populate("author")
  .then( (det) =>{ 
    // res.render("own_profile", { user: req.user, posts: det });
    userDetail.findById(req.user._id)
    .then( elee =>{
      Blog.find({_id:elee.stories})
      .populate("author")
      .then((temp) => {
        // res.json(temp);
        res.render("own_profile", { user: req.user, posts: det , saved:temp});
      })
    })

  })
  .catch(err => res.send(err));

  // res.render("own_profile", { user: req.user, posts: dataa });
  // res.render("own_profile", { user: req.user });
});

//@#$%@#%@#$%@#$%@#%^@#%^@  ERROR !@#$%!@%@#%$%!#@!#!~!@#$^$%^$%##^#

router.get("/home", isLoggedIn, function (req, res, next) {
  Blog.find()
    .populate("author")
    .then(function (posts) {
      // res.json(posts);
      res.render("home", { user: req.user, posts: posts });
    })
    .catch(function (err) {
      res.send(err);
    });
});
router.get("/about", isLoggedIn, function (req, res, next) {
  
  userDetail.findById(req.user._id)
    .then( elee =>{
      Blog.find({_id:elee.stories})
      .populate("author")
      .then((temp) => {
        // res.json(temp);
        res.render("about", { user: req.user, saved:temp});
      })
    })
    .catch(err => res.send(err));
});
router.get("/login", function (req, res, next) {
  res.render("login_page");
});
router.get("/signup", function (req, res, next) {
  res.render("signup_page");
});
router.get("/resetPass", isLoggedIn, function (req, res, next) {
  res.render("resetPas", {user : req.user});
});
router.get("/forgetFacebookPass", function (req, res, next) {
  res.render("forgetFacebookPass");
});
router.get("/updateProfileDetailPage", isLoggedIn, function (req, res, next) {
  res.render("updateProfileData", { user: req.user });
});
router.get("/editPost/:id", isLoggedIn, function (req, res, next) {
  Blog.findById(req.params.id)
  .then((det) =>{
    // res.json(det);
    res.render("updatePostData", { posts: det , user:req.user });
  })
  .catch(err => res.send(err));
  
});

router.post(
  "/updateProfilePic",
  isLoggedIn,
  upload.single("avatar"),
  function (req, res, next) {
    if (!req.file) {
      res.redirect("/ownprofile");
    }
    userDetail
      .findByIdAndUpdate(req.user._id, { avatar: req.file.filename })
      .then(function () {
        if (req.body.oldavatar !== "dummy.jpg") {
          fs.unlinkSync(
            path.join(__dirname, "..", "public", "uploads", req.body.oldavatar)
          );
        }
        res.redirect("/ownprofile");
      })
      .catch(function (err) {
        res.send(err);
      });
    // })
  }
);

router.get("/removeProfile", isLoggedIn, function (req, res, next) {
  userDetail
    .findByIdAndUpdate(req.user._id, { avatar: "dummy.jpg" })
    .then((det) => {
      if (det.avatar !== "dummy.jpg") {
        fs.unlinkSync(
          path.join(__dirname, "..", "public", "uploads", det.avatar)
        );
      }

      res.redirect("/ownProfile");
    })
    .catch(function (err) {
      res.send(err);
    });
});

router.get("/deletee", isLoggedIn, function (req, res, next) {
  userDetail
    .findByIdAndDelete(req.user._id)
    .then((det) => {
      det.lists.forEach(function (idds) {
        Blog.findByIdAndDelete(idds).then(async (det) => {
          await det.blog.forEach((ele) => {
            if (ele.type === "image") {
              let url = ele.data.file.url;
              let filename = url.substring(url.lastIndexOf("/") + 1);

              fs.unlinkSync(
                path.join(__dirname, "..", "public", "uploads", filename)
              );
            }
          });
        });
      });
      res.redirect("/logout");
    })
    .catch(function (err) {
      res.send(err);
    });
});

router.post("/updateProfileData", isLoggedIn, function (req, res, next) {
  const { username, about } = req.body;
  userDetail
    .findByIdAndUpdate(req.user._id, { username, about })
    .then(() => {
      res.redirect("/ownProfile");
    })
    .catch((err) => res.send(err));
});

router.post("/ressetPassword", isLoggedIn, function (req, res) {
  const { oldPassword, newPassword } = req.body;

  req.user.changePassword(oldPassword, newPassword, function (err, user) {
    if (err) {
      res.send(err);
    }
    res.redirect("/logout");
  });
});

router.post("/forgetPassword", function (req, res, next) {
  const { email } = req.body;
  userDetail
    .findOne({ email })
    .then((userFound) => {
      if (userFound === null) {
        return res.send(
          "<h1 style='color: red; position: absolute;left: 50%;transform: translateX(-50%); margin-top: 5vmax; text-align: center;'>User Not Found <br> <a style='color:black;' href='/forgetFacebookPass'>Go Back</a></h1>"
        );
      }
      // ***********************************

      const link = `${req.protocol}://${req.get("host")}/change_password/${
        userFound._id
      }`;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "arshiqamar19@gmail.com",
          pass: "orkdvyaacvybbvzt",
        },
      });

      var mailOptions = {
        from: "arshiqamar19@gmail.com",
        to: req.body.email,
        subject: "Forget Password",
        html: `<p>This Link is one time valid , And cannot be access after one try . Change your password carefully <br> <a style="text-decoration: none;" href='${link}'>Click here to change</a></p>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          userFound.resetToken = 1;
          userFound.save();
          res.send(
            "<h1 style='color:rgb(23, 197, 23); position: absolute;left: 50%;transform: translateX(-50%); margin-top: 5vmax; text-align: center;'>Message Sent Successfully <br> <br> <a style='color: #000000;' href='/'>Go Back</a></h1>"
          );
        }
      });
      // ***********************************
    })
    .catch((err) => res.send(err));
});

router.get("/change_password/:id", function (req, res, next) {
  const id = req.params.id;
  userDetail.findById(id)
  .then((user) =>{
    res.render("changPassword", { id: id , user:user});
  })
  .catch(err => res.send(err));
  
  //   res.send("<h1 style='color:red; position: absolute;left: 50%;transform: translateX(-50%); margin-top: 5vmax; text-align: center;'>Link Expired <br> <br> <a style='color: #000000;' href='/login'>Go to Login Page</a></h1>");
});

router.post("/changeePassword/:id", function (req, res, next) {
  userDetail
    .findById(req.params.id)
    .then((usr) => {
      if (!usr) {
        return res.send("User Not Found");
      }
      if (usr.resetToken === 1) {
        usr.setPassword(req.body.newPassword, function (err, user) {
          if (err) {
            res.send(err);
          }
          usr.resetToken = 0;
          usr.save();
          res.redirect("/");
        });
      } else {
        res.send(
          "<h1 style='color:red; position: absolute;left: 50%;transform: translateX(-50%); margin-top: 5vmax; text-align: center;'>Link Expired <br> <br> <a style='color: #000000;' href='/'>Go to Login Page</a></h1>"
        );
      }
    })
    .catch((err) => res.send(err));
});

router.post("/uploadFile", upload.single("avatar"), function (req, res, next) {
  res.json({
    success: 1,
    file: {
      url: "http://localhost:3000/uploads/" + req.file.filename,
      // any other image data you want to store, such as width, height, color, extension, etc
    },
  });
});

router.post("/write", isLoggedIn, async function (req, res, next) {
  if (!req.body) {
    res.send("Empty");
    return;
  }
  const newBlog = new Blog({
    author: req.user._id,
    blog: req.body,
  });
  req.user.lists.push(newBlog._id);
  await req.user.save();
  await newBlog.save();

  res.redirect("/profile");
});

router.get("/savePost/:id", isLoggedIn, function (req, res, next) {
  userDetail
    .findByIdAndUpdate(req.user._id, {
      $addToSet: {
        stories: req.params.id,
      },
    })
    .then(() => {
      res.redirect("/home");
    })
    .catch((err) => res.send(err));
  // req.user.stories.push(req.params.id);
  // req.user.save();
  // res.redirect("/home");
});

router.get("/unSavePost/:id", isLoggedIn, function (req, res, next) {
  userDetail
    .findByIdAndUpdate(req.user._id, {
      $pull: {
        stories: req.params.id,
      },
    })
    .then(() => {
      res.redirect("/about");
    })
    .catch((err) => res.send(err));
  // req.user.stories.push(req.params.id);
  // req.user.save();
  // res.redirect("/home");
});

router.get("/lists", isLoggedIn, function (req, res, next) {
  Blog.find()
    .populate("author")
    .then(function (posts) {
      // res.json(posts);
      res.render("homepage", { posts: posts });
    })
    .catch(function (err) {
      res.send(err);
    });
});

router.get("/deletePost/:id", isLoggedIn, function (req, res, next) {
  // firstly we have to delete the images that is uploaded in this post
  // secondly we have to delete this post detail from Blog
  // third we have to delete the id of this post from the list of the userDetail

  const listId = req.params.id;

  Blog.findByIdAndDelete(req.params.id)
    .then(async (det) => {
      await det.blog.forEach((ele) => {
        if (ele.type === "image") {
          let url = ele.data.file.url;
          let filename = url.substring(url.lastIndexOf("/") + 1);

          fs.unlinkSync(
            path.join(__dirname, "..", "public", "uploads", filename)
          );
        }
      });
      await userDetail.findByIdAndUpdate(req.user._id, {
        $pull: {
          lists: req.params.id,
        },
      });
      
      res.redirect("/ownProfile");
    })
    .catch((err) => res.send(err));
});




function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.render("loginFacebook");
}
module.exports = router;

// const url = chk.file.url;
// const filename = url.substring(url.lastIndexOf("/") + 1);
