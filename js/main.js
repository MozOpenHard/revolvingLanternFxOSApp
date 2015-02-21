(function(){
  var Timer;
  var RenderTimer; //描画インターバル
  var AutoRenderTimer; //自動再生モード描画インターバル
  var Rotate=0;
  var Angle=-0.0;
  var MAX_X=20;
  var MAX_Y=10;
  var boxsize=50;
  var dx=0;
  var dy=0;
  var boxFill=true;

  var canvas;
  var ctx;
  var cx;
  var cy;


  window.onload = function(){
    init();
    document.addEventListener("keydown", keyDown);
  };
  
  
  function init(){
    console.log("cone mirror");
    var cw = 1000;
    var ch = 1000;
    canvas = document.getElementById("canvas");

    canvas.width = cw;
    canvas.height = ch;

    ctx = canvas.getContext('2d');
    cx = canvas.width / 2;
    cy = canvas.height / 2;

    //和柄イメージの読み込み
    img1.onload = function(){
      img2.onload = function(){
        img3.onload = function(){
          newGame();
          // 1000ミリ秒ごとに状態を描画する関数を呼び出す
          RenderTimer = setInterval(render, 1000 );
        };
        img3.src = imagesFile[2];
      };
      img2.src = imagesFile[1];
    };
    img1.src = imagesFile[0];

  }


  // 盤面と操作ブロックを描画する
  function render() {
    // 盤面を描画する
    ctx.clearRect( 0, 0, 1000, 1000 );  // 一度キャンバスを真っさらにする

    for ( var x = 0; x < MAX_X; ++x ) {
      for ( var y = 0; y < MAX_Y; ++y ) {
        if ( board[ y ][ x ] ) {  // マスが空、つまり0ゃなかったら
          draw( x, y, board[y][x]-1);  // マスを描画
        }
      }
    }
    // 操作ブロックを描画する
    for ( var y = 0; y < 4; ++y ) {
      for ( var x = 0; x < 4; ++x ) {
        if ( current[ y ][ x ] ) {
          draw( (currentX + x)%COLS , currentY + y, current[ y ][ x ] - 1 );  // マスを描画
        }
      }
    }
  }

  function draw(x,y,shapeId){
    var r = (MAX_Y - y)*boxsize;
    var unitAngle = (2*Math.PI)/MAX_X;
    var theta = x * unitAngle;
    
    ctx.beginPath();
    ctx.moveTo(cx + (r*Math.cos(theta)),cy + (r*Math.sin(theta)));
    ctx.arc(cx,cy,r,theta,theta+unitAngle,false);
    ctx.lineTo(cx + ((r-boxsize)*Math.cos(theta+unitAngle)),cy + ((r-boxsize)*Math.sin(theta+unitAngle)));
    ctx.arc(cx,cy,r-boxsize,theta+unitAngle,theta,true);
    ctx.closePath();
    
    //ctx.strokeStyle = colors[shapeId]; // 線の色を指定する
    //ctx.stroke();
    //ctx.fillStyle = colors[shapeId];  // 塗りつぶしの色を指定す
    //ctx.fill();
    var id=Math.floor(shapeId/10);
  
    ctx.save();
    ctx.clip();

    var xArray = [
      cx + (r*Math.cos(theta)),
      cx + (r*Math.cos(theta+unitAngle)),
      cx + ((r-boxsize)*Math.cos(theta+unitAngle)),
      cx + ((r-boxsize)*Math.cos(theta))
    ];
    var yArray = [
      cy + (r*Math.sin(theta)),
      cy + (r*Math.sin(theta+unitAngle)),
      cy + ((r-boxsize)*Math.sin(theta+unitAngle)),
      cy + ((r-boxsize)*Math.sin(theta))
    ];

    var clipX = Math.min.apply(null,xArray);
    var clipY = Math.min.apply(null,yArray);
    var clipW = Math.max.apply(null,xArray) - Math.min.apply(null,xArray);
    var clipH = Math.max.apply(null,yArray) - Math.min.apply(null,yArray);

    var scale = 250/1000;  //画像リソースのサイズ/テトリス画面のサイズ
    ctx.drawImage(images[id],clipX*scale,clipY*scale,clipW*scale,clipH*scale,clipX,clipY,clipW,clipH); 
    
    ctx.restore();
  }




  function keyDown(e){
    
    var keycode = e.keyCode;
    /*
    if(keycode==13){
      console.log(Timer);
      if(!Timer){
        rotation();
      }else{
        clearTimeout(Timer);
        Timer=null;
      }
    }
    */

    switch(keycode){
      case 13:
        console.log(Timer);
        if(!Timer){
          rotation();
        }else{
          clearTimeout(Timer);
          Timer=null;
        }
        break;
      case 87:
        Angle+=0.1;
        angle();
        break;
      case 83:
        Angle-=0.1;
        angle();
        break;

      case 32: //スペースキー 自動描画モード
        if(!_bAutoMode) {
          startAutoDraw();
          _bAutoMode = true;
        }
        else {
          stopAutoDraw();
          _bAutoMode = false;
        }
        break;


      default:
        break;
    }
    var keys = {
      37: 'left',
      39: 'right',
      40: 'down',
      38: 'rotate'
    };

    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
      // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
      if(!_bAutoMode){
        keyPress( keys[ e.keyCode ] );
        // 描画処理を行う
        render();
      }
    }
  }
  function angle(){
    console.log("angle = "+Angle);
    var ele = document.getElementById("canvas_pers");
    ele.style.webkitTransform = "perspective(300) rotateX( "+Angle+"deg )";
    ele.style.mozTransform = "perspective(300) rotateX( "+Angle+"deg )";
  }
  
  function rotation(){
    Rotate+=1;
    var ele = document.getElementById("canvas_rotate");
    ele.style.webkitTransform = "rotate( "+Rotate+"deg )";
    ele.style.mozTransform = "rotate( "+Rotate+"deg )";
    Timer = setTimeout(rotation, 33);
  }


//オート再生処理
  function startAutoDraw(){
    autoCount=0;
    clearInterval(RenderTimer); //レンダリングタイマーをクリア
    clearInterval(interval);  // ゲームタイマーをクリア
    setTimeout(loadJsonFile, 2000);
  }
  function stopAutoDraw(){
    clearInterval(AutoRenderTimer);
    autoCount=0;
    newGame();
    RenderTimer = setInterval( render, 1000 );
  }
  function loadJsonFile(){
   var fileName ="test.json";
   httpObj = new XMLHttpRequest();
   httpObj.open('GET',fileName,true);
   httpObj.send(null);
     httpObj.onreadystatechange = function(){
        if( ( httpObj.readyState == 4) && (httpObj.status == 200)){
         var data= JSON.parse(httpObj.responseText);
         autoRender(data);
        }
      }
    }
   function autoRender(data){
      ctx.clearRect( 0, 0, 1000, 1000 );  // 一度キャンバスを真っさらにする
      record = data.record;
      autoCountMax = record.length;
      AutoRenderTimer = setInterval( autoDraw, 1000);
   }
   function autoDraw(){
      do{
        if(autoCount==autoCountMax){
          autoCount=0
          ctx.clearRect( 0, 0, 1000, 1000 );  // 一度キャンバスを真っさらにする
          break;
        }

        draw(record[autoCount].x, record[autoCount].y, record[autoCount].shape);  // マスを描画

        if(autoCount==autoCountMax-1){
          autoCount++;
          break;
        } 
        
        if(record[autoCount].freezeNo != record[autoCount+1].freezeNo) {
          autoCount++;
          break;
        }
        autoCount++;

      }while(1) 
   }


})();
