let imageInsert = document.getElementById('imga1');
    imageInsert.addEventListener('click', drawTheImage);
    function drawTheImage() {
    setPics.push(pic);
}

let moveIt = document.getElementById('moveLeft');

moveIt.addEventListener('click', pushAction);
function pushAction() {
    let logic = document.getElementById('logic');
    let move = document.createElement('img');
    move.src = 'img/move.png';
    move.style.width = '100px';
    logic.appendChild(move);
}

let execute = document.getElementById('execute');
    execute.addEventListener('click', executeLogic);
function executeLogic() {



}