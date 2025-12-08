// ================== CONSTANTS ===================
const API = {
  INGREDIENT_BY_NAME: "https://www.thecocktaildb.com/api/json/v1/1/search.php?i=",
  INGREDIENT_IMG: "https://www.thecocktaildb.com/images/ingredients/",
  COCTAILS_BY_INGREDIENT: "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=",
  COCTAIL_BY_ID: "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i="
};
const IMAGE_NOT_FOUND = "https://previews.123rf.com/images/asmati/asmati1701/asmati170100126/68986757-no-cocktail-sign-illustration.jpg";

// ================== STATE ===================
let selectedIngredients = [];
let selectedCoctails = [];
let menu = [];
let currentIngredient = {};

// ================== DOM ===================
const input = document.getElementById("ingredientName");
const ingredientsList = document.getElementById("ingredientList");
const coctailsList = document.getElementById("coctailsList");
const menuCoctail = document.getElementById("menuCoctails");

// ================== API ===================
async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

// ================== SEARCH INGREDIENT ===================
input.addEventListener("input", async () => {
  currentIngredient = {};
  let query = input.value.toLowerCase().trim().replaceAll(" ", "_");

  if (!query) return;

  const data = await fetchJSON(API.INGREDIENT_BY_NAME + query);

  if (data.ingredients) {
    currentIngredient = {
      id: data.ingredients[0].idIngredient,
      name: data.ingredients[0].strIngredient
    };
  }
});

// enter => add ingredient
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIngredient();
    input.value = "";
  }
});

// ================== ADD INGREDIENT ===================
function addIngredient() {
  if (!currentIngredient.id) return;

  if (selectedIngredients.find(i => i.id === currentIngredient.id)) {
    return;
  }

  // copy object
  const ingredient = { ...currentIngredient };
  selectedIngredients.push(ingredient);

  const img = document.createElement("img");
  img.classList.add("img-ingredient");
  img.id = ingredient.id;
  img.src = API.INGREDIENT_IMG + ingredient.name.toLowerCase() + "-small.png";

  img.addEventListener("click", () => removeIngredient(ingredient.id));

  ingredientsList.appendChild(img);
  ingredientsList.style.display = "flex";

  currentIngredient = {};
  refreshCoctails();
}

// ================== REMOVE INGREDIENT ===================
function removeIngredient(id) {
  // remove from array
  selectedIngredients = selectedIngredients.filter(x => x.id !== id);

  // remove DOM
  const el = document.getElementById(id);
  if (el) el.remove();

  if (selectedIngredients.length === 0) {
    ingredientsList.style.display = "none";
  }

  // remove cocktails related to removed ingredient
  selectedCoctails = selectedCoctails.filter(c => c.idIngredient !== id);

  refreshCoctails();
  menuGenerator();
}

// ================== REFRESH COCTAILS LIST ===================
async function refreshCoctails() {
  coctailsList.innerHTML = "";

  if (selectedIngredients.length === 0) {
    coctailsList.style.display = "none";
    return;
  }

  coctailsList.style.display = "flex";

  for (const ing of selectedIngredients) {
    const data = await fetchJSON(API.COCTAILS_BY_INGREDIENT + ing.name);

    if (data.drinks && data.drinks !== "no data found") {
      addCoctailsUI(data.drinks, ing.id);
    }
  }
}

// ================== ADD COCTAILS THUMBNAILS ===================
function addCoctailsUI(drinks, ingredientID) {
  drinks.forEach(drink => {
    const img = document.createElement("img");
    img.classList.add("img-ingredient");
    img.src = drink.strDrinkThumb + "/small";
    img.id = drink.idDrink;
    img.alt = drink.strDrink;

    // toggle cocktail
    img.addEventListener("click", () =>
      toggleCocktail(drink, ingredientID, img)
    );

    coctailsList.appendChild(img);
  });
}

// ================== TOGGLE COCKTAIL SELECT ===================
function toggleCocktail(drink, ingredientID, imgEl) {
  const exists = selectedCoctails.find(c => c.id === drink.idDrink);

  if (exists) {
    selectedCoctails = selectedCoctails.filter(c => c.id !== drink.idDrink);
    imgEl.style.background = "white";
  } else {
    selectedCoctails.push({
      id: drink.idDrink,
      name: drink.strDrink,
      image: drink.strDrinkThumb,
      idIngredient: ingredientID
    });
    imgEl.style.background = "red";
  }

  menuGenerator();
}

// ================== MENU GENERATOR ===================
async function menuGenerator() {
  menu = [];
  menuCoctail.innerHTML = "";

  for (const item of selectedCoctails) {
    const data = await fetchJSON(API.COCTAIL_BY_ID + item.id);
    const info = data.drinks[0];

    const cocktail = {
      id: info.idDrink,
      name: info.strDrink,
      src: info.strDrinkThumb,
      alcohol: info.strAlcoholic,
      glass: info.strGlass,
      instruction: info.strInstructions,
      ingredients: []
    };

    for (let i = 1; i <= 15; i++) {
      const ing = info[`strIngredient${i}`];
      const measure = info[`strMeasure${i}`];

      if (!ing) continue;

      cocktail.ingredients.push({
        name: ing,
        measure: measure || ""
      });
    }

    menu.push(cocktail);
  }

  menu.forEach(addMenuUI);
}

// ================== RENDER MENU ===================
function addMenuUI(coctailInfo) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.id = coctailInfo.id;

  const img = document.createElement("img");
  img.classList.add("img-ingredient");
  img.src = coctailInfo.src + "/medium";

  const info = document.createElement("div");
  info.style.marginLeft = "10px";

  info.innerHTML = `
    <h3>${coctailInfo.name}</h3>
    <p>${coctailInfo.alcohol}</p>
    <p>${coctailInfo.glass}</p>
    <p>${coctailInfo.ingredients.map(i => `${i.measure} ${i.name}`).join(", ")}</p>
    <p><b>Instruction:</b> ${coctailInfo.instruction}</p>
  `;

  wrapper.appendChild(img);
  wrapper.appendChild(info);

  menuCoctail.appendChild(wrapper);
}
