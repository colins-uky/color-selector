const popupContainer = document.querySelector('.popup');
const colorPickerButton = document.querySelector("#pick-color");
const selectedColor = document.querySelector("#selected-color");
const selectedHex = document.querySelector('#selected-hex');
const selectedRGB = document.querySelector('#selected-rgb');

function hexToRGB (hex) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];

    // 6 digits
    } else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    
    return "rgb("+ +r + "," + +g + "," + +b + ")";
}

function updateHistoryDisplay(colorHistory) {
    const historyContainer = document.querySelector('#history-container');

    // clear outdated display
    historyContainer.innerHTML = '';

    // Add each color in history to the display (max 12 colors)

    for (const color of colorHistory) {
        addToHistoryDisplay(color);
    }
}

function addToHistoryDisplay(color) {
    const historyContainer = document.querySelector('#history-container');

    const colorCell = document.createElement('div');
    colorCell.style.backgroundColor = color.rgb;
    colorCell.style.cursor = 'pointer';
    colorCell.className = 'color-cell';

    // Add mouseover and mouseout events
    colorCell.addEventListener('mouseover', () => {
        document.querySelector('#history-color').style.backgroundColor = color.rgb;
        document.querySelector('#history-hex').innerText = color.hex;
        document.querySelector('#history-rgb').innerText = color.rgb;
    });

    // Add onclick event
    colorCell.addEventListener('click', () => {
        document.querySelector('#history-color').style.backgroundColor = color.rgb;
        document.querySelector('#history-hex').innerText = color.hex;
        document.querySelector('#history-rgb').innerText = color.rgb;

        document.querySelector('#selected-color').style.backgroundColor = color.rgb;
        document.querySelector('#selected-hex').innerText = color.hex;
        document.querySelector('#selected-rgb').innerText = color.rgb;
    })


    historyContainer.appendChild(colorCell);
}

function displayColorHistory(colorHistory) {
    const historyContainer = document.querySelector("#history-container");
    historyContainer.innerHTML = ''; // clear the grid before displaying
    colorHistory.forEach(color => addToHistoryDisplay(color)); // add each color to the grid
}

// Initialize color history storage
chrome.storage.local.get('colorHistory', ({ colorHistory }) => {
    if (!colorHistory) {
        chrome.storage.local.set({ colorHistory: [] });
    } else {
        displayColorHistory(colorHistory);
    }
});

async function activateEyeDropper () {
    try {
        const eyeDropper = new EyeDropper();
        const response = await eyeDropper.open();

        // Show popup again after await returns
        popupContainer.classList.remove('hide-popup');

        const hex = response.sRGBHex;
        const rgb = hexToRGB(hex);

        chrome.storage.local.get('colorHistory', ({ colorHistory }) => {
            if (!colorHistory) {
                colorHistory = [];
            }

            const color = {
                hex: hex,
                rgb: rgb
            };

            if (colorHistory.length == 12) {
                colorHistory.shift();
            }

            colorHistory.push(color);

            chrome.storage.local.set({ colorHistory: colorHistory }, () => {
                console.log("Color History Updated");

                updateHistoryDisplay(colorHistory);
            })
        })
        
        selectedColor.style.backgroundColor = rgb;

        selectedRGB.innerText = rgb;
        selectedHex.innerText = hex;
        
    } catch (error) {
        console.log(error);
    }
}

function copyToClipboard(element) {
    const text = element.innerText;
    navigator.clipboard.writeText(text);

    element.innerText = "Copied!";

    setTimeout(() => {
        element.innerText = text;
    }, 1000)
}



const copyDivs = document.getElementsByClassName('copy');
for (let i = 0; i < copyDivs.length; i++) {
    copyDivs[i].addEventListener("click", () => {
        copyToClipboard(copyDivs[i]);
    })
}


const clearHistoryButton = document.querySelector('#clear-history');
clearHistoryButton.addEventListener('click', () => {
    // Clear the color history in storage
    chrome.storage.local.set({ colorHistory: [] }, () => {
        console.log("Color history cleared");

        // Clear the history display
        const historyContainer = document.querySelector("#history-container");
        historyContainer.innerHTML = '';
    });
});

chrome.storage.local.get('colorHistory', ({ colorHistory }) => {
    let latestColor;

    // Check if the color history is not empty
    if (colorHistory && colorHistory.length > 0) {
        // Get the latest color
        latestColor = colorHistory[colorHistory.length - 1];
    } else {
        // Use white as the default color
        latestColor = {
            hex: '#ffffff',
            rgb: 'rgb(255,255,255)'
        };
    }

    // Get the selected and history color divs
    document.querySelector('#history-color').style.backgroundColor = latestColor.rgb;
    document.querySelector('#history-hex').innerText = latestColor.hex;
    document.querySelector('#history-rgb').innerText = latestColor.rgb;

    document.querySelector('#selected-color').style.backgroundColor = latestColor.rgb;
    document.querySelector('#selected-hex').innerText = latestColor.hex;
    document.querySelector('#selected-rgb').innerText = latestColor.rgb;

});

colorPickerButton.addEventListener("click", () => {
    // Hide popup window
    popupContainer.classList.add('hide-popup');

    // Activate eye dropper after 17 milliseconds to give time for the 
    // css class styles to be applied and rendered. i.e. next frame
    // ~17 ms for 60 fps and ~7 ms for 144 fps
    setTimeout(activateEyeDropper, 17);
});