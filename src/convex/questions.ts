import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    subject: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.subject && args.difficulty) {
      return await ctx.db
        .query("questions")
        .withIndex("by_subject_and_difficulty", (q) =>
          q.eq("subject", args.subject!).eq("difficulty", args.difficulty!)
        )
        .take(limit);
    }
    if (args.subject) {
      return await ctx.db
        .query("questions")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject!))
        .take(limit);
    }
    return await ctx.db.query("questions").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdInternal = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    bloomsLevel: v.string(),
    gradeLevel: v.string(),
    contentEnglish: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.string()),
    explanation: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("questions", {
      ...args,
      createdBy: identity?.email,
      isValidated: false,
    });
  },
});

export const createMany = mutation({
  args: {
    questions: v.array(v.object({
      subject: v.string(),
      topic: v.string(),
      questionType: v.string(),
      difficulty: v.string(),
      bloomsLevel: v.string(),
      gradeLevel: v.string(),
      contentEnglish: v.string(),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.optional(v.string()),
      explanation: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const q of args.questions) {
      const id = await ctx.db.insert("questions", {
        ...q,
        isValidated: false,
      });
      ids.push(id);
    }
    return { count: ids.length, ids };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allQuestions = await ctx.db.query("questions").take(1000);
    const subjects = new Set(allQuestions.map((q) => q.subject));
    const validated = allQuestions.filter((q) => q.isValidated).length;
    return {
      total: allQuestions.length,
      validated,
      subjects: subjects.size,
      bySubject: Array.from(subjects).map((s) => ({
        subject: s,
        count: allQuestions.filter((q) => q.subject === s).length,
      })),
    };
  },
});

export const seedSampleQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("questions").take(1);
    if (existing.length > 0) return { seeded: false };

    const sampleQuestions = [
      {
        subject: "mathematics",
        topic: "Triangles",
        questionType: "numerical",
        difficulty: "medium",
        bloomsLevel: "apply",
        gradeLevel: "class_10",
        contentEnglish: "Find the area of a triangle with base 12 cm and height 8 cm.",
        correctAnswer: "48 sq cm",
        explanation: "Area = (1/2) × base × height = (1/2) × 12 × 8 = 48 sq cm",
        tags: ["geometry", "area", "triangle"],
        isValidated: true,
      },
      {
        subject: "mathematics",
        topic: "Quadratic Equations",
        questionType: "mcq",
        difficulty: "hard",
        bloomsLevel: "analyze",
        gradeLevel: "class_10",
        contentEnglish: "Which of the following is a root of x² - 5x + 6 = 0?",
        options: ["1", "2", "4", "5"],
        correctAnswer: "2",
        explanation: "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3",
        tags: ["algebra", "quadratic"],
        isValidated: true,
      },
      {
        subject: "physics",
        topic: "Light",
        questionType: "short_answer",
        difficulty: "medium",
        bloomsLevel: "understand",
        gradeLevel: "class_10",
        contentEnglish: "Explain why the sky appears blue using Rayleigh scattering.",
        correctAnswer: "Blue light has shorter wavelength and scatters more than red light",
        explanation: "Rayleigh scattering causes shorter wavelengths (blue) to scatter more in all directions",
        tags: ["optics", "scattering", "atmosphere"],
        isValidated: true,
      },
      {
        subject: "chemistry",
        topic: "Chemical Reactions",
        questionType: "numerical",
        difficulty: "hard",
        bloomsLevel: "apply",
        gradeLevel: "class_10",
        contentEnglish: "Balance the equation: Fe + H₂O → Fe₃O₄ + H₂",
        correctAnswer: "3Fe + 4H₂O → Fe₃O₄ + 4H₂",
        explanation: "Balance Fe: 3 on each side. Balance O: 4 on each side. Balance H: 8 on each side.",
        tags: ["balancing", "redox", "iron"],
        isValidated: true,
      },
      {
        subject: "biology",
        topic: "Photosynthesis",
        questionType: "long_answer",
        difficulty: "medium",
        bloomsLevel: "understand",
        gradeLevel: "class_10",
        contentEnglish: "Explain the process of photosynthesis with a labeled diagram.",
        correctAnswer: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        explanation: "Photosynthesis occurs in chloroplasts using light energy to convert CO₂ and water into glucose",
        tags: ["photosynthesis", "chloroplast", "glucose"],
        isValidated: true,
      },
      {
        subject: "social_science",
        topic: "1857 Revolt",
        questionType: "case_study",
        difficulty: "hard",
        bloomsLevel: "analyze",
        gradeLevel: "class_10",
        contentEnglish: "Analyze the causes of the 1857 revolt using the given sources. What were the immediate and long-term causes?",
        correctAnswer: "Immediate: Greased cartridges, annexation policies. Long-term: Economic exploitation, cultural interference",
        explanation: "The revolt had both immediate triggers and deep-rooted causes related to British colonial policies",
        tags: ["history", "revolt", "colonial"],
        isValidated: true,
      },
      {
        subject: "mathematics",
        topic: "Statistics",
        questionType: "numerical",
        difficulty: "easy",
        bloomsLevel: "remember",
        gradeLevel: "class_9",
        contentEnglish: "If a farmer in Punjab has 5 acres of wheat field and produces 20 quintals per acre, what is the total production?",
        correctAnswer: "100 quintals",
        explanation: "Total = 5 × 20 = 100 quintals",
        tags: ["arithmetic", "multiplication", "agriculture"],
        isValidated: true,
      },
      {
        subject: "humanities",
        topic: "Bhakti Movement",
        questionType: "long_answer",
        difficulty: "hard",
        bloomsLevel: "evaluate",
        gradeLevel: "class_12",
        contentEnglish: "Compare and contrast the Bhakti and Sufi movements in medieval India.",
        correctAnswer: "Both emphasized personal devotion, rejected ritualism, promoted social equality",
        explanation: "Bhakti was Hindu devotional movement; Sufi was Islamic mystical movement; both had similar social reform goals",
        tags: ["medieval", "religion", "social reform"],
        isValidated: true,
      },
    ];

    for (const q of sampleQuestions) {
      await ctx.db.insert("questions", q);
    }
    return { seeded: true, count: sampleQuestions.length };
  },
});

export const bulkSeedQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("questions").take(1);
    if (existing.length > 0) {
      // Count and return
      const all = await ctx.db.query("questions").take(1000);
      return { seeded: false, existing: all.length };
    }

    const questions = [
      // MATHEMATICS - Class 6-12
      { subject: "mathematics", topic: "Number Systems", questionType: "mcq", difficulty: "easy", bloomsLevel: "remember", gradeLevel: "class_6", contentEnglish: "Which of the following is a natural number?", options: ["-1", "0", "1", "1/2"], correctAnswer: "1", explanation: "Natural numbers are positive integers starting from 1.", tags: ["number-systems", "natural-numbers"], isValidated: true },
      { subject: "mathematics", topic: "Fractions", questionType: "numerical", difficulty: "easy", bloomsLevel: "apply", gradeLevel: "class_6", contentEnglish: "What is 3/4 + 1/4?", correctAnswer: "1", explanation: "3/4 + 1/4 = 4/4 = 1", tags: ["fractions", "addition"], isValidated: true },
      { subject: "mathematics", topic: "Decimals", questionType: "numerical", difficulty: "easy", bloomsLevel: "apply", gradeLevel: "class_6", contentEnglish: "Convert 3/5 to a decimal.", correctAnswer: "0.6", explanation: "3 ÷ 5 = 0.6", tags: ["decimals", "fractions"], isValidated: true },
      { subject: "mathematics", topic: "Integers", questionType: "mcq", difficulty: "easy", bloomsLevel: "understand", gradeLevel: "class_7", contentEnglish: "What is (-5) + 8?", options: ["-3", "3", "13", "-13"], correctAnswer: "3", explanation: "(-5) + 8 = 3 (move 8 steps right from -5)", tags: ["integers", "addition"], isValidated: true },
      { subject: "mathematics", topic: "Ratio and Proportion", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_7", contentEnglish: "If 3 pens cost ₹15, what is the cost of 7 pens?", correctAnswer: "₹35", explanation: "Cost per pen = 15/3 = ₹5. Cost of 7 pens = 7 × 5 = ₹35", tags: ["ratio", "proportion", "unitary-method"], isValidated: true },
      { subject: "mathematics", topic: "Algebraic Expressions", questionType: "short_answer", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_7", contentEnglish: "Simplify: 3x + 2y - x + 4y", correctAnswer: "2x + 6y", explanation: "Combine like terms: (3x - x) + (2y + 4y) = 2x + 6y", tags: ["algebra", "simplification"], isValidated: true },
      { subject: "mathematics", topic: "Linear Equations", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_8", contentEnglish: "Solve: 2x + 5 = 13", correctAnswer: "x = 4", explanation: "2x = 13 - 5 = 8, x = 4", tags: ["linear-equations", "algebra"], isValidated: true },
      { subject: "mathematics", topic: "Squares and Square Roots", questionType: "numerical", difficulty: "easy", bloomsLevel: "remember", gradeLevel: "class_8", contentEnglish: "Find the square root of 144.", correctAnswer: "12", explanation: "12 × 12 = 144, so √144 = 12", tags: ["square-roots", "arithmetic"], isValidated: true },
      { subject: "mathematics", topic: "Mensuration", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_8", contentEnglish: "Find the area of a rectangle with length 15 cm and breadth 8 cm.", correctAnswer: "120 sq cm", explanation: "Area = length × breadth = 15 × 8 = 120 sq cm", tags: ["mensuration", "rectangle", "area"], isValidated: true },
      { subject: "mathematics", topic: "Polynomials", questionType: "mcq", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What is the degree of the polynomial 3x³ + 2x² - x + 5?", options: ["1", "2", "3", "5"], correctAnswer: "3", explanation: "The degree is the highest power of the variable, which is 3.", tags: ["polynomials", "degree"], isValidated: true },
      { subject: "mathematics", topic: "Coordinate Geometry", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "In which quadrant does the point (-3, 4) lie?", correctAnswer: "Second quadrant (II)", explanation: "Negative x and positive y means second quadrant.", tags: ["coordinate-geometry", "quadrants"], isValidated: true },
      { subject: "mathematics", topic: "Triangles", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "Find the area of a triangle with base 12 cm and height 8 cm.", correctAnswer: "48 sq cm", explanation: "Area = (1/2) × base × height = (1/2) × 12 × 8 = 48 sq cm", tags: ["geometry", "area", "triangle"], isValidated: true },
      { subject: "mathematics", topic: "Quadratic Equations", questionType: "mcq", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_10", contentEnglish: "Which of the following is a root of x² - 5x + 6 = 0?", options: ["1", "2", "4", "5"], correctAnswer: "2", explanation: "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3", tags: ["algebra", "quadratic"], isValidated: true },
      { subject: "mathematics", topic: "Arithmetic Progressions", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "Find the 10th term of the AP: 2, 5, 8, 11, ...", correctAnswer: "29", explanation: "a = 2, d = 3. a₁₀ = 2 + (10-1)×3 = 2 + 27 = 29", tags: ["AP", "sequences"], isValidated: true },
      { subject: "mathematics", topic: "Trigonometry", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "Find the value of sin 30° + cos 60°.", correctAnswer: "1", explanation: "sin 30° = 1/2, cos 60° = 1/2. Sum = 1/2 + 1/2 = 1", tags: ["trigonometry", "standard-angles"], isValidated: true },
      { subject: "mathematics", topic: "Statistics", questionType: "numerical", difficulty: "easy", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "Find the mean of: 5, 10, 15, 20, 25.", correctAnswer: "15", explanation: "Mean = (5+10+15+20+25)/5 = 75/5 = 15", tags: ["statistics", "mean"], isValidated: true },
      { subject: "mathematics", topic: "Probability", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "A bag has 3 red and 5 blue balls. What is the probability of drawing a red ball?", correctAnswer: "3/8", explanation: "P(red) = 3/(3+5) = 3/8", tags: ["probability", "basic"], isValidated: true },
      { subject: "mathematics", topic: "Sets", questionType: "short_answer", difficulty: "easy", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "Write the set of even natural numbers less than 10 in roster form.", correctAnswer: "{2, 4, 6, 8}", explanation: "Even natural numbers less than 10 are 2, 4, 6, 8.", tags: ["sets", "roster-form"], isValidated: true },
      { subject: "mathematics", topic: "Permutations and Combinations", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "In how many ways can 5 students be arranged in a row?", correctAnswer: "120", explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120", tags: ["permutations", "factorial"], isValidated: true },
      { subject: "mathematics", topic: "Binomial Theorem", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "Find the expansion of (1+x)³.", correctAnswer: "1 + 3x + 3x² + x³", explanation: "Using binomial theorem: C(3,0) + C(3,1)x + C(3,2)x² + C(3,3)x³", tags: ["binomial-theorem", "expansion"], isValidated: true },
      { subject: "mathematics", topic: "Limits", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "Find lim(x→2) of (x² - 4)/(x - 2).", correctAnswer: "4", explanation: "(x²-4)/(x-2) = (x+2)(x-2)/(x-2) = x+2. At x=2: 2+2=4", tags: ["limits", "calculus"], isValidated: true },
      { subject: "mathematics", topic: "Derivatives", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_12", contentEnglish: "Find dy/dx if y = x³ + 2x² - 5x + 3.", correctAnswer: "3x² + 4x - 5", explanation: "Differentiate term by term: d/dx(x³) + d/dx(2x²) - d/dx(5x) + d/dx(3) = 3x² + 4x - 5", tags: ["derivatives", "calculus"], isValidated: true },
      { subject: "mathematics", topic: "Integrals", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_12", contentEnglish: "Evaluate ∫(2x + 3)dx.", correctAnswer: "x² + 3x + C", explanation: "∫2x dx + ∫3 dx = x² + 3x + C", tags: ["integrals", "calculus"], isValidated: true },
      { subject: "mathematics", topic: "Matrices", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is the order of a matrix with 3 rows and 4 columns?", correctAnswer: "3 × 4", explanation: "Order = rows × columns = 3 × 4", tags: ["matrices", "order"], isValidated: true },
      { subject: "mathematics", topic: "Probability", questionType: "numerical", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_12", contentEnglish: "Two dice are thrown. Find the probability that the sum is 7.", correctAnswer: "1/6", explanation: "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6", tags: ["probability", "dice"], isValidated: true },

      // PHYSICS - Class 9-12
      { subject: "physics", topic: "Motion", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_9", contentEnglish: "A car travels 120 km in 2 hours. What is its average speed?", correctAnswer: "60 km/h", explanation: "Speed = Distance/Time = 120/2 = 60 km/h", tags: ["motion", "speed"], isValidated: true },
      { subject: "physics", topic: "Force and Laws of Motion", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "State Newton's First Law of Motion.", correctAnswer: "An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.", explanation: "This is the law of inertia.", tags: ["newton-laws", "inertia"], isValidated: true },
      { subject: "physics", topic: "Gravitation", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_9", contentEnglish: "What is the weight of a 5 kg object on Earth? (g = 10 m/s²)", correctAnswer: "50 N", explanation: "Weight = mass × g = 5 × 10 = 50 N", tags: ["gravitation", "weight"], isValidated: true },
      { subject: "physics", topic: "Work and Energy", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_9", contentEnglish: "Calculate the work done when a force of 20 N moves an object 5 m in the direction of force.", correctAnswer: "100 J", explanation: "Work = Force × Distance = 20 × 5 = 100 J", tags: ["work", "energy"], isValidated: true },
      { subject: "physics", topic: "Sound", questionType: "short_answer", difficulty: "easy", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What is the speed of sound in air at room temperature?", correctAnswer: "343 m/s (approximately 340 m/s)", explanation: "Sound travels at approximately 343 m/s in air at 20°C.", tags: ["sound", "speed"], isValidated: true },
      { subject: "physics", topic: "Light", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "Explain why the sky appears blue using Rayleigh scattering.", correctAnswer: "Blue light has shorter wavelength and scatters more than red light", explanation: "Rayleigh scattering causes shorter wavelengths (blue) to scatter more in all directions", tags: ["optics", "scattering", "atmosphere"], isValidated: true },
      { subject: "physics", topic: "Electricity", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "A resistor of 10 Ω is connected to a 5 V battery. Find the current.", correctAnswer: "0.5 A", explanation: "I = V/R = 5/10 = 0.5 A (Ohm's Law)", tags: ["electricity", "ohms-law"], isValidated: true },
      { subject: "physics", topic: "Magnetic Effects of Current", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "State Fleming's Left Hand Rule.", correctAnswer: "If the thumb, index finger, and middle finger of the left hand are stretched mutually perpendicular, the thumb gives direction of force, index finger gives direction of magnetic field, and middle finger gives direction of current.", explanation: "Used to find direction of force on a current-carrying conductor in a magnetic field.", tags: ["magnetism", "flemings-rule"], isValidated: true },
      { subject: "physics", topic: "Kinematics", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "A ball is thrown vertically upward with velocity 20 m/s. Find the maximum height. (g = 10 m/s²)", correctAnswer: "20 m", explanation: "v² = u² - 2gh. At max height v=0. h = u²/2g = 400/20 = 20 m", tags: ["kinematics", "projectile"], isValidated: true },
      { subject: "physics", topic: "Laws of Motion", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "A 2 kg object accelerates at 5 m/s². Find the net force.", correctAnswer: "10 N", explanation: "F = ma = 2 × 5 = 10 N", tags: ["newton-laws", "force"], isValidated: true },
      { subject: "physics", topic: "Work, Energy and Power", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "A machine does 500 J of work in 10 seconds. Find its power.", correctAnswer: "50 W", explanation: "Power = Work/Time = 500/10 = 50 W", tags: ["power", "energy"], isValidated: true },
      { subject: "physics", topic: "Thermodynamics", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "State the First Law of Thermodynamics.", correctAnswer: "Energy can neither be created nor destroyed; it can only be converted from one form to another. ΔU = Q - W", explanation: "This is the law of conservation of energy applied to thermodynamic systems.", tags: ["thermodynamics", "first-law"], isValidated: true },
      { subject: "physics", topic: "Waves", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_11", contentEnglish: "A wave has frequency 50 Hz and wavelength 2 m. Find its speed.", correctAnswer: "100 m/s", explanation: "v = fλ = 50 × 2 = 100 m/s", tags: ["waves", "frequency", "wavelength"], isValidated: true },
      { subject: "physics", topic: "Electrostatics", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_12", contentEnglish: "Two charges of 2 μC and 3 μC are 1 m apart. Find the force between them. (k = 9×10⁹ N·m²/C²)", correctAnswer: "0.054 N", explanation: "F = kq₁q₂/r² = 9×10⁹ × 2×10⁻⁶ × 3×10⁻⁶ / 1² = 0.054 N", tags: ["electrostatics", "coulombs-law"], isValidated: true },
      { subject: "physics", topic: "Current Electricity", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_12", contentEnglish: "Three resistors of 2Ω, 3Ω, and 6Ω are connected in parallel. Find the equivalent resistance.", correctAnswer: "1 Ω", explanation: "1/R = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. R = 1 Ω", tags: ["resistance", "parallel"], isValidated: true },
      { subject: "physics", topic: "Electromagnetic Induction", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "State Faraday's Law of Electromagnetic Induction.", correctAnswer: "The induced EMF in a circuit is equal to the negative rate of change of magnetic flux through the circuit. EMF = -dΦ/dt", explanation: "This is the fundamental law of electromagnetic induction.", tags: ["electromagnetic-induction", "faraday"], isValidated: true },
      { subject: "physics", topic: "Optics", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_12", contentEnglish: "A convex lens has focal length 20 cm. An object is placed 30 cm from it. Find the image distance.", correctAnswer: "60 cm", explanation: "1/v - 1/u = 1/f. 1/v = 1/20 + 1/(-30) = 3/60 - 2/60 = 1/60. v = 60 cm", tags: ["optics", "lens-formula"], isValidated: true },
      { subject: "physics", topic: "Dual Nature of Matter", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is the de Broglie wavelength of an electron moving with velocity v?", correctAnswer: "λ = h/mv, where h is Planck's constant and m is the mass of electron", explanation: "de Broglie proposed that matter has wave-like properties.", tags: ["quantum-physics", "de-broglie"], isValidated: true },
      { subject: "physics", topic: "Atoms and Nuclei", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is radioactive decay? Name the three types.", correctAnswer: "Spontaneous disintegration of unstable nuclei. Types: Alpha (α), Beta (β), and Gamma (γ) decay.", explanation: "Radioactive decay releases energy and transforms one element into another.", tags: ["radioactivity", "nuclear-physics"], isValidated: true },

      // CHEMISTRY - Class 9-12
      { subject: "chemistry", topic: "Matter", questionType: "mcq", difficulty: "easy", bloomsLevel: "remember", gradeLevel: "class_9", contentEnglish: "Which of the following is a pure substance?", options: ["Air", "Sea water", "Gold", "Milk"], correctAnswer: "Gold", explanation: "Gold is a pure substance (element). Air, sea water, and milk are mixtures.", tags: ["matter", "pure-substance"], isValidated: true },
      { subject: "chemistry", topic: "Atoms and Molecules", questionType: "numerical", difficulty: "medium", bloomsLevel: "apply", gradeLevel: "class_9", contentEnglish: "Find the molecular mass of water (H₂O). (H=1, O=16)", correctAnswer: "18 u", explanation: "Molecular mass = 2(1) + 16 = 18 u", tags: ["molecular-mass", "water"], isValidated: true },
      { subject: "chemistry", topic: "Structure of Atom", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What are isotopes? Give an example.", correctAnswer: "Isotopes are atoms of the same element with the same atomic number but different mass numbers. Example: Carbon-12 and Carbon-14.", explanation: "Isotopes have the same number of protons but different numbers of neutrons.", tags: ["isotopes", "atomic-structure"], isValidated: true },
      { subject: "chemistry", topic: "Chemical Reactions", questionType: "numerical", difficulty: "hard", bloomsLevel: "apply", gradeLevel: "class_10", contentEnglish: "Balance the equation: Fe + H₂O → Fe₃O₄ + H₂", correctAnswer: "3Fe + 4H₂O → Fe₃O₄ + 4H₂", explanation: "Balance Fe: 3 on each side. Balance O: 4 on each side. Balance H: 8 on each side.", tags: ["balancing", "redox", "iron"], isValidated: true },
      { subject: "chemistry", topic: "Acids, Bases and Salts", questionType: "mcq", difficulty: "easy", bloomsLevel: "remember", gradeLevel: "class_10", contentEnglish: "What is the pH of a neutral solution?", options: ["0", "7", "14", "1"], correctAnswer: "7", explanation: "A neutral solution has pH = 7. Acids have pH < 7, bases have pH > 7.", tags: ["pH", "acids-bases"], isValidated: true },
      { subject: "chemistry", topic: "Metals and Non-metals", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "Why is sodium stored in kerosene?", correctAnswer: "Sodium is highly reactive and reacts vigorously with water and oxygen in air. Kerosene prevents contact with air and moisture.", explanation: "Sodium reacts with water to form NaOH and hydrogen gas, which can ignite.", tags: ["metals", "sodium", "reactivity"], isValidated: true },
      { subject: "chemistry", topic: "Carbon Compounds", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "What is the difference between saturated and unsaturated hydrocarbons?", correctAnswer: "Saturated hydrocarbons have only single bonds (alkanes). Unsaturated hydrocarbons have double or triple bonds (alkenes, alkynes).", explanation: "Unsaturated compounds can undergo addition reactions.", tags: ["carbon-compounds", "hydrocarbons"], isValidated: true },
      { subject: "chemistry", topic: "Periodic Table", questionType: "mcq", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "Elements in the same group of the periodic table have the same:", options: ["Atomic mass", "Number of neutrons", "Number of valence electrons", "Atomic number"], correctAnswer: "Number of valence electrons", explanation: "Elements in the same group have the same number of valence electrons, giving them similar chemical properties.", tags: ["periodic-table", "groups"], isValidated: true },
      { subject: "chemistry", topic: "Chemical Bonding", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_11", contentEnglish: "Explain why NaCl is an ionic compound while HCl is a covalent compound.", correctAnswer: "NaCl forms by transfer of electrons from Na to Cl (ionic bond). HCl forms by sharing of electrons between H and Cl (covalent bond). The difference in electronegativity determines the bond type.", explanation: "Large electronegativity difference leads to ionic bonds; small difference leads to covalent bonds.", tags: ["chemical-bonding", "ionic", "covalent"], isValidated: true },
      { subject: "chemistry", topic: "States of Matter", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "State Boyle's Law.", correctAnswer: "At constant temperature, the pressure of a fixed amount of gas is inversely proportional to its volume. PV = constant", explanation: "As pressure increases, volume decreases proportionally at constant temperature.", tags: ["gas-laws", "boyles-law"], isValidated: true },
      { subject: "chemistry", topic: "Thermodynamics", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What is Hess's Law?", correctAnswer: "The total enthalpy change for a reaction is the same regardless of the path taken, as long as the initial and final states are the same.", explanation: "Hess's Law is a consequence of the law of conservation of energy.", tags: ["thermodynamics", "hess-law"], isValidated: true },
      { subject: "chemistry", topic: "Equilibrium", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_11", contentEnglish: "State Le Chatelier's Principle.", correctAnswer: "If a system at equilibrium is subjected to a change in concentration, temperature, or pressure, the equilibrium shifts in the direction that tends to counteract the change.", explanation: "This principle predicts how equilibrium responds to external changes.", tags: ["equilibrium", "le-chatelier"], isValidated: true },
      { subject: "chemistry", topic: "Electrochemistry", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is the difference between electrolytic and galvanic cells?", correctAnswer: "Galvanic cells convert chemical energy to electrical energy (spontaneous). Electrolytic cells use electrical energy to drive non-spontaneous chemical reactions.", explanation: "Batteries are galvanic cells; electrolysis uses electrolytic cells.", tags: ["electrochemistry", "cells"], isValidated: true },
      { subject: "chemistry", topic: "Coordination Compounds", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is a ligand? Give two examples.", correctAnswer: "A ligand is an ion or molecule that donates a pair of electrons to the central metal atom/ion. Examples: NH₃ (ammonia), Cl⁻ (chloride ion).", explanation: "Ligands form coordinate bonds with the central metal in coordination compounds.", tags: ["coordination-compounds", "ligands"], isValidated: true },
      { subject: "chemistry", topic: "Polymers", questionType: "mcq", difficulty: "medium", bloomsLevel: "remember", gradeLevel: "class_12", contentEnglish: "Which of the following is a natural polymer?", options: ["Nylon", "Polythene", "Starch", "PVC"], correctAnswer: "Starch", explanation: "Starch is a natural polymer of glucose. Nylon, polythene, and PVC are synthetic polymers.", tags: ["polymers", "natural-synthetic"], isValidated: true },

      // BIOLOGY - Class 9-12
      { subject: "biology", topic: "Cell", questionType: "mcq", difficulty: "easy", bloomsLevel: "remember", gradeLevel: "class_9", contentEnglish: "Which organelle is called the 'powerhouse of the cell'?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctAnswer: "Mitochondria", explanation: "Mitochondria produce ATP through cellular respiration, providing energy for the cell.", tags: ["cell", "organelles", "mitochondria"], isValidated: true },
      { subject: "biology", topic: "Tissues", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What is the difference between meristematic and permanent tissue in plants?", correctAnswer: "Meristematic tissue has actively dividing cells and is found at growing tips. Permanent tissue has differentiated cells that have lost the ability to divide.", explanation: "Meristematic tissue is responsible for plant growth.", tags: ["tissues", "plant-biology"], isValidated: true },
      { subject: "biology", topic: "Diversity in Living Organisms", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What is the basis of classification of organisms?", correctAnswer: "Organisms are classified based on similarities and differences in their characteristics including cell structure, mode of nutrition, body organization, and evolutionary relationships.", explanation: "Taxonomy uses a hierarchical system: Kingdom, Phylum, Class, Order, Family, Genus, Species.", tags: ["classification", "taxonomy"], isValidated: true },
      { subject: "biology", topic: "Photosynthesis", questionType: "long_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "Explain the process of photosynthesis with a labeled diagram.", correctAnswer: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂", explanation: "Photosynthesis occurs in chloroplasts using light energy to convert CO₂ and water into glucose", tags: ["photosynthesis", "chloroplast", "glucose"], isValidated: true },
      { subject: "biology", topic: "Life Processes", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "What is the role of the diaphragm in breathing?", correctAnswer: "The diaphragm is a dome-shaped muscle below the lungs. When it contracts, it flattens and increases lung volume, causing inhalation. When it relaxes, it returns to dome shape, decreasing lung volume, causing exhalation.", explanation: "The diaphragm is the primary muscle of respiration.", tags: ["respiration", "diaphragm"], isValidated: true },
      { subject: "biology", topic: "Control and Coordination", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_10", contentEnglish: "Compare the nervous system and endocrine system in terms of speed and duration of response.", correctAnswer: "Nervous system: fast response (milliseconds), short duration. Endocrine system: slow response (seconds to hours), long duration. Nervous system uses electrical signals; endocrine uses chemical hormones.", explanation: "Both systems coordinate body functions but through different mechanisms.", tags: ["nervous-system", "endocrine-system"], isValidated: true },
      { subject: "biology", topic: "Heredity and Evolution", questionType: "mcq", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "In Mendel's experiment, when tall (TT) plants were crossed with dwarf (tt) plants, the F1 generation was:", options: ["All tall", "All dwarf", "Half tall, half dwarf", "3 tall : 1 dwarf"], correctAnswer: "All tall", explanation: "Tall (T) is dominant over dwarf (t). F1 = Tt, which shows tall phenotype.", tags: ["genetics", "mendel", "dominance"], isValidated: true },
      { subject: "biology", topic: "Cell Division", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_11", contentEnglish: "What is the significance of meiosis in sexual reproduction?", correctAnswer: "Meiosis reduces the chromosome number by half (from diploid to haploid), ensuring that when gametes fuse during fertilization, the original chromosome number is restored. It also creates genetic variation through crossing over.", explanation: "Without meiosis, chromosome number would double with each generation.", tags: ["meiosis", "cell-division", "genetics"], isValidated: true },
      { subject: "biology", topic: "Biomolecules", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What are enzymes and how do they work?", correctAnswer: "Enzymes are biological catalysts (proteins) that speed up chemical reactions without being consumed. They work by lowering the activation energy of reactions. Each enzyme has an active site that binds to specific substrates (lock and key model).", explanation: "Enzymes are essential for all metabolic processes.", tags: ["enzymes", "biomolecules", "catalysis"], isValidated: true },
      { subject: "biology", topic: "Genetics", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_12", contentEnglish: "Explain the Central Dogma of Molecular Biology.", correctAnswer: "DNA → RNA → Protein. DNA is transcribed into mRNA, which is then translated into proteins. This is the flow of genetic information in cells.", explanation: "The Central Dogma describes how genetic information flows from DNA to functional proteins.", tags: ["central-dogma", "genetics", "molecular-biology"], isValidated: true },
      { subject: "biology", topic: "Evolution", questionType: "short_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_12", contentEnglish: "What is natural selection? How does it lead to evolution?", correctAnswer: "Natural selection is the process where organisms with favorable traits survive and reproduce more successfully. Over generations, favorable traits become more common in the population, leading to evolutionary change.", explanation: "Darwin's theory of natural selection is the mechanism of evolution.", tags: ["evolution", "natural-selection", "darwin"], isValidated: true },
      { subject: "biology", topic: "Biotechnology", questionType: "short_answer", difficulty: "hard", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is recombinant DNA technology?", correctAnswer: "Recombinant DNA technology involves combining DNA from different sources to create new genetic combinations. It uses restriction enzymes to cut DNA and ligases to join fragments, creating recombinant DNA that can be inserted into host organisms.", explanation: "This technology is used to produce insulin, vaccines, and genetically modified organisms.", tags: ["biotechnology", "recombinant-DNA"], isValidated: true },
      { subject: "biology", topic: "Ecology", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_12", contentEnglish: "What is a food chain? Give an example from an Indian ecosystem.", correctAnswer: "A food chain shows the transfer of energy from one organism to another. Example: Grass → Grasshopper → Frog → Snake → Eagle (in Indian grasslands)", explanation: "Energy flows from producers to consumers in a food chain.", tags: ["ecology", "food-chain", "ecosystem"], isValidated: true },

      // SOCIAL SCIENCE - Class 9-12
      { subject: "social_science", topic: "French Revolution", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "What were the main causes of the French Revolution?", correctAnswer: "Main causes: 1) Social inequality (three estates system), 2) Financial crisis of the French state, 3) Enlightenment ideas about liberty and equality, 4) Food shortages and high bread prices, 5) Weak leadership of Louis XVI.", explanation: "The French Revolution (1789) transformed France from a monarchy to a republic.", tags: ["french-revolution", "causes"], isValidated: true },
      { subject: "social_science", topic: "Socialism in Europe", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_9", contentEnglish: "How did the Russian Revolution of 1917 change the world?", correctAnswer: "The Russian Revolution established the world's first communist state, inspired socialist movements globally, led to the Cold War, and challenged capitalist systems. It showed that workers could overthrow existing governments.", explanation: "The Bolshevik Revolution under Lenin transformed Russia into the Soviet Union.", tags: ["russian-revolution", "socialism"], isValidated: true },
      { subject: "social_science", topic: "Nazism and Hitler", questionType: "short_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_9", contentEnglish: "How did the economic crisis of 1929 help Hitler rise to power?", correctAnswer: "The Great Depression caused massive unemployment and poverty in Germany. Hitler exploited this crisis by blaming Jews and communists, promising economic recovery and national glory. Desperate people supported his Nazi party.", explanation: "Economic hardship made people vulnerable to extremist ideologies.", tags: ["nazism", "hitler", "great-depression"], isValidated: true },
      { subject: "social_science", topic: "Forest Society", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_9", contentEnglish: "How did colonial forest laws affect tribal communities in India?", correctAnswer: "Colonial forest laws restricted tribal access to forests for hunting, gathering, and shifting cultivation. Forests were declared 'reserved' for commercial timber. This disrupted tribal livelihoods and led to resistance movements.", explanation: "The Forest Acts of 1865 and 1878 transformed forest governance in India.", tags: ["forest-society", "colonial-india", "tribals"], isValidated: true },
      { subject: "social_science", topic: "1857 Revolt", questionType: "case_study", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_10", contentEnglish: "Analyze the causes of the 1857 revolt using the given sources. What were the immediate and long-term causes?", correctAnswer: "Immediate: Greased cartridges, annexation policies. Long-term: Economic exploitation, cultural interference", explanation: "The revolt had both immediate triggers and deep-rooted causes related to British colonial policies", tags: ["history", "revolt", "colonial"], isValidated: true },
      { subject: "social_science", topic: "Nationalism in India", questionType: "long_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_10", contentEnglish: "Evaluate the role of Mahatma Gandhi in India's independence movement.", correctAnswer: "Gandhi transformed the independence movement into a mass movement through non-violent civil disobedience. Key contributions: Non-Cooperation Movement (1920), Civil Disobedience Movement (1930), Quit India Movement (1942). He united diverse groups and gave moral authority to the struggle.", explanation: "Gandhi's methods of satyagraha and ahimsa became globally influential.", tags: ["gandhi", "independence", "nationalism"], isValidated: true },
      { subject: "social_science", topic: "Democracy", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "What are the essential features of democracy?", correctAnswer: "Essential features: 1) Free and fair elections, 2) Universal adult franchise, 3) Rule of law, 4) Protection of fundamental rights, 5) Independent judiciary, 6) Accountability of government.", explanation: "Democracy is a system where people choose their representatives.", tags: ["democracy", "features"], isValidated: true },
      { subject: "social_science", topic: "Indian Constitution", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What are Fundamental Rights? Name any three.", correctAnswer: "Fundamental Rights are basic rights guaranteed by the Indian Constitution. Three examples: 1) Right to Equality (Article 14-18), 2) Right to Freedom (Article 19-22), 3) Right against Exploitation (Article 23-24).", explanation: "Fundamental Rights are justiciable and can be enforced through courts.", tags: ["constitution", "fundamental-rights"], isValidated: true },
      { subject: "social_science", topic: "Federalism", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_10", contentEnglish: "How does India's federal structure differ from the USA's federal structure?", correctAnswer: "India has a 'holding together' federation where the Centre is stronger. USA has a 'coming together' federation with stronger states. India has a single citizenship; USA has dual citizenship. India's constitution is more centralized.", explanation: "India's federalism is asymmetric with more power to the Centre.", tags: ["federalism", "india", "usa"], isValidated: true },
      { subject: "social_science", topic: "Development", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "What is the Human Development Index (HDI)? What are its components?", correctAnswer: "HDI is a composite index measuring human development. Components: 1) Life expectancy (health), 2) Education (mean years of schooling and expected years of schooling), 3) Per capita income (standard of living).", explanation: "HDI was developed by UNDP to measure development beyond just income.", tags: ["HDI", "development", "economics"], isValidated: true },
      { subject: "social_science", topic: "Money and Credit", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_10", contentEnglish: "What is the role of the Reserve Bank of India (RBI)?", correctAnswer: "RBI is India's central bank. Roles: 1) Issues currency, 2) Regulates commercial banks, 3) Controls money supply and credit, 4) Manages foreign exchange, 5) Acts as banker to the government.", explanation: "RBI was established in 1935 and nationalized in 1949.", tags: ["RBI", "banking", "monetary-policy"], isValidated: true },
      { subject: "social_science", topic: "Globalisation", questionType: "short_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_10", contentEnglish: "Has globalisation been beneficial for India? Discuss with examples.", correctAnswer: "Mixed impact. Benefits: IT sector growth, FDI inflow, consumer choice, export growth. Negative impacts: Threat to small industries, agricultural distress, cultural homogenization. Example: IT sector created millions of jobs but textile workers faced competition.", explanation: "Globalisation has differential impacts on different sectors and groups.", tags: ["globalisation", "india", "economics"], isValidated: true },

      // HUMANITIES - Class 11-12
      { subject: "humanities", topic: "Bhakti Movement", questionType: "long_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_12", contentEnglish: "Compare and contrast the Bhakti and Sufi movements in medieval India.", correctAnswer: "Both emphasized personal devotion, rejected ritualism, promoted social equality", explanation: "Bhakti was Hindu devotional movement; Sufi was Islamic mystical movement; both had similar social reform goals", tags: ["medieval", "religion", "social reform"], isValidated: true },
      { subject: "humanities", topic: "Indian Philosophy", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_12", contentEnglish: "What are the key differences between Advaita Vedanta and Dvaita Vedanta?", correctAnswer: "Advaita (Adi Shankaracharya): Non-dualism — Brahman and Atman are identical; the world is maya (illusion). Dvaita (Madhvacharya): Dualism — God (Vishnu) and individual souls are eternally distinct.", explanation: "These are two major schools of Vedantic philosophy.", tags: ["philosophy", "vedanta", "advaita"], isValidated: true },
      { subject: "humanities", topic: "Indian Economy", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What were the main features of India's economic planning after independence?", correctAnswer: "Features: 1) Five-Year Plans, 2) Mixed economy (public and private sectors), 3) Import substitution industrialization, 4) Land reforms, 5) Green Revolution for food security, 6) Focus on heavy industries.", explanation: "India adopted a planned economy model under Nehru's leadership.", tags: ["indian-economy", "planning", "five-year-plans"], isValidated: true },
      { subject: "humanities", topic: "Political Science", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What is the difference between a parliamentary and presidential form of government?", correctAnswer: "Parliamentary: Executive is part of legislature; PM is head of government; President is ceremonial head; government accountable to parliament. Presidential: Strict separation of powers; President is both head of state and government; not directly accountable to legislature.", explanation: "India follows parliamentary system; USA follows presidential system.", tags: ["political-science", "parliamentary", "presidential"], isValidated: true },
      { subject: "humanities", topic: "Sociology", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_11", contentEnglish: "How does the caste system affect social mobility in India?", correctAnswer: "The caste system traditionally restricted social mobility by assigning occupations and social status by birth. However, constitutional provisions (reservations, anti-discrimination laws), education, urbanization, and economic development have increased mobility. Yet caste discrimination persists in rural areas and marriage patterns.", explanation: "Caste is a complex social institution with both traditional and modern dimensions.", tags: ["caste", "social-mobility", "sociology"], isValidated: true },
      { subject: "humanities", topic: "Geography", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "Explain the monsoon mechanism in India.", correctAnswer: "Indian monsoon is caused by differential heating of land and sea. In summer, land heats faster than sea, creating low pressure over land. Moist winds from the Indian Ocean blow towards land (SW monsoon, June-September). In winter, land cools faster, creating high pressure, and winds blow from land to sea (NE monsoon).", explanation: "The monsoon is critical for Indian agriculture, providing 75% of annual rainfall.", tags: ["monsoon", "geography", "climate"], isValidated: true },
      { subject: "humanities", topic: "Psychology", questionType: "short_answer", difficulty: "medium", bloomsLevel: "understand", gradeLevel: "class_11", contentEnglish: "What is Maslow's Hierarchy of Needs?", correctAnswer: "Maslow proposed a pyramid of human needs: 1) Physiological (food, water, shelter), 2) Safety (security, stability), 3) Love/Belonging (relationships), 4) Esteem (achievement, recognition), 5) Self-actualization (reaching full potential). Lower needs must be met before higher ones.", explanation: "This theory is widely used in psychology, education, and management.", tags: ["maslow", "motivation", "psychology"], isValidated: true },
      { subject: "humanities", topic: "Economics", questionType: "short_answer", difficulty: "hard", bloomsLevel: "analyze", gradeLevel: "class_12", contentEnglish: "What is the difference between GDP and GNP?", correctAnswer: "GDP (Gross Domestic Product): Total value of goods and services produced within a country's borders in a year. GNP (Gross National Product): GDP + income earned by residents abroad - income earned by foreigners in the country. GNP measures output by a country's nationals.", explanation: "For most countries, GDP and GNP are similar, but they differ for countries with large overseas workers.", tags: ["GDP", "GNP", "economics"], isValidated: true },
      { subject: "humanities", topic: "History", questionType: "long_answer", difficulty: "hard", bloomsLevel: "evaluate", gradeLevel: "class_12", contentEnglish: "Assess the impact of the Green Revolution on Indian agriculture and society.", correctAnswer: "Positive: Increased food production (wheat, rice), food security, reduced imports. Negative: Regional inequality (Punjab, Haryana benefited most), small farmers marginalized, environmental degradation (soil, water), increased use of chemicals, social tensions.", explanation: "The Green Revolution (1960s-70s) transformed Indian agriculture but had mixed social impacts.", tags: ["green-revolution", "agriculture", "india"], isValidated: true },
    ];

    for (const q of questions) {
      await ctx.db.insert("questions", q);
    }
    return { seeded: true, count: questions.length };
  },
});

export const exportAll = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").take(1000);
    return questions;
  },
});