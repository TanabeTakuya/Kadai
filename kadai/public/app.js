//自分自身の情報を入れる
const IAM = {
    token: null,  // トークン
    name: null    // 名前
  };
  
  //-------------------------------------
  // STEP1. Socket.ioサーバへ接続
  //-------------------------------------
  const socket = io();
  
  let myRoll;
  let win = 2;
  let an;
  // 正常に接続したら
  socket.on("connect", ()=>{
    // 表示を切り替える
    $("#my-roll").style.display = "none";   // 「接続中」を非表示
    $("#nowconnecting").style.display = "none";   // 「接続中」を非表示
    $("#return").style.display = "none";   // 「接続中」を非表示
    $("#inputmyname").style.display = "block";    // 名前入力を表示
  });
  
  // トークンを発行されたら
  socket.on("token", (data)=>{
    IAM.token = data.token;
  });
  
  //-------------------------------------
  // STEP2. 名前の入力
  //-------------------------------------
  /**
   * [イベント] 名前入力フォームが送信された
   */
  $("#frm-myname").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
    // 入力内容を取得する
    const myname = $("#txt-myname");
    if( myname.value === "" ){
      return(false);
    }
  
    // 名前をセット
    $("#myname").innerHTML = myname.value;
    IAM.name = myname.value;
    $("#question").addEventListener("click", (e)=>{
      // 表示を切り替える
      document.getElementById("my-roll").innerText = "出題者"
      $("#my-roll").style.display = "block";   // 「接続中」を非表示
      $("#inputmyname").style.display = "none";   // 名前入力を非表示
      $("#chat").style.display = "block";         // チャットを表示

      myRoll = "Question";
    });
    $("#ansewer").addEventListener("click", (e)=>{
      // 表示を切り替える
      document.getElementById("my-roll").innerText = "回答者"
      document.getElementById("ansewer-question").innerText = "出題があるまでお待ちください"      
      $("#my-roll").style.display = "block";   // 「接続中」を非表示
      $("#inputmyname").style.display = "none";   // 名前入力を非表示
      $("#chat").style.display = "block";         // チャットを表示

      myRoll = "Ansewer";
    });

  });
  
  
  //-------------------------------------
  // STEP3. チャット開始
  //-------------------------------------
  /**
   * [イベント] 発言フォームが送信された
   */
  $("#frm-post").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
    let operation = document.getElementById("ansewer-question");
    // 入力内容を取得する
    const msg = $("#msg");
    if( msg.value === "" || operation.value === "回答があるまでお待ちください"){
      return(false);
    }

    if(myRoll ==="Question"){
      // Socket.ioサーバへ送信
      socket.emit("post", {
        text: msg.value,
        token: IAM.token,
        name: IAM.name
      });
      document.getElementById("ansewer-question").innerText = "回答があるまでお待ちください" ;     
    }
    else if(operation != "出題があるまでお待ちください"){
      // Socket.ioサーバへ送信
      socket.emit("post", {
        text: msg.value,
        token: IAM.token,
        name: IAM.name
      });
      if(operation === text){
        an = msg.value;
      }
    }
  
    // 発言フォームを空にする
    msg.value = "";
  });
  
  /**
   * [イベント] 誰かが発言した
   */
  socket.on("member-post", (msg)=>{
    const is_me = (msg.token === IAM.token);
    addMessage(msg, is_me);
  });
  
  
  /**
   * 発言を表示する
   *
   * @param {object}  msg
   * @param {boolean} [is_me=false]
   * @return {void}
   */
  function addMessage(msg, is_me=false){
    const list = $("#msglist");
    const li = document.createElement("li");
    //------------------------
    // 自分の発言
    //------------------------
    if( is_me ){
      if(myRoll ==="Ansewer"){
        li.innerHTML = `<span class="msg-me">${msg.name}> ${msg.text}</span>`;
        if(an === msg.text){
          win = 1;
          document.getElementById("ansewer-question").innerText = "正解";
          $("#return").style.display = "none"; 
        }
        else{
          document.getElementById("ansewer-question").innerText = "不正解";
          win = 0;
          $("#return").style.display = "none";
        }
      }
      else if(document.getElementById("ansewer-question").innerText != "回答があるまでお待ちください" ){
      }
    }
    else if(myRoll ==="Ansewer"){
      an = msg.text;
      let a = an.split('');
      let questionRand = a.sort();
      document.getElementById("ansewer-question").innerText = questionRand.join("");
    }
    else if(myRoll ==="Question" ){
      if(win === 0){
        document.getElementById("ansewer-question").innerText = "貴方の勝ち";
        $("#return").style.display = "none";
      }
      else{
        document.getElementById("ansewer-question").innerText = "貴方の負け";
        $("#return").style.display = "none"; 
      }
    }
    document.getElementById("return").onclick = function() {
      //最初に戻りたい
    };
    // リストの最初に追加
    list.insertBefore(li, list.firstChild);
  }