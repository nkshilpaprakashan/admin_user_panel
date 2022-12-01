const express = require("express")
const app = express();
const path = require("path")
const ejs = require("ejs")
const sessions=require("express-session")
const port = process.env.PORT || 4000
require("./db/conn");
const Register = require("./models/registers");
const { log } = require("console");
var objectId=require('mongodb').ObjectId


const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")

app.use(sessions({
    //session setup //flag=1
    resave:true,
    saveUninitialized:true,
    secret:'randomwordtyfrtdtrudiftfi',    
}))

app.use((req, res, next) => {

    //to reload
    res.set("Cache-Control", "no-store");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));//to get the data from the user

app.use(express.static(static_path))

app.set("view engine", "ejs")

app.set("views", template_path);//instead of lookingto views go and look to templates

//ejs.registerPartials(partials_path)

app.get('/', (req, res) => {
    //if(flag=1)
    if(req.session.anything){
        res.redirect('/login2')
    }else{

        res.render("index")
    }
})





let email;




//login check
app.post('/login', async (req, res) => {

    
    try {
        
        email = req.body.email;
        let password = req.body.password;

        console.log(`${email} and password is ${password}`)
        const userdata = await Register.findOne({ email: email })

       

        console.log(userdata)
        


        if (userdata.password === password) {
            //flag=1
            //session created

            req.session.anything=true
            
            res.redirect("/login2")

        } 
        else {
            res.send("password incorrect ");

        }

    } catch (error) {
        res.status(400).send("Invalid login details");
    }


})





app.get("/login2",(req,res)=>{
    if(email==='admin@gmail.com'){
     

        if(req.session.anything){
                   
                    Register.find((err,data)=>{
                        if(err){
                            console.log(error)
                        }
                        else{
                            res.render("admin",{fulldata:data});
                           
                        }
                    })
            
                   
              
    
        }else{
            res.redirect("/")
        }
    }else{

        if(req.session.anything){
            res.status(201).render("login");
        }else{
            res.redirect("/")
        }
    }
    
    
})



app.post('/searching',(req,res)=>{
   let search=req.body.search
Register.find({$or:[{first_name:search},{last_name:search},{email:search}]},(err,data)=>{
        if(err){
            console.log(error)
        }
        else{
            res.render("admin",{fulldata:data});
           
        }
    })
})

app.post('/clearsearch',(req,res)=>{
    Register.find((err,data)=>{
        if(err){
            console.log('error')
        }
        else{
            res.render("admin",{fulldata:data});
           
        }
    })
})



app.get('/register', (req, res) => {
    res.render("register")
})

// app.post('/register',(req,res)=>{
//     res.render("register")
//     })


//create new user in database
app.post('/register', async (req, res) => {
    try {
        // console.log(req.body.first_name);
        // res.send(req.body.first_name);

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;



        if (password === cpassword) {

            const registeruser = new Register({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            })

            const registered = await registeruser.save();
            /* res.status(201).render("index");*/
            res.redirect('/')

        } else {
            res.send("Password are not matching")
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/')
    
})

app.get('/edits/:id',(req,res)=>{
    let userid=req.params.id
Register.findByIdAndUpdate({_id:objectId(userid)},req.body,{new:true},(err,docs)=>{
    if(err){
        console.log("no edit")
        next(err);
    }else{
        console.log("updated")
        res.render('editpage',{Register:docs})
        
    }
})
console.log(userid);

})

app.post('/editpage/:id',(req,res,next)=>{
    let userid=req.params.id
    Register.findByIdAndUpdate({_id:objectId(userid)},req.body,(err,docs)=>{
        if(err){
            console.log("no edit")
            next(err);
        }else{
            console.log("updated")
            res.redirect('/login2')
            
        }
})
})



app.get('/delete/:id',(req,res,next)=>{
let userid=req.params.id
Register.findByIdAndDelete({_id:objectId(userid)},function(err,docs){
    if(err){
        console.log(err)
        next(err);
    }else{
        console.log("Deleted:",docs)
        res.redirect('/login2')
        
    }
})
console.log(userid);

})





app.post('/addnewuser', async (req, res) => {

    res.render("adminuserregister")
    
})

//create new user in database by admin
app.post('/adduser', async (req, res) => {
    try {
       

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {

            const registeruser = new Register({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            })

            const registered = await registeruser.save();
            /* res.status(201).render("index");*/
            res.redirect('/login2')

        } else {
            res.send("Password are not matching")
        }
    } catch (error) {
        res.status(400).send(error);
    }
})



app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})