var ascii=require("./Ascii");
function encrypt(password)
{
     var p=11,q=13;
     var N=p*q;
     var  e=19;
     var c=0;
     for(var i=0;i<password.length;i++)
       c=c+ascii(password.charAt(i));
     var CT=Math.pow(c,e)%N;
    return CT;
}
module.exports=encrypt;