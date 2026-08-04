var MYCOVERSE_SPLASH_TEXTS = {
    general: [
        "Every empire begins with a single spore.",
        "The colony is always growing.",
        "Evolution never sleeps.",
        "Welcome back to MycoVerse.",
        "The mushrooms are watching...",
        "One colony. Infinite possibilities."
    ],
    colony: [
        "Your colony hungers for expansion.",
        "More spores. More power.",
        "Every harvest brings new discoveries.",
        "The mycelium keeps expanding.",
        "The strongest empires begin underground."
    ],
    laboratory: [
        "The laboratory is waiting for new experiments.",
        "Mutation research has begun.",
        "Science grows beneath the surface.",
        "Every mutation unlocks new possibilities.",
        "The laboratory smells... unusual."
    ],
    exploration: [
        "Every planet hides a new secret.",
        "Another expedition is ready.",
        "The stars are fertile tonight.",
        "Explore. Evolve. Expand.",
        "Even galaxies can bloom."
    ],
    golden: [
        "Golden Hour is almost here...",
        "The Golden Mushroom is extremely rare.",
        "Fortune favors the explorers.",
        "A legendary mushroom may appear today."
    ]
};

var splashTextArray = [];
Object.keys(MYCOVERSE_SPLASH_TEXTS).forEach(function (category) {
    splashTextArray = splashTextArray.concat(MYCOVERSE_SPLASH_TEXTS[category]);
});

var splashText = splashTextArray[Math.floor(Math.random() * splashTextArray.length)];
var splashElement = document.getElementById("splashText");
if (splashElement) {
    splashElement.textContent = splashText;
}
