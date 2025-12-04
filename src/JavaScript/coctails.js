const LINK_INGREDIENT_BY_NAME = "https://www.thecocktaildb.com/api/json/v1/1/search.php?i="
const LINK_INGREDIENT_IMG = "https://www.thecocktaildb.com/images/ingredients/" //gin-small.png"
const LINK_COCTAILS_BY_INGREDIENT = "https:/www.thecocktaildb.com/api/json/v1/1/filter.php?i="
const LINK_COCTAIL_BY_NAME = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s="
const LINK_COCTAIL_BY_ID = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i="
const IMAGE_NOT_FOUND = "https://previews.123rf.com/images/asmati/asmati1701/asmati170100126/68986757-no-cocktail-sign-illustration.jpg";


async function searchFromApi(link){

   let response = await fetch(link);
    let data = await response.json();
    //console.log(data)
    
    return data; 
}

// Ingredients

const selectedIngredients = []; //list of selected ingredients
let currentIngredient = {};

async function getIngredientByName(ingredientName){

    let ingredientsFromApi = await searchFromApi(LINK_INGREDIENT_BY_NAME+ingredientName)

    return ingredientsFromApi

}


const input = document.getElementById("ingredientName");

input.addEventListener("input", async () => {
     
    const query = input.value.toLowerCase();

    if (query.length === 0) {
        return;
    }

    const response = await getIngredientByName(query)

    if(response.ingredients){
        currentIngredient.name = response.ingredients[0].strIngredient
        currentIngredient.id = response.ingredients[0].idIngredient
    }
    
});

input.addEventListener("keydown", (event) =>{
    if (event.key === "Enter") {
    event.preventDefault();
    addHTMLIngredient();
    input.value=""
  }

});

function addHTMLIngredient(){

    if(!selectedIngredients.find(item => item.id === currentIngredient.id)){

    const list = document.getElementById("ingredientList");

    const ingredientImg = document.createElement("img")
    ingredientImg.classList.add("img-ingredient")
    ingredientImg.id = currentIngredient.id
    ingredientImg.src = LINK_INGREDIENT_IMG + currentIngredient.name + "-small.png" // !!!!!! formatting name

    ingredientImg.addEventListener("click", () =>{
        const idToRemove = ingredientImg.id;


          const index = selectedIngredients.findIndex(item => item.id === idToRemove);
            if (index !== -1) {
                selectedIngredients.splice(index, 1);
            }

            if (selectedIngredients.length === 0){
                   list.style.display = "none"
            }

          const domElement = document.getElementById(idToRemove);
            if (domElement) {
                domElement.remove(); 
            }
    })

    selectedIngredients.push(currentIngredient)
    
    list.appendChild(ingredientImg)
    list.style.flexdirection = "row"; 
    list.style.display = "flex"

   /// console.log(list)
    
    currentIngredient = {}
    }

}

//Coctails
///// the right tool is MutationObserver



async function getCoctailsByIngredients(ingredient){

    let coctailsFromApi = await searchFromApi(LINK_COCTAILS_BY_INGREDIENT+ingredient)

    return coctailsFromApi
}

const output = document.getElementById("coctailsList");

const observer = new MutationObserver(async (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
    
      output.innerHTML = ""
      for(let i = 0; i < selectedIngredients.length; i++){

        let response = await getCoctailsByIngredients(selectedIngredients[i].name)
        addHTMLCoctails(response.drinks)
        //console.log(response.drinks)
      }
    
    }
  }
});

const ingredientsList = document.getElementById("ingredientList")
// Watch for changes in direct children and deeper descendants
observer.observe(ingredientsList, { childList: true, subtree: true });

let selectedCoctails = []
let menu = [] // menu of Coctails
let menuCoctail = document.getElementById("menuCoctails") //section

async function getCoctailById(CoctailID){

     let coctailsFromApi = await searchFromApi(LINK_COCTAIL_BY_ID+CoctailID)

    return coctailsFromApi

}


function addHTMLCoctails(coctails){
    
    for(let i = 0; i < coctails.length; i++){

        const imagContainer = document.createElement("img")
        imagContainer.classList.add("img-ingredient")
        imagContainer.src = coctails[i].strDrinkThumb+"/small"
        imagContainer.id = coctails[i].idDrink
        imagContainer.alt = coctails[i].strDrink

        imagContainer.addEventListener("click", ()=>{

            const idToRemove = imagContainer.id;

          const index = selectedCoctails.findIndex(item => item.id === idToRemove);
            if (index !== -1) {
                //console.log("click MINUS " + coctails[i].strDrink)
                selectedCoctails.splice(index, 1);
                imagContainer.style.background = "white"
            } else {
            //console.log("click PLUS " + coctails[i].strDrink)
                let coctailObject = {}
            coctailObject.name = coctails[i].strDrink
            coctailObject.image = coctails[i].strDrinkThumb
            coctailObject.id = coctails[i].idDrink
            
            imagContainer.style.background = "red"
            selectedCoctails.push(coctailObject)

            }
            
            console.log(selectedCoctails)
            menuGenerator()
           
        })

        output.style.display = "flex"
        output.appendChild(imagContainer)

    }  
}




async function menuGenerator(){
    menuCoctail.innerHTML = ""
    menu.splice(0, menu.length)
    
    for(let i = 0; i < selectedCoctails.length; i++){
      
            let response = await getCoctailById(selectedCoctails[i].id)
            let coctailInfo = response.drinks[0]

            //Object of coctail
            let coctail = {}
            coctail.id = coctailInfo.idDrink //id
            coctail.name = coctailInfo.strDrink // name
            coctail.src = coctailInfo.strDrinkThumb //img
            coctail.alcohol = coctailInfo.strAlcoholic //alcoholc or non
            coctail.glass = coctailInfo.strGlass //glass for coctail
            coctail.instruction = coctailInfo.strInstructions //instruction
            
            coctail.ingredients = []
            for (let i = 1; i <= 15; i++) {
            

              const ingredientKey = `strIngredient${i}`;
              const measureKey = `strMeasure${i}`;

              const ingredient = coctailInfo[ingredientKey];
              const measure = coctailInfo[measureKey];
    

            if (ingredient !== null ){
                let ing = {}
                ing.name = ingredient
                ing.measure = measure
                
                coctail.ingredients.push(ing)
            }
    
    }

    menu.push(coctail)

 
}
    console.log("Menu container")
    console.log(menu)
    for(let i = 0; i < menu.length;i++){
        addHTMLMenu(menu[i])
    }
}


function addHTMLMenu(coctailInfo){
    
    const divCoctail = document.createElement("div")
    ////
    divCoctail.style.display = "flex"
    

    divCoctail.id = coctailInfo.id

    const imgCoctail = document.createElement("img")
    imgCoctail.classList.add("img-ingredient")
    imgCoctail.src = coctailInfo.src + "/medium" //350px x 350px

    

    const divInfoCoctail = document.createElement("div")
    divInfoCoctail.style.marginLeft = "10px"

    const h3NameCoctail = document.createElement("h3")
    h3NameCoctail.textContent = coctailInfo.name
    divInfoCoctail.appendChild(h3NameCoctail)

    const pTypeCoctail = document.createElement("p")
    pTypeCoctail.textContent = coctailInfo.alcohol
    divInfoCoctail.appendChild(pTypeCoctail)

    const pGlassType = document.createElement("p")
    pGlassType.textContent = coctailInfo.glass
    divInfoCoctail.appendChild(pGlassType)

    const pIngredients = document.createElement("p")

    console.log(coctailInfo)
    pIngredients.textContent = ""

    for(let i = 0; i < coctailInfo.ingredients.length; i++){

        if(coctailInfo.ingredients[i].measure !== null){
            pIngredients.textContent += coctailInfo.ingredients[i].measure  
        }
        
        pIngredients.textContent += "\t" + coctailInfo.ingredients[i].name

       if (i < coctailInfo.ingredients.length - 1){
            pIngredients.textContent += ",\t"
        }

    }

    divInfoCoctail.appendChild(pIngredients)

    const pInstruction = document.createElement("p")
    pInstruction.textContent = "Instruction: " + coctailInfo.instruction

    divInfoCoctail.appendChild(pInstruction)

    divCoctail.appendChild(imgCoctail)
    divCoctail.appendChild(divInfoCoctail)

    menuCoctail.appendChild(divCoctail)
}