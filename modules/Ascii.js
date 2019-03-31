function getAscii(c)
{
    var upper="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lower="abcdefghijklmnopqrstuvwxyz";
    var number="0123456789";
    var lowstart=97;
    var upstart=65;
    var numstart=48;
    var ascii=new Object();
    for(var i=0;i<upper.length;i++)
       ascii[upper.charAt(i)]=upstart++;
    for(var i=0;i<lower.length;i++)
      ascii[lower.charAt(i)]=lowstart++;
    for(var i=0;i<number.length;i++)
      ascii[number.charAt(i)]=numstart++;
    ascii["!"]=33;
    ascii["@"]=64;
    ascii["#"]=35;
    ascii["$"]=36;
    ascii["%"]=37;
    ascii["^"]=97;
    ascii["&"]=38;
    ascii["*"]=42;
    ascii["("]=40;
    ascii[")"]=41;
    ascii["-"]=45;
    ascii["_"]=95;
    ascii["/"]=47;
    ascii["."]=46;
    ascii[" "]=32;
    ascii[";"]=59;
    ascii[","]=44;
  return ascii[c];  
}
module.exports=getAscii;