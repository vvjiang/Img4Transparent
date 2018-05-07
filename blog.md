## 前言 ##

不论是做一些2d的小游戏，或者制作小图标，或者抠图都需要用到这个功能，对图片的背景进行透明化，是我们经常需要用到的一个功能。

通常情况下我们都会去下载PS或者美图秀秀这样的软件去制作。

但是我真的不想仅仅为了做个透明图像就去下载这些软件，这些软件不仅体积大，要下载个半天，放在电脑上也占空间。

最重要的是每次我做这个事情，都需要去临时百度一下制作透明图片的方法。

这些软件固然强大，但是功能的众多或者需要一些基础知识，往往造成了一些门槛。

简单点说，虽然瑞士军刀很6，但是我现在只需要一把起子，我不想知道什么蒙版图层，不想在一堆什么美颜什么各种滤镜之中找半天，我就想上传个图片点两下就好了。

** 那么能不能在线对图片进行背景透明化呢？ **

当然是有的，下面是网址

[http://www.aigei.com/bgremover/](http://www.aigei.com/bgremover/)

你以为我是来推荐网站的？当然不是。

我之所以提到这个网站，是因为我以前就是用这个做一些处理的，但是真的不是很给力啊。

我并不知道它的原理，也没有看过它的代码，但是它的缺陷很明显：

    1、不能对指定颜色进行透明化
    2、当需要对色差很大的多种颜色进行透明化时，无能为力
    3、对一些图片的透明化处理不够完美，会出现锯齿，但是又无法进行进一步处理
    4、对复杂图片完全无能为力

有问题就解决问题呗，于是就有了今天的小玩意。

## 作品 ##

与之前的作品一样，直接将功能写在这篇博客里了，所以可以直接在博客园中使用。

使用方法：

    1、上传图片
    2、点击图片，将以鼠标点击处的颜色为标准，对色差20之内的颜色进行透明化处理。（如果想调整色差标准，可以在控制台下设置transparentConfig.colorDiff）
    3、对出现透明化处理有有误的地方，可以开启恢复模式，再次移动鼠标到图片上，此时鼠标会变成红色小方框，小方框区域内会显示原始图像。点击后会将红色小方框区域内的图像恢复为原始图像。（如果想调整小方框尺寸，可以在控制台下通过transparentConfig.setRecoverSize(30)的方式进行修改）
    4、下载图片，搞定。

当然按照本懒人的惯例，还是只在chrome浏览器下实现，所以如果您用其它浏览器的话可能无法正常操作。

不过本应用的核心功能与以往一样都是可以在现代浏览器中实现的，只是需要您调一下兼容性。

如果您有闲情逸致，想研究一下的话，这是为本项目的 [GitHub地址](https://github.com/vvjiang/Img4Transparent)，为了能方便复制进博客园，所以代码是直接写在html中的。

少说废话，以下为应用：

## 技术点 ##

本应用依然只使用纯前端实现，涉及到的技术点如下：

    1、获取图片文件
    2、将文件转换为图片,并放入canvas中
    3、点击canvas获取点击处的颜色信息
    4、根据指定颜色，对图像中在色差范围内的颜色进行透明化处理
    5、自定义鼠标，在鼠标上显示指定区域内原始图像
    6、对图像上指定区域，进行图像还原操作
    7、下载图片

其中技术点1，2，7在之前的一篇博客中有涉及到，所以这里就不再赘述，不了解的可以去看一下我之前写的那篇博客：[在博客园里给图片加水印(canvas + drag)](http://www.cnblogs.com/vvjiang/p/8673879.html)

那么，接下来就让我们看一下具体的实现吧。

## 点击图片获取点击处的颜色信息 ##

通过type为file类型的input获取到文件，然后通过FileReader读取文件信息后放入到canvas中。

这是前两步所做的工作，现在我们需要做的是点击图像（实际上是canvas）获取到点击处的颜色信息。

首先我们需要获取到原始图像的像素信息，并保存下来，这一步在图片加载时实现，部分代码如下：

    var ctx = document.getElementById('target_canvas').getContext('2d');
    imgDataArr = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

** 小课堂开始：**

canvas的getImageData会获取canvas中指定区域内的图像信息，返回一个ImageData对象。

ImageData对象的data属性的值是一个Uint8ClampedArray对象，而这个对象就是图像的像素信息。

Uint8ClampedArray看名字可以了解到，它是一个定型数组，里面的值都是0-255范围之内的值。

假如我们有一个图片只有四个像素，长2px，宽2px。左上角的像素和右下角的像素为黑色，而右上角和左下角的像素为白色。那么这张图片会以怎样的形式存储在Uint8ClampedArray数组中呢？

首先我们了解到白色的RGBA值为rgba(255,255,255,255)，黑色的RGBA值为rgba(0,0,0,255)。

那么这张图片的分解为rgba值，分别为

    rgba(0,0,0,255)           rgba(255,255,255,255)
    rgba(255,255,255,255)     rgba(0,0,0,255)

那么颜色值将会以从左到右，从上至下的方式存储到Uint8ClampedArray数组中，如下：

    [0,0,0,255,255,255,255,255,255,255,255,255,0,0,0,255]

小课堂讲解完毕，回到正题。

现在我们已经拿到了原始图像的像素信息了，并存放在了imgDataArr这个Uint8ClampedArray数组中。

如何获取鼠标点击处的像素信息呢？代码如下：

    /**
      * 获取图像数据中指定偏移处的颜色信息
      */
    function getColorInfo(imgDataArr, offsetX, offsetY) {
      var pos = canvasInfo.width * 4 * offsetY + offsetX * 4;
      return {
        rValue: imgDataArr[pos],
        gValue: imgDataArr[pos + 1],
        bValue: imgDataArr[pos + 2],
        aValue: imgDataArr[pos + 3]
      }
    }

    /**
     * 非恢复模式下，点击canvas，以点击处颜色为标准，去掉颜色色差在指定色差范围内的颜色
     */
    function transparetModeCanvasClick(e) {
      if (imgDataArr.length === 0) {
        return;
      }
      if (resultImgDataArr.length === 0) {
        resultImgDataArr = imgDataArr.slice(0)
      }
      var clickColorInfo = getColorInfo(resultImgDataArr, e.offsetX, e.offsetY)
      ...
    }

我们会给canvas绑定回调函数为transparetModeCanvasClick的click事件，那么，在鼠标点击canvas后，我们就可以获取到鼠标相对于canvas左上角的点击位置。

imgDataArr里面保存的是原始的图像像素信息，之后还会用到，所以这里不做处理。

那么就copy数据到当前像素信息数组resultImgDataArr中。

然后获取像素信息时需要计算像素在一维数组中的位置：

    var pos = canvasInfo.width * 4 * offsetY + offsetX * 4;

根据上面的表达式得到点击的那个像素在一维数组中的位置，如果有仔细阅读之前Uint8ClampedArray存储像素信息的方式，这个表达式应该不难理解。

## 判断颜色与指定颜色的色差，并做透明化处理 ##

在获取到点击像素的颜色信息后，我们需要去遍历整个canvas的像素信息，对于色差小于指定范围的颜色做透明化处理。代码如下：

    /**
     * 获取图像数据指定位置颜色与指定颜色的色差
     */
    function getColorDiff(imgDataArr, pos, colorInfo) {
      var value = Math.pow(imgDataArr[pos] - colorInfo.rValue, 2) +
        Math.pow(imgDataArr[pos + 1] - colorInfo.gValue, 2) +
        Math.pow(imgDataArr[pos + 2] - colorInfo.bValue, 2);

        return Math.pow(value, 0.5);
    }
    /**
     * 设置图像数据指定位置为透明色
     */
    function setTransparent(imgDataArr, pos) {
      imgDataArr[pos] = 0;
      imgDataArr[pos + 1] = 0;
      imgDataArr[pos + 2] = 0;
      imgDataArr[pos + 3] = 0;
    }
    /**
     * 非恢复模式下，点击canvas，以点击处颜色为标准，去掉颜色色差在指定色差范围内的颜色
     */
    function transparetModeCanvasClick(e) {
      if (imgDataArr.length === 0) {
        return;
      }
      if (resultImgDataArr.length === 0) {
        resultImgDataArr = imgDataArr.slice(0)
      }
      var clickColorInfo = getColorInfo(resultImgDataArr, e.offsetX, e.offsetY)
      var ctx = document.getElementById('target_canvas').getContext('2d');
      for (var pos = 0, len = canvasInfo.height * canvasInfo.height * 4; pos < len; pos = pos + 4) {
        if (getColorDiff(resultImgDataArr, pos, clickColorInfo) < transparentConfig.colorDiff) {
          setTransparent(resultImgDataArr, pos);
        }
      }
      ctx.putImageData(new ImageData(resultImgDataArr, canvasInfo.width, canvasInfo.height), 0, 0);
    }

色差计算公式为将rgb三个值的颜色相减，将他们的平方和进行开方即可。

至于设置图片为透明色，实际上只需要将

    imgDataArr[pos + 3] = 0;

即可。
但是为了和一般声明的透明颜色保持一致，还是将其他几个值都设为0。

将数据设为透明色的数据之后，需要调用canvas的putImageData方法将整个图像的数据设置到canvas中。

至此，我们完成了对图像进行透明化处理的整个过程。
但是仍然不够，因为对于复杂图像而言，这种方式处理起来太过粗暴，无法做到精细化的处理。
所以接下来我们要实现恢复模式，对于处理的不好的地方进行恢复原始图像的操作。

## 恢复模式的探讨 ##

在恢复模式下，当我们鼠标移动到canvas上时，鼠标显示为一个小方框，小方框内是原始图像。
当我们点击鼠标时，小方框内的图像会重新覆盖到当前图像上，从而达到恢复原有图像的效果。

全篇下来，其实在这个地方才开始显得有趣。

** 最初方案（隐藏鼠标 + canvas） **

在想到通过这个办法进行精细化操作之后，第一反应是隐藏鼠标，并在移动鼠标时跟随一个小的canvas，这个小canvas中显示的是原始图像。

事实上最开始也是这么做的，如果各位有兴趣的话可以参考我github上的提交方案，上面有这个方案的实现。

虽然这个方案可以实现效果，但是存在一个很明显的性能问题，操作起来会有顿卡的感觉。

原因就是在进行鼠标移动的时候，会频繁的计算图像信息，再写入到小canvas中。

虽然后来加了个防抖函数，并将移动方框放在防抖函数外，使得红色小框可以即时移动，其中的内容不会出现顿卡，但是因为防抖函数的存在，必然会有一点小小的延迟。

作为一个懒人其实我觉得做到这里就可以了，因为这样我也可以用了。

然而，纠结了半天还是改了，这种卡顿实在的蛋疼得紧。

** 现在的方案（隐藏鼠标 + background-image） **

现在的方案是在鼠标移动时，隐藏鼠标，并在鼠标那里加一个div，div里面设置原始图像的背景图片。

在移动鼠标时，不仅会对鼠标的位置进行重新计算（说是位置，实际上用的是translate，而不是top+left），还会对背景图片的位置进行重新计算，这样就可以实现同样的效果了。

通过这种方案，在我的电脑上移动红框和计算恢复图像的方式很流畅，完全感觉不到卡顿。

如果在低配电脑上有卡顿的情况，这里也可以加一个防抖函数来处理。

## 恢复模式的实现 ##

那么让我们现在来看一看恢复模式下鼠标在canvas上移动时的代码：

    // 根据鼠标的偏移位置获取recover_img位置
    function getRecoverImgPos(e) {
      // 给鼠标位置+1，是为了让recover_img不会出现在鼠标下方，从而使得鼠标点击时不会点击在recover_img上
      return {
        x: e.offsetX + 1,
        y: e.offsetY + 1
      }
    }

    /**
     * 恢复模式下，鼠标在canvas上移动，呈现原先图像
     */
    function recoverModeCanvasMove(e) {
      if (imgDataArr.length === 0) {
        return;
      }
      var $recoverImg = $("#recover_img");
      var recoverImgPos = getRecoverImgPos(e)
      if (recoverImgPos.x > canvasInfo.width - recoverSize || recoverImgPos.y > canvasInfo.height - recoverSize) {
      $recoverImg.hide();
        return;
      } else {
        $recoverImg.show();
      }
      $recoverImg.css({
        transform: 'translate(' + recoverImgPos.x + 'px,' + recoverImgPos.y + 'px)',
        'background-position': (-recoverImgPos.x - 1) + 'px ' + (-recoverImgPos.y - 1) + 'px'
      });
    }

在上面的代码中我们会根据鼠标的位置重新计算恢复图像所在的div的位置，然后判断是否触边来决定是否隐藏。
接着再来计算其位置。

这里有一个坑点在注释里面也写了，就是恢复图像实际上并没有和鼠标重叠，以防止我们在点击时点到恢复图像上而不是canvas上。

另外如果大家细心查看css样式的话，会发现两个小坑点：

    1、在样式里面对恢复图像和canvas上的鼠标样式都设置了隐藏，原因是避免当鼠标拖动过快时鼠标会出现在恢复图像上，出现鼠标闪烁情况
    2、恢复图像本身就有一个top：1px和left：1px的初始值，这是因为我们的canvas有一个1px的border，而绝对定位的位置是相对于canvas的父级的。

然后再来看看点击恢复图像的代码：

    /**
     * 恢复模式下，点击canvas，将点击处指定范围内图像恢复原样
     */
    function recoverModeCanvasClick(e) {
      if (imgDataArr.length === 0) {
        return;
      }
      var recoverImgPos = getRecoverImgPos(e);
      for (var i = 0, ylen = recoverSize; i < ylen; i++) {
        var pos = canvasInfo.width * 4 * (recoverImgPos.y + i) + recoverImgPos.x * 4;
        for (var j = pos, xlen = pos + recoverSize * 4; j < xlen; j++) {
          resultImgDataArr[j] = imgDataArr[j]
        }
      }
      var ctx = document.getElementById('target_canvas').getContext('2d');
      ctx.putImageData(new ImageData(resultImgDataArr, canvasInfo.width, canvasInfo.height), 0, 0);
      setCanvasImgToDownloadLink()
    }

同样是先根据鼠标位置获取恢复图像的位置，然后根据偏移量去计算位置。

我们得注意到虽然我们的恢复图像是一块完整的相连接的区域，但是在
Uint8ClampedArray数组中的数据并不是相连接的，需要我们去计算。

将最开始我们保存初始图像像素数组imgDataArr赋值到当前处理的图像像素数组中。

最后将处理好的像素数组以putImageData的方式放入数组即可。

## 总结 ##

这个小应用现在可以满足我的需求了，但是它依然存在很多不足与改进空间，比如：

    1、兼容性
    2、色差的调整，现在是放在控制台之中。即使是拿出来也可能只是一个输入框。实际上这个地方是可以做的更加完美，在应对一个复杂图片时，当我们点击一个像素后，可以保存这个像素，并出现一个调整色差的滑动条，拖动这个滑动条图像会针对色差在原基础上实时进行透明化和恢复图像的处理。
    3、恢复图像尺寸的调整，可以通过鼠标滑轮滚动的方式进行处理
    4、如果一个应用不能让我第一眼就知道怎么做，怎么玩，那么这个应用已经是有问题的。很明显虽然这比其他应用已经足够简单，但依然不够是吗？

本期分享结束，依然是一个小应用，依然是一堆你可能知道也可能不知道的小知识点。

最后例行说明，右下角的精灵球是点赞，这已经是我连续几篇文章说明了，并且那么大几个字已经写明了。
因为有几个园友引用了这个精灵球，所以你们应该也形成了精灵球即是点赞的心理预期和用户习惯了吧。
如果你不小心点错了，请刷新页面，那么精灵球那里会出现取消点赞的按钮。

讲道理，在精灵球那里加那么几个大字已经很蠢了，每次在文章里还要再说一堆就更蠢了，所以下篇文章就不会再写这些话了，因为我已经感觉蠢到极限了并且不想再解释了。
