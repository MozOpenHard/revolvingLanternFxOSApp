(function(){
  var CANVAS;
  var CTX;
  var CENTER_X;
  var CENTER_Y;
  var CANVAS_SIZEW = 1000;
  var CANVAS_SIZEH = 1000;
  
  var Timer;
  var Rotate=0;
  var Angle=-0.0;

  var ImageH;
  var ImageW;

  var Images = [];
  var ImageFiles =["images/texture.png","images/kiku.png"];
  
  window.onload = function(){
    loadImg(0);
    //init();
    //document.addEventListener("keydown", keyDown);
    //draw(0); 
  };
  function loadImg(i){
    console.log("loadImg" + i + ImageFiles[i]);
    Images[i] = new Image();
    Images[i].onload = function(){
      if(i < ImageFiles.length - 1){
        loadImg(i+1);
      }else{
        init();
      }
    }
    Images[i].src = ImageFiles[i];
    
  }
  function init(){
    console.log("init");
    /*
    var cw = 1000;
    var ch = 1000;

    for(var i=1; i<ImageFiles.length+1; i++){
      var canvas = document.getElementById("canvas"+i);
      canvas.width = cw;
      canvas.height = ch;
    }

    var oh = cw/2;
    var ow = oh*3;
    var origin = document.getElementById("origin");
    origin.style.top = window.innerHeight + 'px';
    origin.width = ow;
    origin.height = oh;
    ImageW = origin.width;
    ImageH = origin.height;
    CANVAS = document.getElementById("canvas");
*/
    CANVAS = document.getElementById("canvas1");
    
    CANVAS.width = CANVAS_SIZEW;
    CANVAS.height = CANVAS_SIZEH;

    CTX = CANVAS.getContext('2d');
    CENTER_X = CANVAS.width / 2;
    CENTER_Y = CANVAS.height / 2;
    
    clearCanvas();
  }
  
  function clearCanvas(){
    console.log("clearcanvas");
    CTX.clearRect( 0, 0, CANVAS_SIZEW, CANVAS_SIZEH );

    var r = 500;
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

  
  function draw(count){
    var j = count;

    var origin = document.getElementById("origin");
    var ctx = origin.getContext('2d');
    var wx = origin.width;
    var wy = origin.height;
    ctx.beginPath();
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, wx, wy);

    var canvas = document.getElementById("canvas1");

    Images.onload = function(){
      var dw = Images.width;
      var dh = Images.height;

      var scale;
      var scaleW = ImageW/dw;
      var scaleH = ImageH/dh;
      if(scaleH>scaleW) scale = scaleW;
      else scale = scaleH;

      dw = dw * scale;
      dh = dh * scale;

      ctx.drawImage(Images,0, 0, dw, dh);
      
      ctx.fillStyle = "rgb(255,0,0)";
      for(var i=1;i<6;i++){
        ctx.fillRect(0, (canvas1.width/10)*i - 5, wx, 5);
      }
      j++;
      if(j<ImageFiles.length+1){
          convert(j);
          draw(j);
      }else {
        console.log("setting was fine!");
        var id = Math.floor( Math.random() * ImageFiles.length )+1;
        view(id);
      }
    }
    if (j<ImageFiles.length){
      Images.src = ImageFiles[j];
    }
  }
  

  function convert(id){
    var origin = document.getElementById("origin");
    var origincontext = origin.getContext('2d');
    var wx = origin.width;
    var wy = origin.height;
    var imagedata = origincontext.getImageData(0,0,wx,wy);
    var origindata = imagedata.data;
    
    var canvas = document.getElementById("canvas"+id);
    var ctx = canvas.getContext('2d');
    var cx = canvas.width/2;
    var cy = canvas.height/2;
    var x,y,n,r,g,b,ox,oy,R,theta;
    ctx.beginPath();
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(y=0;y < wy*2-1 ;y++){
      for(x=0;x < wy*2-1 ;x++){
        
        R = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy));
        if(R < wy){
          theta = Math.acos((x-cx)/R);
          if(y-cy < 0){
            theta = theta + Math.PI;
          }
          ox = ~~(wx*(theta/(2*Math.PI)));
          oy = ~~(wy - R);
        
          n = ox*4 + oy*wx*4;
          r = origindata[n];
          g = origindata[n+1];
          b = origindata[n+2];
          ctx.fillStyle = "rgb("+r+","+g+","+b+")";
          ctx.fillRect(x+(cx-wy),y+(cy-wy),1,1);
        }
      }
    }
  }

  function view(id){
    for(var i=1; i<ImageFiles.length+1; i++){
      if(i==id){
        document.getElementById("canvas"+i).style.visibility = "visible";
      }else{
        document.getElementById("canvas"+i).style.visibility = "hidden";
      }
    }
  }

  
  function keyDown(e){
    
    var keycode = e.keyCode;
    console.log(keycode);
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
      default:
        break;
    }
  }
  
  function angle(){
    var ele = document.getElementById("canvas_pers");
    ele.style.webkitTransform = "perspective(300) rotateX( "+Angle+"deg )";
    ele.style.MozTransform = "perspective(300) rotateX( "+Angle+"deg )";
  }
  
  function rotation(){
    Rotate+=1;
    var ele = document.getElementById("canvas_rotate");
    ele.style.webkitTransform = "rotate( "+Rotate+"deg )";
    ele.style.MozTransform = "rotate( "+Rotate+"deg )";
    Timer = setTimeout(rotation, 33);

    if(Rotate%(180) == 0){ //180°回転毎に画像をランダム表示
      var id = Math.floor( Math.random() * ImageFiles.length )+1;
      view(id);
    }

  }
})();
