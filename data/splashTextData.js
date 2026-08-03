var splashTextArray = [
"Every empire begins with a single spore.",
"The colony is always growing.",
"The mushrooms are watching...",
"Feed the colony. Expand the MycoVerse.",
"Evolution never sleeps.",
"One more miner won't hurt.",
"Collect spores. Build the future.",
"Every planet hides a new secret.",
"The Golden Mushroom is extremely rare.",
"The laboratory is waiting for new experiments.",
"Your colony hungers for expansion.",
"The galaxy belongs to the patient.",
"Ancient spores remember everything.",
"Every expedition changes your destiny.",
"Nature always finds a way.",
"Some mushrooms glow in the dark.",
"The colony grows stronger together.",
"More spores. More power.",
"The stars are fertile tonight.",
"Beware of mysterious fungal anomalies.",
"Evolution rewards the curious.",
"Never underestimate a tiny spore.",
"The fungal network keeps expanding.",
"Every harvest brings new discoveries.",
"The universe is alive with mycelium.",
"Rare miners are worth the wait.",
"Science grows beneath the surface.",
"Explore. Evolve. Expand.",
"The next planet may change everything.",
"The colony remembers your progress.",
"Golden Hour is almost here...",
"Power flows through the mycelium.",
"Every mutation opens new possibilities.",
"Ancient civilizations left fungal relics behind.",
"Your miners believe in you.",
"Even galaxies can bloom.",
"One colony. Infinite possibilities.",
"Some secrets are buried underground.",
"Growth is the greatest technology.",
"The strongest empires begin underground.",
"The laboratory smells... unusual.",
"The spores approve your decisions.",
"Another expedition is ready.",
"The mycelium connects every world.",
"Patience grows great colonies.",
"Fortune favors the explorers.",
"The universe is full of mushrooms.",
"Every click feeds the colony.",
"The next discovery is closer than you think.",
"Welcome back to MycoVerse.",
];

var splashText = splashTextArray[Math.floor(Math.random()*splashTextArray.length)];

var currentDate = (new Date()).toString();
if(currentDate.indexOf("Jan 01") !== -1){
	splashText = "Happy New Year!";
}
if(currentDate.indexOf("Feb 14") !== -1){
	splashText = "Happy Valentines!";
}
if(currentDate.indexOf("Sep 12") !== -1){
	splashText = "6 Month Anniversary! V0.5 Released!";
}
if(currentDate.indexOf("Dec 25") !== -1){
	splashText = "Merry Christmas!";
}
if(currentDate.indexOf("Apr 01") !== -1){
	splashText = "April Fools!";
}
document.getElementById("splashText").textContent = splashText;
