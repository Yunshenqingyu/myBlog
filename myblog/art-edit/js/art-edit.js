$(document).ready(function() {
    // 获取文章ID（假设通过URL参数传递）
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    // 获取文章数据填充表单
    if (articleId) {
        $.ajax({
            url: `/my/article/${articleId}`, // 根据实际路由调整
            type: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(response) {
                $('input[name="title"]').val(response.data.title);
                $('textarea[name="content"]').val(response.data.content);
                  // 显示原有图片
                  if (response.data.cover_img) {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${response.data.cover_img}" class="preview-image">
                        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
                    `;
                    previewContainer.appendChild(preview);
                }
            },
            error: function(xhr) {
                alert('获取文章失败: ' + xhr.responseJSON.message);
            }
        });
    }

    // 提交更新
    $('#postForm').submit(function(e) {
        e.preventDefault();
        
        // 创建 FormData 对象（支持文件上传）
        const formData = new FormData();
        formData.append('Id', articleId); // 添加文章ID到表单数据
        // 添加文本字段（确保输入字段有 name 属性）
        formData.append('title', $('.post-form input[type="text"]').val());
        formData.append('content', $('.post-form textarea').val());
        console.log($('.post-form input[type="text"]').val());
        // 添加封面图片（注意字段名需与后端一致）
        const coverImg = $('#fileInput')[0].files[0];
        if (coverImg) {
            formData.append('cover_img', coverImg);
        }
        $.ajax({
            url: '/my/article/edit', // 根据实际路由调整
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(response) {
                if (response.status === 0) {
                    alert('更新成功！');
                    window.location.href = '/myblog/myblog/myblog.html'; // 可选跳转
                }else {
                    alert('更新失败: ' + response.message);
                }
            },
            error: function(xhr) {
                alert('更新失败: ' + xhr.responseJSON.message);
            }
        });
    });
    // 删除文章
    $('.delete-btn').click(function(e) {
        e.preventDefault();
        if (!confirm('确定要删除这篇文章吗？')) return;
        $.ajax({
            url: `/my/article/delete/${articleId}`,
            type: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function() {
                alert('删除成功！');
                window.location.href = '/myblog/myblog/myblog.html'; // 可选跳转
            },
            error: function(xhr) {
                alert(`删除失败: ${xhr.responseJSON?.message || '服务器错误'}`);
            }
        });
    });
});