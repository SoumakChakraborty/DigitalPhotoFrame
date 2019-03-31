var x=document.querySelector("#usernameshow");
var y=document.querySelector(".user-items");
var flag=false;
x.addEventListener("click",function()
{
     if(!flag)
     {
         y.classList.remove("user-items");
         y.classList.add("user-items-hover");
         flag=true;
     }
     else
     {
        y.classList.remove("user-items-hover");
        y.classList.add("user-items");
        flag=false;
     }
});