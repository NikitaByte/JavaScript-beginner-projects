const body = document.getElementsByTagName("body")[0];

function setBackroundColor(name) {
    body.style.backgroundColor = name;
}

function setRandomColor() {
    const color = getRandomColor();
    const body = document.getElementsByTagName("body")[0];
    body.style.backgroundColor = color;
}

function getRandomColor() {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);

    return `rgb(${r}, ${g}, ${b})`;
}