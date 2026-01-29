import { api } from "@/lib/api";

const recipes = [
  {
    name: "Garlic Lemon Chicken Bowl",
    description:
      "Juicy pan-seared chicken with a bright lemon-garlic sauce, served over rice with quick sautéed broccoli.",
    instructions: [
      "Pat chicken dry and season with salt, pepper, and paprika.",
      "Heat olive oil in a skillet over medium-high heat. Sear chicken 4–5 minutes per side until cooked through. Remove to a plate.",
      "Lower heat to medium. Add butter and minced garlic; cook 30 seconds until fragrant.",
      "Add lemon juice and chicken broth; simmer 1–2 minutes to reduce slightly.",
      "Return chicken to skillet and spoon sauce over top. Taste and adjust salt/pepper.",
      "In a separate pan (or same after chicken is done), sauté broccoli with a splash of oil and a pinch of salt until bright green and tender-crisp.",
      "Serve chicken and broccoli over cooked rice. Garnish with parsley if desired.",
    ],
    nutrition: {
      calories: 610,
      protein: 44,
      fats: 18,
      carbs: 68,
    },
    cookingTimes: {
      prep: 10,
      cook: 20,
      total: 30,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1604908177522-402a9b6c5b0a?auto=format&fit=crop&w=1200&q=80",
    inputUrl: "https://example.com/garlic-lemon-chicken-bowl",
    ingredients: [
      {
        name: "Chicken breast",
        description: "Boneless, skinless chicken breast, sliced into cutlets.",
        nutrition: { calories: 165, protein: 31, fats: 4, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "lb",
      },
      {
        name: "Jasmine rice",
        description: "Cooked jasmine rice for serving.",
        nutrition: { calories: 205, protein: 4, fats: 0, carbs: 45 },
        imageUrl:
          "https://images.unsplash.com/photo-1604909052746-3d1f8d7a6f31?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "cup",
      },
      {
        name: "Broccoli florets",
        description: "Fresh broccoli florets, washed and trimmed.",
        nutrition: { calories: 55, protein: 4, fats: 1, carbs: 11 },
        imageUrl:
          "https://images.unsplash.com/photo-1584270354949-1b57d4b3d3c0?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "cups",
      },
      {
        name: "Lemon",
        description: "Fresh lemon for juice.",
        nutrition: { calories: 17, protein: 1, fats: 0, carbs: 5 },
        imageUrl:
          "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "whole",
      },
      {
        name: "Garlic",
        description: "Fresh garlic cloves, minced.",
        nutrition: { calories: 13, protein: 1, fats: 0, carbs: 3 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486363855-1f0c0f2b7c7d?auto=format&fit=crop&w=1200&q=80",
        quantity: 4,
        unit: "cloves",
      },
      {
        name: "Chicken broth",
        description: "Low-sodium chicken broth.",
        nutrition: { calories: 15, protein: 1, fats: 0, carbs: 1 },
        imageUrl:
          "https://images.unsplash.com/photo-1604908554013-3c7d6c1d4f1c?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.25,
        unit: "cup",
      },
      {
        name: "Olive oil",
        description: "Extra virgin olive oil.",
        nutrition: { calories: 119, protein: 0, fats: 14, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Butter",
        description: "Unsalted butter.",
        nutrition: { calories: 102, protein: 0, fats: 12, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1589985270958-95f5572f90e8?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Paprika",
        description: "Smoked paprika (or regular).",
        nutrition: { calories: 6, protein: 0, fats: 0, carbs: 1 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364058-9cb9e9f3d0df?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Parsley",
        description: "Fresh parsley for garnish (optional).",
        nutrition: { calories: 1, protein: 0, fats: 0, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
    ],
  },

  {
    name: "Turkey Taco Lettuce Wraps",
    description:
      "Quick weeknight tacos using seasoned ground turkey, topped with salsa and avocado in crisp lettuce cups.",
    instructions: [
      "Heat oil in a skillet over medium heat. Add onion and cook 2–3 minutes until softened.",
      "Add ground turkey and cook, breaking it up, until no longer pink.",
      "Stir in taco seasoning and water. Simmer 2–3 minutes until thickened.",
      "Spoon turkey into romaine or butter lettuce leaves.",
      "Top with salsa, avocado, and a squeeze of lime. Add cilantro if desired.",
    ],
    nutrition: {
      calories: 430,
      protein: 34,
      fats: 22,
      carbs: 24,
    },
    cookingTimes: {
      prep: 10,
      cook: 15,
      total: 25,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80",
    inputUrl: "https://example.com/turkey-taco-lettuce-wraps",
    ingredients: [
      {
        name: "Ground turkey",
        description: "Lean ground turkey (93/7 preferred).",
        nutrition: { calories: 170, protein: 22, fats: 9, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "lb",
      },
      {
        name: "Taco seasoning",
        description: "Store-bought or homemade taco seasoning.",
        nutrition: { calories: 10, protein: 0, fats: 0, carbs: 2 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Yellow onion",
        description: "Diced yellow onion.",
        nutrition: { calories: 44, protein: 1, fats: 0, carbs: 10 },
        imageUrl:
          "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.5,
        unit: "whole",
      },
      {
        name: "Olive oil",
        description: "Extra virgin olive oil.",
        nutrition: { calories: 119, protein: 0, fats: 14, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Water",
        description: "Used to bloom spices and form sauce.",
        nutrition: { calories: 0, protein: 0, fats: 0, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.25,
        unit: "cup",
      },
      {
        name: "Romaine lettuce",
        description: "Large leaves for taco wraps.",
        nutrition: { calories: 15, protein: 1, fats: 0, carbs: 3 },
        imageUrl:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        quantity: 8,
        unit: "leaves",
      },
      {
        name: "Salsa",
        description: "Your favorite salsa (mild/medium/hot).",
        nutrition: { calories: 20, protein: 1, fats: 0, carbs: 4 },
        imageUrl:
          "https://images.unsplash.com/photo-1604908177042-47c3a4f965b2?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.5,
        unit: "cup",
      },
      {
        name: "Avocado",
        description: "Sliced avocado for topping.",
        nutrition: { calories: 160, protein: 2, fats: 15, carbs: 9 },
        imageUrl:
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "whole",
      },
      {
        name: "Lime",
        description: "Fresh lime for juice.",
        nutrition: { calories: 20, protein: 0, fats: 0, carbs: 7 },
        imageUrl:
          "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "whole",
      },
      {
        name: "Cilantro",
        description: "Fresh cilantro for garnish (optional).",
        nutrition: { calories: 1, protein: 0, fats: 0, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "tbsp",
      },
    ],
  },

  {
    name: "Salmon with Roasted Asparagus",
    description:
      "Oven-roasted salmon with lemon-dill seasoning and crisp-tender asparagus on a single sheet pan.",
    instructions: [
      "Preheat oven to 425°F (220°C). Line a sheet pan with parchment.",
      "Place asparagus on the pan, toss with olive oil, salt, and pepper.",
      "Add salmon fillets to the pan. Brush with olive oil and season with salt, pepper, and dill.",
      "Add lemon slices on top of salmon if desired.",
      "Roast 10–12 minutes (depending on thickness) until salmon flakes easily and asparagus is tender-crisp.",
      "Serve immediately with extra lemon juice.",
    ],
    nutrition: {
      calories: 520,
      protein: 40,
      fats: 34,
      carbs: 12,
    },
    cookingTimes: {
      prep: 8,
      cook: 12,
      total: 20,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
    inputUrl: "https://example.com/salmon-roasted-asparagus",
    ingredients: [
      {
        name: "Salmon fillet",
        description: "Skin-on or skinless salmon fillets.",
        nutrition: { calories: 367, protein: 39, fats: 22, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "fillets",
      },
      {
        name: "Asparagus",
        description: "Fresh asparagus, woody ends trimmed.",
        nutrition: { calories: 27, protein: 3, fats: 0, carbs: 5 },
        imageUrl:
          "https://images.unsplash.com/photo-1584270354949-1b57d4b3d3c0?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "bunch",
      },
      {
        name: "Olive oil",
        description: "Extra virgin olive oil.",
        nutrition: { calories: 119, protein: 0, fats: 14, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Lemon",
        description: "Fresh lemon for slices and juice.",
        nutrition: { calories: 17, protein: 1, fats: 0, carbs: 5 },
        imageUrl:
          "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "whole",
      },
      {
        name: "Dill",
        description: "Dried dill (or fresh chopped dill).",
        nutrition: { calories: 1, protein: 0, fats: 0, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Garlic powder",
        description: "Garlic powder for quick seasoning.",
        nutrition: { calories: 9, protein: 0, fats: 0, carbs: 2 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.5,
        unit: "tsp",
      },
    ],
  },

  {
    name: "One-Pot Beef & Veggie Stir Fry",
    description:
      "Tender beef strips and colorful veggies tossed in a quick soy-ginger sauce. Great over rice or noodles.",
    instructions: [
      "Whisk soy sauce, honey, rice vinegar, and cornstarch in a small bowl; set aside.",
      "Heat oil in a large skillet or wok over high heat.",
      "Add beef and sear 2–3 minutes until browned. Remove to a plate.",
      "Add bell pepper and broccoli; stir fry 3–4 minutes.",
      "Add garlic and ginger; stir 30 seconds.",
      "Return beef to pan, pour in sauce, and toss 1–2 minutes until glossy and thick.",
      "Serve over cooked rice (optional) and top with sesame seeds.",
    ],
    nutrition: {
      calories: 690,
      protein: 42,
      fats: 26,
      carbs: 72,
    },
    cookingTimes: {
      prep: 12,
      cook: 18,
      total: 30,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1604909052746-3d1f8d7a6f31?auto=format&fit=crop&w=1200&q=80",
    inputUrl: "https://example.com/beef-veggie-stir-fry",
    ingredients: [
      {
        name: "Flank steak",
        description: "Thinly sliced flank steak (against the grain).",
        nutrition: { calories: 230, protein: 26, fats: 13, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1603048297172-c92544798d1f?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "lb",
      },
      {
        name: "Broccoli florets",
        description: "Fresh broccoli florets.",
        nutrition: { calories: 55, protein: 4, fats: 1, carbs: 11 },
        imageUrl:
          "https://images.unsplash.com/photo-1584270354949-1b57d4b3d3c0?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "cups",
      },
      {
        name: "Red bell pepper",
        description: "Sliced red bell pepper.",
        nutrition: { calories: 37, protein: 1, fats: 0, carbs: 9 },
        imageUrl:
          "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "whole",
      },
      {
        name: "Garlic",
        description: "Fresh garlic cloves, minced.",
        nutrition: { calories: 13, protein: 1, fats: 0, carbs: 3 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486363855-1f0c0f2b7c7d?auto=format&fit=crop&w=1200&q=80",
        quantity: 3,
        unit: "cloves",
      },
      {
        name: "Fresh ginger",
        description: "Fresh ginger, grated.",
        nutrition: { calories: 5, protein: 0, fats: 0, carbs: 1 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Soy sauce",
        description: "Low-sodium soy sauce.",
        nutrition: { calories: 10, protein: 2, fats: 0, carbs: 1 },
        imageUrl:
          "https://images.unsplash.com/photo-1542444459-db47a7c3f27a?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.25,
        unit: "cup",
      },
      {
        name: "Honey",
        description: "Honey to balance the sauce.",
        nutrition: { calories: 64, protein: 0, fats: 0, carbs: 17 },
        imageUrl:
          "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Rice vinegar",
        description: "Rice vinegar for brightness.",
        nutrition: { calories: 0, protein: 0, fats: 0, carbs: 0 },
        imageUrl:
          "https://images.unsplash.com/photo-1542444459-db47a7c3f27a?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Cornstarch",
        description: "Cornstarch to thicken the sauce.",
        nutrition: { calories: 30, protein: 0, fats: 0, carbs: 7 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 2,
        unit: "tsp",
      },
      {
        name: "Jasmine rice",
        description: "Cooked rice for serving (optional).",
        nutrition: { calories: 205, protein: 4, fats: 0, carbs: 45 },
        imageUrl:
          "https://images.unsplash.com/photo-1604909052746-3d1f8d7a6f31?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "cup",
      },
      {
        name: "Sesame seeds",
        description: "Toasted sesame seeds for garnish (optional).",
        nutrition: { calories: 52, protein: 2, fats: 4, carbs: 2 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
    ],
  },

  {
    name: "Greek Yogurt Berry Parfait",
    description:
      "High-protein breakfast parfait with Greek yogurt, fresh berries, granola, and honey.",
    instructions: [
      "Spoon half the yogurt into a glass or bowl.",
      "Add half the berries and half the granola.",
      "Repeat layers with remaining yogurt, berries, and granola.",
      "Drizzle honey on top and serve immediately.",
    ],
    nutrition: {
      calories: 390,
      protein: 28,
      fats: 9,
      carbs: 52,
    },
    cookingTimes: {
      prep: 5,
      cook: 0,
      total: 5,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80",
    inputUrl: "https://example.com/greek-yogurt-berry-parfait",
    ingredients: [
      {
        name: "Greek yogurt",
        description: "Plain nonfat Greek yogurt.",
        nutrition: { calories: 130, protein: 23, fats: 0, carbs: 9 },
        imageUrl:
          "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "cup",
      },
      {
        name: "Mixed berries",
        description: "Blueberries and strawberries (fresh or thawed).",
        nutrition: { calories: 70, protein: 1, fats: 0, carbs: 17 },
        imageUrl:
          "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "cup",
      },
      {
        name: "Granola",
        description: "Crunchy granola (store-bought).",
        nutrition: { calories: 150, protein: 4, fats: 6, carbs: 22 },
        imageUrl:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
        quantity: 0.5,
        unit: "cup",
      },
      {
        name: "Honey",
        description: "Honey for sweetness.",
        nutrition: { calories: 64, protein: 0, fats: 0, carbs: 17 },
        imageUrl:
          "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Chia seeds",
        description: "Optional add-in for fiber and texture.",
        nutrition: { calories: 58, protein: 2, fats: 4, carbs: 5 },
        imageUrl:
          "https://images.unsplash.com/photo-1615486364066-6d2d2f6b7a8b?auto=format&fit=crop&w=1200&q=80",
        quantity: 1,
        unit: "tbsp",
      },
    ],
  },
];

async function main() {
  recipes.forEach(async (recipeData) => {
    const { ingredients, ...recipe } = recipeData;
    const inserted = await api.recipes.insert(recipe, ingredients);

    console.log("inserted recipe:", inserted?.id ?? inserted);
  });
}

main();
