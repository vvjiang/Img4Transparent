# Img4Transparent #

纯前端实现图片背景透明化

## 使用 ##

运行

    npm run dev

然后在页面上进行操作：

1. 上传图片
2. 点击图片，将以鼠标点击处的颜色为标准，对色差20之内的颜色进行透明化处理。（如果想调整色差标准，可以在控制台下设置transparentConfig.colorDiff）
3. 对出现透明化处理有有误的地方，可以开启恢复模式，再次移动鼠标到图片上，此时鼠标会变成红色小方框，小方框区域内会显示原始图像。点击后会将红色小方框区域内的图像恢复为原始图像。（如果想调整小方框尺寸，可以在控制台下通transparentConfig.setRecoverSize(30)的方式进行修改）
4. 下载图片，搞定。

实际应用可参考博客：

[http://www.cnblogs.com/vvjiang/p/9005804.html](http://www.cnblogs.com/vvjiang/p/9005804.html)
