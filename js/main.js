// Player object
let player = {
    currentArea: 0,
    toolVersion: "1.0",
    areaList: [],
    lastScreenUpdate: Date.now(),
    resources: {},
    variables: {},
    currentTicks: 0,
    currentTime: 0,
    maxFPS: 100,
    showGrindMats: true,
    showCraftRecipes: true,
    enableAutobuys: true,
    autoSave: true,
    saveGotten: false,
    switchArea: false,
};

let bodyEl = document.querySelector("body");
let titleEl = document.querySelector("title");
let iconLinkEl = document.querySelector("#iconLink");

// Stop selecting and dragging of text
function pauseEvent(e){
    if (e.preventDefault) e.preventDefault();
    e.returnValue=false;
    return false;
}

// Show recipies and resources
bodyEl.addEventListener("mousemove", moveRecipe);
bodyEl.addEventListener("mousemove", moveGrindResources);

let leftDivEl = document.querySelector(".left-div");
let rightDivEl = document.querySelector(".right-div");

let leftTopDivEl = document.querySelector(".left-top-div");
let leftBottomDivEl = document.querySelector(".left-bottom-div");

let recipeDivEl = document.querySelector(".recipe-div");
let recipeNameEl = document.querySelector(".recipe-name");
let recipeCostDivEl = document.querySelector(".recipe-cost-div");
let recipeDescEl = document.querySelector(".recipe-desc");

let grindResourceDivEl = document.querySelector(".grind-resource-div");

let messageDivEl = document.querySelector(".message-div");
let messageTextEl = document.querySelector(".message-text");
let messageButtonEl = document.querySelector(".message-button");

let settingsDivEl = document.querySelector(".settings-div");
let settingsButtonEl = document.querySelector(".settings-button");
let settingEls = document.querySelectorAll(".setting");

let tpsTextEl = document.querySelector(".tps-text");
let settingsTopButtonEl = document.querySelector(".settings-top-button");

let maxFPSInputEl = document.querySelector("#maxFPSInput");
let maxFPSLabelEl = document.querySelector("#maxFPSLabel");
let showGrindMatsInputEl = document.querySelector("#showGrindMaterialsInput");
let showCraftRecipesInputEl = document.querySelector("#showCraftRecipesInput");
let enableAutobuysInputEl = document.querySelector("#enableAutobuysInput");
let autoSaveInputEl = document.querySelector("#autoSaveInput");
let importSaveinputEl = document.querySelector("#importSaveInput");
let importSaveButtonEl = document.querySelector("#importSaveButton");
let copySaveButtonEl = document.querySelector("#copySaveButton");
let resetSaveButtonEl = document.querySelector("#resetSaveButton");
let saveButtonEl = document.querySelector("#saveButton");

messageButtonEl.addEventListener("click", hideMessage);
settingsButtonEl.addEventListener("click", hideSettings);
settingsTopButtonEl.addEventListener("click", showSettings);
copySaveButtonEl.addEventListener("click", copySave);
importSaveButtonEl.addEventListener("click", importSave);
resetSaveButtonEl.addEventListener("click", resetSave);
saveButtonEl.addEventListener("click", saveGame);

// Setting values
maxFPSInputEl.addEventListener("mousemove", () => {
    maxFPSLabelEl.innerText = maxFPSInputEl.value;
});

maxFPSInputEl.addEventListener("change", () => {
    player.maxFPS = Number(maxFPSInputEl.value);
});

showGrindMatsInputEl.addEventListener("change", () => {
    player.showGrindMats = !player.showGrindMats;
});

showCraftRecipesInputEl.addEventListener("change", () => {
    player.showCraftRecipes = !player.showCraftRecipes;
});

enableAutobuysInputEl.addEventListener("change", () => {
    player.enableAutobuys = !player.enableAutobuys;
});

autoSaveInputEl.addEventListener("change", () => {
    player.autoSave = !player.autoSave;
});

// Add area to the player object
function addArea(id, contents) {
    contents.lastUpdate = Date.now();
    player[id] = contents;
    player.areaList.push(id);
}

// Get saved data
function getSavedData(save) {
    if (save.resources) {
        player.resources = save.resources;
    }

    if (save.variables) {
        player.variables = save.variables;
    }

    if (save.maxFPS) {
        player.maxFPS = save.maxFPS;
        maxFPSInputEl.value = player.maxFPS;
        maxFPSLabelEl.innerText = player.maxFPS;
    }

    if (save.showGrindMats === true || save.showGrindMats === false) {
        player.showGrindMats = save.showGrindMats;
        showGrindMatsInputEl.checked = player.showGrindMats;
    }

    if (save.showCraftRecipes === true || save.showCraftRecipes === false) {
        player.showCraftRecipes = save.showCraftRecipes;
        showCraftRecipesInputEl.checked = player.showCraftRecipes;
    }

    if (save.enableAutobuys === true || save.enableAutobuys === false) {
        player.enableAutobuys = save.enableAutobuys;
        enableAutobuysInputEl.checked = player.enableAutobuys;
    }

    if (save.autoSave === true || save.autoSave === false) {
        player.autoSave = save.autoSave;
        autoSaveInputEl.checked = player.autoSave;
    }

    if (save.currentArea === 0 || save.currentArea) {
        player.currentArea = save.currentArea;
    }

    player.saveGotten = true;
}

// Add resources to the player object
function addResources(contents) {
    if (!player.saveGotten && localStorage[gameInfo.ID]) {
        getSavedData(JSON.parse(localStorage[gameInfo.ID]));
    }

    // For every resource
    for (let resource in contents) {
        // Replace image texts
        if (contents[resource].image === "" || contents[resource].image === "blank") contents[resource].image = "images/system/blank.png";
        if (contents[resource].image === "wip") contents[resource].image = "images/system/wip.png";

        // If the resource is already in the player object ...
        if (player.resources[resource]) {
            // ... update image
            player.resources[resource].image = contents[resource].image;
            
            // ... update limit
            if (!player.resources[resource].limit && (contents[resource].limit || contents[resource].limit === 0)) {
                player.resources[resource].limit = contents[resource].limit;
            }

            // Remove the resource from the contents object
            delete contents[resource];
        }
    }

    // Add the remaining resources to the player object
    player.resources = {
        ...player.resources,
        ...contents,
    }
}

// Add variables to the player object
function addVariables(contents) {
    if (!player.saveGotten && localStorage[gameInfo.ID]) {
        getSavedData(JSON.parse(localStorage[gameInfo.ID]));
    }

    // For every variable
    for (let variable in contents) {
        // If the variable is already in the player object
        if (player.variables[variable] !== undefined) {
            // If the variable is an object ...
            if (typeof contents[variable] === 'object' && !Array.isArray(contents[variable]) && contents[variable] !== null) {
                // ... update the values inside the object
                updateVariableObject(player.variables[variable], contents[variable]);
            }

            // Remove the variable from the contents object
            delete contents[variable];
        }
    }

    // Add the remaining variables to the player pbject
    player.variables = {
        ...player.variables,
        ...contents,
    }
}

// Update variable objects
function updateVariableObject(path, object) {
    // For every key in the variable object
    for (let key in object) {
        // If the key doesn't exist in the variable in the player object ...
        if (path[key] === undefined) {
            //... add the key to the variable in the player object
            path[key] = object[key];
        }
        // If it does exist and the value is an object ...
        else if (typeof object[key] === 'object' && !Array.isArray(object[key]) && object[key] !== null) {
            //... check trough the new object
            updateVariableObject(path[key], object[key]);
        }
    }
}

// Set up game
function setupGame() {
    // Empty website
    rightDivEl.innerHTML = "";
    leftTopDivEl.innerHTML = "";
    leftBottomDivEl.innerHTML = "";

    titleEl.innerText = gameInfo.name;
    iconLinkEl.href = gameInfo.icon;

    // Show area-buttons
    for (let areaID of player.areaList) {
        let area = player[areaID];

        // Create elements
        let areaDivEl = document.createElement("div");
        let areaTextEl = document.createElement("h3");

        // Add text and images
        areaTextEl.innerText = area.name;
        areaDivEl.style.background = "url(" + area.image + ")";
        areaDivEl.className = "area-div";

        areaDivEl.addEventListener("click", () => {
            switchArea(areaID);
        });

        // Show on website
        areaDivEl.appendChild(areaTextEl);
        leftBottomDivEl.appendChild(areaDivEl);
        
        // If the area is unlocked: Show the element. If not: Hide
        if (area.unlocked) {
            areaDivEl.style.display = "block";
        } else {
            areaDivEl.style.display = "none";
        }
    }

    let area = player[player.areaList[player.currentArea]];
    let areaGrinds = area.grinds;

    // Show grinds of current area
    for (let i = 0; i < areaGrinds.length; i++) {
        let grind = areaGrinds[i];
        let grindName = grind.name;

        // Create elements
        let grindDivEl = document.createElement("div");
        let grindDivGradientEl = document.createElement("div");
        let progressDivEl = document.createElement("div");
        let progressbarEl = document.createElement("div");
        let imgDivEl = document.createElement("div");
        let h3El = document.createElement("h3");
        let imgEl = document.createElement("img");
        let toolImgEl = document.createElement("img");

        // Set values
        grind.current = "";
        grind.clicked = false;

        // Add text and images
        grindDivEl.className = "grind-div";
        grindDivEl.style.background = "url(" + grind.background + ")";
        grindDivGradientEl.className = "grind-div2";
        imgDivEl.className = "grind-image-div";
        h3El.className = "grind-text";
        h3El.innerText = grindName;
        imgEl.className = "grind-image";
        imgEl.src = "images/system/blank.png";
        toolImgEl.className = "grind-tool-image";
        toolImgEl.src = "images/system/blank.png";
        progressDivEl.className = "grind-progressbar-div";
        progressbarEl.className = "grind-progressbar";

        imgDivEl.addEventListener("click", () => {
            grindResource(grindDivEl, i);
        });

        grindDivEl.addEventListener("mouseover", () => {
            showGrindResources(grind);
        });

        grindDivEl.addEventListener("mousedown", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });
        
        grindDivEl.addEventListener("mousemove", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });

        grindDivEl.addEventListener("mouseout", hideGrindResources);

        // Show elements on website
        imgDivEl.appendChild(imgEl);
        imgDivEl.appendChild(progressDivEl);
        progressDivEl.appendChild(progressbarEl);
        grindDivGradientEl.appendChild(imgDivEl);
        grindDivEl.appendChild(h3El);
        grindDivEl.appendChild(toolImgEl);
        grindDivEl.appendChild(grindDivGradientEl);
        leftTopDivEl.appendChild(grindDivEl);

        // If the grind isn't unlocked: Hide
        if (!grind.unlocked) {
            grindDivEl.style.display = "none";
        }
    }

    let areaCrafts = area.crafts;

    // Show crafts of current area
    for (let i = 0; i < areaCrafts.length; i++) {
        let craft = areaCrafts[i];
        let craftName = craft.name;

        // Get name and image
        let name = (craft.displayName) ? craft.displayName : craftName;
        let image = (craft.displayImage) ? craft.displayImage : craftName;

        image = (player.resources[image]) ? player.resources[image].image : image;

        // If the amount isn't set, set it to 0
        if (!player.resources[craftName].amount) {
            player.resources[craftName].amount = 0;
        }

        // Create elements
        let divEl = document.createElement("div");
        let imgEl = document.createElement("img");
        let pEl = document.createElement("p");

        // Add text and images
        divEl.className = "craft-div";
        divEl.setAttribute("data-name", craftName);
        imgEl.className = "craft-image";
        imgEl.src = image;
        pEl.className = "craft-text";
        pEl.innerText = (player.resources[craftName].amount) ? player.resources[craftName].amount : "";

        // If the craft type isn't "display": Make it clickable
        if (craft.type !== "display") {
            divEl.addEventListener("click", () => {
                craftResource(craft);
            });
        }

        divEl.addEventListener("mouseover", () => {
            if (player.resources[craftName].limit || player.resources[craftName].limit === 0) {
                showRecipe(craft, name + " (Max: " + ((player.resources[craftName].limit > 999999999) ? shortenNumber(player.resources[craftName].limit) : player.resources[craftName].limit) + ")");
            } else {
               showRecipe(craft, name); 
            }
        });

        divEl.addEventListener("mouseout", hideRecipe);

        divEl.addEventListener("mousedown", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });
        
        divEl.addEventListener("mousemove", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });

        divEl.appendChild(imgEl);
        divEl.appendChild(pEl);
        rightDivEl.appendChild(divEl);

        // If the craft unlocks grinds when bought
        if (craft.unlockGrinds) {
            // For every grind
            for (let j = 0; j < area.grinds.length; j++) {
                let grind = area.grinds[j];

                // If the grind is unlocked from the craft and you have crafted it ...
                if (craft.unlockGrinds.indexOf(grind.name) > -1 && player.resources[craft.name].amount > 0) {
                    // ... unlock the grind and show it
                    grind.unlocked = true;
                    leftTopDivEl.children[j].style.display = "block";
                }
            }
        }

        // If the craft unlocks areas when bought
        if (craft.unlockAreas) {
            // For every area
            for (let j = 0; j < player.areaList.length; j++) {
                let areaID = player.areaList[j];

                // If the area is unlocked from the craft and you have crafted it ...
                if (craft.unlockAreas.indexOf(areaID) > -1 && player.resources[craft.name].amount > 0) {
                    // ... unlock the area and show it
                    player[areaID].unlocked = true;
                    leftBottomDivEl.children[j].style.display = "block";
                }
            }
        }
    }

    // Make a list of all areas except the current
    let checkAreaList = Object.assign([], player.areaList);
    checkAreaList.splice(player.currentArea, 1);

    // For every area in the checklist
    for (let areaID of checkAreaList) {
        let areaCrafts = player[areaID].crafts;

        // For every craft in that area
        for (let i = 0; i < areaCrafts.length; i++) {
            let craft = areaCrafts[i];

            // If the craft unlocks any areas
            if (craft.unlockAreas) {
                // For every area
                for (let j = 0; j < player.areaList.length; j++) {
                    let areaID = player.areaList[j];

                    // If the area is unlocked from the craft and you have crafted it ...
                    if (craft.unlockAreas.indexOf(areaID) > -1 && player.resources[craft.name].amount > 0) {
                        // ... unlock the area and show it
                        player[areaID].unlocked = true;
                        leftBottomDivEl.children[j].style.display = "block";
                    }
                }
            }
        }
    }

    // Set the heigh of the area-button div
    leftBottomDivEl.style.height = (window.innerHeight - 60 - 45.2 - leftTopDivEl.clientHeight) + "px";

    // You have now switched to a new area / set up the game
    player.switchArea = false;
}

// Grind a resource
function grindResource(grind, grindID) {
    // Get the current area
    let area = player[player.areaList[player.currentArea]];

    // If you are currently grinding something: Return
    if (area.grinds[grindID].current === "" || area.grinds[grindID].currentGrindTime > 0) {
        return;
    }

    // Get the current resource
    let resource = area.grinds[grindID].resources[area.grinds[grindID].resourceID];
    let totalTime = 0;
    let toolUsed = "";

    // For every tool in that resource
    for (let tool of resource.time) {
        // If you have the tool and it's not just your hand
        if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
            // Set this tool to your current tool and break
            toolUsed = tool[0];
            totalTime = tool[1];
            break;
        }
    }

    // If there are any resource mults
    if (resource.mults) {
        // For every mult
        for (let mult of resource.mults) {
            // If you have the mult and it has a time boost
            if (mult[0] && mult[1] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                // Divide total time by the mult
                totalTime /= mult[1];
            }
        }
    }

    // Start grinding the resource
    area.grinds[grindID].clicked = true;
    grind.children[2].children[0].children[1].style.display = "block";
    grind.children[2].children[0].children[1].firstElementChild.style.width = 0;

    grind.children[1].style.display = "block";
    grind.children[1].src = (toolUsed) ? player.resources[toolUsed].image : "images/system/hand.png";

    area.grinds[grindID].currentGrindTime = 0;
    area.grinds[grindID].totalGrindTime = totalTime;
}

// Craft a resource
function craftResource(resource) {
    // Get the current area
    let area = player[player.areaList[player.currentArea]];

    // Get info about the craft
    let name = resource.name;
    let cost = resource.cost;
    let amount = (resource.amount) ? resource.amount : 1;

    // If you can't afford it: Return
    if (!canAfford(cost, name, amount)) {
        return;
    }

    // For every material in cost
    for (let mat of cost) {
        // If the cost is more than 0
        if (mat[1] > 0) {
            // Pay the cost
            player.resources[mat[0]].amount -= mat[1];
        }
    }

    // If the resource has a message and it hasn't been shown
    if (resource.message && !resource.hasShownMessage && player.resources[resource.name].amount === 0) {
        // Show the message
        showMessage(resource.message);
        resource.hasShownMessage = true;
    }

    // Craft the resource
    player.resources[name].amount += amount;

    // If the resource unlocks grinds
    if (resource.unlockGrinds) {
        // For every grind
        for (let i = 0; i < area.grinds.length; i++) {
            let grind = area.grinds[i];

            // If the grind is unlocked from the craft ...
            if (resource.unlockGrinds.indexOf(grind.name) > -1) {
                // ... unlock the grind and show it
                grind.unlocked = true;
                leftTopDivEl.children[i].style.display = "block";
            }
        }
    }

    // If the resource unlocks areas
    if (resource.unlockAreas) {
        // For every area
        for (let i = 0; i < player.areaList.length; i++) {
            let areaID = player.areaList[i];

            // If the area is unlocked from the craft ...
            if (resource.unlockAreas.indexOf(areaID) > -1 && player.resources[resource.name].amount > 0) {
                // ... unlock the area and show it
                player[areaID].unlocked = true;
                leftBottomDivEl.children[i].style.display = "block";
            }
        }
    }

    // If the resource runs a function when crafted
    if (resource.runFunction) {
        // For every function
        for (let func of resource.runFunction) {
            // If the value is an array
            if (Array.isArray(func)) {
                // Get arguments
                let args = Object.assign([], func);
                let functionName = args.shift();
    
                // Run function with arguments
                window[functionName].apply(window, args);
            } else {
                // Else, run function
                window[func]();
            }
        }
    }
}

// Show crafting recipe
function showRecipe(resource, name) {
    // If show crafting recipes is off: Return
    if (!player.showCraftRecipes) {
        return;
    }

    // Gert current area and cost
    let area = player[player.areaList[player.currentArea]];
    let cost = resource.cost;

    recipeNameEl.innerText = name;
    recipeDescEl.innerText = resource.desc;

    // For every material in the cost
    for (let mat of cost) {
        // Get name and amount
        let matName = mat[0];
        let matAmount = mat[1];

        // Create elements
        let divEl = document.createElement("div");
        let imgEl = document.createElement("img");
        let pEl = document.createElement("p");

        // Set text and images
        divEl.className = "craft-div";
        imgEl.className = "craft-image";
        imgEl.src = player.resources[matName].image;
        pEl.className = "craft-text";

        // If the amount is too big: Shorten the number
        if (matAmount) {
            pEl.innerText = (matAmount > 999999999) ? shortenNumber(matAmount) : matAmount;
        } else {
            pEl.innerText = "";
        }

        // If the text length is too big: Change font size
        if (pEl.innerText.length > 7) {
            pEl.style.right = "1px";
            pEl.style.fontSize = "10px";
        } else if (pEl.innerText.length > 4) {
            pEl.style.right = "2px";
            pEl.style.fontSize = "12px";
        } else {
            pEl.style.right = "";
            pEl.style.fontSize = "";
        }

        // If the amount is less than 0: Reverse it
        if (matAmount < 0) {
            pEl.innerText = -matAmount;
        }

        // Show elements
        divEl.appendChild(imgEl);
        divEl.appendChild(pEl);
        recipeCostDivEl.appendChild(divEl);

        // For every craft in the current area
        for (let i = 0; i < area.crafts.length; i++) {
            let craft = area.crafts[i];

            // If the craft is in the cost and you don't have enough of it
            if (craft.name === matName && (player.resources[matName].amount < matAmount || player.resources[matName].amount === 0)) {
                // Change the background color to red
                let craftEl = rightDivEl.children[i];
                craftEl.style.backgroundColor = "#a83c32";

                // Change the border to red
                if (craftEl.className === "craft-div") {
                    craftEl.style.borderTop = "solid 4px #862e28";
                    craftEl.style.borderLeft = "solid 4px #862e28";
                    craftEl.style.borderRight = "solid 4px #cb493b";
                    craftEl.style.borderBottom = "solid 4px #cb493b";
                } else {
                    craftEl.style.borderRight = "solid 3px #862e28";
                    craftEl.style.borderBottom = "solid 3px #862e28";
                    craftEl.style.borderTop = "solid 3px #cb493b";
                    craftEl.style.borderLeft = "solid 3px #cb493b";
                }
            }
        }
    }

    recipeDivEl.style.display = "block";
}

// Move crafting recipe
function moveRecipe(e) {
    // If the page isn't too far right ...
    if ((e.pageX + 10) < window.innerWidth - 300) {
        // ... place recipe to the right of the mouse
        recipeDivEl.style.left = (e.pageX + 10) + "px";
        recipeDivEl.style.right = "";
    }
    // Else if the page is too far right ...
    else {
        // ... place recipe to the left of the mouse
        recipeDivEl.style.right = (window.innerWidth - e.pageX + 10) + "px";
        recipeDivEl.style.left = "";
    }

    // If the page isn't too far down ...
    if ((e.pageY + 10) < window.innerHeight - recipeDivEl.clientHeight) {
        // ... place the recipe below the mouse
        recipeDivEl.style.top = (e.pageY + 10) + "px";
        recipeDivEl.style.bottom = "";
    }
    // Else if the page is too far down ...
    else {
        // ... place the recipe above the mouse
        recipeDivEl.style.bottom = (window.innerHeight -  e.pageY + 10) + "px";
        recipeDivEl.style.top = "";
    }
}

// Hide crafting recipe
function hideRecipe() {
    // Clear the recipe text
    recipeDivEl.style.display = "none";
    recipeNameEl.innerText = "";
    recipeDescEl.innerText = "";
    recipeCostDivEl.innerHTML = "";

    // For every craft in the current area
    for (let i = 0; i < rightDivEl.children.length; i++) {
        let craftDivEl = rightDivEl.children[i];

        // Remove the red background and border colors
        craftDivEl.style.backgroundColor = "";
        craftDivEl.style.borderRight = "";
        craftDivEl.style.borderBottom = "";
        craftDivEl.style.borderTop = "";
        craftDivEl.style.borderLeft = "";
    }
}

// Show grind resources
function showGrindResources(grind) {
    // If show grind materials is off: Return
    if (!player.showGrindMats) {
        return;
    }

    // Get resources
    let resources = grind.resources;
    let grindImages = [];

    // For every resource
    for (let resource of resources) {
        // Get images and tools
        let resourceImage = (player.resources[resource.image]) ? player.resources[resource.image].image : resource.image;
        let resourceTool = resource.time[resource.time.length -1][0];
        let toolImage = "";
        
        // If the resource has already been checked: Continue
        if (grindImages.indexOf(resourceImage) > -1) {
            continue;
        }

        // Add the resource image to the image list
        grindImages.push(resourceImage);

        // If the weakest resource tool isn't the hand
        if (resourceTool && player.resources[resourceTool]) {
            // Set toolImage to the tool image
            toolImage = player.resources[resourceTool].image;
        }
        // Else if the weakest tool is the hand
        else if (resourceTool === "") {
            // Set toolImage to the hand
            toolImage = "images/system/hand.png";
        }
        // Else if there is no tool
        else {
            // Set toolImage to blank
            toolImage = "images/system/blank.png";
        }

        // Create elements
        let divEl = document.createElement("div");
        let resourceDivEl = document.createElement("div");
        let toolDivEl = document.createElement("div");
        let resourceImgEl = document.createElement("img");
        let toolImgEl = document.createElement("img");
        let arrowImgEl = document.createElement("img");

        // Set classes and images
        divEl.className = "grind-resource-sub-div";
        resourceDivEl.className = "grind-resource-image-div";
        toolDivEl.className = "grind-resource-image-div";
        resourceImgEl.className = "grind-resource-image";
        toolImgEl.className = "grind-resource-image";
        arrowImgEl.className = "grind-resource-arrow";
        resourceImgEl.src = resourceImage;
        toolImgEl.src = toolImage;
        arrowImgEl.src = "images/system/grindArrow.png";

        // Show elements
        toolDivEl.appendChild(toolImgEl);
        resourceDivEl.appendChild(resourceImgEl);
        divEl.appendChild(toolDivEl);
        divEl.appendChild(arrowImgEl);
        divEl.appendChild(resourceDivEl);
        grindResourceDivEl.appendChild(divEl);
    }

    grindResourceDivEl.style.display = "block";
}

// Move grind resources
function moveGrindResources(e) {
    // Place list to the left of the mouse
    grindResourceDivEl.style.left = (e.pageX + 10) + "px";

    // If the page isn't too far down ...
    if ((e.pageY + 10) < window.innerHeight - grindResourceDivEl.clientHeight) {
        // ... place the list below the mouse
        grindResourceDivEl.style.top = (e.pageY + 10) + "px";
        grindResourceDivEl.style.bottom = "";
    }
    // Else if the page is too far down ...
    else {
        // ... place the list on the bottom of the screen
        grindResourceDivEl.style.bottom = "0";
        grindResourceDivEl.style.top = "";
    }
}

// Hide grind resources
function hideGrindResources() {
    // Clear the list
    grindResourceDivEl.style.display = "none";
    grindResourceDivEl.innerHTML = "";
}

// Show message
function showMessage(text) {
    // Set the text, show the message and place it in the middle of the screen
    messageTextEl.innerText = text;
    messageDivEl.style.display = "block";
    messageDivEl.style.top = (window.innerHeight - messageDivEl.clientHeight) / 2 + "px";
}

// Hide message
function hideMessage() {
    messageDivEl.style.display = "none";
}

// Show settings
function showSettings() {
    // Show settings and place it in the middle of the screen
    settingsDivEl.style.display = "block";
    settingsDivEl.style.top = (window.innerHeight - settingsDivEl.clientHeight) / 2 + "px";
}

// Hide settings
function hideSettings() {
    settingsDivEl.style.display = "none";
}

// Copy save
function copySave() {
    // Get the text to copy
    let copyText = JSON.stringify({
        resources: player.resources,
        maxFPS: player.maxFPS,
        showGrindMats: player.showGrindMats,
        showCraftRecipes: player.showCraftRecipes,
        enableAutobuys: player.enableAutobuys,
        autoSave: player.autoSave,
        currentArea: player.currentArea,
        variables: player.variables,
    });

    // Create a textfield and set the text
    let copyEl = document.createElement("textarea");
    copyEl.innerHTML = copyText;

    // Select the textfield
    copyEl.select();
    copyEl.setSelectionRange(0, 999999); // For mobile devices

    // Copy the text inside the textfield
    navigator.clipboard.writeText(copyEl.value);
}

// Import save
function importSave() {
    // If there is no import value: Return
    if (!importSaveinputEl.value) {
        return;
    }

    // Get the value and clear the input element
    let text = importSaveinputEl.value;
    importSaveinputEl.value = "";

    // Turn the text into an object
    let saveImport = JSON.parse(text);

    // If the save is invalid: Return
    if (!saveImport.resources) {
        return;
    }

    // Get saved data from save and set up game
    getSavedData(saveImport);
    setupGame();
}

// Reset save
function resetSave() {
    // Check if the player really wants to reset their save
    let check = prompt("Are you sure you want to reset your save? [Y/N]");

    // If true: Reset save and reload the page
    if (check === "Y") {
        player.autoSave = false;
        localStorage.removeItem(gameInfo.ID);
        location.reload();
    }
}

// Save game
function saveGame() {
    // Update the localStorage
    localStorage[gameInfo.ID] = JSON.stringify({
        resources: player.resources,
        maxFPS: player.maxFPS,
        showGrindMats: player.showGrindMats,
        showCraftRecipes: player.showCraftRecipes,
        enableAutobuys: player.enableAutobuys,
        autoSave: player.autoSave,
        variables: player.variables,
        currentArea: player.currentArea,
    });
}

// Switch area
function switchArea(areaID) {
    // If the area doesn't exist: Return
    if (player.areaList.indexOf(areaID) === -1) {
        return;
    }

    // Set the current area to the new area and set switchArea to true
    player.currentArea = player.areaList.indexOf(areaID);
    player.switchArea = true;
}

// Check if you can afford the cost
function canAfford(cost, name, amount) {
    // For every material in the cost
    for (let mat of cost) {
        // If you don't have enough of the resource: Return false
        if (player.resources[mat[0]].amount < mat[1] || player.resources[mat[0]].amount === 0) {
            return false;
        }
    }

    // Get the resource
    let playerResource = player.resources[name];

    // If there is a limit to that resource
    if (playerResource.limit || playerResource.limit === 0) {
        // If crafting the resource makes you exceed that limit: Return false
        if (playerResource.amount + amount > playerResource.limit) {
            return false;
        }
    }

    // If everything else checks out: Return true
    return true;
}

// Screen update
function screenUpdate(diff) {
    // Get the time of the last screen update
    player.lastScreenUpdate = Date.now();

    // If you are currently switching area: Set up game
    if (player.switchArea) {
        setupGame();
    }

    // Get the current area
    let area = player[player.areaList[player.currentArea]];

    // For every grind
    for (let i = 0; i < leftTopDivEl.children.length; i++) {
        // Define variables
        let grind = leftTopDivEl.children[i];
        let playerGrind = area.grinds[i];

        let grindCurrent = playerGrind.current;

        // If there are no grinds right now, find a new one
        if (grindCurrent === "") {
            // Create lists
            let totalProbability = 0;
            let resourceList = [];
            let probabilityList = [];
            let amountList = [];
            let imageList = [];
            let idList = [];

            playerGrind.currentGrindTime = 0;

            // For every grind resource
            for (let j = 0; j < playerGrind.resources.length; j++) {
                let resource = playerGrind.resources[j];

                // For every tool in that resource
                for (let tool of resource.time) {
                    // If you have the tool ...
                    if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                        // Add the tool to the lists and break
                        totalProbability += resource.probability;
                        resourceList.push(resource.id);
                        probabilityList.push(resource.probability);
                        imageList.push(resource.image);
                        idList.push(j);
                        amountList.push((tool[2]) ? tool[2] : 1);
                        break;
                    }
                }

                // If there are any mults for this resource
                if (resource.mults) {
                    // For every mult
                    for (let mult of resource.mults) {
                        // If you have the mult ...
                        if (mult[0] && mult[2] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                            // Multiply the amount by the mult
                            amountList[j] *= mult[2];
                        }
                    }
                }

                // If the resource doesn't exist: Continue
                if (!player.resources[resource.id]) {
                    continue;
                }

                // Get the resource
                let playerResource = player.resources[resource.id];

                // If the resource has a limit ...
                if (playerResource.limit || playerResource.limit === 0) {
                    // ... and the amount is exceeded while grinding ...
                    if (playerResource.amount + amountList[j] > playerResource.limit) {
                        // ... remove the resource from the list
                        totalProbability -= resource.probability;
                        resourceList.pop();
                        probabilityList.pop();
                        imageList.pop();
                        idList.pop();
                        amountList.pop();
                    }
                }
            }

            // Get a random number
            let randomChoice = Math.random() * totalProbability;
            let randomImage = "";

            // For every resource in the list
            for (let j = 0; j < probabilityList.length; j++) {
                // If the resource is selected ...
                if (randomChoice < probabilityList[j]) {
                    // ... add the resource info to the grind and break
                    playerGrind.current = resourceList[j];
                    playerGrind.resourceID = idList[j];
                    randomImage = imageList[j];
                    playerGrind.grindAmount = amountList[j];
                    break;
                }

                // If the resource is not selected: Subtract the chance from the randomChoice variable
                randomChoice -= probabilityList[j];
            }

            // Get the grind image element
            let grindImage = grind.children[2].children[0].children[0];

            // Add the image to the grind image element
            if (player.resources[randomImage]) {
                grindImage.src = player.resources[randomImage].image;
            } else {
                grindImage.src = randomImage;
            }

            // Check if the auto-grind has been unlocked
            if (playerGrind.auto) {
                // For every resource in the auto-list
                for (let auto of playerGrind.auto) {
                    // If the resource is unlocked ...
                    if (player.resources[auto].amount > 0) {
                        // ... auto-grind the grin and break
                        grindResource(grind, i);
                        break;
                    }
                }
            }
            

        }
        // If there is a grind right now and it has been started, count down the timer
        else {
            // If the grind is clicked
            if (playerGrind.clicked) {
                // Add the time to the progressbar
                playerGrind.currentGrindTime += diff / 1000;
                let progressbarEl = grind.children[2].children[0].children[1].firstElementChild;

                // When the grind is done, give the resource
                if (playerGrind.currentGrindTime > playerGrind.totalGrindTime) {
                    // Get resource info
                    let grindResource = playerGrind.resources[playerGrind.resourceID];

                    // If there are custom resources
                    if (grindResource.customResources) {
                        // If there are any guaranteed custom resources
                        if (grindResource.customResources.guaranteed) {
                            let guaranteedResourceList = grindResource.customResources.guaranteed;

                            // For every guaranteed resource
                            for (let guaranteedResource of guaranteedResourceList) {
                                // Get the amount
                                let amount = guaranteedResource.amount;

                                // If the amount is an array: Choose a random number between that amount
                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                // Add the amount to the resource
                                player.resources[guaranteedResource.name].amount += randomRound(amount * playerGrind.grindAmount);
                            }
                        }

                        // If there are any random resources
                        if (grindResource.customResources.random) {
                            let randomResourceList = grindResource.customResources.random;

                            let rolls = 1;
                            let totalProbability = 0;
                            let resourceList = [];
                            let probabilityList = [];
                            let amountList = [];

                            if (grindResource.customResources.randomRolls !== undefined) {
                                rolls = grindResource.customResources.randomRolls;
                                if (rolls < 0) rolls = 0;
                            }

                            // For every random resource in the list
                            for (let randomResource of randomResourceList) {
                                // Add to the resource list
                                totalProbability += randomResource.probability;
                                resourceList.push(randomResource.name);
                                probabilityList.push(randomResource.probability);
                                amountList.push(randomResource.amount);
                            }
                            
                            // For every roll
                            for (let i = 0; i < rolls; i++) {
                                // Get a random number between 0 and totalProbability
                                let randomChoice = Math.random() * totalProbability;

                                // For every resource
                                for (let j = 0; j < probabilityList.length; j++) {
                                    // If the resource is selected
                                    if (randomChoice < probabilityList[j]) {
                                        // Get the amount
                                        let amount = amountList[j];

                                        // If the amount is an array: Choose a random number between that amount
                                        if (Array.isArray(amount)) {
                                            amount = randomRange(amount[0], amount[1]);
                                        }

                                        // Add the amount to the resource and break
                                        player.resources[resourceList[j]].amount += randomRound(amount * playerGrind.grindAmount);
                                        break;
                                    }

                                    // Change the randomChoice by the probability of the resource
                                    randomChoice -= probabilityList[j];
                                }
                            }
                        }
                    }
                    // If there aren't any custom resources ...
                    else {
                        let resourceName = playerGrind.current;
                    
                        // ... get the current resource
                        if (player.resources[resourceName]) {
                            player.resources[resourceName].amount += randomRound(playerGrind.grindAmount);
                        }
                    }

                    // Reset the grind
                    playerGrind.current = "";
                    playerGrind.clicked = false;
                    playerGrind.currentGrindTime = 0;
                    playerGrind.grindAmount = 0;

                    grind.children[2].children[0].children[1].style.display = "none";
                    grind.children[2].children[0].children[0].src = "images/system/blank.png";

                    grind.children[1].style.display = "none";
                    grind.children[1].src = "images/system/blank.png";

                }
                // If the grind is not done, update the progressbar
                else {
                    progressbarEl.style.width = Math.round(playerGrind.currentGrindTime / playerGrind.totalGrindTime * 100) + "%";
                }
            }
            // If there is a grind right now and it hasn't been started, check if the auto-grind has been unlocked
            else {
                if (playerGrind.auto) {
                    // For every resource in the auto-list
                    for (let auto of playerGrind.auto) {
                        // If you have the resource: auto-grind the resource and break
                        if (player.resources[auto].amount > 0) {
                            grindResource(grind, i);
                            break;
                        }
                    }
                }
            }
        }
    }

    // For every resource
    for (let resourceName in player.resources) {
        let resource = player.resources[resourceName];
        
        // If the resource amount is more than its limit: Change the amount to the limit
        if (resource.limit !== undefined && resource.amount > resource.limit) {
            resource.amount = resource.limit;
        }
    }

    // For every craft
    for (let i = 0; i < rightDivEl.children.length; i++) {
        // Define variables
        let craft = rightDivEl.children[i];
        let craftAmountTextEl = craft.children[1];
        let craftName = craft.getAttribute("data-name");

        // If you have the resource, show the amount
        if (player.resources[craftName].amount) {
            craftAmountTextEl.innerText = (player.resources[craftName].amount > 999999999) ? shortenNumber(player.resources[craftName].amount) : player.resources[craftName].amount;
        } else {
            craftAmountTextEl.innerText = "";
        }

        // Change font size based on the length of the text
        if (craftAmountTextEl.innerText.length > 7) {
            craftAmountTextEl.style.right = "1px";
            craftAmountTextEl.style.fontSize = "10px";
        } else if (craftAmountTextEl.innerText.length > 4) {
            craftAmountTextEl.style.right = "2px";
            craftAmountTextEl.style.fontSize = "12px";
        } else {
            craftAmountTextEl.style.right = "";
            craftAmountTextEl.style.fontSize = "";
        }

        // Get the current craft
        let playerCraft = area.crafts[i];

        // If the craft has an autocraft and you have the resource
        if (playerCraft.autoCraft && player.resources[playerCraft.name].amount > 0 && player.enableAutobuys) {
            // Create a list of all the crafts and reverse it
            let craftList = Object.assign([], area.crafts);
            craftList.reverse();

            // For every resource in the autoCraft
            for (let resource of playerCraft.autoCraft) {
                // If there is no time counter: Create one with value 0
                if (!resource[2]) {
                    resource[2] = 0;
                }

                // Add diff to the time counter
                resource[2] += diff;

                // If the time counter is higher than the requierement time
                if (resource[2] > resource[1]) {
                    // For every craft in the craftList
                    for (let craftCheck of craftList) {
                        // If the name of the craft in the craftList is the same as the name of the resource
                        if (craftCheck.name === resource[0]) {
                            // Repeat for every time the item can be crafted
                            for (let i = 0; i < Math.floor(resource[2] / (resource[1] ? resource[1] : 1)); i++) {
                                // Craft the resource
                                craftResource(craftCheck);
                            }

                            break;
                        }
                    }

                    // Set time counter to 0
                    resource[2] = 0;
                }
            }
        }

        // If you can afford the craft: Change the display
        if (canAfford(area.crafts[i].cost, playerCraft.name, (playerCraft.amount) ? playerCraft.amount : 1) && area.crafts[i].type !== "display") {
            craft.className = "craft-div-afford";
        } else {
            craft.className = "craft-div";
        }
    }

    // If the current area has an update function: Run it
    if (area.update) {
        area.update(diff);
    }

    // For every area in the areaList
    for (let i of player.areaList) {
        let area = player[i];

        // If the area is the current area or it doesn't support unactive grinding: Continue
        if (player.areaList.indexOf(i) === player.currentArea || !area.updateWhileUnactive) {
            continue;
        }

        // Do an unactive grind for that area
        unactiveGrind(area, diff);

        // If the area has an update function: Run it
        if (area.update) {
            area.update(diff);
        }
    }

    // Every 0.5 seconds: Update FPS counter and auto-save game
    if (player.currentTime < 500) {
        player.currentTime += diff;
        player.currentTicks += 1;
    } else {
        let currentFPS = player.currentTicks / (player.currentTime / 1000);
        tpsTextEl.innerText = "FPS: " + Math.round(currentFPS);
        player.currentTime = 0;
        player.currentTicks = 0;

        if (player.autoSave) {
            saveGame();
        }
    }

    // Get wait time and set timeout for next screen update
    let waitTime = 1000 / player.maxFPS - (Date.now() - player.lastScreenUpdate);

    setTimeout(() => {
        screenUpdate(Date.now() - player.lastScreenUpdate);
    }, (waitTime > 0) ? waitTime : 0);
}
// Unactive grind
function unactiveGrind(area, diff) {
    // For every grind in the area
    for (let grind of area.grinds) {
        let grindCurrent = grind.current;

        // If there are no grinds right now, find a new one
        if (grindCurrent === "") {
            // Create lists
            let totalProbability = 0;
            let resourceList = [];
            let probabilityList = [];
            let amountList = [];
            let idList = [];

            grind.currentGrindTime = 0;

            // For every resource in the grind
            for (let j = 0; j < grind.resources.length; j++) {
                let resource = grind.resources[j];

                // For every tool in the resource
                for (let tool of resource.time) {
                    // If you have the tool ...
                    if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                        // ... add it to the lists and break
                        totalProbability += resource.probability;
                        resourceList.push(resource.id);
                        probabilityList.push(resource.probability);
                        idList.push(j);
                        amountList.push((tool[2]) ? tool[2] : 1);
                        break;
                    }
                }

                // If the resource has any mults
                if (resource.mults) {
                    // For every mult
                    for (let mult of resource.mults) {
                        // If you have the mult ...
                        if (mult[0] && mult[2] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                            // Multiply it with the amountlist
                            amountList[j] *= mult[2];
                        }
                    }
                }

                // Get the resource
                let playerResource = player.resources[resource.id];

                // If the resource has a limit ...
                if (playerResource.limit || playerResource.limit === 0) {
                    // ... and the amount exceeds the limit ...
                    if (playerResource.amount + amountList[j] > playerResource.limit) {
                        // ... remove the resource from the list
                        totalProbability -= resource.probability;
                        resourceList.pop();
                        probabilityList.pop();
                        idList.pop();
                        amountList.pop();
                    }
                }
            }

            // Random number to choose resource
            let randomChoice = Math.random() * totalProbability;

            // For every resource in the list
            for (let j = 0; j < probabilityList.length; j++) {
                // If the resource is selected
                if (randomChoice < probabilityList[j]) {
                    // Add the resource stats to the grind and break
                    grind.current = resourceList[j];
                    grind.resourceID = idList[j];
                    grind.grindAmount = amountList[j];
                    break;
                }

                // Change number by the probability of the resource
                randomChoice -= probabilityList[j];
            }

            // Check if the auto-grind has been unlocked
            if (grind.auto) {
                // For every resource in the auto-list
                for (let auto of grind.auto) {
                    // If you have the resource
                    if (player.resources[auto].amount > 0) {
                        // Get grind resource info
                        let resource = grind.resources[grind.resourceID];
                        let totalTime = 0;
                        let toolUsed = "";

                        // For every tool in the resource
                        for (let tool of resource.time) {
                            // If you have the tool
                            if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                                // Select the tool and set the time
                                toolUsed = tool[0];
                                totalTime = tool[1];
                                break;
                            }
                        }

                        // If the resource has any mults
                        if (resource.mults) {
                            // For every mult in the resource
                            for (let mult of resource.mults) {
                                // If you have the mult
                                if (mult[0] && mult[1] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                                    // Divide totalTime by mult
                                    totalTime /= mult[1];
                                }
                            }
                        }

                        // Start grinding the resource and break
                        grind.clicked = true;
                        grind.currentGrindTime = 0;
                        grind.totalGrindTime = totalTime;

                        break;
                    }
                }
            }
            

        }
        // If there is a grind right now and it has been started, count down the timer
        else {
            if (grind.clicked) {
                // Add time to grind
                grind.currentGrindTime += diff / 1000;

                // When the grind is done, give the resource
                if (grind.currentGrindTime > grind.totalGrindTime) {
                    // Get the grind resource info
                    let grindResource = grind.resources[grind.resourceID];

                    // If there are custom resources
                    if (grindResource.customResources) {
                        // If there are any guaranteed resources
                        if (grindResource.customResources.guaranteed) {
                            let guaranteedResourceList = grindResource.customResources.guaranteed;

                            // For every guaranteed resource
                            for (let guaranteedResource of guaranteedResourceList) {
                                // Get the amount
                                let amount = guaranteedResource.amount;

                                // If the amount is an array: Choose a random number between the amount
                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                // Add the resource
                                player.resources[guaranteedResource.name].amount += randomRound(amount * grind.grindAmount);
                            }
                        }

                        // If there are any random resources
                        if (grindResource.customResources.random) {
                            let randomResourceList = grindResource.customResources.random;

                            // create lists
                            let rolls = 1;
                            let totalProbability = 0;
                            let resourceList = [];
                            let probabilityList = [];
                            let amountList = [];

                            if (grindResource.customResources.randomRolls !== undefined) {
                                rolls = grindResource.customResources.randomRolls;
                                if (rolls < 0) rolls = 0;
                            }

                            // For every random resource
                            for (let randomResource of randomResourceList) {
                                // Add to the resource to the lists
                                totalProbability += randomResource.probability;
                                resourceList.push(randomResource.name);
                                probabilityList.push(randomResource.probability);
                                amountList.push(randomResource.amount);
                            }

                            // For every roll
                            for (let i = 0; i < rolls; i++) {
                                // Get a random number between 0 and totalProbability
                                let randomChoice = Math.random() * totalProbability;

                                // For every resource
                                for (let j = 0; j < probabilityList.length; j++) {
                                    // If the resource is selected
                                    if (randomChoice < probabilityList[j]) {
                                        // Get the amount
                                        let amount = amountList[j];

                                        // If the amount is an array: Choose a random number between that amount
                                        if (Array.isArray(amount)) {
                                            amount = randomRange(amount[0], amount[1]);
                                        }

                                        // Add the amount to the resource and break
                                        player.resources[resourceList[j]].amount += randomRound(amount * grindCurrent.grindAmount);
                                        break;
                                    }

                                    // Change the randomChoice by the probability of the resource
                                    randomChoice -= probabilityList[j];
                                }
                            }
                        }
                    }
                    // If there aren't any custom resources
                    else {
                        let resourceName = grind.current;

                        if (player.resources[resourceName]) {
                            player.resources[resourceName].amount += randomRound(grind.grindAmount);
                        }
                    }

                    // Reset the grind
                    grind.current = "";
                    grind.clicked = false;
                    grind.currentGrindTime = 0;
                    grind.grindAmount = 0;
                }
            }
            // If there is a grind right now and it has not been started, check if the auto-grind has been unlocked
            else {
                if (grind.auto && grind.resourceID) {
                    // For every resource in the auto-list
                    for (let auto of grind.auto) {
                        // If you have the resource
                        if (player.resources[auto].amount > 0) {
                            // Get resource info
                            let resource = grind.resources[grind.resourceID];
                            let totalTime = 0;

                            // For every tool in the resource
                            for (let tool of resource.time) {
                                // If you have the tool
                                if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                                    // Select the tool and break
                                    totalTime = tool[1];
                                    break;
                                }
                            }

                            // If the resource has any mults
                            if (resource.mults) {
                                // For every mult in the resource
                                for (let mult of resource.mults) {
                                    // If you have the mult
                                    if (mult[0] && mult[1] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                                        // Divide time by the mult
                                        totalTime /= mult[1];
                                    }
                                }
                            }

                            // Start grinding the grind
                            grind.clicked = true;
                            grind.currentGrindTime = 0;
                            grind.totalGrindTime = totalTime;
                            break;
                        }
                    }
                }
            }
        }
    }
}

// Returns a random integer between min and max
function randomRange(min, max) {
    let randomNumber = Math.floor(Math.random() * (max + 1 - min)) + min;
    return randomRound(randomNumber);
}

// Returns a random float with 2 decimal-digits between min and max
function randomFloat(min, max) {
    let randomNumber = Math.random() * (max - min) + min;
    return Number(randomNumber.toFixed(2));
}

// Randomly round a number up or down
function randomRound(number) {
    // Get rest of number
    numFloor = Math.floor(number);
    let numRest = number - numFloor;

    // If the rest is more than a random number between 0 and 1: Round up
    if (numRest > Math.random()) {
        numFloor++;
    }

    // Return the number
    return numFloor;
}

// Format numbers
function shortenNumber(number) {
    // If the number is more than 1e20: Disable JS default formatting and replace with my own
    if (number >= 1e20) {
        // Turn number to string and get the first digit
        number = number.toString();
        let text = number[0] + ".";

        // Get the second to fourth digit
        for (let i = 2; i < 4; i++) {
            // If the number isn't an "e" or a "+": Add it to the text
            if (number[i] !== "e" && number[i] !== "+") {
                text += number[i];
            }
            // If the number is an "e" or a "+": Break
            else {
                break;
            }
        }

        // If the text hasn't changed: Add two 0s
        if (text === number[0] + ".") {
            text += "00";
        }

        // Get the length of the number and add it after the "e"
        let numLength = number.slice(number.indexOf("e") + 2);
        text += "e" + numLength;

        // Return text
        return text;
    }
    // If the number is less than 1e20: Add my own formatting
    else {
        // Turn number to string and get first digit
        number = number.toString();
        let text = number[0] + ".";

        // Get second to fourth digit and add them to the text
        for (let i = 1; i < 3; i++) {
            text += number[i];
        }

        // Add an "e" and the length of the number
        text += "e" + (number.length - 1);

        // Return text
        return text;
    }
}