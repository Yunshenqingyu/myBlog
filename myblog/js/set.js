/*
作者: imsyy
主页：https://www.imsyy.top/
GitHub：https://github.com/imsyy/home
版权所有，请勿删除
*/

// 修复 1：增加安全解析函数
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// 背景图片 Cookies
function setBgImg(bg_img) {
  if (bg_img) {
    // 修复 2：必须序列化对象
    Cookies.set("bg_img", JSON.stringify(bg_img), { // 强制序列化
      expires: 36500,
    });
    return true;
  }
  return false;
}

// 获取背景图片 Cookies
function getBgImg() {
  const bg_img_local = Cookies.get("bg_img");
  // 修复 3：更安全的解析逻辑
  const parsed = safeJsonParse(bg_img_local);
  if (parsed && typeof parsed === "object") {
    return parsed;
  } else {
    // 修复 4：初始化时存储序列化后的默认配置
    setBgImg(bg_img_preinstall);
    return { ...bg_img_preinstall }; // 返回副本避免污染源数据
  }
}

function setBgImgDefault() {
  const bg_img = getBgImg(); // 获取最新配置
  let imgIndex = 1 + ~~(Math.random() * 2);
  let imgUrl = `/myblog/img/background${imgIndex}.webp`;
  let attempts = 0;
  const maxAttempts = 3;

  // 修复 5：确保 bg_img[1] 存在
  if (!bg_img[1]) bg_img[1] = bg_img_preinstall[1];

  while (attempts++ < maxAttempts) {
    if (bg_img[1] === imgUrl) {
      imgIndex = 1 + ~~(Math.random() * 2);
      imgUrl = `/myblog/img/background${imgIndex}.webp`;
    } else {
      bg_img[1] = imgUrl;
      setBgImg(bg_img); // 存储更新后的配置
      break;
    }
  }

  return (callback) => {
    const img = new Image();
    img.onload = () => callback(imgUrl);
    img.onerror = () => callback(bg_img_preinstall[1]); // 失败时回退到预设默认值
    img.src = imgUrl;
  };
}

// 修复 6：冻结默认配置防止意外修改
const bg_img_preinstall = Object.freeze({
  type: "1",
  1: "./img/background1.webp",
  2: "https://api.dujin.org/bing/1920.php",
  3: "https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images",
  4: "https://www.dmoe.cc/random.php",
});

// 修复 7：异步初始化逻辑
document.addEventListener("DOMContentLoaded", () => {
  const currentConfig = getBgImg();
  if (currentConfig.type === "1") {
    setBgImgDefault()((imgUrl) => {
      // 更新内存中的配置引用
      const updatedConfig = getBgImg();
      updatedConfig[1] = imgUrl;
      setBgImg(updatedConfig);
      
      // 直接应用新背景
      $("body").css("background-image", `url("${imgUrl}")`);
    });
  }
  setBgImgInit();
});


// 随机默认壁纸url加载
if (getBgImg()["type"] === "1") {
  setBgImgDefault()((imgUrl) => {
    console.log(imgUrl);
    bg_img_preinstall[1] = imgUrl;
  });
}

// 更改背景图片
function setBgImgInit() {
  let bg_img = getBgImg();
  $("input[name='wallpaper-type'][value=" + bg_img["type"] + "]").click();

  // switch (bg_img["type"]) {
  //   case "1":
  //     // $("#bg").attr(
  //     //   "src",
  //     //   `./img/background${1 + ~~(Math.random() * 10)}.webp`
  //     // ); //随机默认壁纸
  //     break;
  //   case "2":
  //     // $("#bg").attr("src", bg_img_preinstall[2]); //必应每日
  //     break;
  //   case "3":
  //     // $("#bg").attr("src", bg_img_preinstall[3]); //随机风景
  //     break;
  //   case "4":
  //     // $("#bg").attr("src", bg_img_preinstall[4]); //随机动漫
  //     break;
  // }
  // 初始背景加载
  $("body").css("background-image", `url("${bg_img_preinstall[bg_img["type"]]}")`);
}

// 即时切换背景图片
function changeBg(type) {
  let bg_img = getBgImg();
  bg_img["type"] = type;
  setBgImg(bg_img);

  $("body").css("background-image", `url("${bg_img_preinstall[type]}")`);
}

$(document).ready(function () {
  // 壁纸数据加载
  setBgImgInit();
  // 设置背景图片
  $("#wallpaper").on("click", ".set-wallpaper", function () {
    let type = $(this).val();
    // let bg_img = getBgImg();
    // bg_img["type"] = type;
    changeBg(type);
    iziToast.show({
      icon: "fa-solid fa-image",
      timeout: 2500,
      message: "壁纸设置成功，刷新后生效",
    });
    // setBgImg(bg_img);
  });
});
