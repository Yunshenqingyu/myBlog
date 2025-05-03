$(document).ready(function() {
    // 给表单添加提交事件
    $('#postForm').submit(function(e) {
        e.preventDefault(); // 阻止表单默认提交
        
        // 创建 FormData 对象（支持文件上传）
        const formData = new FormData();
        
        // 添加文本字段（确保输入字段有 name 属性）
        formData.append('title', $('.post-form input[type="text"]').val());
        formData.append('content', $('.post-form textarea').val());
        
        // 添加封面图片（注意字段名需与后端一致）
        const coverImg = $('#fileInput')[0].files[0];
        if (coverImg) {
            formData.append('cover_img', coverImg);
        }

        // 发送 AJAX 请求
        $.ajax({
            url: '/my/article/add',   // 对应你的路由地址
            type: 'POST',
            data: formData,
            contentType: false,       // 需要设置为 false 用于 FormData
            processData: false,       // 需要设置为 false 用于 FormData
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(response) {
                if (response.status === 0) {
                    alert('发布成功！');
                    // 可选：跳转到文章列表页
                    window.location.href = '/myblog/blog/blog-index.html';
                } else {
                    alert('发布失败: ' + response.message);
                }
            },
            error: function(xhr) {
                alert('请求出错: ' + xhr.responseJSON.message);
            }
        });
    });

});