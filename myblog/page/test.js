$(document).ready(function() {
    // 解析URL参数
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const articleId = getQueryParam('id');
   let authorId;
   let commentId;
    if (articleId) {
        // 获取文章详情
        $.ajax({
            url: `/my/article/${articleId}`,
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    authorId = data.user_id;
                    // 填充页面内容
                    $('.post-title').text(data.title);
                    $('.author-name').text(data.nickname);
                    $('.author-avatar').attr('src', data.avatar);
                    $('.cover-img img').attr('src', data.cover_img);
                    // 处理内容格式（假设内容包含换行）
                    const content = data.content.split('\n').map(p => `<p>${p}</p>`).join('');
                    $('.post-body').html(content);
                    //处理日期
                    const pubDate = new Date(data.pub_date);
                    const formattedDate = pubDate.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false // 24小时制
                    }).replace(/\//g, '-').replace(/,/, '');
                    $('.post-time').text(formattedDate); 

                } else {
                    alert('获取文章失败: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('请求失败: ' + error);
            }
        });
    } else {
        alert('无效的文章ID');
        window.location.href = '/'; // 跳转回首页
    }
    //跳转作者主页
    $('.author-nickname').on('click', function() {
        
        $.ajax({
          url: `/my/userinfo/${authorId}`,
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token')
          },
          success: function(response) {
            if (response.success) {
              window.location.href = `/myblog/hisblog/hisblog.html?id=${authorId}`;
            } else {
              alert('用户不存在');
            }
          },
          error: function() {
            alert('获取用户信息失败');
          }
        });
      });
    // 发布评论
    $('.comment-form').on('submit', function(e) {
        e.preventDefault(); // 阻止默认表单提交
        
        // 获取输入内容
        const content = $('.comment-input').val().trim();
        
        // 简单验证
        if (!content) {
            alert('评论内容不能为空！');
            return;
        }

        // 发送 AJAX 请求
        $.ajax({
            url: '/my/article/addComment', 
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            data: {
                article_id: articleId, // 对应后端的 req.body.article_id
                content: content      // 对应后端的 req.body.content
            },
            success: function(response) {
                if (response.status === 0) {
                    $('.comment-input').val(''); // 清空输入框
                    alert('评论发布成功！');
                    // 跳转到文章详情页并传递数据
                    window.location.href = `/myblog/page/page.html?id=${articleId}`;
                } else {
                    alert(response.message || '发布失败');
                }
            },
            error: function(xhr, status, error) {
                alert('请求失败: ' + error);
            }
        });
    });

    // 发送AJAX请求获取评论（假设当前文章ID存在变量中）
    $.ajax({
        type: "POST",
        url: `/my/article/listComment?article_Id=${articleId}`,  // 确保这个路由与你的后端路由一致
        headers: {
            'Authorization': localStorage.getItem('token')
        },
        data: {
            article_Id: articleId  // 这里替换为实际的文章ID获取方式
        },
        success: function(response) {
            if (response.success) {
                const data = response.data;
                commentId = data.user_id;
                renderComments(response.data);
            } else {
                console.error('获取评论失败：', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('请求失败：', error);
        }
    });

    // 渲染评论函数
    function renderComments(comments) {
        const $container = $('.comment-list');
        $container.empty(); // 清空现有内容
        comments.forEach(comment => {
            //处理日期
            const date = new Date(comment.pub_date);
            const formattedDate = date.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai', // 指定 UTC 时区
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 禁用 12 小时制
            }).replace(/\//g, '-').replace(/,/, '');
            const commentHtml = `
                <div class="comment-item">
                    <img src="${comment.avatar}" class="comment-avatar" data-userid="${comment.user_id}" alt="用户头像">
                    <div class="comment-content">
                        <div class="comment-author">${comment.nickname}</div>
                        <p class="comment-text">${comment.content}</p>
                        <div class="comment-time">${formattedDate}</div>
                    </div>
                </div>
            `;
            $container.append(commentHtml);
        });
    }
    //跳转评论者者主页
    $('.comment-list').on('click', '.comment-avatar', function() {
        // 直接从data属性获取
        const userId = $(this).data('userid');
        window.location.href = `/myblog/hisblog/hisblog.html?id=${userId}`;
    });


});