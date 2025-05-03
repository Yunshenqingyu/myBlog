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