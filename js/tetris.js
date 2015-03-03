/*
This version of tetris is MIT licensed:

Copyright (C) 2012 Dionysis "dionyziz" Zindros dionyziz@gmail.com
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



var board = [];  // 盤面の状態を保持する変数
var lose;  // 一番うえまで積み重なっちゃったフラグ
var interval;  // ゲームタイマー保持用変数
var current; // 現在操作しているブロック
var currentX, currentY; // 現在操作しているブロックのいち

// ブロックのパターン

var shapes = [
  [ 1, 1, 1 ],
  [ 1, 1, 0, 0,
    1, 1 ],
  [ 1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0 ]
];

// ブロックの色
var colors = [
  'cyan', 'pink', 'azure','orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

//和柄イメージ設定
var img1 = new Image();
var img2 = new Image();
var img3 = new Image();
var images =[img1,img2,img3];
var imagesFile =["images/texture.png","images/texture.png","images/texture.png"];


//レコーディング関連変数群
var RecordCount = 0;
var freezeCount = 0;
var recordSet = [];
var record={};
var _bAutoMode =false;
var autoCount=0;
var autoCountMax;


// shapesからランダムにブロックのパターンを出力し、盤面の一番上へセットする
function newShape() {
  var id = Math.floor( Math.random() * shapes.length );  // ランダムにインデックスを出す
  var shape = shapes[ id ];
  //10:img1, 20:img2, 30:img3 　
  var id2 = Math.floor( Math.random() * (images.length)) * 10; //画像IDランダム生成
  var id = id + id2;
  //console.log(id);

  // パターンを操作ブロックへセットする
  current = [];
  for ( var y = 0; y < 4; ++y ) {
    current[ y ] = [];
    for ( var x = 0; x < 4; ++x ) {
      var i = 4 * y + x;
      if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
        current[ y ][ x ] = id + 1;
      }
      else {
        current[ y ][ x ] = 0;
      }
    }
  }
  // 新しいブロックの盤面上における初期配置座標
  console.log("Rotate"+Rotate);
  //currentX = 0;
  if(!currentX){
    currentX=5;
  }
  rotation(currentX);
  currentY = 0;
}

// 盤面を空にする
function init() {
  for ( var y = 0; y < ROWS; ++y ) {
    board[ y ] = [];
    for ( var x = 0; x < COLS; ++x ) {
      board[ y ][ x ] = 0;
    }
  }
}

// newGameで指定した秒数毎に呼び出される関数。
// 操作ブロックを下の方へ動かし、
// 操作ブロックが着地したら消去処理、ゲームオーバー判定を行う
function tick() {
  //console.log("tick");
  // １つ下へ移動する
  if ( valid( 0, 1 ) ) {
    ++currentY;
  }
  // もし着地していたら(１つしたにブロックがあったら)
  else {
    freeze();  // 操作ブロックを盤面へ固定する
    //clearLines();  // ライン消去処理
    if (lose) {
      // もしゲームオーバなら最初から始める
      
      //レコード吐き出し処理
      RecordCount = 0;
      freezeCount = 0;
      var dumyObj ={"record":recordSet};
      console.log(JSON.stringify(dumyObj));

      /*
      startAutoDraw();
      _bAutoMode = true;
      */
      //sendAutomode(ORIGIN + "auto/");
      newGame();
      return false;
    }
    // 新しい操作ブロックをセットする
    newShape();
  }
}

function sendAutomode(url){
  console.log("send"+url);
  var xhr = new XMLHttpRequest({mozSystem: true});
  console.log(xhr);
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function(){
    console.log("onreadychange" + xhr.readyState + ";" + xhr.status);
    // 本番用
    if (xhr.readyState === 4 && xhr.status === 200){
      console.log(xhr.responseText);
    }
  };
  xhr.send(null);
}

// 操作ブロックを盤面にセットする関数
function freeze() {
  freezeCount++;
  for ( var y = 0; y < 4; ++y ) {
    for ( var x = 0; x < 4; ++x ) {
      if ( current[ y ][ x ] ) {
        board[ y + currentY ][ (x + currentX)%COLS ] = current[ y ][ x ];


        //TODO Recording
        RecordCount++;
        record={"count":RecordCount, 
                "freezeNo":freezeCount,
                "x":(x + currentX)%COLS, 
                "y":(y+currentY), 
                "shape":board[ y + currentY ][ (x + currentX)%COLS ]-1
        };
        recordSet.push(record);
        

      }
    }
  }
}

// 操作ブロックを回す処理
function rotate( current ) {
  var newCurrent = [];
  for ( var y = 0; y < 4; ++y ) {
    newCurrent[ y ] = [];
    for ( var x = 0; x < 4; ++x ) {
      newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
    }
  }
  return newCurrent;
}

// 一行が揃っているか調べ、揃っていたらそれらを消す
function clearLines() {
  for ( var y = ROWS - 1; y >= 0; --y ) {
    var rowFilled = true;
    // 一行が揃っているか調べる
    for ( var x = 0; x < COLS; ++x ) {
      if ( board[ y ][ x ] == 0 ) {
        rowFilled = false;
        break;
      }
    }
    // もし一行揃っていたら, サウンドを鳴らしてそれらを消す。
    if ( rowFilled ) {
      // その上にあったブロックを一つずつ落としていく
      for ( var yy = y; yy > 0; --yy ) {
        for ( var x = 0; x < COLS; ++x ) {
          board[ yy ][ x ] = board[ yy - 1 ][ x ];
        }
      }
      ++y;  // 一行落としたのでチェック処理を一つ下へ送る
    }
  }
}


// 指定された方向に、操作ブロックを動かせるかどうかチェックする
// ゲームオーバー判定もここで行う
function valid( offsetX, offsetY, newCurrent ) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;

  if(offsetX<0){
    currentX = COLS;
    offsetX += COLS;
  }

  newCurrent = newCurrent || current;
  for ( var y = 0; y < 4; ++y ) {
    for ( var x = 0; x < 4; ++x ) {

      if ( newCurrent[ y ][ x ] ) {
        if ( typeof board[ y + offsetY ] == 'undefined'
           || typeof board[ y + offsetY ][ (x + offsetX)%COLS ] == 'undefined'
           || board[ y + offsetY ][ (x + offsetX)%COLS ]
           || y + offsetY >= ROWS-BOTTOM) {
             if (offsetY == 1 && offsetY-currentY == 1){
               console.log('game over');
               lose = true; // もし操作ブロックが盤面の上にあったらゲームオーバーにする             
             }
          return false;
          }
      }
    }
  }
  return true;
}


/*ゲーム開始関数*/
function newGame() {
  console.log("new game");
  clearInterval(interval);  // ゲームタイマーをクリア
  init();  // 盤面をまっさらにする
  newShape();  // 新しい
  lose = false;
  interval = setInterval( tick, 1000 );  // 1000ミリ秒ごとにtickという関数を呼び出す
}



// テトリス用のインプット処理(キーボードが押された時に呼び出される関数)
function keyPress( key ) {
    switch ( key ) {
    case 'left':
      if ( valid( -1 ) ) {
        --currentX;  // 左に一つずらす
        rotation(currentX);
      }
      break;

    case 'right':
      if ( valid( 1 ) ) {
        ++currentX;  // 右に一つずらす
        currentX%=COLS;
        rotation(currentX);
      }
      break;
    case 'down':
      if ( valid( 0, 1 ) ) {
        ++currentY;  // 下に一つずらす
      }
      break;
    case 'rotate':
      // 操作ブロックを回す
      var rotated = rotate( current );
      if ( valid( 0, 0, rotated ) ) {
        current = rotated;  // 回せる場合は回したあとの状態に操作ブロックをセットする
      }
      break;
    }
  
}

