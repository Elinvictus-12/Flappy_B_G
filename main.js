const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Inicio, Juego, GameOver]
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    game.scale.resize(w, h);
});

if (screen && screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("portrait").catch(() => {});
} else if (screen && screen.lockOrientation) {
    try {
        screen.lockOrientation("portrait");
    } catch (e) {}
} else if (window.screen && window.screen.lockOrientation) {
    try {
        window.screen.lockOrientation("portrait");
    } catch (e) {}
}