$.ajax({
    url: '/my/userinfo',
    type: 'GET',
    dataType: 'json',
    headers: {
      // 如果需要身份验证，通常在这里添加 token
      'Authorization': localStorage.getItem('token')
    },
    success: function(response) {
      // 请求成功处理
      if (response.status === 0) { // 假设返回状态码 0 表示成功
        const user = response.data;
        $('.concern-id').text("UID: "+user.id);
        $('#username').text(user.username);
        $('.username').text(user.nickname);
        $('#email').text(user.email);
        $('.avatar').attr('src', user.user_pic);
        $('.inf p').text(user.bio);
      } else {
        console.error('获取用户信息失败:', response.message);
      }
    },
    error: function(xhr, status, error) {
      // 请求失败处理
      console.error('请求失败:', status, error);
      const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : '服务器连接失败';
      alert('获取用户信息失败: ' + errorMsg);
    }
  });