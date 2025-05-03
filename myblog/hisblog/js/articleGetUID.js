$(document).ready(function(){
    $.ajax({
        url: '/my/article/listUID', // 后端文章列表接口
        type: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token')
        },
        success: function(response) {
            if (response.status === 0) {
                var articles = response.data;
                if(articles.length!==0) $('#articlesContainer').empty(); // 清空现有内容
                for (var i = 0; i < articles.length; i++) {
                    var article = articles[i];
                    var id=article.Id;
                    var title = article.title;
                    var content = article.content;
                    var cover_img = article.cover_img;
                    // 截取文章内容前15个字，超出部分用...替代
                    if (content.length > 15) {
                        content = content.substring(0, 15) + '...';
                    }

                    // 动态生成文章的HTML结构
                    var articleHtml = `
                    <a href="javascript: void(0)" data-id="${id}" class="page">
                        <div class="article-card">
                            <div class="article-title">
                                <h3>${title}</h3>
                            </div>
                            <img class="article-img" src="${cover_img}">
                            <div class="article-container">
                                <p>${content}</p>  
                                <div id="favo">
                                    <button class="favorite"><i class="fa fa-comment" aria-hidden="true" /></i>评论</button>
                                    <button class="favorite"><i class="fa fa-paper-plane" aria-hidden="true" /></i>分享</button>
                                    <button class="favorite"><i class="fa fa-heart" aria-hidden="true" /></i>喜欢</button>
                                    <button class="favorite"><i class="fa fa-star" aria-hidden="true" /></i>收藏</button>
                                </div>  
                            </div>
                        </div>
                    </a>
                    `;
                    // 将生成的HTML添加到页面的容器中
                    $('#articlesContainer').append(articleHtml);
                }
            } else {
                alert('获取文章列表失败：' + response.message);
            }
        },
        error: function() {
            alert('请求失败，请检查网络或后端服务是否正常');
        }
    });
    // 点击文章跳转对应文章页面
    $(document).on('click', '.page', function() {
        const articleId = $(this).data('id'); // 注意小写
        // 使用AJAX获取文章详情
        $.ajax({
            url: `/my/article/${articleId}`,
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(response) {
                if (response.success) {
                    // 跳转到文章详情页并传递数据
                    window.location.href = `/myblog/page/page.html?id=${articleId}`;
                } else {
                    alert('获取文章失败: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('请求失败: ' + error);
            }
        });
    });
});
