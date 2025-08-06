const quotes = new Map();

quotes.set(
  'The keenest sorrow is to recognize ourselves as the sole cause of all our adversities.',
  'Sophocles (496 BC - 406 BC)'
);
quotes.set(
  'Deeds, not words shall speak me.',
  'John Fletcher (1579 - 1625)'
);
quotes.set(
  'I think it is good that books still exist, but they do make me sleepy.',
  'Frank Zappa (1940 - 1993)'
);
quotes.set(
  'Some are born great, some achieve greatness, and some hire public relations officers.',
  'Daniel J. Boorstin (1914 - )'
);
quotes.set(
  'Having a dream is what keeps you alive. Overcoming the challenges make life worth living.',
  'Mary Tyler Moore (1936 - )'
);
quotes.set(
  "I'm glad I don't have to explain to a man from Mars why each day I set fire to dozens of little pieces of paper, and then put them in my mouth.",
  'Mignon McLaughlin'
);
quotes.set(
  'One of the joys we have in being human is in exercising our freedom to choose and to take each case as it comes to us. We are not robots who are forced into behaviors by their programming. We see things; we think about things; and we choose our course of action or beliefs appropriately. And as long as that remains true of us, we will live every day of our lives on one slippery slope or another. There is no reason to fear this.',
  'Gordon Atkinson, Real Live Preacher weblog, 03-23-06'
);
quotes.set(
  'Seek not happiness too greedily, and be not fearful of happiness.',
  'Lao-tzu (604 BC - 531 BC)'
);
quotes.set(
  'All of us learn to write in the second grade. Most of us go on to greater things.',
  'Bobby Knight (1940 - )'
);
quotes.set(
  'Level with your child by being honest. Nobody spots a phony quicker than a child.',
  'Mary MacCracken'
);
quotes.set(
  "A signature always reveals a man's character - and sometimes even his name.",
  'Evan Esar (1899 - 1995)'
);
quotes.set(
  'I believe that banking institutions are more dangerous to our liberties than standing armies.',
  'Thomas Jefferson (1743 - 1826)'
);
quotes.set(
  'When we remember we are all mad, the mysteries disappear and life stands explained.',
  'Mark Twain (1835 - 1910)'
);
quotes.set(
  'There are some defeats more triumphant than victories.',
  'Michel de Montaigne (1533 - 1592)'
);
quotes.set(
  "I took a speed reading course and read 'War and Peace' in twenty minutes. It involves Russia.",
  'Woody Allen (1935 - )'
);
quotes.set(
  'A raise is like a martini: it elevates the spirit, but only temporarily.',
  "Dan Seligman, in 'Forbes Magazine'"
);
quotes.set(
  'It is unwise to be too sure of one\'s own wisdom. It is healthy to be reminded that the strongest might weaken and the wisest might err.',
  'Mahatma Gandhi (1869 - 1948)'
);
quotes.set(
  'The artist is a receptacle for emotions that come from all over the place: from the sky, from the earth, from a scrap of paper, from a passing shape...',
  'Pablo Picasso (1881 - 1973)'
);
quotes.set(
  'Ah! Memory impairment: the free prize at the bottom of every vodka bottle!',
  'Chuck Lorre, Steven Molaro and Eric Kaplan, Big Bang Theory, The Agreement Dissection, 2011'
);
quotes.set(
  'It is well to give when asked but it is better to give unasked, through understanding.',
  "Kahlil Gibran (1883 - 1931), 'On Giving,' The Prophet, 1923"
);

const quoteList = Array.from(quotes.keys());
const authorList = Array.from(quotes.values());

const quote_block = document.querySelector('.quote-block');
const usedIndexes = new Set();

generateRandomQuote(quote_block);

function generateRandomQuote(quote_block) {
  if (usedIndexes.size >= quotes.size) {
    usedIndexes.clear();
  }

  while (true) {
    const index = Math.floor(Math.random() * quotes.size);
    if (usedIndexes.has(index)) continue;

    const quote = quoteList[index];
    const author = authorList[index];

    quote_block.innerHTML = `
        <p class="quote">${quote}</p>
        <p class="author-quote">— ${author}</p>
    `;

    usedIndexes.add(index);
    break;
  }
}