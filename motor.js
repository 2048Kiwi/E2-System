var fase = 0;
var limit_time = 300 //[sec]

function int2str(num){
  if(num<10){
    return "0" + String(num);
  }else{
    return String(num);
  }
}

function countDown(){
  let now_time = new Date();
  let left_time = limit_time*1000 - now_time.getTime() + start_time.getTime();
  if(left_time <= 0 && fase!=0){
     left_time = 0.0;
     w().callMacro('end');
  }
  let min = parseInt(left_time/1000/60);
  left_time %= 1000*60;
  let sec = parseInt(left_time/1000);
  left_time = parseInt((left_time%1000)/10);
  document.getElementById("big").innerText = String(min) + ":" + int2str(sec);
  document.getElementById("small").innerText = ":" +  int2str(left_time);
  if(min+sec+left_time != 0) setTimeout(countDown, 10);
}

w().ready(function() { 
  let motor_stop = true;
  let speed = 40;
  let cam_angle = 1; //0~4, 水平が0(の予定)
  
// 「出撃」「強制終了」ボタンが押されたときのイベント処理
  $('#pow').bind(BUTTON_DOWN, function(event) {
    if(fase == 0){//出撃
      $('#forward').addClass('trEnable');
      $('#backward').addClass('trEnable');
      $('#right').addClass('trEnable');
      $('#left').addClass('trEnable');
      $('#camUp').addClass('trEnable');
      $('#camDown').addClass('trEnable');
      $('#spUp').addClass('trEnable');
      $('#spDown').addClass('trEnable');
      $('.stateBox').css('border', 'solid 2px rgb(255, 0, 0)');
      $('.timerBox').css('border', 'solid 2px rgb(255, 0, 0)');
      $('.directionBox').css('border', 'solid 2px rgb(255, 0, 0)');
      $('.speedBox').css('border', 'solid 2px rgb(255, 0, 0)');
      $('.cameraBox').css('border', 'solid 2px rgb(255, 0, 0)');
      $('.label').css('background-color', 'rgb(255, 0, 0)');
      $('.stateLabel').css('background-color', 'rgb(255, 0, 0)');
      $('.stateTextBar').css('background', 'rgb(255, 0, 0)');
      $('.stateSprite').css('background', 'repeating-linear-gradient(45deg, rgb(255, 0, 0), rgb(255, 0, 0) 5px, rgb(0, 0, 0) 5px, rgb(0, 0, 0) 10px)');
      //$('.stateSprite').css('background', 'rgb(25, 0, 0)');
      $('.stateText').css('color', 'rgb(255, 0, 0)');
      $('.speedText').css('color', 'rgb(255, 0, 0)');
      $('.time').css('color', 'rgb(255, 0, 0)');
      console.log("出撃");
      document.getElementById("powText").innerText = "強制終了";
      document.getElementById("powFrom").innerText = "内部";
      fase += 1;
      start_time = new Date();
      countDown()
      w().callMacro('start');
    }else if(fase == 1){//強制終了
      w().callMacro('end');
      fase += 1;
    }
  }).bind(BUTTON_UP, function(event) {
    // 離したとき
  });

// 「上」ボタンが押されたときのイベント処理
  $('#forward').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(motor_stop && fase == 1) {
      $(this).addClass('trOn');
      move('FORWARD');
    }
  }).bind(BUTTON_UP, function(event) {
    // 離したとき
    $(this).removeClass('trOn');
    move('STOP');
  });

  // 「下」ボタンが押されたときのイベント処理
  $('#backward').bind(BUTTON_DOWN, function(event) {
    if(motor_stop && fase == 1) {
      $(this).addClass('trOn');
      move('BACKWARD');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('trOn');
    move('STOP');
  });

  // 「右」ボタンが押されたときのイベント処理
  $('#right').bind(BUTTON_DOWN, function(event) {
    if(motor_stop && fase == 1) {
      $(this).addClass('trOn');
      move('RIGHT');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('trOn');
    move('STOP');
  });

  // 「左」ボタンが押されたときのイベント処理
  $('#left').bind(BUTTON_DOWN, function(event) {
    if(motor_stop && fase == 1) {
      $(this).addClass('trOn');
      move('LEFT');
    }
  }).bind(BUTTON_UP, function(event) {
      $(this).removeClass('trOn');
    move('STOP');
  });
  
// 「スピードアップ」ボタンが押されたときのイベント処理
  $('#spUp').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(speed < 100 && fase == 1) {
      speed += 20;
      $(this).addClass('trOn');
      $('#spDown').addClass('trEnable');
      document.getElementById("spText").innerText = String(speed) + "%";
      w().callMacro('setSpeed', speed);
    }
  }).bind(BUTTON_UP, function(event) {
      $(this).removeClass('trOn');
      if(speed == 100) $(this).removeClass('trEnable');
  });

  
// 「スピードダウン」ボタンが押されたときのイベント処理
  $('#spDown').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(speed > 20 && fase == 1) {
      speed -= 20;
      $(this).addClass('trOn');
      $('#spUp').addClass('trEnable');
      document.getElementById("spText").innerText = String(speed) + "%";
      w().callMacro('setSpeed', speed);
    }
  }).bind(BUTTON_UP, function(event) {
      $(this).removeClass('trOn');
      if(speed == 20) $(this).removeClass('trEnable');
  });
  
    // 「視線アップ」ボタンが押されたときのイベント処理
  $('#camUp').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(cam_angle < 4 && fase == 1) {
      cam_angle += 1;
      $(this).addClass('trOn');
      $('#camDown').addClass('trEnable');
      w().callMacro('setCamera', cam_angle);
    }
  }).bind(BUTTON_UP, function(event) {
      $(this).removeClass('trOn');
      if(cam_angle == 4) $(this).removeClass('trEnable');
  });

  
  // 「視線ダウン」ボタンが押されたときのイベント処理
  $('#camDown').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(cam_angle > 0 && fase == 1) {
      cam_angle -= 1;
      $(this).addClass('trOn');
      $('#camUp').addClass('trEnable');
      w().callMacro('setCamera', cam_angle);
    }
  }).bind(BUTTON_UP, function(event) {
      $(this).removeClass('trOn');
      if(cam_angle == 0) $(this).removeClass('trEnable');
  });

 //移動状態変更の関数
  function move(type) {
    let id = document.getElementById("st")
    motor_stop = false;
    if(type == "FORWARD") {             // 前進
      w().callMacro('forward');
      id.innerText = "前進";
    } else if(type == "BACKWARD") {    // 後退
      w().callMacro('backward');
      id.innerText = "後退";
    } else if(type == "RIGHT") {       // 右旋回
      w().callMacro('right');
      id.innerText = "旋回";
      $('.stateRight').css('color', 'rgb(255, 0, 0)');
    } else if(type == "LEFT") {        // 左旋回
      w().callMacro('left');
      id.innerText = "旋回";
      $('.stateLeft').css('color', 'rgb(255, 0, 0)');
    } else if(type == "STOP") {       // 停止
      w().callMacro('stop');
      id.innerText = "停止";
      $('.stateRight').css('color', 'rgb(50, 50, 50)');
      $('.stateLeft').css('color', 'rgb(50, 50, 50)');
      motor_stop = true;
    }
  }
　});

console.log("start?");
