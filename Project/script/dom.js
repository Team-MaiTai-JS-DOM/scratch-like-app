let operate;let s = null;
//inserting pic to the canvas
let imageInsert = document.getElementById('imga1');
    imageInsert.addEventListener('click', drawTheImage);
    function drawTheImage() {
        if(s === null){
            s = createSprite(60,100,10,10);
            s.addImage(pic1);
        }
}

//moveLeft button
let moveLeftButton = document.getElementById('moveLeft');
moveLeftButton.addEventListener('click', pushAction);
function pushAction() {
    let logic = document.getElementById('logic');
    let move = document.createElement('img');
    move.src = 'img/move.png';
    move.style.width = '100px';
    move.className = 'moveLeft';
    logic.appendChild(move);
    logicOperations.push(moveLeft);
}
function moveLeft() {
    s.position.x += 3;
}

//execute button
let execute = document.getElementById('execute');
execute.addEventListener('click', executeLogic);
function executeLogic() {
    operate = true;
}

//reset button
let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', reset);
function reset() {
    s.position.x = 60;
    s.position.y = 100;
}