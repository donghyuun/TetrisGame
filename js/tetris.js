import BLOCKS from "./blocks.js";

//DOM--TEST
const gameText = document.querySelector(".game-text")
const playground = document.querySelector(".playground ul");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;//block이 떨어지는 시간
let downInterval;
let tempMovingItem;//moving이 실행되기 전에 잠깐 담아두는 용도

const movingItem = {//실질적으로 block의 type과 좌표등의 정보를 가지고 있는 변수
  type: "",
  direction: 0,//화살표를 이용한 방향전환에 사용되는 변수
  top: 0,//좌표기준으로 어디까지 내려왔는지, 어디까지 내려가야하는지
  left: 3,//좌우값을 알려줌
}

init();

//Functions
function init() {
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  tempMovingItem = { ...movingItem };//movingItem을 나두고 tempMovingItem을 바꾼다음, 바꾼 값이 맞으면 괜찮지만 틀리다면 다시 movingItem으로 돌아가기위해 spread문법을 사용한다.
  generateNewBlock();
}
//---기본 레이아웃구성
function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}
//---Block rendering
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;//distructuring사용, 하나씩 접근해야하는 불편함을 줄여준다.
  //BLOCKS[tree][0]인 경우 type이 tree이고 direction이 0이므로 기본방향을 나타낸다.
  const movingBlocks = document.querySelectorAll(".moving");//.moving class를 가지고 있는 query가 많기때문
  movingBlocks.forEach(moving => {
    moving.classList.remove(type, "moving");
  })
  BLOCKS[type][direction].some(block => {
    const x = block[0] + left;
    const y = block[1] + top;//perpend를 이용하여 layout했기때문에 top을 더하면 밑으로내려감
    const target = playground.childNodes[y] && playground.childNodes[y].childNodes[0].childNodes[x] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);//target존재유무에 따라 false/true
    if (isAvailable) {
      target.classList.add(type, "moving");//type은 변수, "moving"은 클래스 이름 
    } else {
      tempMovingItem = { ...movingItem }
      if(moveType === "retry"){
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks('retry');
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  })
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}
function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");//.moving class를 가지고 있는 query가 많기때문
  movingBlocks.forEach(moving => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  })
  checkMatch()

}
function checkMatch() {

  const childNodes = playground.childNodes;
  childNodes.forEach(child => {//각각의 li, 가로행 check
    let matched = true;
    child.children[0].childNodes.forEach(li => {//child(li)의 children(ul)의 childNodes(li)
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    })
    if (matched) {
      child.remove();//li, 가로행 삭제
      prependNewLine()//새로 한줄을 생성함
      score++;
      scoreDisplay.innerText = score;
    }
  })

  generateNewBlock();
}
function generateNewBlock() {

  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  }, duration)

  const blockArray = Object.entries(BLOCKS);//객체를 배열로 바꿔줌
  const randomIndex = Math.floor(Math.random() * blockArray.length)
  movingItem.type = blockArray[randomIndex][0]
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };//값만 복사
  renderBlocks();
}
function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}
function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
  renderBlocks();
}
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1)
  }, 10)
}
function showGameoverText(){
  gameText.style.display ="flex"
}
//event handling
document.addEventListener("keydown", e => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
})

restartButton.addEventListener("click",()=>{
  playground.innerHTML = "";
  gameText.style.display = "none";//restart눌렀을때 이제 게임종료 안보이게 해야됨
  init();
})
//-------48min
