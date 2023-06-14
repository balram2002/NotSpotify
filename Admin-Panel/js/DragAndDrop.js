const image = document.querySelector("#dropzone-file2");
const dropZone = document.querySelector('.dropzone');
const img = document.querySelector('.image');
let p1 = document.querySelector('.p1');
let p2 = document.querySelector('.p2');
const svg = dropZone.querySelector("svg");


dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});
dropZone.addEventListener('drop', (e) => {
    let file = e.dataTransfer.files[0];
    e.preventDefault();
    image.files = e.dataTransfer.files;
    updateThumbnail(file);

});

function updateThumbnail(file) {
    svg.classList.add("hidden");
    img.style = "display:block;";
    img.height = 100;
    img.width = 100;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        p1.style = 'display: none';
        p2.innerHTML = file.name;
        let src = this.result;
        img.src = src;
        img.alt = file.name;
    }
}