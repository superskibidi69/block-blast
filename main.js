const colors = {
    blue_background: "#324c83",
}
javascript:(function () { var script = document.createElement('script'); script.src="https://cdn.jsdelivr.net/npm/eruda"; document.body.append(script); script.onload = function () { eruda.init(); } })();
const isMobile = navigator.userAgentData.mobile;
const game_grid = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
];
document.querySelector(".home-classic").onclick = function () {

    //main game
    document.body.style.background = colors.blue_background
    document.body.innerHTML = `
<div class="game-header">
<div class="game-highscore"><img src="assets/Screenshot_2024-11-30_4.48.29_PM_Nero_AI_Photo_Face-removebg-preview (1).png">0</div>
<div class="game-settings"><img src="assets/Screenshot_2024-11-30_4.48.45_PM_Nero_AI_Photo_Face-removebg-preview.png"></div>
</div>
<div class="game-score"><text>0</text></div>
<div class="grid-cont" style=" display: flex;
    text-align: center;
    align-items: center; width: 100%; justify-content: center;">
<div id="game-grid" style="  display: flex;
    flex-wrap: wrap; margin-top: 50px;"></div>
    </div>
    <div id="current_blocks"></div>
`;
    for (let i = 1; i < game_grid.length + 1; i++) {
        let current_row = ((game_grid.length - i) / 8).toString().split(".")[0];
        let gridRow = document.createElement("div");
        gridRow.id = `row-${current_row}`;
        let gridBlock = document.createElement("div");
        gridBlock.style = ` 
     flex: 0 0 12.5%;
    box-sizing: border-box;
    background:#222B4C;
    border:1px solid #1E2748;
    padding: ${isMobile ? "40" : "20"}px;
    `;
        if (document.querySelector(`#${gridRow.id}`) === null) {
            document.querySelector("#game-grid").appendChild(gridRow)
            document.querySelector(`#${gridRow.id}`).appendChild(gridBlock)
        } else {
            document.querySelector(`#${gridRow.id}`).appendChild(gridBlock)
        }
    }

    const gridBlocks = {
        "brokecrossup": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 1, 1, 1, 0,

            ]
        }, "brokecrossdown": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 1, 1, 1, 0,
                0, 0, 1, 0, 0,
            ]

        }, "brokecrossleft": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 1, 1, 0, 0,
                0, 0, 1, 0, 0,
            ]

        }, "brokecrossright": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 1, 0,
                0, 0, 1, 0, 0,
            ]

        }, "4stickh": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 1, 1, 1, 1,
            ]

        }, "5stickh": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 1, 1, 1,
                0, 0, 0, 0, 0,
            ]

        }, "4stickv": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
            ]

        }, "5stickv": {
            "layout": [
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
            ]

        }, "wallright": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                1, 1, 1, 0, 0,
            ]

        }, "wallleft": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 0, 0, 0, 0,
                1, 0, 0, 0, 0,
                1, 1, 1, 0, 0,
            ]

        }, "walldown": {
            "layout": [
                1, 1, 1, 0, 0,
                1, 0, 0, 0, 0,
                1, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
            ]

        }, "wallup": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
            ]

        }, "stepleft": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
            ]

        }, "stepright": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                1, 1, 0, 0, 0,
            ]
        }, "stepup": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
                0, 1, 0, 0, 0,
            ]

        }, "stepdown": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
                1, 0, 0, 0, 0,
            ]

        }, "3x3": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 1, 0, 0,
                1, 1, 1, 0, 0,
                1, 1, 1, 0, 0,
            ]

        }, "2x2": {
            "layout": [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
                1, 1, 0, 0, 0,
            ]

        }
    }
     function generateBlocks(grid, score) {
        const blockList = ["brokecrossup", "brokecrossdown", "brokecrossleft", "brokecrossright", "4stickh", "5stickh", "4stickv", "5stickv", "wallright", "wallleft", "walldown", "wallup", "stepleft", "stepright", "stepup", "stepdown", "2x2", "3x3"];
        
        function getRandomStrings(arr, num) {
            const shuffled = arr.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        }
    
        const randomStrings = getRandomStrings(blockList, 3);
}
    generateBlocks(game_grid)










document.querySelector(".game-settings").onclick = function() {
   let settings = document.createElement("div");
   settings.id = "setting-popup";
   settings.innerHTML = `
   <div class="settings-section">
     <div class="settings-option">Sound <div></div>Toggle</div>  
     <div class="settings-option">BGM <div></div>Toggle</div> 
   <div class="settings-option">Vibration <div></div>Toggle</div>
   <div class="settings-option">Home <div></div>Toggle</div>
   <div class="settings-option">Replay <div></div>Toggle</div>
   <div class="settings-option">More Games <div></div>Toggle</div>
   <div class="settings-option">More Settings <div></div>Toggle</div>
   </div>`;
   document.body.appendChild(settings);
}
}
