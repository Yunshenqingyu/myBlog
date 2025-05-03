//开场动画
const text = document.querySelector('.text');
    text.innerHTML = text.textContent.replace(/\S/g,"<span>$&</span>");
    const letters = document.querySelectorAll("span");
    for (let i = 0; i < letters.length; i++) {
    (function(i) {
        setTimeout(function() {
            letters[i].classList.add('growing');
        }, i * 10);
    })(i);
}
setTimeout(function(){
    for (let i = 0; i < letters.length; i++) {
        letters[i].addEventListener('mouseover', function() {
            letters[i].classList.add('active');
        });
    }
},10*letters.length);

let stars=document.getElementById('stars');
let Obj=function(){}
Obj.prototype.drawStar = function(){ 
    let odiv = document.createElement('div');  
    odiv.style.width = '7px';
    odiv.style.height = '7px';
    odiv.style.position = 'absolute';  
    odiv.style.left = Math.floor(document.body.clientWidth*Math.random())+'px';   
    odiv.style.top = Math.floor(document.body.clientHeight*Math.random())+'px';
    odiv.style.overflow = 'hidden'; 
    stars.appendChild(odiv);   
    let ostar = document.createElement('img'); 
    ostar.style.width = '49px';
    ostar.style.height = '7px';
    ostar.src = 'image/star.png';
    ostar.style.position = 'absolute';   
    ostar.style.top = '0px';
    odiv.appendChild(ostar); 
    Play(ostar);   
}
function Play(ele){
    let i = Math.floor(Math.random()*7); 
    let timer = setInterval(function(){    
        if(i<7){
            ele.style.left = -i*7+'px';
            i++;
        }else{
            i = 0;
        }  
    },100);
}
for(let i=0; i<150; i++){/*控制星星数量*/ 
    let obj = new Obj();
    obj.drawStar();
}