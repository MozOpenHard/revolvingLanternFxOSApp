var Timer;
var RenderTimer; //描画インターバル
var AutoRenderTimer; //自動再生モード描画インターバル
var Rotate=0;
var Angle=-0.0;

var CANVAS;
var CTX;
var CENTER_X;
var CENTER_Y;

var COLS = 30, ROWS = 10;  // 盤面のマスの数
var BOTTOM=2;
var OFFSET_X = 21;
var CANVAS_SIZEW = 1000;
var CANVAS_SIZEH = 1000;
var boxsize = (CANVAS_SIZEH / 2) /ROWS;

var UNIT_ROTALYENCODER = 20;

var ORIGIN = "http://localhost:3001/";
//var ORIGIN = "http://lantern.local:3001/";

window.onload = function(){
  initTetris();
  document.addEventListener("keydown", keyDown);
};


function initTetris(){
  
  CANVAS = document.getElementById("canvas");

  CANVAS.width = CANVAS_SIZEW;
  CANVAS.height = CANVAS_SIZEH;

  CTX = CANVAS.getContext('2d');
  CENTER_X = CANVAS.width / 2;
  CENTER_Y = CANVAS.height / 2;

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
  
  
  startRotation();
  checkRotation();
  /*
  setTimeout(function(){
    startAutoDraw();
   _bAutoMode = true;
  },2000);
  */
}


// 盤面と操作ブロックを描画する
function render() {
  //console.log("render");
  // 盤面を描画する
  //CTX.clearRect( 0, 0, CANVAS_SIZEW, CANVAS_SIZEH );  // 一度キャンバスを真っさらにする
  clearCanvas();

  for ( var x = 0; x < COLS; ++x ) {
    for ( var y = 0; y < ROWS; ++y ) {
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
  var r = (ROWS - y)*boxsize;
  var unitAngle = (2*Math.PI)/COLS;
  var theta = x * unitAngle;
  
  CTX.beginPath();
  CTX.moveTo(CENTER_X + (r*Math.cos(theta)),CENTER_Y + (r*Math.sin(theta)));
  CTX.arc(CENTER_X,CENTER_Y,r,theta,theta+unitAngle,false);
  CTX.lineTo(CENTER_X + ((r-boxsize)*Math.cos(theta+unitAngle)),CENTER_Y + ((r-boxsize)*Math.sin(theta+unitAngle)));
  CTX.arc(CENTER_X,CENTER_Y,r-boxsize,theta+unitAngle,theta,true);
  CTX.closePath();
  
  //CTX.strokeStyle = "rgb(0,0,0)"; // 線の色を指定する
  //CTX.stroke();
  //ctx.fillStyle = colors[shapeId];  // 塗りつぶしの色を指定す
  //ctx.fill();
  var id=Math.floor(shapeId/10);

  CTX.save();
  CTX.clip();

  var xArray = [
    CENTER_X + (r*Math.cos(theta)),
    CENTER_X + (r*Math.cos(theta+unitAngle)),
    CENTER_X + ((r-boxsize)*Math.cos(theta+unitAngle)),
    CENTER_X + ((r-boxsize)*Math.cos(theta))
  ];
  var yArray = [
    CENTER_Y + (r*Math.sin(theta)),
    CENTER_Y + (r*Math.sin(theta+unitAngle)),
    CENTER_Y + ((r-boxsize)*Math.sin(theta+unitAngle)),
    CENTER_Y + ((r-boxsize)*Math.sin(theta))
  ];

  var clipX = Math.min.apply(null,xArray);
  var clipY = Math.min.apply(null,yArray);
  var clipW = Math.max.apply(null,xArray) - Math.min.apply(null,xArray);
  var clipH = Math.max.apply(null,yArray) - Math.min.apply(null,yArray);

  var scale = 1000/1000;  //画像リソースのサイズ/テトリス画面のサイズ
  CTX.drawImage(images[id],clipX*scale,clipY*scale,clipW*scale,clipH*scale,clipX,clipY,clipW,clipH); 
  
  CTX.restore();
}




function keyDown(e){
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
      //rotation(keys[ e.keyCode ]);
      render();
      
    }
  }
}
function angle(){
  console.log("angle = "+Angle);
  var ele = document.getElementById("canvas_pers");
  ele.style.webkitTransform = "perspective(300) rotateX( "+Angle+"deg )";
  ele.style.MozTransform = "perspective(300) rotateX( "+Angle+"deg )";
}

function rotation(x){
  
  var unitAngle = 360 / COLS;
  var deg = -(x-OFFSET_X) * unitAngle;
  var ele = document.getElementById("canvas_rotate");
  ele.style.webkitTransform = "rotate( "+deg+"deg )";
  ele.style.MozTransform = "rotate( "+deg+"deg )";

}


//オート再生処理
function startAutoDraw(){
  console.log("start auto draw");
  autoCount=0;
  clearInterval(RenderTimer); //レンダリングタイマーをクリア
  clearInterval(interval);  // ゲームタイマーをクリア
  //clearTimeout(Timer);
  autoRender(playdata);
  //setTimeout(loadJsonFile, 2000);
  //setTimeout(function(){
  //  
  //},2000);
  
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
  console.log("autoRender");
  CTX.clearRect( 0, 0, CANVAS_SIZEW, CANVAS_SIZEH );  // 一度キャンバスを真っさらにする
  record = data.record;
  autoCountMax = record.length;
  console.log(autoCountMax);
  AutoRenderTimer = setInterval( autoDraw, 1000);
}
function autoDraw(){
  do{
    if(autoCount==autoCountMax){
      autoCount=0
      CTX.clearRect( 0, 0, CANVAS_SIZEW, CANVAS_SIZEH );  // 一度キャンバスを真っさらにする
      break;
    }
    console.log("autoDraw autoCount "+autoCount);
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


function clearCanvas(){
  console.log("clearcanvas");
  CTX.clearRect( 0, 0, CANVAS_SIZEW, CANVAS_SIZEH );
 
  var r = BOTTOM * boxsize;
  CTX.beginPath();
  CTX.fillStyle = 'rgb(192, 80, 77)'; // 赤
  CTX.arc(CENTER_X,CENTER_Y, r, 0, Math.PI*2, false);
  //CTX.fill();

  CTX.save();
  CTX.clip();

  var scale = 1000/1000;  //画像リソースのサイズ/テトリス画面のサイズ
  CTX.drawImage(images[0],0,0,1000,1000,0,0,1000,1000); 
  
  CTX.restore();
  
}

var currentRotation=0;
function startRotation(){
  console.log("startRotation");
  var url = ORIGIN + "start/";
  sendAutomode(url);
}
function checkRotation(){
  console.log("checkRotation");
  
  //var url = "http://lantern.local:3001/checkRotation/";
  //var url = "http://localhost:3001/checkRotation/";
  var url = ORIGIN + "checkRotation/";
  
  send(url);
  
}
function checkCommand(res){
  console.log(res);
  var pastRotation = currentRotation;
  var response = JSON.parse(res);
  if(response.cmd){
    switch(response.cmd){
      case "left":
        console.log("left");
        
        if(!_bAutoMode){
         keyPress("left");
         render();
        }else{
          stopAutoDraw();
          _bAutoMode = false;
        }
        break;
      case "right":
        console.log("right");
        if(!_bAutoMode){
         keyPress("right");
         render();
        }else{
          stopAutoDraw();
          _bAutoMode = false;
        }
        break;
      case "auto":
        console.log("auto");
        /*
        if(!_bAutoMode){
          startAutoDraw();
          _bAutoMode = true;
        }else{
          stopAutoDraw();
          _bAutoMode = false;
        }
        */
        if(!_bAutoMode){
          startAutoDraw();
          _bAutoMode = true;
        }
        break;
      case "stop":
        response = response.rotation;
        //response = response.res.split("\")[0];
        console.log("checkCommand");
        console.log(response);
        currentRotation = parseInt(response);
        break;
      case "game":
        startAutoDraw();
        _bAutoMode = true;
        if(!_bAutoMode){
         
        }else{
          stopAutoDraw();
          _bAutoMode = false;
        }
        break;
        
      default:
        break;
    }
  }else{
    response = response.rotation;
    //response = response.res.split("\")[0];
    console.log("checkCommand");
    console.log(response);
    currentRotation = parseInt(response);

    var rotation = currentRotation - pastRotation;
    console.log(rotation);
    if(rotation > 30000){
      rotation = rotation - 65536;
    }else if(rotation < -30000){
      rotation = rotation + 65536;
    }
    var cmd;
    var count = 0;
    if(rotation > 0){
      cmd = "right";
      count = rotation / UNIT_ROTALYENCODER;
    }else{
      cmd = "left";
      count = Math.abs(rotation) / UNIT_ROTALYENCODER;
    }
    /*
    if(cmd){
      var url = ORIGIN + cmd + "/";
      sendAutomode(url);  
    }
    */
    
    for(var i=0;i<count;i++){
      console.log("keypress" + cmd);
      if(!_bAutoMode){
       keyPress(cmd);
       //render();
      }else{
        stopAutoDraw();
        _bAutoMode = false;
      }
      //rotation(cmd)
    }
    render();
  }
  Timer = setTimeout(function(){
    checkRotation();
  },100);
}

function send(url){
  console.log("send"+url);
  var xhr = new XMLHttpRequest({mozSystem: true});
  console.log(xhr);
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function(){
    console.log("onreadychange" + xhr.readyState + ";" + xhr.status);
    // 本番用
    if (xhr.readyState === 4 && xhr.status === 200){
      console.log(xhr.responseText);
      checkCommand(xhr.responseText);
    }
  };
  xhr.send(null);
}
