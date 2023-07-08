const colorPickerButton = document.querySelector("#pick-color");
const colorContainer = document.querySelector(".color-container");
const color1 = document.querySelector(".color-1");

const hexToRGB = (hex) => {
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


const activateEyeDropper = async () => {
    try {
        const eyeDropper = new EyeDropper();
        const response = await eyeDropper.open();
        const hex = response.sRGBHex;
        const rgb = hexToRGB(hex);


        

        color1.style.backgroundColor = rgb;
        colorContainer.style.visibility = "visible";



        
        
    } catch (error) {
        console.log(error);
    }
}
colorPickerButton.addEventListener("click", activateEyeDropper);