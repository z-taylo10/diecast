const colorMapping = {
    "Dark Purple": "Purple",
    "Light Purple": "Purple",
    "Purple": "Purple",
    "Black Gran Turismo": "Black",
    "Black": "Black",
    "White #52": "White",
    "White": "White",
    "Red": "Red",
    "Blue": "Blue",
    "Green": "Green",
    "Yellow": "Yellow",
    "Orange": "Orange",
    "Gray": "Gray",
    "Silver": "Silver",
    "Gold": "Gold",
    "Cream": "Neutral",
    "Tan": "Neutral",
    "Beige": "Neutral",
    "Ivory": "Neutral",
    "Off-White": "Neutral",
    "Brown": "Brown",
    "Dark Brown": "Brown",
    "Light Brown": "Brown",
    "Maroon": "Red",
    "Burgundy": "Red",
    "Navy": "Blue",
    "Sky Blue": "Blue",
    "Light Blue": "Blue",
    "Dark Blue": "Blue",
    "Lime": "Green",
    "Olive": "Green",
    "Dark Green": "Green",
    "Light Green": "Green",
    "Pink": "Pink",
    "Hot Pink": "Pink",
    "Magenta": "Pink",
    "Cyan": "Blue",
    "Teal": "Blue",
    "Turquoise": "Blue",
    "Aqua": "Blue",
    "Violet": "Purple",
    "Lavender": "Purple",
    "Indigo": "Purple",
    // Add more mappings as needed
};

function getBaseColor(color) {
    for (const [key, value] of Object.entries(colorMapping)) {
        if (color.includes(key)) {
            return value;
        }
    }
    return color; // Return the original color if no match is found
}