import App from "./modules/app.js";
window.onload = () => {
    let canvas = document.getElementById("app");
    const app = new App(canvas);
    function gameLoop() {
        app.update();
        app.render();
        window.requestAnimationFrame(gameLoop);
    }
    window.requestAnimationFrame(gameLoop);
};
