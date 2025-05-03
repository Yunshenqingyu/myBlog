//tab
let btns = document.querySelectorAll(".tab-title li");
btns.forEach((item, i) => {
  item.onclick = function () {
    let activeBtn = document.querySelector(".tab-title li.active");
    activeBtn.classList.remove("active");
    this.classList.add("active");
    let showPanel = document.querySelector(".tab-content .tab-panel.show");
    showPanel.classList.remove("show");
    let panels = document.querySelectorAll(".tab-content .tab-panel");
    panels[i].classList.add("show");
  };
});
const urlParams = new URLSearchParams(window.location.search);
const authorid = urlParams.get("id");
$.ajax({
  url: `/my/userinfo/${authorid}`,
  type: "GET",
  dataType: "json",
  headers: {
    // 如果需要身份验证，通常在这里添加 token
    Authorization: localStorage.getItem("token"),
  },
  success: function (response) {
    // 请求成功处理
    if (response.status === 0) {
      // 假设返回状态码 0 表示成功
      const user = response.data;
      $(".concern-id").text("UID: " + user.id);
      $("#username").text(user.username);
      $(".username").text(user.nickname);
      $("#email").text(user.email);
      $(".avatar").attr("src", user.user_pic);
      console.log(user.user_pic);
      $(".inf p").text(user.bio);
    } else {
      console.error("获取用户信息失败:", response.message);
    }
  },
  error: function (xhr, status, error) {
    // 请求失败处理
    console.error("请求失败:", status, error);
    const errorMsg = xhr.responseJSON
      ? xhr.responseJSON.message
      : "服务器连接失败";
    alert("获取用户信息失败: " + errorMsg);
  },
});
$(document).ready(function(){
  $.ajax({
      url: `/my/article/listAID/${authorid}`, // 后端文章列表接口
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