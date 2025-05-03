// 表单切换逻辑
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

$(document).ready(function () {

    // 注册请求
    $('#register-form button1').click(function (e) {
        e.preventDefault(); // 阻止默认提交

        const username = $('#register-username').val();
        const email = $('#register-email').val();
        const password = $('#register-password').val();
        const confirmPassword = $('#register-confirmPassword').val();

        if (password !== confirmPassword) {
            alert('两次密码输入不一致！');
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/api/reguser',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                email: email,
                password: password
            }),
            success: function (res) {
                if (res.status === 0) {
                    alert('注册成功！请登录');
                    $('#register-form').addClass('hidden');
                    $('#login-form').removeClass('hidden');
                } else {
                    alert(res.message);
                }
            },
            error: function () {
                alert('注册失败，服务器错误！');
            }
        });
    });

    // 登录请求
    $('#login-button').click(function (e) {
        e.preventDefault(); // 阻止默认提交

        const email = $('#login-email').val();
        const password = $('#login-password').val();

        $.ajax({
            type: 'POST',
            url: '/api/login',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: function (res) {
                if (res.status === 0) {
                    // 保存服务器返回的 token 到 localStorage
                    localStorage.setItem('token', res.token);
                    alert('登录成功！');
                    // 登录成功后的操作，如跳转页面
                    window.location.href = '/myblog/blog/blog-index.html';
                } else {
                    alert(res.message);
                }
            },
            error: function () {
                alert('登录失败，服务器错误！');
            }
        });
    });
});