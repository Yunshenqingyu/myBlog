//tab
let btns=document.querySelectorAll('.tab-title li');
btns.forEach((item,i)=>{
    item.onclick=function(){
        let activeBtn=document.querySelector('.tab-title li.active');
        activeBtn.classList.remove('active');
        this.classList.add('active');
        let showPanel=document.querySelector('.tab-content .tab-panel.show');
        showPanel.classList.remove('show');
        let panels=document.querySelectorAll('.tab-content .tab-panel');
        panels[i].classList.add('show');
    }
})

 // 显示模态框
 function showEditModal() {
    document.getElementById('editModal').style.display = 'flex';
}

// 隐藏模态框
function hideEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 头像预览
document.getElementById('avatarInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.avatar-preview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});


// 点击模态框外部关闭
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        hideEditModal();
    }
}
let id,email;
$(document).ready(function(){
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
            id=user.id;
            email=user.email;
            /* console.log(id);
            console.log(email); */
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
    // 头像选择和预览
    $("#avatarInput").on('change', function() {
        var file = this.files[0];
        if (file) {
            // 创建FileReader对象
            var reader = new FileReader();
            reader.onload = function(e) {
                // 将预览的img标签的src属性设置为选中图片的base64数据
                $('.avatar-preview').attr('src', e.target.result);
                // 将 Base64 数据保存，供后续提交
                $('#avatarData').val(e.target.result);
            }
            // 读取文件为Data URL
            reader.readAsDataURL(file);
        }
    });

    // 表单提交处理
$('#profileForm').on('submit', function(e) {
    e.preventDefault(); // 阻止表单的默认提交行为

    // 禁用提交按钮，防止重复提交
    $('.confirm-btn').prop('disabled', true);

    // 获取昵称和个人简介的值
    var nickname = $('#nickname').val();
    var bio = $('#bio').val();
        
    const avatarFile = $('#avatarInput')[0].files[0];
  if (!avatarFile) {
    alert('请选择头像文件');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', avatarFile);

  $.ajax({
    url: '/my/update/avatar',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      Authorization: localStorage.getItem('token')
    },
    success: function(res) {
      if (res.status === 0) {
        alert('头像更新成功');
        location.reload(); // 可选：刷新页面显示新头像
      } else {
        alert('头像更新失败：' + res.message);
      }
    },
    error: function() {
      alert('请求出错，请检查网络');
    }
  });

    // Ajax请求更新用户基本信息
    $.ajax({
        url: '/my/userinfo',
        type: 'POST',
        data: {
            id:id,
            nickname: nickname,
            email:email,
            bio: bio
        },
        headers: {
            Authorization: localStorage.getItem('token')
        },
        success: function(res) {
            if(res.status === 0){
                // 更新成功的处理
                alert('基本信息更新成功');
                
            } else {
                // 处理失败的情况
                alert('基本信息更新失败：' + res.message);
                console.log(res.message);
            }
        },
        error: function(err) {
            alert('基本信息更新出错');
        },
        complete: function(){
            // 修改成功后的操作，如跳转页面
            window.location.href = '/myblog/myblog/myblog.html';
        }
    });
    });
});
