/*
 * Starter vocabulary: short, picturable words grouped by topic. Each word has
 * an emoji picture and a simple sentence so children can connect the word with
 * its meaning. Words are lowercase, at most 6 letters, and use emoji available
 * on iPadOS 15 and current desktop browsers.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.Vocabulary = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const categories = [
    { id: "animals", name: "Animals", icon: "🐾" },
    { id: "food", name: "Food", icon: "🍎" },
    { id: "things", name: "Things", icon: "🧸" },
    { id: "vehicles", name: "On the go", icon: "🚗" },
    { id: "nature", name: "Nature", icon: "🌳" },
    { id: "body", name: "Body & people", icon: "🙂" },
    { id: "colors", name: "Colors", icon: "🎨" },
    { id: "little", name: "Little words", icon: "💬" },
  ];

  // [word, picture, sentence]
  const lists = {
    animals: [
      ["ant", "🐜", "An ant is a tiny bug."],
      ["ape", "🦍", "The ape is big and strong."],
      ["bat", "🦇", "A bat flies at night."],
      ["bear", "🐻", "The bear likes honey."],
      ["bee", "🐝", "The bee says buzz."],
      ["bird", "🐦", "A bird can fly."],
      ["camel", "🐫", "A camel lives in the desert."],
      ["cat", "🐱", "The cat says meow."],
      ["cow", "🐮", "The cow says moo."],
      ["crab", "🦀", "A crab walks sideways."],
      ["deer", "🦌", "A deer runs fast."],
      ["dog", "🐶", "The dog says woof."],
      ["duck", "🦆", "The duck says quack."],
      ["fish", "🐟", "A fish can swim."],
      ["fox", "🦊", "The fox has a bushy tail."],
      ["frog", "🐸", "The frog can hop."],
      ["goat", "🐐", "The goat eats grass."],
      ["hen", "🐔", "The hen lays eggs."],
      ["horse", "🐴", "I can ride a horse."],
      ["koala", "🐨", "A koala sleeps in a tree."],
      ["lion", "🦁", "The lion says roar."],
      ["llama", "🦙", "A llama has soft wool."],
      ["monkey", "🐵", "The monkey likes bananas."],
      ["mouse", "🐭", "The mouse says squeak."],
      ["owl", "🦉", "The owl says hoot."],
      ["panda", "🐼", "A panda eats bamboo."],
      ["pig", "🐷", "The pig says oink."],
      ["rabbit", "🐰", "The rabbit has long ears."],
      ["seal", "🦭", "A seal swims in the sea."],
      ["shark", "🦈", "A shark has sharp teeth."],
      ["sheep", "🐑", "The sheep says baa."],
      ["snail", "🐌", "A snail is very slow."],
      ["snake", "🐍", "The snake says hiss."],
      ["spider", "🕷️", "A spider has eight legs."],
      ["tiger", "🐯", "A tiger has stripes."],
      ["turtle", "🐢", "A turtle has a shell."],
      ["whale", "🐳", "A whale is very big."],
      ["worm", "🪱", "A worm lives in the dirt."],
      ["zebra", "🦓", "A zebra is black and white."],
    ],
    food: [
      ["apple", "🍎", "I eat a red apple."],
      ["banana", "🍌", "A banana is yellow."],
      ["bread", "🍞", "We make toast with bread."],
      ["cake", "🎂", "Yum, birthday cake!"],
      ["candy", "🍬", "Candy is sweet."],
      ["carrot", "🥕", "A rabbit likes a carrot."],
      ["cheese", "🧀", "A mouse likes cheese."],
      ["cherry", "🍒", "A cherry is small and red."],
      ["cookie", "🍪", "I bake a cookie."],
      ["corn", "🌽", "Corn is yellow."],
      ["donut", "🍩", "A donut has a hole."],
      ["egg", "🥚", "A hen lays an egg."],
      ["grape", "🍇", "Grapes grow on vines."],
      ["honey", "🍯", "Bees make honey."],
      ["jam", "🍓", "Jam is made from fruit."],
      ["lemon", "🍋", "A lemon is sour."],
      ["melon", "🍈", "A melon is juicy."],
      ["milk", "🥛", "I drink a glass of milk."],
      ["nut", "🥜", "A squirrel eats a nut."],
      ["peach", "🍑", "A peach is soft and sweet."],
      ["pear", "🍐", "A pear is green."],
      ["pie", "🥧", "We bake a pie."],
      ["pizza", "🍕", "Pizza is yummy."],
      ["rice", "🍚", "I eat rice in a bowl."],
      ["soup", "🍲", "The soup is hot."],
      ["taco", "🌮", "A taco is crunchy."],
    ],
    things: [
      ["bag", "👜", "I put my toys in a bag."],
      ["ball", "⚽", "I kick the ball."],
      ["bed", "🛏️", "I sleep in my bed."],
      ["bell", "🔔", "The bell goes ding."],
      ["book", "📖", "I read a book."],
      ["box", "📦", "A gift is in the box."],
      ["cap", "🧢", "I wear a cap."],
      ["chair", "🪑", "I sit on a chair."],
      ["clock", "⏰", "A clock tells the time."],
      ["crown", "👑", "A king wears a crown."],
      ["cup", "☕", "A cup holds a drink."],
      ["door", "🚪", "Please shut the door."],
      ["drum", "🥁", "I bang the drum."],
      ["gift", "🎁", "I got a gift!"],
      ["hat", "🎩", "I wear a hat."],
      ["key", "🔑", "A key opens the door."],
      ["kite", "🪁", "My kite flies high."],
      ["map", "🗺️", "A map shows the way."],
      ["pen", "🖊️", "I write with a pen."],
      ["ring", "💍", "A ring goes on a finger."],
      ["robot", "🤖", "The robot can talk."],
      ["shoe", "👟", "I tie my shoe."],
      ["sock", "🧦", "I wear a sock on my foot."],
      ["teddy", "🧸", "I hug my teddy."],
      ["yarn", "🧶", "The cat plays with yarn."],
    ],
    vehicles: [
      ["bike", "🚲", "I ride my bike."],
      ["boat", "⛵", "The boat sails on the sea."],
      ["bus", "🚌", "We ride the bus."],
      ["car", "🚗", "The car goes beep beep."],
      ["jet", "✈️", "A jet flies in the sky."],
      ["rocket", "🚀", "A rocket goes to space."],
      ["ship", "🚢", "A big ship sails away."],
      ["taxi", "🚕", "The taxi is yellow."],
      ["train", "🚆", "The train goes choo choo."],
      ["truck", "🚚", "The truck is big."],
      ["van", "🚐", "We drive in a van."],
    ],
    nature: [
      ["cloud", "☁️", "A cloud is in the sky."],
      ["fire", "🔥", "Fire is hot."],
      ["flower", "🌸", "A flower smells nice."],
      ["ice", "🧊", "Ice is very cold."],
      ["leaf", "🍃", "A leaf falls from the tree."],
      ["moon", "🌙", "The moon shines at night."],
      ["rain", "🌧️", "Rain makes puddles."],
      ["rock", "🪨", "A rock is hard."],
      ["rose", "🌹", "A rose smells sweet."],
      ["shell", "🐚", "I find a shell on the beach."],
      ["snow", "❄️", "Snow is cold and white."],
      ["star", "⭐", "A star twinkles."],
      ["sun", "☀️", "The sun is hot."],
      ["tree", "🌳", "A tree is tall."],
      ["wave", "🌊", "A wave splashes."],
      ["web", "🕸️", "A spider makes a web."],
    ],
    body: [
      ["baby", "👶", "The baby is sleeping."],
      ["ear", "👂", "I hear with my ear."],
      ["eye", "👁️", "I see with my eye."],
      ["foot", "🦶", "I hop on one foot."],
      ["hand", "✋", "I wave my hand."],
      ["king", "🤴", "The king sits on a throne."],
      ["nose", "👃", "I smell with my nose."],
      ["queen", "👸", "The queen lives in a castle."],
      ["tooth", "🦷", "I lost a tooth!"],
    ],
    colors: [
      ["red", "🔴", "An apple is red."],
      ["orange", "🟠", "An orange is orange."],
      ["yellow", "🟡", "The sun is yellow."],
      ["green", "🟢", "Grass is green."],
      ["blue", "🔵", "The sky is blue."],
      ["purple", "🟣", "Grapes can be purple."],
      ["brown", "🟤", "A bear is brown."],
      ["black", "⚫", "The night is black."],
      ["white", "⚪", "Snow is white."],
    ],
    little: [
      ["up", "⬆️", "The balloon goes up."],
      ["hi", "👋", "Say hi to a friend."],
      ["yes", "👍", "Yes, please!"],
      ["no", "🙅", "No, thank you."],
      ["big", "🐘", "An elephant is big."],
      ["fun", "🎉", "Playing is fun!"],
    ],
  };

  const words = categories.flatMap((category) =>
    lists[category.id].map(([word, picture, sentence]) => ({ word, picture, sentence, category: category.id }))
  );

  // The picture word shown for each letter in Letters mode ("A is for apple").
  const letterExamples = {
    a: "apple", b: "ball", c: "cat", d: "dog", e: "egg", f: "fish", g: "goat", h: "hat", i: "ice",
    j: "jam", k: "kite", l: "lion", m: "moon", n: "nose", o: "owl", p: "pig", q: "queen", r: "rabbit",
    s: "sun", t: "tree", u: "up", v: "van", w: "whale", x: "box", y: "yarn", z: "zebra",
  };

  function exampleFor(letter) {
    const lower = letter.toLowerCase();
    const preferred = words.find((w) => w.word === letterExamples[lower]);
    return preferred || words.find((w) => w.word.startsWith(lower)) || words.find((w) => w.word.includes(lower)) || null;
  }

  return { categories, words, exampleFor };
});
