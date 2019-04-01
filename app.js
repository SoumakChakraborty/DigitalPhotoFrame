var express=require("express");
var app=express();
var f=require("fs-extra");
var conn=require("./modules/connection");
var encrypt=require("./modules/Encrypt");
var session=require("express-session");
var sanitizer=require("express-sanitizer");
var body=require("body-parser");
var files=require("express-fileupload");
var method=require("method-override");
var email=require("emailjs");
app.use(body.urlencoded({extended:true}));
var c=0;
var uname="";
app.use(files());
app.use(sanitizer());
app.use(method("_method"));
var flash=require("connect-flash");
app.use(session({
   secret:"This is it",
   resave:false,
   saveUninitialized:false
}));
app.use(flash());
app.set("view engine","ejs");
app.use(express.static("Public"));
app.get("/",function(req,res)
{
   c=0;
   res.render("landing");
});
app.get("/check",function(req,res)
{
     var IP=req.connection.remoteAddress;
     var user=req.headers["user-agent"];
     var sessid=encrypt(IP+""+user);
     var flag=false;
     conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
     {
            if(result.length==0)
            {
                 flag=false;
                 req.flash("msg","You need to sign in/sign up");
                 c++;
            }
            else
              flag=true;
         if(!flag)
           res.render("details",{msg:req.flash("msg"),c:c,error:req.flash("error")});
         else
           res.redirect("/showuser"); 
     });
});
app.get("/signup",function(req,res)
{
      res.render("signup",{error:req.flash("error")});
});
app.post("/signup",function(req,res)
{
    var fname=req.body.firstname;
    var lname=req.body.lastname;
    var email=req.body.username;
    var pass=req.body.password;
    var firstpass=encrypt(pass);
    firstpass="P"+firstpass+"D";
    var secondpass=encrypt(firstpass);
    conn.query("select * from user where username='"+email+"'",function(error,result,fields)
    {
      if(result.length==0)
      {   
        conn.query("insert into user(fname,lname,username,password) values("+"'"+fname+"'"+","+"'"+lname+"'"+","+"'"+email+"'"+","+"'"+secondpass+"'"+")",function(err,result,fields)
        {
         if(err)
         {
               res.redirect("/signup");
         }
         else
           res.redirect("/check");
       });
      }
     else
     {
        req.flash("error","Username exists");
        res.redirect("/signup");
     } 
   });  
});
app.post("/signin",function(req,res)
{
    var username=req.body.username;
    var password=req.body.password;
    var firstpass=encrypt(password);
    firstpass="P"+firstpass+"D";
    var secondpass=encrypt(firstpass);
    conn.query("select * from user where username='"+username+"'",function(err,result,fields)
    {
         if(result.length==0)
         {
             req.flash("error","Username does not exist");
             res.redirect("/check");
         }
         else if(result[0].password!=secondpass)
         {
          req.flash("error","Wrong password");
          res.redirect("/check");
         }
         else
         {
          var IP=req.connection.remoteAddress;
          var user=req.headers["user-agent"];
          var sessid=encrypt(IP+""+user);
          conn.query("insert into state(uid,IP,sessid) values("+"'"+result[0].uid+"'"+","+"'"+IP+"'"+","+"'"+sessid+"'"+")",function(error,ures,field)
          {
            if(error)
              console.log(error);
           else
           {    
             res.redirect("/showuser");
            }
          });      
        }
    });
});
app.get("/showuser",function(req,res)
{
    var IP=req.connection.remoteAddress;
    var user=req.headers["user-agent"];
    var sessid=encrypt(IP+""+user);
    conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
    {
         conn.query("select * from user where uid='"+result[0].uid+"'",function(error,results,fields)
         {
             uname="";
             uname=results[0].fname+" "+results[0].lname;
             conn.query("select * from album where user='"+results[0].username+"'",function(e,r,f)
             {
                  if(r.length==0)
                    res.render("showuser",{username:uname,album:"",usermail:results[0].username});
                  else
                  {
                    res.render("showuser",{username:uname,album:r,usermail:results[0].username});
                  }
             });
         });
    });
});
app.get("/signout",function(req,res)
{
  var IP=req.connection.remoteAddress;
  var user=req.headers["user-agent"];
  var sessid=encrypt(IP+""+user);
  conn.query("delete from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,field)
  {
  });
  res.redirect("/check");  
});
app.get("/create/album",function(req,res)
{
     res.render("createalbum");
});
app.post("/create/album",function(req,res)
{
  var IP=req.connection.remoteAddress;
  var user=req.headers["user-agent"];
  var sessid=encrypt(IP+""+user);
  conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
  {
      if(result.length==0)
        res.redirect("/check");
  });
   var album_name=req.sanitize(req.body.albumname);
   var description=req.sanitize(req.body.albumdescription);
   var date=new Date();
   var created=date.getUTCFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"+parseInt(date.getDate());
   var IP=req.connection.remoteAddress;
   var user=req.headers["user-agent"];
   var sessid=encrypt(IP+""+user);
   conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(error,result,field)
   {
        conn.query("select * from user where uid='"+result[0].uid+"'",function(err,results,fields)
        {
           conn.query("insert into album values("+"'"+results[0].username+"'"+","+"'"+album_name+"'"+","+"'"+description+"'"+","+"'"+created+"'"+")",function(e,r,f)
           {
             if(e)
               console.log(e);
           });
        });
   });
   res.redirect("/showuser"); 
});
app.get("/show/album/:userid/:id",function(req,res)
{
  var IP=req.connection.remoteAddress;
   var user=req.headers["user-agent"];
   var sessid=encrypt(IP+""+user);
  conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
  {
      if(result.length==0)
        res.redirect("/check");
  });
    conn.query("select * from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(err,result,fields)
    {
         conn.query("select * from album where user='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(e,r,f)
         {
            res.render("showalbum",{result:result,count:result.length,username:req.params.userid,album:r});
         });
    });
});
app.get("/create/photo/:userid/:id",function(req,res)
{
  var IP=req.connection.remoteAddress;
   var user=req.headers["user-agent"];
   var sessid=encrypt(IP+""+user);
  conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
  {
      if(result.length==0)
        res.redirect("/check");
  });
    res.render("createphoto",{user:req.params.userid,album:req.params.id});
});
app.post("/create/photo/:userid/:id",function(req,res)
{
    var photoname=req.body.photoname;
    var photo=req.files.photofile;
    var description=req.body.photodescription;
    photo.mv("./Public/uploads/"+photoname+"_"+req.params.userid+".jpg",function(err)
    {
        if(err)
         console.log(err);
    });
    conn.query("insert into photos values("+"'"+req.params.userid+"'"+","+"'"+photoname+"_"+req.params.userid+".jpg"+"'"+","+"'"+description+"'"+","+"'"+req.params.id+"'"+")",function(err,result,fields)
    {
        if(err)
           console.log(err);
    });
    res.redirect("/show/album/"+req.params.userid+"/"+req.params.id);
});
app.get("/Edit/:userid/:id",function(req,res)
{
  var IP=req.connection.remoteAddress;
   var user=req.headers["user-agent"];
   var sessid=encrypt(IP+""+user);
  conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
  {
      if(result.length==0)
        res.redirect("/check");
  });
     conn.query("select * from album where user='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(err,result,fields)
     {
         res.render("editalbum",{result:result});
     });
});
app.put("/Edit/:userid/:id",function(req,res)
{
     var albumname=req.body.albumname;
     var description=req.body.albumdescription;
     var alb=req.params.id;
    if(albumname!=req.params.id)
    { 
     conn.query("update album set album_name='"+albumname+"'"+"where user='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(error,result,fields)
     {
     });
     conn.query("update photos set album_name='"+albumname+"'"+"where username='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(e,r,f)
     {
     });
     alb=albumname;
    }
     conn.query("update album set description='"+description+"'"+"where user='"+req.params.userid+"'"+"and album_name='"+alb+"'",function(error,result,fields)
     {
     });
     var date=new Date();
    var created=date.getUTCFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"+parseInt(date.getDate());
    conn.query("update album set created='"+created+"'"+"where user='"+req.params.userid+"'"+"and album_name='"+alb+"'",function(error,result,fields)
    {
    });  
    res.redirect("/show/album/"+req.params.userid+"/"+alb); 
});
app.delete("/Delete/:userid/:id",function(req,res)
{
    conn.query("select photo_name from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(error,result,fields)
    {
          for(var i=0;i<result.length;i++)
          {
            f.unlink("./Public/uploads/"+result[i],function(err)
            {
                 if(err)
                   console.log(err);
            });
          }
    });
    conn.query("delete from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(error,result,fields)
    {
    });
    conn.query("delete from album where user='"+req.params.userid+"'"+"and album_name='"+req.params.id+"'",function(error,result,fields)
    {
    }); 
   res.redirect("/showuser"); 
});
app.get("/show/:userid/:album/:id",function(req,res)
{
  var IP=req.connection.remoteAddress;
  var user=req.headers["user-agent"];
  var sessid=encrypt(IP+""+user);
 conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
 {
     if(result.length==0)
       res.redirect("/check");
  });
    conn.query("select * from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.album+"'"+"and photo_name='"+req.params.id+"'",function(err,result,fields)
    {
      res.render("showimage",{result:result,username:req.params.userid,album:req.params.album});
    });
});
app.get("/Edit/:userid/:album/:id",function(req,res)
{
  var IP=req.connection.remoteAddress;
   var user=req.headers["user-agent"];
   var sessid=encrypt(IP+""+user);
  conn.query("select * from state where IP='"+IP+"'"+"and sessid='"+sessid+"'",function(err,result,fields)
  {
      if(result.length==0)
        res.redirect("/check");
  });
  conn.query("select * from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.album+"'"+"and photo_name='"+req.params.id+"'",function(err,result,fields)
  {
    res.render("editimage",{result:result,username:req.params.userid,album:req.params.album});
  });
});
app.put("/Edit/:userid/:album/:id",function(req,res)
{
    var photoname=req.body.photoname;
    var description=req.body.photodescription;
    if(req.params.id!=photoname)
    {
      f.rename("./Public/Uploads/"+req.params.id,"./Public/Uploads/"+photoname+"_"+req.params.userid+".jpg",function(err)
      {
         if(err)
           console.log(err);
      });
    }
   conn.query("update photos set photo_name='"+photoname+"_"+req.params.userid+".jpg"+"'"+"where username='"+req.params.userid+"'"+"and album_name='"+req.params.album+"'",function(error,result,fields)
   {
   });
   conn.query("update photos set description='"+description+"'"+"where username='"+req.params.userid+"'"+"and album_name='"+req.params.album+"'",function(error,result,fields)
   {
   });
   if(req.params.id!=photoname) 
     res.redirect("/show/"+req.params.userid+"/"+req.params.album+"/"+photoname+"_"+req.params.userid+".jpg");
   else
   res.redirect("/show/"+req.params.userid+"/"+req.params.album+"/"+req.params.id);
});
app.delete("/Delete/:userid/:album/:id",function(req,res)
{
         f.unlink("./Public/uploads/"+req.params.id,function(error)
         {
            if(error)
              console.log(error);      
         });
        conn.query("delete from photos where username='"+req.params.userid+"'"+"and album_name='"+req.params.album+"'"+"and photo_name='"+req.params.id+"'",function(err,result,fields)
        {
        });
    res.redirect("/show/album/"+req.params.userid+"/"+req.params.album);    
});
app.get("/changepassword/:id",function(req,res)
{
   res.render("changepass",{username:req.params.id});
});
app.put("/changepassword/:id",function(req,res)
{
   var password=req.body.password;
   var firstpass=encrypt(password);
   firstpass="P"+firstpass+"D";
   var secondpass=encrypt(firstpass);
   conn.query("update user set password='"+secondpass+"'"+"where username='"+req.params.id+"'",function(err,result,fields)
   {
       if(err)
         console.log(err);
   });
   res.redirect("/showuser");
});
app.get("/forgotpass",function(req,res)
{
   res.render("forgotpass");
});
app.post("/forgotpass",function(req,res)
{
    var usermail=req.body.username;
    var server=email.server.connect({
        user:"yelpcamp500@gmail.com",
        password:"Windows90#",
        host:"smtp.gmail.com",
        ssl:true
    });
    server.send({
        from:"yelpcamp500@gmail.com",
        to:usermail,
        text:"Please click on the link: http://localhost:3000/resetpass/"+usermail+" \n to reset your password\nRegards,\nDigital Frame team"
    },function(err,msg)
    {
        console.log(err||msg);
    });
    res.redirect("/check");
});
app.get("/resetpass/:id",function(req,res)
{
    res.render("resetpassword",{username:req.params.id});
});
app.put("/resetpass/:id",function(req,res)
{
  var password=req.body.password;
  var firstpass=encrypt(password);
  firstpass="P"+firstpass+"D";
  var secondpass=encrypt(firstpass);
  conn.query("update user set password='"+secondpass+"'"+"where username='"+req.params.id+"'",function(err,result,fields)
  {
      if(err)
        console.log(err);
  });
  res.redirect("/check");
});
app.listen(3000,"192.168.0.101",function()
{
     console.log("Server has started");
});