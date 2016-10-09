/**
 * Created by Lewis on 2016/9/29.
 */
$(function () {
    var canvas = $('#canvas').get(0);
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var Row = 15;
    var W = width / Row;
    var flag = true;
    var blocks = {};
    var blanks = {};
    var ai = false;
    var audio = $("#audio").get(0);

//实现转换功能的小函数
    function p2k(position) {
        return position.x + "_" + position.y;
    };
    function o2k(x, y) {
        return x + "_" + y;
    };
    function k2o(key) {
        var arr = key.split("_");
        return {x: parseInt(arr[0]), y: parseInt(arr[1])};
    };

//把blanks表填充满
    function fill() {
        for (var i = 0; i < Row; i++) {
            for (var j = 0; j < Row; j++) {
                blanks[o2k(i, j)] = true;
            }
        }
    };
    fill();

//画出棋谱
    function drawChessboard() {
        //画表格
        for (var i = 0; i < 16; i++) {
            //行
            ctx.save();
            ctx.translate(0.5, 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2, W / 2 + W * i);
            ctx.lineTo((Row - 0.5) * W, W / 2 + W * i);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
            //列
            ctx.save();
            ctx.translate(0.5, 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 + W * i, W / 2);
            ctx.lineTo(W / 2 + W * i, (Row - 0.5) * W);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        // 画圆点
        var x1 = 3.5, x2 = 7.5, x3 = 11.5;

        function DrawCircle(x, y) {
            ctx.beginPath();
            ctx.arc(x * W, y * W, 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        DrawCircle(x1, x1);
        DrawCircle(x1, x3);
        DrawCircle(x2, x2);
        DrawCircle(x3, x1);
        DrawCircle(x3, x3);
    };
    // drawChessboard();

//画棋子
    function drawChessman(position, color) {
        ctx.save();
        ctx.beginPath();
        ctx.translate((position.x + 0.5) * W, (position.y + 0.5) * W);
        if (color == "black") {
            var image = new Image();
            image.onload = function () {
                ctx.drawImage(image, (position.x + 0.12) * W, (position.y + 0.12) * W, 25, 25);
            };
            image.src = "img/black.png";
            audio.play();
            $('.cvas .pieces .blackP').css('display','none');
            $('.cvas .pieces .whiteP').css('display','block');
            clearInterval(tB);
            bi.clearRect(0,0,blackTime.width,blackTime.width);
            tW = setInterval(moveW, 1000);
            w = 0;
        } else if (color == "white") {
            var image = new Image();
            image.onload = function () {
                ctx.drawImage(image, (position.x + 0.12) * W, (position.y + 0.12) * W, 25, 25);
            };
            image.src = "img/white.png";
            audio.play();
            $('.cvas .pieces .whiteP').css('display','none');
            $('.cvas .pieces .blackP').css('display','block');
            clearInterval(tW);
            wi.clearRect(0,0,whiteTime.width,whiteTime.width);
            tB = setInterval(moveB, 1000);
            b = 0;
        }
        // ctx.arc(0,0,16,0,Math.PI*2);
        ctx.closePath();
        // ctx.fill();
        ctx.restore();

        //把棋子放到block中
        blocks[p2k(position)] = color;
        delete blanks[p2k(position)];
    };

//绘制图谱上的字
    function drawText(pos, text, color) {
        ctx.save();
        ctx.font = "15px 微软雅黑";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (color === "white") {
            ctx.fillStyle = "black";
        } else if (color === "black") {
            ctx.fillStyle = "white";
        }
        ctx.fillText(text, (pos.x + 0.5) * W, (pos.y + 0.5) * W);
        ctx.restore();
    };

//重绘图谱文字
    function review() {
        var i = 1;
        for (var pos in blocks) {
            drawText(k2o(pos), i, blocks[pos]);
            i++;
        }
    };

//检查黑白棋是否胜利
    function check(position, color) {
        var table = {};
        var rowNum = 1;
        var colNum = 1;
        var leftNum = 1;
        var rightNum = 1;
        for (var i in blocks) {
            if (blocks[i] === color) {
                table[i] = true;
            }
        }
        ;
        //判断左右方向
        var tx = position.x;
        var ty = position.y;
        while (table[o2k(tx + 1, ty)]) {
            rowNum++;
            tx++;
        }
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx - 1, ty)]) {
            rowNum++;
            tx--;
        }
        //判断上下方向
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx, ty + 1)]) {
            colNum++;
            ty++;
        }
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx, ty - 1)]) {
            colNum++;
            ty--;
        }
        //判断左斜线方向
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx - 1, ty - 1)]) {
            leftNum++;
            tx--;
            ty--;
        }
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx - 1, ty + 1)]) {
            leftNum++;
            tx--;
            ty++;
        }
        //判断右斜线方向
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx + 1, ty - 1)]) {
            rightNum++;
            tx++;
            ty--;
        }
        tx = position.x;
        ty = position.y;
        while (table[o2k(tx + 1, ty + 1)]) {
            rightNum++;
            tx++;
            ty++;
        }

        return Math.max(rowNum, colNum, leftNum, rightNum);
    };

//重新开始游戏
    function restart() {
        ctx.clearRect(0, 0, width, width);
        bi.clearRect(0,0,blackTime.width,blackTime.width);
        wi.clearRect(0,0,whiteTime.width,whiteTime.width);
        drawChessboard();
        blocks = {};
        $('.cvas .pieces .blackP').css('display','none');
        $('.cvas .pieces .whiteP').css('display','none');
        $(canvas).off('click').on('click', handleClick);
        $(this).siblings().removeClass('active');
        $(this).siblings().find("span").removeClass('active');
        $(this).toggleClass('active');
        $(this).find("span").toggleClass('active');
    };

//处理黑白棋哪方胜利
    function handleClick(e) {
        var position = {
            x: Math.round((e.offsetX - W / 2) / W),
            y: Math.round((e.offsetY - W / 2) / W)
        };

        if (blocks[p2k(position)]) {
            return;
        }
        ;

        if (ai) {
            drawChessman(position, "black");
            if (check(position, "black") >= 5) {
                $('.winner').css('display','block');
                bi.clearRect(0,0,blackTime.width,blackTime.width);
                wi.clearRect(0,0,whiteTime.width,whiteTime.width);
                $('.cvas .pieces .blackP').css('display','none');
                $('.cvas .pieces .whiteP').css('display','none');
                clearInterval(tB);
                clearInterval(tW);
                b = 0;
                w = 0;
                $(canvas).off('click');
                review();
                return;
            }
            ;
            drawChessman(k2o(AI()), "white");
            if (check(k2o(AI()), "white") >= 5) {
                $('.loser').css('display','block');
                bi.clearRect(0,0,blackTime.width,blackTime.width);
                wi.clearRect(0,0,whiteTime.width,whiteTime.width);
                $('.cvas .pieces .blackP').css('display','none');
                $('.cvas .pieces .whiteP').css('display','none');
                clearInterval(tB);
                clearInterval(tW);
                b = 0;
                w = 0;
                $(canvas).off('click');
                review();
                return;
            }
            ;
            return;
        }

        if (flag) {
            drawChessman(position, "black");
            if (check(position, "black") >= 5) {
                $('.winner').css('display','block');
                bi.clearRect(0,0,blackTime.width,blackTime.width);
                wi.clearRect(0,0,whiteTime.width,whiteTime.width);
                $('.cvas .pieces .blackP').css('display','none');
                $('.cvas .pieces .whiteP').css('display','none');
                clearInterval(tB);
                clearInterval(tW);
                b = 0;
                w = 0;
                review();
                $(this).off('click');
                return;
            }
            ;
        } else {
            drawChessman(position, "white");
            if (check(position, "white") >= 5) {
                $('.winner').css('display','block');
                bi.clearRect(0,0,blackTime.width,blackTime.width);
                wi.clearRect(0,0,whiteTime.width,whiteTime.width);
                $('.cvas .pieces .blackP').css('display','none');
                $('.cvas .pieces .whiteP').css('display','none');
                clearInterval(tB);
                clearInterval(tW);
                b = 0;
                w = 0;
                review();
                $(this).off('click');
                return;
            }
            ;
        }
        flag = !flag;
    };

//处理AI
    function AI() {
        var max1 = -Infinity;
        var max2 = -Infinity;
        var pos1 = {};
        var pos2 = {};
        for (var i in blanks) {
            var score1 = check(k2o(i), "black");
            if (score1 > max1) {
                max1 = score1;
                pos1 = i;
            }
        }
        for (var i in blanks) {
            var score2 = check(k2o(i), "white");
            if (score2 > max2) {
                max2 = score2;
                pos2 = i;
            }
        }
        if (max1 >= max2) {
            return pos1;
        } else {
            return pos2;
        }
    };

    $(canvas).on('click', function (e) {
        handleClick(e);
    });

//人人对战
    $('#start').on('click', restart);
    $('#people').on('click', restart);
    $('#restart').on('click', restart);
//人机对战
    $('#machine').on('click', function () {
        restart();
        $(this).siblings().removeClass('active');
        $(this).siblings().find("span").removeClass('active');
        $(this).toggleClass('active');
        $(this).find("span").toggleClass('active');
        ai = !ai;
    });


//时间函数
    var blackTime = $('.blackTime').get(0);
    var bi = blackTime.getContext('2d');
    var b = 0;
    var tB,tW;
    function moveB() {
        b++;
        if(b<60&&b>0){
            bi.clearRect(0,0,blackTime.width,blackTime.width);
            bi.save();
            bi.translate(50,50);
            bi.rotate( Math.PI*2/60*b );
            bi.beginPath();
            bi.moveTo(0,0);
            bi.lineTo(0,-40);
            bi.strokeStyle="#000";
            bi.stroke();
            bi.closePath();
            bi.restore();
        }else{
            bi.clearRect(0,0,blackTime.width,blackTime.width);
        }
    };
    var whiteTime = $('.whiteTime').get(0);
    var wi = whiteTime.getContext('2d');
    var w = 0;
    function moveW() {
        w++;
        if(w>0&&w<60){
            wi.clearRect(0,0,whiteTime.width,whiteTime.width);
            wi.save();
            wi.translate(50,50);
            wi.rotate( Math.PI*2/60*w );
            wi.beginPath();
            wi.moveTo(0,0);
            wi.lineTo(0,-40);
            wi.strokeStyle="#000";
            wi.stroke();
            wi.closePath();
            wi.restore();
        }else{
            wi.clearRect(0,0,whiteTime.width,whiteTime.width);
        }
    };

//输赢弹出框
    $('.winner .close').on("click",function () {
        $(this).parent().css("display","none");
    });
    $('.loser .close').on("click",function () {
        $(this).parent().css("display","none");
    });
    $('.winner .outin .enter').on('click',function () {
        $(this).closest('.winner').css("display","none");
        restart();
    });
    $('.loser .outin .enter').on('click',function () {
        $(this).closest('.loser').css("display","none");
        restart();
    });
    $('.winner .outin .exit').on('click',function () {
        $(this).closest('.winner').css("display","none");
        $('.door').css('display','block');
        $('.door .doorr').css('display','block');
    });
    $('.loser .outin .exit').on('click',function () {
        $(this).closest('.loser').css("display","none");
        $('.door').css('display','block');
        $('.door .doorr').css('display','block');
    });

//大门关闭
    $('.door').on('click',function () {
        $(this).css('display','none');
    });

});