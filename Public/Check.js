function check()
{
   var pass=document.querySelector("#password");
   var retype=document.querySelector("#retypepassword");
   if(pass.value!=retype.value)
   {
    alert("Passwords do not match");
    return false;
   }
 return true;
}
