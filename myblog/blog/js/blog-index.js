//响应式导航栏
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.mobile-nav .nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    // 点击菜单外区域关闭菜单
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.mobile-nav')) {
            navLinks.classList.remove('active');
        }
    });
});

//tab选项卡
//tab
let btns=document.querySelectorAll('.tab-title li')
btns.forEach((item,i)=>{
    item.onclick=function(){
        let activeBtn=document.querySelector('.tab-title li.active')
        activeBtn.classList.remove('active')
        
        this.classList.add('active')

        
        let showPanel=document.querySelector('.tab-content .tab-panel.show')
        showPanel.classList.remove('show')
        let panels=document.querySelectorAll('.tab-content .tab-panel')
        panels[i].classList.add('show')
    }
})