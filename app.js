var express           = require("express");
var app               = express();
var mongoose          = require("mongoose");
var expresssantize    = require("express-sanitizer");
var methodOverride    = require("method-override");
var  passport         = require("passport");
var User              = require("./models/user");
var  LocalStrategy    = require("passport-local");
const Customer        = require("./models/DB_Schema");
var flash             = require("connect-flash");

const user = require("./models/user")
mongoose.connect(" mongodb://127.0.0.1:27017/USERS6",{
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useCreateIndex": true
    // other deprecations
},(err)=>{
    console.log(err);
});



app.use(express.static("public"));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expresssantize());
app.set("view engine","ejs");
app.set('views', __dirname + '/views');

//PASSPORT EXPRESSION
app.use(require("express-session")({
    secret: "this is a secret session by (ME)",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());


app.use(function (req,res,next){

    res.locals.currentUser = req.user;
    next();
});
//redirect to index page and then to show page
app.get("/",function (req,res){
    res.redirect("/meetings");

});

//finding the data of particular user and show them
app.get("/meetings",isLoggedIn,function (req,res){


    Customer.find({"author.id":req.user.id},function (err,dt)
    {

        if (err) {

                    console.log("error");
                 }
        else
                {
                     res.render("index",{meeting:dt,currentUser:req.user});
                }

       })
});

app.post("/create/:id",isLoggedIn,function(req,res){


    const { title, timing,withw } = req.body;

    User.findById(req.params.id,function (err,founddata){
        if(err)
               {
                    res.render("/");
               }
        else
               {    const meet = new Customer({ title, timing,withw });
                    meet.author.id = req.user._id;
                    meet.save()
                    res.redirect("/");
               }
    });
});

// inser new meeting in database
app.get("/meetings/:id/new",isLoggedIn,function (req,res){

    user.findById(req.params.id,function (err,founduser){
        if(err)
              {
                      res.render("/");
              }

        else
              {
                       res.render("new",{new_data: founduser});
              }
    });
});

//EDIT Route
app.post("/meetings/:id/edit",isLoggedIn,function (req,res){

    Customer.findById(req.params.id,function (err,foundmeeting){
        if(err)
                {
                     res.render("/");
                }

        else
                {
                    res.render("edit",{new_data: foundmeeting});
                }
    });
});

// UPDATE ROUTE
app.put("/meetings/:id",isLoggedIn,function (req,res){

    var title = req.body.title;
    var timing = req.body.timing;
    var withw = req.body.withw;
    var newDATA = {title:title,timing:timing,withw:withw};

    Customer.findByIdAndUpdate(req.params.id,newDATA,function (err,updt){
             if(err){
                       res.redirect("/");
                    }
             else
                    {
                        res.redirect("/");
                    }

    });
});

app.delete("/meetings/:id",isLoggedIn,function (req,res){

    Customer.findByIdAndRemove(req.params.id,function (err){
        if(err){
                  res.redirect("/");
               }

        else
               {
                  res.redirect("/");
               }

    });
});

//AUTH ROUTES
//signup logics
app.get("/register",function (req,res){

    res.render("register");

});

app.post("/register",function (req,res){

            var newUser = new User({username:req.body.username});
            User.register(newUser,req.body.password,function (err,user){
                if(err)
                       {
                           return res.render("register");
                       }
                passport.authenticate("local")(req,res,function (){
                    res.redirect("/");


                });
});


});


//login login
app.get("/login",function (req,res){

    res.render("login");

});

app.post("/login",passport.authenticate("local",
    {successRedirect:"/",failureRedirect:"/login"}),
    function (req,res){

   });


app.get("/logout",function (req,res){

    req.logout();
    res.redirect("/login");

});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();

    }
    req.flash("sucess","something is wrong");
    res.redirect("/login");


}


app.listen(3000,function (){
    console.log("Server is Listening...");

});