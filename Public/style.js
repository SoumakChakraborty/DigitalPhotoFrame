var img=document.querySelector(".viewimg");
img.addEventListener("mouseover",function()
{
   img.textContent="View gallery >>";
});
img.addEventListener("mouseout",function()
{
   img.textContent="View gallery";
});