const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu")

menuBtn.onclick = () => {
    menu.showModal();
}

document.onclick = (e) => {
    if (e.target != menuBtn && e.clientY > e.target.getBoundingClientRect().height) {
        menu.close();
    }
}