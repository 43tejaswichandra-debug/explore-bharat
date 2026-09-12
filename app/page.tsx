"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";

type Screen =
  | "landing"
  | "welcome"
  | "nickname"
  | "personal"
  | "region"
  | "places"
  | "activities"
  | "timeTrek"
  | "pieceOfPast"
  | "cultureQuest"
  | "heritageCard"
  | "profile"
  | "arcade"
  | "memoryLevels"
  | "memory"
  | "maze";

type Explorer = "girl" | "boy";

type MemoryCard = {
  id: number;
  pairId: number;
  text: string;
  type: "question" | "answer";
  matched: boolean;
};

/* =========================================================
   EXPLORER DATA
========================================================= */

const EXPLORER_DATA: Record<
  Explorer,
  { emoji: string; label: string; greeting: (name: string) => string }
> = {
  girl: {
    emoji: "👧🏻",
    label: "Girl Explorer",
    greeting: (name) =>
      `Namaste, ${name}! I'm so excited you picked me. Let's go explore Bharat together!`,
  },
  boy: {
    emoji: "👦🏻",
    label: "Boy Explorer",
    greeting: (name) =>
      `Namaste, ${name}! I'm so excited you picked me. Let's go explore Bharat together!`,
  },
};

/* =========================================================
   SCREEN-TIME
========================================================= */

const BREAK_INTERVAL_SECONDS = 30 * 60;
const MAX_JOURNEY_XP = 1000;

const PROFILE_REGIONS: Record<string, string[]> = {
  North: ["Delhi", "Agra", "Jaipur", "Amritsar"],
  South: ["Hyderabad", "Mysuru", "Chennai", "Thanjavur"],
  East: ["Kolkata", "Bhubaneswar", "Puri", "Patna"],
  West: ["Ahmedabad", "Mumbai", "Udaipur", "Aurangabad"],
};

const GAME_LABELS = {
  timeTrek: "Time Trek",
  pieceOfPast: "Piece of the Past",
  cultureQuest: "Culture Quest",
} as const;

function gameKey(place: string, game: keyof typeof GAME_LABELS) {
  return `${place}::${game}`;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${m}:${s}`;
}

/* =========================================================
   MEMORY MATCH DATA
========================================================= */

const MEMORY_LEVELS = [
  {
    id: 1,
    title: "Meet the Legends",
    subtitle: "Match the historical personality with the clue.",
    pairs: [
      {
        question:
          "I was the first woman ruler of the Delhi Sultanate and ruled from Delhi in the 13th century. Who am I?",
        answer: "Razia Sultana",
      },
      {
        question:
          "I founded the Maurya Empire and established one of the earliest large empires in ancient India. Who am I?",
        answer: "Chandragupta Maurya",
      },
      {
        question:
          "I was a famous emperor of the Maurya Empire who embraced Buddhism after the Kalinga War. Who am I?",
        answer: "Ashoka",
      },
      {
        question:
          "I was a powerful Mughal emperor who commissioned the Taj Mahal in memory of Mumtaz Mahal. Who am I?",
        answer: "Shah Jahan",
      },
      {
        question:
          "I was the queen of Jhansi who fought against British rule during the Revolt of 1857. Who am I?",
        answer: "Rani Lakshmibai",
      },
    ],
  },
  {
    id: 2,
    title: "Ancient India",
    subtitle: "Match the historical clue with the correct answer.",
    pairs: [
      {
        question:
          "Ancient India — Indus Valley Civilization: Which city is famous for its massive Great Bath?",
        answer: "Mohenjo-daro",
      },
      {
        question:
          "Ancient India — Indus Valley Civilization: Which ancient city is known for its carefully planned streets and advanced drainage system?",
        answer: "Harappa",
      },
      {
        question:
          "Ancient India — Vedic Period: Which ancient Indian texts are considered among the oldest sacred texts of India?",
        answer: "The Vedas",
      },
      {
        question:
          "Ancient India — Mauryan Empire: Which Mauryan emperor is famous for spreading Buddhism across a large part of Asia?",
        answer: "Ashoka",
      },
      {
        question:
          "Ancient India — Gupta Period: Which period is remembered for major developments in Indian art, science, mathematics and literature?",
        answer: "Gupta Age",
      },
    ],
  },
];

const LOCKED_LEVELS = [
  {
    id: 3,
    title: "Monuments & Places",
    subtitle: "Discover India's iconic heritage sites.",
  },
  {
    id: 4,
    title: "Culture & Traditions",
    subtitle: "Explore India's diverse cultural traditions.",
  },
  {
    id: 5,
    title: "Bharat Challenge",
    subtitle: "Take on the ultimate Bharat challenge.",
  },
];

const createMemoryCards = (levelId: number): MemoryCard[] => {
  const level = MEMORY_LEVELS.find((item) => item.id === levelId);

  if (!level) return [];

  const cards = level.pairs.flatMap((pair, index) => [
    {
      id: index * 2,
      pairId: index,
      text: pair.question,
      type: "question" as const,
      matched: false,
    },
    {
      id: index * 2 + 1,
      pairId: index,
      text: pair.answer,
      type: "answer" as const,
      matched: false,
    },
  ]);

  return [...cards].sort(() => Math.random() - 0.5);
};

/* =========================================================
   TIME TREK — HYDERABAD
========================================================= */

type TimeTrekQuestion = {
  question: string;
  options: string[];
  answer: string;
  hint1: string;
  hint2: string;
  fact: string;
};

const HYDERABAD_TIME_TREK: TimeTrekQuestion[] = [
  {
    question:
      "Which iconic monument was built in 1591 and became a symbol of Hyderabad?",
    options: ["Charminar", "Golconda Fort", "Mecca Masjid", "Chowmahalla Palace"],
    answer: "Charminar",
    hint1: "Look for the monument with four famous minarets.",
    hint2: "Its name literally refers to four minarets.",
    fact:
      "Charminar was built in 1591 by Muhammad Quli Qutb Shah and is one of Hyderabad's most famous landmarks.",
  },
  {
    question:
      "Which dynasty founded Hyderabad and ruled the Deccan from Golconda?",
    options: ["Qutb Shahi dynasty", "Chola dynasty", "Maurya dynasty", "Pallava dynasty"],
    answer: "Qutb Shahi dynasty",
    hint1: "Think of the rulers connected with Golconda.",
    hint2: "The dynasty's name begins with Qutb.",
    fact:
      "The Qutb Shahi dynasty ruled the Golconda Sultanate from 1518 to 1687 and founded Hyderabad in 1591.",
  },
  {
    question:
      "Who founded Hyderabad and commissioned the construction of Charminar?",
    options: [
      "Muhammad Quli Qutb Shah",
      "Ibrahim Quli Qutb Shah",
      "Abdullah Qutb Shah",
      "Sultan Quli Qutb-ul-Mulk",
    ],
    answer: "Muhammad Quli Qutb Shah",
    hint1: "He was the fifth ruler of the Qutb Shahi dynasty.",
    hint2: "His name contains the same Qutb Shahi family name as the dynasty.",
    fact:
      "Muhammad Quli Qutb Shah founded Hyderabad and is traditionally credited with commissioning Charminar in 1591.",
  },
  {
    question:
      "Which fort was the original stronghold of the Qutb Shahi rulers near Hyderabad?",
    options: ["Golconda Fort", "Warangal Fort", "Bidar Fort", "Daulatabad Fort"],
    answer: "Golconda Fort",
    hint1: "This famous fort is closely associated with the Deccan diamond trade.",
    hint2: "It is west of Hyderabad and is known for its acoustic design.",
    fact:
      "Golconda Fort was the major stronghold of the Qutb Shahi rulers and became famous for its strategic location and diamond trade.",
  },
  {
    question:
      "Which river flows through Hyderabad and is closely linked with the city's history?",
    options: ["Musi River", "Krishna River", "Godavari River", "Tungabhadra River"],
    answer: "Musi River",
    hint1: "It passes directly through the historic city.",
    hint2: "The river shares its name with Hyderabad's famous Musi flood history.",
    fact:
      "The Musi River flows through Hyderabad. The devastating 1908 Musi flood became an important event in the city's modern history and development.",
  },
];

/* =========================================================
   TIME TREK — CHENNAI
========================================================= */

const CHENNAI_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which beach is one of the most famous tourist attractions in Chennai?",
    options: ["Juhu Beach", "Marina Beach", "Baga Beach", "Puri Beach"],
    answer: "Marina Beach",
    hint1: "Think of Chennai's famous coastline along the Bay of Bengal.",
    hint2: "Its name begins with the letter M.",
    fact: "Marina Beach lies along the Bay of Bengal and stretches for about 12 km.",
  },
  {
    question: "Which famous monument is located in Mylapore, Chennai?",
    options: ["Meenakshi Temple", "Kapaleeshwarar Temple", "Brihadeeswara Temple", "Shore Temple"],
    answer: "Kapaleeshwarar Temple",
    hint1: "Think of a prominent Shiva temple in Mylapore.",
    hint2: "Its name begins with Kapaleeshwarar.",
    fact: "Kapaleeshwarar Temple is a prominent Shiva temple located in Mylapore, Chennai.",
  },
  {
    question: "Which historical fort is located in Chennai?",
    options: ["Golconda Fort", "Amer Fort", "Fort St. George", "Red Fort"],
    answer: "Fort St. George",
    hint1: "Think of the historic fort associated with colonial Chennai.",
    hint2: "Its name begins with Fort St.",
    fact: "Fort St. George is an important historical and colonial monument in Chennai.",
  },
  {
    question: "Which famous Tamil poet is honoured at Valluvar Kottam?",
    options: ["Subramania Bharati", "Thiruvalluvar", "Kambar", "Avvaiyar"],
    answer: "Thiruvalluvar",
    hint1: "Think of the poet and philosopher associated with the Thirukkural.",
    hint2: "Valluvar Kottam takes its name from this figure.",
    fact: "Valluvar Kottam is a monument dedicated to the famous Tamil poet and philosopher Thiruvalluvar, associated with the Thirukkural.",
  },
  {
    question: "Which food is strongly associated with Chennai and Tamil cuisine?",
    options: ["Hyderabadi Biryani", "Dosa and Idli", "Litti Chokha", "Dhokla"],
    answer: "Dosa and Idli",
    hint1: "Think of familiar South Indian breakfast foods.",
    hint2: "Both are made from a fermented rice-and-lentil batter.",
    fact: "South Indian foods such as idli and dosa are strongly associated with Chennai's food culture.",
  },
  {
    question: "Which museum in Chennai was established in 1851?",
    options: ["Salar Jung Museum", "Government Museum", "Indian Museum", "National Museum"],
    answer: "Government Museum",
    hint1: "Think of Chennai's historic museum in Egmore.",
    hint2: "Its name is simply Government Museum.",
    fact: "Chennai's Government Museum, popularly known as the Madras Museum, was established in 1851.",
  },
  {
    question: "Which famous personality is associated with Tamil poetry and nationalism?",
    options: ["Subramania Bharati", "Mirza Ghalib", "Rabindranath Tagore", "Kabir"],
    answer: "Subramania Bharati",
    hint1: "Think of a famous Tamil poet from the freedom era.",
    hint2: "His name begins with Subramania.",
    fact: "Subramania Bharati was a famous Tamil poet and freedom-era writer. His statue is among those found along Marina Beach.",
  },
  {
    question: "What is Chennai's traditional classical dance culture especially associated with?",
    options: ["Bharatanatyam", "Kathak", "Bihu", "Garba"],
    answer: "Bharatanatyam",
    hint1: "Think of a classical dance strongly associated with Tamil Nadu.",
    hint2: "The dance name begins with Bharata.",
    fact: "Chennai is an important centre for classical Tamil performing arts, including Bharatanatyam. Tamil Nadu Tourism highlights Chennai's classical dance performances as part of its cultural attractions.",
  },
  {
    question: "Which famous monument is located near Marina Beach?",
    options: ["Charminar", "Gateway of India", "Gandhi Statue", "India Gate"],
    answer: "Gandhi Statue",
    hint1: "Think of one of the prominent statues along Marina Beach.",
    hint2: "It honours Mahatma Gandhi.",
    fact: "The Mahatma Gandhi statue is one of the prominent statues along Marina Beach.",
  },
  {
    question: "Chennai was historically known by which name?",
    options: ["Bombay", "Madras", "Calcutta", "Bangalore"],
    answer: "Madras",
    hint1: "Think of the city's older colonial-era name.",
    hint2: "The name starts with M and has six letters.",
    fact: "The city and surrounding settlement were historically known as Madras/Madraspatnam before the official name Chennai became established.",
  },
];

/* =========================================================
   TIME TREK — THANJAVUR
========================================================= */

const THANJAVUR_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous temple is located in Thanjavur?",
    options: ["Brihadisvara Temple", "Meenakshi Temple", "Charminar", "Konark Sun Temple"],
    answer: "Brihadisvara Temple",
    hint1: "Think of Thanjavur's most famous Chola-era temple.",
    hint2: "It is also known as the Big Temple.",
    fact: "The Brihadisvara Temple is a famous Chola-era temple in Thanjavur. It is dedicated to Lord Shiva.",
  },
  {
    question: "Who built the Brihadisvara Temple in Thanjavur?",
    options: ["Rajaraja Chola I", "Rajendra Chola I", "Krishnadevaraya", "Raja Raja Pandya"],
    answer: "Rajaraja Chola I",
    hint1: "Think of the Chola ruler who commissioned the temple.",
    hint2: "His name begins with Rajaraja.",
    fact: "Rajaraja Chola I commissioned the Brihadisvara Temple in the early 11th century.",
  },
  {
    question: "Thanjavur is famous for which traditional painting style?",
    options: ["Tanjore Painting", "Madhubani Painting", "Warli Painting", "Pattachitra"],
    answer: "Tanjore Painting",
    hint1: "Think of a traditional art form strongly associated with Thanjavur.",
    hint2: "Its name is also written as Tanjore Painting.",
    fact: "Tanjore painting is known for rich colors, decorative designs and the use of gold foil.",
  },
  {
    question: "The Brihadisvara Temple is mainly dedicated to which deity?",
    options: ["Shiva", "Vishnu", "Ganesha", "Murugan"],
    answer: "Shiva",
    hint1: "Think of the deity worshipped in the temple's main shrine.",
    hint2: "The temple has a large lingam in its main shrine.",
    fact: "The Brihadisvara Temple is dedicated to Lord Shiva and has a large Shiva lingam in its main shrine.",
  },
  {
    question: "Which dynasty is strongly associated with the history of Thanjavur?",
    options: ["Chola Dynasty", "Mughal Dynasty", "Maurya Dynasty", "Gupta Dynasty"],
    answer: "Chola Dynasty",
    hint1: "Think of the dynasty whose imperial capital included Thanjavur.",
    hint2: "The dynasty is famous for major temples in Tamil Nadu.",
    fact: "Thanjavur became an important centre of the Chola dynasty and was the capital of the Imperial Cholas.",
  },
  {
    question: "Which traditional instrument is closely associated with Thanjavur?",
    options: ["Thanjavur Veena", "Santoor", "Sarod", "Shehnai"],
    answer: "Thanjavur Veena",
    hint1: "Think of a string instrument associated with Carnatic music.",
    hint2: "Its name includes the city of Thanjavur.",
    fact: "Thanjavur is an important centre for Carnatic music and is well known for its traditional musical instruments, including the Thanjavur Veena.",
  },
  {
    question: "What is another common name for Tanjore Painting?",
    options: ["Thanjavur Painting", "Mysore Painting", "Mithila Painting", "Kalamkari Painting"],
    answer: "Thanjavur Painting",
    hint1: "Think of the name that uses the city's modern spelling.",
    hint2: "It begins with Thanjavur.",
    fact: "Tanjore Painting is also called Thanjavur Painting and is a traditional South Indian art form.",
  },
  {
    question: "The Brihadisvara Temple is also popularly known by which name?",
    options: ["Big Temple", "Golden Temple", "Sun Temple", "Rock Temple"],
    answer: "Big Temple",
    hint1: "Think of the temple's widely used informal name.",
    hint2: "The name describes its grand scale and begins with Big.",
    fact: "The Brihadisvara Temple is popularly known as the Big Temple and is one of the most famous landmarks of Thanjavur.",
  },
];

/* =========================================================
   TIME TREK — MYSURU
========================================================= */

const MYSURU_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous palace is located in Mysore?",
    options: ["Mysore Palace", "Charminar", "Brihadisvara Temple", "Victoria Memorial"],
    answer: "Mysore Palace",
    hint1: "Think of Mysore's most famous royal landmark.",
    hint2: "Its name includes the city itself.",
    fact: "Mysore Palace is one of the most famous landmarks of Mysore and is known for its grand architecture and beautiful illumination.",
  },
  {
    question: "Mysore is also known by which name?",
    options: ["Mysuru", "Madurai", "Mangalore", "Mysorepuram"],
    answer: "Mysuru",
    hint1: "Think of the official Kannada name of the city.",
    hint2: "The name begins with Mys and ends with uru.",
    fact: "Mysuru is the official Kannada name of Mysore and the city is widely known for its royal heritage and culture.",
  },
  {
    question: "Mysore is famous for which traditional painting style?",
    options: ["Mysore Painting", "Madhubani Painting", "Warli Painting", "Pattachitra"],
    answer: "Mysore Painting",
    hint1: "Think of the traditional painting style named after the city.",
    hint2: "Its name starts with Mysore.",
    fact: "Mysore painting is a traditional South Indian art form known for delicate lines, bright colors and the use of gold.",
  },
  {
    question: "Which festival is celebrated grandly in Mysore?",
    options: ["Mysore Dasara", "Pongal", "Bihu", "Onam"],
    answer: "Mysore Dasara",
    hint1: "Think of the city's famous royal festival.",
    hint2: "It is associated with grand processions and palace illumination.",
    fact: "Mysore Dasara is a famous festival celebrated with processions, cultural programs and the illumination of Mysore Palace.",
  },
  {
    question: "Which dynasty is strongly associated with the history of Mysore?",
    options: ["Wadiyar Dynasty", "Chola Dynasty", "Mughal Dynasty", "Maurya Dynasty"],
    answer: "Wadiyar Dynasty",
    hint1: "Think of the royal dynasty that ruled the Kingdom of Mysore.",
    hint2: "Its name begins with W.",
    fact: "The Wadiyar dynasty ruled the Kingdom of Mysore for several centuries and played an important role in the city's cultural development.",
  },
  {
    question: "Which famous sweet is strongly associated with Mysore?",
    options: ["Mysore Pak", "Rasgulla", "Gulab Jamun", "Peda"],
    answer: "Mysore Pak",
    hint1: "Think of a famous sweet named after the city.",
    hint2: "Its name starts with Mysore.",
    fact: "Mysore Pak is a famous sweet made mainly from gram flour, ghee and sugar and is closely associated with Mysore.",
  },
  {
    question: "Which famous hill is located near Mysore?",
    options: ["Chamundi Hill", "Nandi Hills", "Aravalli Hills", "Nilgiri Hills"],
    answer: "Chamundi Hill",
    hint1: "Think of the hill associated with Mysore's famous temple.",
    hint2: "The Chamundeshwari Temple stands at its summit.",
    fact: "Chamundi Hill is a major landmark of Mysore and is famous for the Chamundeshwari Temple at its summit.",
  },
  {
    question: "Mysore Palace is especially famous for its grand illumination during which occasion?",
    options: ["Mysore Dasara", "Diwali", "Holi", "Ugadi"],
    answer: "Mysore Dasara",
    hint1: "Think of Mysore's grand annual royal celebration.",
    hint2: "The palace is illuminated with thousands of lights during it.",
    fact: "During Mysore Dasara, the Mysore Palace is decorated and illuminated with thousands of lights, creating a spectacular sight.",
  },
];

/* =========================================================
   TIME TREK — JAIPUR
========================================================= */

const JAIPUR_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous palace is known for its many small windows in Jaipur?",
    options: ["Hawa Mahal", "Mysore Palace", "Charminar", "Victoria Memorial"],
    answer: "Hawa Mahal",
    hint1: "Think of Jaipur's famous Palace of Winds.",
    hint2: "Its name begins with Hawa and it is known for many windows.",
    fact: "Hawa Mahal, also called the Palace of Winds, is one of the most famous landmarks of Jaipur.",
  },
  {
    question: "Jaipur is popularly known by which nickname?",
    options: ["Pink City", "Blue City", "Golden City", "White City"],
    answer: "Pink City",
    hint1: "Think of the distinctive color of many buildings in Jaipur's old city.",
    hint2: "The nickname is a color followed by the word City.",
    fact: "Jaipur is popularly known as the Pink City because of the distinctive pink color of many buildings in the old city.",
  },
  {
    question: "Which famous fort is located on a hill near Jaipur?",
    options: ["Amber Fort", "Golconda Fort", "Red Fort", "Agra Fort"],
    answer: "Amber Fort",
    hint1: "Think of the historic fort associated with Rajput architecture near Jaipur.",
    hint2: "Its name begins with Amber.",
    fact: "Amber Fort is a famous historical fort near Jaipur, known for its beautiful Rajput architecture.",
  },
  {
    question: "Which famous astronomical observatory is located in Jaipur?",
    options: ["Jantar Mantar", "Aryabhata Observatory", "Nehru Planetarium", "Birla Observatory"],
    answer: "Jantar Mantar",
    hint1: "Think of Jaipur's historic collection of astronomical instruments.",
    hint2: "Its name has two words and begins with Jantar.",
    fact: "Jantar Mantar in Jaipur contains large astronomical instruments used to observe and calculate celestial positions.",
  },
  {
    question: "Which royal complex is located in the heart of Jaipur?",
    options: ["City Palace", "Mysore Palace", "Umaid Bhawan Palace", "Lake Palace"],
    answer: "City Palace",
    hint1: "Think of the major royal complex in central Jaipur.",
    hint2: "Its name starts with the word City.",
    fact: "The City Palace is an important royal complex in Jaipur and reflects the rich heritage of the former Jaipur rulers.",
  },
  {
    question: "Which traditional art is Jaipur famous for?",
    options: ["Blue Pottery", "Madhubani Painting", "Pattachitra", "Warli Painting"],
    answer: "Blue Pottery",
    hint1: "Think of Jaipur's distinctive craft known for blue designs.",
    hint2: "Its name combines a color with a type of craft.",
    fact: "Jaipur is well known for its traditional blue pottery, which is recognized for its attractive blue designs and patterns.",
  },
  {
    question: "Which dynasty founded the city of Jaipur?",
    options: ["Kachwaha Rajputs", "Chola Dynasty", "Wadiyar Dynasty", "Maurya Dynasty"],
    answer: "Kachwaha Rajputs",
    hint1: "Think of the Rajput dynasty associated with Maharaja Sawai Jai Singh II.",
    hint2: "The dynasty's name begins with K.",
    fact: "Jaipur was founded by Maharaja Sawai Jai Singh II, a ruler of the Kachwaha Rajput dynasty.",
  },
  {
    question: "Which famous festival is celebrated with great enthusiasm in Jaipur?",
    options: ["Gangaur", "Onam", "Bihu", "Pongal"],
    answer: "Gangaur",
    hint1: "Think of an important traditional festival of Rajasthan.",
    hint2: "Its name begins with Gan and ends with aur.",
    fact: "Gangaur is an important traditional festival celebrated in Rajasthan, including Jaipur, with colorful processions and cultural activities.",
  },
];

/* =========================================================
   TIME TREK — AMRITSAR
========================================================= */

const AMRITSAR_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous Sikh shrine is located in Amritsar?",
    options: ["Golden Temple", "Hawa Mahal", "Mysore Palace", "Charminar"],
    answer: "Golden Temple",
    hint1: "Think of Amritsar's most famous Sikh shrine.",
    hint2: "It is also known as Sri Harmandir Sahib.",
    fact: "The Golden Temple, also known as Sri Harmandir Sahib, is one of the most important Sikh religious sites.",
  },
  {
    question: "What is the other popular name of the Golden Temple?",
    options: ["Sri Harmandir Sahib", "Qutub Minar", "Jantar Mantar", "Gateway of India"],
    answer: "Sri Harmandir Sahib",
    hint1: "Think of the Golden Temple's other well-known name.",
    hint2: "It begins with Sri and refers to the sacred shrine.",
    fact: "The Golden Temple is popularly known as Sri Harmandir Sahib or Darbar Sahib.",
  },
  {
    question: "Which famous historical event took place at Jallianwala Bagh?",
    options: ["Jallianwala Bagh Massacre", "Dandi March", "Quit India Movement", "Battle of Plassey"],
    answer: "Jallianwala Bagh Massacre",
    hint1: "Think of the tragic event associated with Jallianwala Bagh.",
    hint2: "It occurred on 13 April 1919.",
    fact: "The Jallianwala Bagh Massacre took place on 13 April 1919 during the British period.",
  },
  {
    question: "Which festival is especially important in Punjab and is celebrated with great enthusiasm?",
    options: ["Baisakhi", "Onam", "Pongal", "Bihu"],
    answer: "Baisakhi",
    hint1: "Think of Punjab's important harvest festival.",
    hint2: "It begins with the letter B and is strongly linked with Punjab.",
    fact: "Baisakhi is an important harvest festival of Punjab and also has great significance in Sikh history.",
  },
  {
    question: "Which famous border ceremony can be watched near Amritsar?",
    options: ["Wagah Border Ceremony", "Republic Day Parade", "Mysore Dasara", "Beating Retreat at India Gate"],
    answer: "Wagah Border Ceremony",
    hint1: "Think of the famous ceremony near the India-Pakistan border.",
    hint2: "It takes place at the Wagah-Attari border.",
    fact: "The Wagah-Attari border near Amritsar is famous for its daily flag-lowering and Beating Retreat ceremony.",
  },
  {
    question: "Which traditional Punjabi dance is commonly associated with men?",
    options: ["Bhangra", "Kuchipudi", "Bharatanatyam", "Kathak"],
    answer: "Bhangra",
    hint1: "Think of Punjab's energetic folk dance.",
    hint2: "It is traditionally associated with men and harvest celebrations.",
    fact: "Bhangra is a lively traditional folk dance of Punjab, traditionally associated with harvest celebrations.",
  },
  {
    question: "Which traditional Punjabi dance is commonly performed by women?",
    options: ["Giddha", "Garba", "Lavani", "Odissi"],
    answer: "Giddha",
    hint1: "Think of the traditional Punjabi folk dance performed by women.",
    hint2: "Its name starts with G and is associated with Punjabi celebrations.",
    fact: "Giddha is a traditional Punjabi folk dance commonly performed by women during celebrations and festivals.",
  },
  {
    question: "Which famous food is strongly associated with Punjabi cuisine?",
    options: ["Amritsari Kulcha", "Dhokla", "Idli", "Puttu"],
    answer: "Amritsari Kulcha",
    hint1: "Think of a stuffed flatbread associated with Amritsar.",
    hint2: "Its name includes the city itself.",
    fact: "Amritsari Kulcha is a popular stuffed flatbread associated with Amritsar and Punjabi cuisine.",
  },
];


/* =========================================================
   TIME TREK — DELHI
========================================================= */

const DELHI_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous monument in Delhi was built by the Mughal emperor Shah Jahan?",
    options: ["India Gate", "Red Fort", "Qutub Minar", "Lotus Temple"],
    answer: "Red Fort",
    hint1: "Think of the Mughal emperor associated with Delhi's famous red sandstone fort.",
    hint2: "Its name contains the word Red.",
    fact: "The Red Fort was built by Mughal emperor Shah Jahan and is one of Delhi's most famous historical monuments.",
  },
  {
    question: "Which monument is one of Delhi's most famous historical landmarks and is a UNESCO World Heritage Site?",
    options: ["Qutub Minar", "Gateway of India", "Charminar", "Victoria Memorial"],
    answer: "Qutub Minar",
    hint1: "Think of Delhi's famous tall minaret.",
    hint2: "Its name begins with Qutub.",
    fact: "Qutub Minar is one of Delhi's most famous historical landmarks and is a UNESCO World Heritage Site.",
  },
  {
    question: "Who started the construction of the Qutub Minar?",
    options: ["Akbar", "Shah Jahan", "Qutb-ud-din Aibak", "Humayun"],
    answer: "Qutb-ud-din Aibak",
    hint1: "Think of the ruler who founded the Delhi Sultanate.",
    hint2: "His name begins with Qutb.",
    fact: "Qutb-ud-din Aibak started the construction of the Qutub Minar.",
  },
  {
    question: "Which famous monument in Delhi commemorates Indian soldiers who died in World War I?",
    options: ["India Gate", "Red Fort", "Purana Qila", "Jama Masjid"],
    answer: "India Gate",
    hint1: "Think of Delhi's famous war memorial.",
    hint2: "It stands along a ceremonial avenue in New Delhi.",
    fact: "India Gate is a war memorial dedicated to Indian soldiers who died during World War I.",
  },
  {
    question: "Which temple in Delhi is famous for its lotus-shaped architecture?",
    options: ["Akshardham Temple", "Lotus Temple", "Birla Mandir", "ISKCON Temple"],
    answer: "Lotus Temple",
    hint1: "Think of the Delhi place of worship shaped like a flower.",
    hint2: "Its name is the same as the flower shape.",
    fact: "The Lotus Temple is famous for its distinctive lotus-shaped architecture.",
  },
  {
    question: "Which famous Indian leader's memorial, Raj Ghat, is located in Delhi?",
    options: ["Subhas Chandra Bose", "Mahatma Gandhi", "Sardar Vallabhbhai Patel", "Bhagat Singh"],
    answer: "Mahatma Gandhi",
    hint1: "Think of the leader associated with India's non-violent freedom movement.",
    hint2: "His memorial is known as Raj Ghat.",
    fact: "Raj Ghat is the memorial dedicated to Mahatma Gandhi and is located in Delhi.",
  },
  {
    question: "Which food is particularly famous as a street food in Delhi?",
    options: ["Dhokla", "Chole Bhature", "Appam", "Litti Chokha"],
    answer: "Chole Bhature",
    hint1: "Think of a popular North Indian dish enjoyed across Delhi.",
    hint2: "It combines spicy chickpeas with a fried bread.",
    fact: "Chole Bhature is a popular North Indian dish and is particularly famous as a street food in Delhi.",
  },
  {
    question: "Which historic mosque in Delhi was built by Shah Jahan?",
    options: ["Jama Masjid", "Mecca Masjid", "Haji Ali Dargah", "Charminar Mosque"],
    answer: "Jama Masjid",
    hint1: "Think of Shah Jahan's famous mosque in Old Delhi.",
    hint2: "Its name begins with Jama.",
    fact: "Jama Masjid in Delhi was built by Mughal emperor Shah Jahan.",
  },
  {
    question: "Which famous market in Delhi is well known for shopping, food, and its lively atmosphere?",
    options: ["Chandni Chowk", "Colaba Causeway", "MG Road", "Park Street"],
    answer: "Chandni Chowk",
    hint1: "Think of the historic market in Old Delhi.",
    hint2: "Its name has two words and starts with Chandni.",
    fact: "Chandni Chowk is one of Delhi's oldest and most famous markets, known for shopping, food, and its lively atmosphere.",
  },
  {
    question: "Delhi is the capital of which country?",
    options: ["Nepal", "Bangladesh", "India", "Sri Lanka"],
    answer: "India",
    hint1: "Think of the country where Delhi is located.",
    hint2: "It is the country whose national flag has three horizontal colors.",
    fact: "Delhi is the capital city of India.",
  },
];

/* =========================================================
   TIME TREK — AGRA
========================================================= */

const AGRA_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous monument is Agra best known for?",
    options: ["Qutub Minar", "Taj Mahal", "Gateway of India", "Charminar"],
    answer: "Taj Mahal",
    hint1: "Think of Agra's most famous white marble monument.",
    hint2: "It is one of the world's most famous monuments.",
    fact: "The Taj Mahal is one of the world's most famous monuments and is located in Agra.",
  },
  {
    question: "Who commissioned the Taj Mahal?",
    options: ["Akbar", "Aurangzeb", "Shah Jahan", "Babur"],
    answer: "Shah Jahan",
    hint1: "Think of the Mughal emperor associated with the Taj Mahal.",
    hint2: "His name is strongly connected with Agra's Mughal heritage.",
    fact: "Mughal Emperor Shah Jahan commissioned the Taj Mahal in memory of his wife Mumtaz Mahal.",
  },
  {
    question: "The Taj Mahal was built in memory of whom?",
    options: ["Jodha Bai", "Mumtaz Mahal", "Noor Jahan", "Razia Sultan"],
    answer: "Mumtaz Mahal",
    hint1: "Think of Shah Jahan's wife whose memory the monument honours.",
    hint2: "Her name begins with Mumtaz.",
    fact: "The Taj Mahal was built as a mausoleum in memory of Mumtaz Mahal, the wife of Shah Jahan.",
  },
  {
    question: "Which famous monument is located near the Taj Mahal in Agra?",
    options: ["Agra Fort", "India Gate", "Red Fort, Delhi", "Golconda Fort"],
    answer: "Agra Fort",
    hint1: "Think of Agra's famous historic fort.",
    hint2: "Its name includes the city where it is located.",
    fact: "Agra Fort is a historic Mughal fort located near the Taj Mahal in Agra.",
  },
  {
    question: "Which UNESCO World Heritage Site is located near Agra?",
    options: ["Fatehpur Sikri", "Sanchi Stupa", "Konark Temple", "Ajanta Caves"],
    answer: "Fatehpur Sikri",
    hint1: "Think of the historic Mughal city near Agra.",
    hint2: "Its name contains two words and starts with Fatehpur.",
    fact: "Fatehpur Sikri is a historic Mughal city and a UNESCO World Heritage Site located near Agra.",
  },
  {
    question: "Which Mughal emperor built much of Fatehpur Sikri?",
    options: ["Shah Jahan", "Akbar", "Humayun", "Bahadur Shah Zafar"],
    answer: "Akbar",
    hint1: "Think of the Mughal emperor who developed Fatehpur Sikri as an imperial city.",
    hint2: "He was the son of Humayun.",
    fact: "Mughal Emperor Akbar developed Fatehpur Sikri as an important imperial city.",
  },
  {
    question: "Which sweet is especially famous in Agra?",
    options: ["Mysore Pak", "Petha", "Rasgulla", "Modak"],
    answer: "Petha",
    hint1: "Think of Agra's famous traditional sweet.",
    hint2: "It is mainly made from ash gourd.",
    fact: "Agra is especially famous for Petha, a traditional sweet made mainly from ash gourd.",
  },
  {
    question: "Which river flows through Agra?",
    options: ["Ganga", "Yamuna", "Godavari", "Narmada"],
    answer: "Yamuna",
    hint1: "Think of the river that passes alongside the Taj Mahal.",
    hint2: "It is a major river associated with northern India.",
    fact: "The Yamuna River flows through Agra and passes alongside the Taj Mahal.",
  },
  {
    question: "Which famous Mughal emperor is closely associated with Agra Fort and Fatehpur Sikri?",
    options: ["Akbar", "Ashoka", "Tipu Sultan", "Chandragupta Maurya"],
    answer: "Akbar",
    hint1: "Think of the Mughal ruler strongly associated with Fatehpur Sikri.",
    hint2: "He was one of the most prominent Mughal emperors.",
    fact: "Akbar is closely associated with Agra Fort and Fatehpur Sikri, which were important centres during his reign.",
  },
  {
    question: "Which garden in Agra is located across the Yamuna River from the Taj Mahal?",
    options: ["Lodhi Garden", "Mehtab Bagh", "Cubbon Park", "Shalimar Garden"],
    answer: "Mehtab Bagh",
    hint1: "Think of the historic garden opposite the Taj Mahal.",
    hint2: "Its name begins with Mehtab.",
    fact: "Mehtab Bagh is a historic garden located across the Yamuna River from the Taj Mahal and offers a famous view of the monument.",
  },
];

/* =========================================================
   TIME TREK — BHUBANESWAR
========================================================= */

const BHUBANESWAR_TIME_TREK: TimeTrekQuestion[] = [
  { question: "Which famous ancient temple is one of the most important landmarks of Bhubaneswar?", options: ["Lingaraj Temple", "Victoria Memorial", "Golden Temple", "Charminar"], answer: "Lingaraj Temple", hint1: "Think of Bhubaneswar's famous ancient temple.", hint2: "It is dedicated to Lord Shiva.", fact: "Lingaraj Temple is one of the most famous temples in Bhubaneswar and is dedicated to Lord Shiva." },
  { question: "Which famous temple near Bhubaneswar is designed in the shape of a giant chariot?", options: ["Konark Sun Temple", "Meenakshi Temple", "Golden Temple", "Somnath Temple"], answer: "Konark Sun Temple", hint1: "Think of the famous Sun Temple near Bhubaneswar.", hint2: "It is designed like a giant chariot.", fact: "The Konark Sun Temple is a famous temple dedicated to the Sun God and is designed as a magnificent stone chariot." },
  { question: "Which famous Buddhist monument is located at Dhauli near Bhubaneswar?", options: ["Dhauli Shanti Stupa", "India Gate", "Gateway of India", "Charminar"], answer: "Dhauli Shanti Stupa", hint1: "Think of the peace monument at Dhauli.", hint2: "It is associated with Emperor Ashoka.", fact: "Dhauli Shanti Stupa is a famous peace monument associated with Emperor Ashoka and Buddhism." },
  { question: "Which classical dance form originated in Odisha?", options: ["Odissi", "Kathak", "Bharatanatyam", "Kuchipudi"], answer: "Odissi", hint1: "Think of Odisha's classical dance.", hint2: "Its name begins with O.", fact: "Odissi is one of the major classical dance forms of India and originated in Odisha." },
  { question: "Which famous festival is celebrated with chariots in Odisha?", options: ["Rath Yatra", "Durga Puja", "Baisakhi", "Onam"], answer: "Rath Yatra", hint1: "Think of Odisha's famous chariot festival.", hint2: "Its name means chariot journey.", fact: "Rath Yatra is a famous chariot festival associated with Lord Jagannath and is celebrated with great enthusiasm in Odisha." },
  { question: "Which caves near Bhubaneswar are associated with ancient Jain traditions?", options: ["Khandagiri and Udayagiri Caves", "Ajanta Caves", "Elephanta Caves", "Ellora Caves"], answer: "Khandagiri and Udayagiri Caves", hint1: "Think of the ancient caves near Bhubaneswar.", hint2: "They have important Jain connections.", fact: "Khandagiri and Udayagiri Caves are ancient rock-cut caves near Bhubaneswar with important Jain connections." },
  { question: "Bhubaneswar is popularly known by which name because of its many temples?", options: ["Temple City of India", "Pink City", "City of Lakes", "City of Palaces"], answer: "Temple City of India", hint1: "Think about Bhubaneswar's many historic temples.", hint2: "The nickname begins with Temple.", fact: "Bhubaneswar is widely known as the Temple City because of its large number of historic temples." },
  { question: "Which traditional art form of Odisha is famous for paintings made on cloth?", options: ["Pattachitra", "Madhubani", "Warli", "Mysore Painting"], answer: "Pattachitra", hint1: "Think of Odisha's traditional painting style.", hint2: "It is known for paintings on cloth.", fact: "Pattachitra is a traditional painting style of Odisha, known for detailed artwork and paintings on cloth." },
];

/* =========================================================
   TIME TREK — PURI
========================================================= */

const PURI_TIME_TREK: TimeTrekQuestion[] = [
  { question: "Which primary deity is enshrined alongside his siblings in the grand temple of Puri?", options: ["Lord Jagannath", "Lord Shiva", "Lord Ganesha", "Lord Hanuman"], answer: "Lord Jagannath", hint1: "The deity shares his name with the famous temple.", hint2: "The temple is called the Jagannath Temple.", fact: "Lord Jagannath is the main deity of the famous Jagannath Temple in Puri and is worshipped along with Balabhadra and Subhadra." },
  { question: "What is the name of the world-famous annual festival where the deities are carried through Puri in massive wooden chariots?", options: ["Rath Yatra", "Durga Puja", "Baisakhi", "Onam"], answer: "Rath Yatra", hint1: "Think of Puri's famous chariot festival.", hint2: "The name means chariot journey.", fact: "Rath Yatra is the famous chariot festival of Puri, during which the deities are taken on large decorated chariots." },
  { question: "Which famous beach is one of the main attractions of Puri?", options: ["Puri Beach", "Marina Beach", "Baga Beach", "Juhu Beach"], answer: "Puri Beach", hint1: "Think of Puri's famous coastal spot.", hint2: "Its name is the same as the city.", fact: "Puri Beach is a popular coastal attraction known for its sandy shore and beautiful sea views." },
  { question: "The present Jagannath Temple in Puri was started under which dynasty?", options: ["Eastern Ganga Dynasty", "Maurya Dynasty", "Chola Dynasty", "Mughal Dynasty"], answer: "Eastern Ganga Dynasty", hint1: "Think of the dynasty connected with the temple's construction.", hint2: "Its name includes the word Ganga.", fact: "The present Jagannath Temple is associated with the Eastern Ganga dynasty, during the reign of Anantavarman Chodaganga Deva." },
  { question: "What is the specific name of Lord Jagannath's large chariot used during the annual procession?", options: ["Nandighosa", "Taladhwaja", "Darpadalana", "Devadalana"], answer: "Nandighosa", hint1: "Think of Lord Jagannath's own chariot.", hint2: "It has a red and yellow canopy and 16 wheels.", fact: "Nandighosa is the large chariot of Lord Jagannath and traditionally has 16 wheels." },
  { question: "Which crispy, multi-layered sweet is traditionally prepared and sold in large quantities inside the temple complex?", options: ["Khaja", "Mysore Pak", "Modak", "Jalebi"], answer: "Khaja", hint1: "Think of a crispy traditional sweet.", hint2: "It is a flaky pastry-like sweet soaked in sugar syrup.", fact: "Khaja is a traditional flaky sweet closely associated with Puri and the Jagannath Temple." },
  { question: "Which nearby 13th-century architectural wonder is built in the shape of a colossal chariot for the Sun God?", options: ["Konark Sun Temple", "Lingaraj Temple", "Mukteshwar Temple", "Udayagiri Caves"], answer: "Konark Sun Temple", hint1: "Think of the famous Sun Temple near Puri.", hint2: "It is famous for its 24 carved stone wheels.", fact: "The Konark Sun Temple is a 13th-century monument designed as a monumental representation of the Sun God's chariot." },
  { question: "Which regional style of Hindu temple architecture is famous in Odisha?", options: ["Kalinga Architecture", "Nagara Architecture", "Dravidian Architecture", "Vesara Architecture"], answer: "Kalinga Architecture", hint1: "Think of the traditional temple style of Odisha.", hint2: "The style shares its name with an ancient name for the region.", fact: "Kalinga Architecture is the distinctive regional temple architecture associated with Odisha." },
];

/* =========================================================
   TIME TREK — PATNA
========================================================= */

const PATNA_TIME_TREK: TimeTrekQuestion[] = [
  { question: "Which famous ancient monument is located in Patna and was built by the British East India Company?", options: ["Golghar", "Charminar", "Gateway of India", "India Gate"], answer: "Golghar", hint1: "Think of Patna's famous dome-shaped landmark.", hint2: "It was built as a granary.", fact: "Golghar is a historic granary in Patna built in 1786. It is one of the most recognizable landmarks of the city." },
  { question: "Which ancient university was located near present-day Patna in Bihar?", options: ["Nalanda University", "Takshashila University", "Vikramashila University", "Kashi University"], answer: "Nalanda University", hint1: "Think of an ancient centre of learning in Bihar.", hint2: "Its name begins with Nalanda.", fact: "Nalanda was one of the world's great ancient centres of learning and attracted scholars from many parts of Asia." },
  { question: "Which museum in Patna is famous for its collection of historical and artistic objects?", options: ["Patna Museum", "Salar Jung Museum", "Indian Museum", "Albert Hall Museum"], answer: "Patna Museum", hint1: "Think of the museum named after the city.", hint2: "Its name begins with Patna.", fact: "Patna Museum houses important archaeological, historical and artistic collections from Bihar and India." },
  { question: "Which river flows through Patna?", options: ["Ganga", "Yamuna", "Godavari", "Narmada"], answer: "Ganga", hint1: "Think of the major sacred river beside Patna.", hint2: "It is one of India's most important rivers.", fact: "The Ganga flows along Patna and has played an important role in the city's history, culture and development." },
  { question: "Which important Buddhist site near Patna is associated with the Buddha's enlightenment?", options: ["Bodh Gaya", "Sarnath", "Sanchi", "Kushinagar"], answer: "Bodh Gaya", hint1: "Think of the Bihar site linked with enlightenment.", hint2: "It begins with Bodh.", fact: "Bodh Gaya in Bihar is one of the most important Buddhist pilgrimage sites and is traditionally regarded as the place where Gautama Buddha attained enlightenment." },
  { question: "Which famous Sikh place of worship in Patna is associated with Guru Gobind Singh?", options: ["Takht Sri Patna Sahib", "Golden Temple", "Bangla Sahib", "Hemkund Sahib"], answer: "Takht Sri Patna Sahib", hint1: "Think of Patna's important Sikh pilgrimage site.", hint2: "Its name includes Patna Sahib.", fact: "Takht Sri Patna Sahib is an important Sikh pilgrimage site and is traditionally regarded as the birthplace of Guru Gobind Singh." },
  { question: "Which traditional festival is widely celebrated in Bihar and Patna with prayers offered to the Sun God?", options: ["Chhath Puja", "Onam", "Baisakhi", "Pongal"], answer: "Chhath Puja", hint1: "Think of Bihar's famous Sun-worship festival.", hint2: "It begins with Chhath.", fact: "Chhath Puja is a major festival of Bihar in which devotees offer prayers to the Sun God and observe rituals near rivers and water bodies." },
  { question: "Patna is the capital city of which Indian state?", options: ["Bihar", "Jharkhand", "Uttar Pradesh", "West Bengal"], answer: "Bihar", hint1: "Think of the state where Patna is located.", hint2: "Its name begins with B.", fact: "Patna is the capital and one of the major cultural, historical and educational centres of Bihar." },
];

/* =========================================================
   TIME TREK — KOLKATA
========================================================= */

const KOLKATA_TIME_TREK: TimeTrekQuestion[] = [
  {
    question: "Which famous monument is one of the most important landmarks of Kolkata?",
    options: ["Victoria Memorial", "Hawa Mahal", "Golden Temple", "Charminar"],
    answer: "Victoria Memorial",
    hint1: "Think of Kolkata's famous white marble monument.",
    hint2: "It was built in memory of Queen Victoria.",
    fact: "Victoria Memorial is a famous marble monument and museum located in Kolkata.",
  },
  {
    question: "Which river flows beside Kolkata?",
    options: ["Hooghly River", "Ganga River", "Yamuna River", "Godavari River"],
    answer: "Hooghly River",
    hint1: "Think of the major river along Kolkata.",
    hint2: "Its name begins with H.",
    fact: "The Hooghly River is a major river that flows along Kolkata and is an important part of the city's history.",
  },
  {
    question: "Which famous temple in Kolkata is dedicated to Goddess Kali?",
    options: ["Kalighat Kali Temple", "Meenakshi Temple", "Golden Temple", "Somnath Temple"],
    answer: "Kalighat Kali Temple",
    hint1: "Think of Kolkata's famous Kali temple.",
    hint2: "Its name begins with Kalighat.",
    fact: "Kalighat Kali Temple is one of the most famous Hindu temples in Kolkata and is dedicated to Goddess Kali.",
  },
  {
    question: "Which festival is celebrated with great enthusiasm in Kolkata?",
    options: ["Durga Puja", "Baisakhi", "Onam", "Pongal"],
    answer: "Durga Puja",
    hint1: "Think of Kolkata's most famous festival.",
    hint2: "It celebrates Goddess Durga.",
    fact: "Durga Puja is one of the biggest and most important festivals celebrated in Kolkata.",
  },
  {
    question: "Which famous bridge connects Kolkata with Howrah?",
    options: ["Howrah Bridge", "Bandra-Worli Sea Link", "Golden Gate Bridge", "Pamban Bridge"],
    answer: "Howrah Bridge",
    hint1: "Think of Kolkata's iconic bridge over the Hooghly.",
    hint2: "Its name begins with Howrah.",
    fact: "Howrah Bridge, officially known as Rabindra Setu, is one of Kolkata's most recognizable landmarks.",
  },
  {
    question: "Which traditional Bengali sweet is strongly associated with Kolkata?",
    options: ["Rasgulla", "Mysore Pak", "Dhokla", "Amritsari Kulcha"],
    answer: "Rasgulla",
    hint1: "Think of a famous Bengali syrupy sweet.",
    hint2: "Its name begins with Ras.",
    fact: "Rasgulla is a popular Bengali sweet made from chhena and soaked in sugar syrup.",
  },
  {
    question: "Which famous place in Kolkata is associated with Mother Teresa?",
    options: ["Mother House", "City Palace", "Amber Fort", "Jallianwala Bagh"],
    answer: "Mother House",
    hint1: "Think of the Kolkata place associated with Mother Teresa.",
    hint2: "Its name begins with Mother.",
    fact: "Mother House in Kolkata is associated with Mother Teresa and the Missionaries of Charity.",
  },
  {
    question: "Which famous stadium in Kolkata is known for cricket?",
    options: ["Eden Gardens", "Wankhede Stadium", "M. Chinnaswamy Stadium", "Rajiv Gandhi International Stadium"],
    answer: "Eden Gardens",
    hint1: "Think of Kolkata's famous cricket stadium.",
    hint2: "Its name contains the word Gardens.",
    fact: "Eden Gardens is a famous cricket stadium in Kolkata and is one of India's best-known cricket venues.",
  },
];

/* =========================================================
   PIECE OF THE PAST — HYDERABAD
========================================================= */

type PuzzlePiece = {
  id: number;
  correctPosition: number;
};

const HYDERABAD_PERSONALITY_IMAGE =
  "/images/personalities/hyderabad/muhammad-quli-qutb-shah.jpg.jpeg";

const MUHAMMAD_QULI_FACTS = [
  "Muhammad Quli Qutb Shah was the fifth ruler of the Qutb Shahi dynasty.",
  "He founded Hyderabad in 1591 and is traditionally credited with commissioning the Charminar.",
  "He was also a poet who wrote in the Dakhni tradition, reflecting the rich cultural life of the Deccan.",
];

const CHENNAI_PERSONALITY_IMAGE =
  "/images/personalities/chennai/bharatanatyam.jpeg";

const BHARATANATYAM_FACTS = [
  "Bharatanatyam is one of India's major classical dance traditions and is strongly associated with Tamil Nadu.",
  "The dance combines expressive hand gestures, facial expressions, rhythmic footwork, and storytelling.",
  "Chennai is an important centre for Bharatanatyam and other classical performing arts.",
];

const THANJAVUR_PUZZLE_IMAGE =
  "/images/personalities/thanjavur/thanjavurpuzzle.jpg";

const MYSURU_PUZZLE_IMAGE =
  "/images/personalities/mysuru/mysorepuzzle.jpg.webp";

const JAIPUR_PUZZLE_IMAGE =
  "/images/personalities/jaipur/jaipurpuzzle.jpg.jpeg";

const AMRITSAR_PUZZLE_IMAGE =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/cd/40/c9.jpg";

const DELHI_PUZZLE_IMAGE =
  "/images/personalities/delhi/delhi.jpeg";

const AGRA_PUZZLE_IMAGE =
  "/images/personalities/agra/agra.jpeg";

const KOLKATA_WORD_PUZZLE = [
  {
    question:
      "What is the local name for the popular hollow street snack filled with spiced potatoes and tamarind water?",
    answer: "PHUCHKA",
    hint: "GOLGAPPA",
  },
  {
    question:
      "Which famous street food wrap, featuring grilled meat skewered inside a paratha, was invented at Nizam's?",
    answer: "ROLL",
    hint: "KATHI",
  },
  {
    question:
      "What unique ingredient distinguishes a traditional Kolkata Biryani from other regional Indian biryanis?",
    answer: "POTATO",
    hint: "ALOO",
  },
  {
    question:
      "What is the name of the iconic, dark-colored, slow-cooked mutton curry famously served at Golbari?",
    answer: "MANGSHO",
    hint: "KOSHA",
  },
  {
    question:
      "What traditional, deep-fried, puffy flatbread made of all-purpose flour is a staple breakfast item in Bengal?",
    answer: "LUCHI",
    hint: "POORI",
  },
  {
    question:
      "Which highly prized fish is considered the king of fish in Bengal and often cooked in mustard sauce?",
    answer: "HILSA",
    hint: "ILISH",
  },
  {
    question:
      "What is the name of the famous sweet, fermented yogurt traditionally set in clay pots?",
    answer: "DOI",
    hint: "MISHTI",
  },
  {
    question:
      "Which spherical, syrupy cottage cheese sweet is the most globally recognized dessert from Kolkata?",
    answer: "ROSOGOLLA",
    hint: "SPONGE",
  },
] as const;

type WordPuzzleCell = { row: number; col: number; letter: string };
type WordPlacement = { answer: string; cells: Array<[number, number]> };

const WORD_GRID_SIZE = 9;
const WORD_DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

function createKolkataWordGrid(): { grid: WordPuzzleCell[][]; placements: WordPlacement[] } {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const words = [...KOLKATA_WORD_PUZZLE.map((entry) => entry.answer)].sort((a, b) => b.length - a.length);

  for (let restart = 0; restart < 200; restart++) {
    const grid = Array.from({ length: WORD_GRID_SIZE }, (_, row) =>
      Array.from({ length: WORD_GRID_SIZE }, (_, col) => ({ row, col, letter: "" }))
    );
    const placements: WordPlacement[] = [];
    const shuffledDirections = () => [...WORD_DIRECTIONS].sort(() => Math.random() - 0.5);

    const canPlace = (word: string, row: number, col: number, dr: number, dc: number) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= WORD_GRID_SIZE || c < 0 || c >= WORD_GRID_SIZE) return false;
        const existing = grid[r][c].letter;
        if (existing && existing !== word[i]) return false;
      }
      return true;
    };

    const placeWord = (word: string): boolean => {
      const candidates: Array<[number, number, number, number]> = [];
      for (let row = 0; row < WORD_GRID_SIZE; row++) {
        for (let col = 0; col < WORD_GRID_SIZE; col++) {
          for (const [dr, dc] of shuffledDirections()) {
            if (canPlace(word, row, col, dr, dc)) candidates.push([row, col, dr, dc]);
          }
        }
      }
      candidates.sort(() => Math.random() - 0.5);

      for (const [row, col, dr, dc] of candidates) {
        const cells: Array<[number, number]> = [];
        for (let i = 0; i < word.length; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          grid[r][c].letter = word[i];
          cells.push([r, c]);
        }
        placements.push({ answer: word, cells });
        return true;
      }
      return false;
    };

    let success = true;
    for (const word of words) {
      if (!placeWord(word)) {
        success = false;
        break;
      }
    }

    if (!success) continue;

    for (let r = 0; r < WORD_GRID_SIZE; r++) {
      for (let c = 0; c < WORD_GRID_SIZE; c++) {
        if (!grid[r][c].letter) {
          grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    return { grid, placements };
  }

  throw new Error("Could not create the Kolkata word puzzle grid");
}

/* =========================================================
   PIECE OF THE PAST — PATNA WORD PUZZLE
========================================================= */

const PATNA_WORD_PUZZLE = [
  { question: "Which famous dome-shaped structure was built as a granary in Patna?", answer: "GOLGHAR", hint: "HISTORIC GRANARY" },
  { question: "Which historic museum in Patna is famous for its archaeological collections?", answer: "PATNAMUSEUM", hint: "HISTORIC MUSEUM" },
  { question: "Which major sacred river flows through Patna?", answer: "GANGA", hint: "SACRED RIVER" },
  { question: "Which important Buddhist pilgrimage site in Bihar is associated with Buddha's enlightenment?", answer: "BODHGAYA", hint: "BUDDHIST SITE" },
  { question: "Which important Sikh pilgrimage site in Patna is associated with Guru Gobind Singh?", answer: "PATNASAHEB", hint: "SIKH PILGRIMAGE" },
  { question: "Which famous festival in Bihar is dedicated to the worship of the Sun God?", answer: "CHHATHPUJA", hint: "SUN FESTIVAL" },
  { question: "Which famous ancient university in Bihar became a major centre of learning?", answer: "NALANDA", hint: "ANCIENT UNIVERSITY" },
  { question: "Patna is the capital city of which Indian state?", answer: "BIHAR", hint: "INDIAN STATE" },
] as const;

const PATNA_WORD_GRID_SIZE = 12;

function createPatnaWordGrid(): { grid: WordPuzzleCell[][]; placements: WordPlacement[] } {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const words = [...PATNA_WORD_PUZZLE.map((entry) => entry.answer)].sort((a, b) => b.length - a.length);
  for (let restart = 0; restart < 300; restart++) {
    const grid = Array.from({ length: PATNA_WORD_GRID_SIZE }, (_, row) =>
      Array.from({ length: PATNA_WORD_GRID_SIZE }, (_, col) => ({ row, col, letter: "" }))
    );
    const placements: WordPlacement[] = [];
    const canPlace = (word: string, row: number, col: number, dr: number, dc: number) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= PATNA_WORD_GRID_SIZE || c < 0 || c >= PATNA_WORD_GRID_SIZE) return false;
        const existing = grid[r][c].letter;
        if (existing && existing !== word[i]) return false;
      }
      return true;
    };
    const placeWord = (word: string) => {
      const candidates: Array<[number, number, number, number]> = [];
      for (let row = 0; row < PATNA_WORD_GRID_SIZE; row++) for (let col = 0; col < PATNA_WORD_GRID_SIZE; col++) {
        for (const [dr, dc] of WORD_DIRECTIONS) if (canPlace(word, row, col, dr, dc)) candidates.push([row, col, dr, dc]);
      }
      candidates.sort(() => Math.random() - 0.5);
      if (!candidates.length) return false;
      const [row, col, dr, dc] = candidates[0];
      const cells: Array<[number, number]> = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        grid[r][c].letter = word[i]; cells.push([r, c]);
      }
      placements.push({ answer: word, cells });
      return true;
    };
    if (!words.every(placeWord)) continue;
    for (let r = 0; r < PATNA_WORD_GRID_SIZE; r++) for (let c = 0; c < PATNA_WORD_GRID_SIZE; c++) {
      if (!grid[r][c].letter) grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return { grid, placements };
  }
  throw new Error("Could not create the Patna word puzzle grid");
}

const BHUBANESWAR_WORD_PUZZLE = [
  { question: "Which famous ancient temple is one of the most important landmarks of Bhubaneswar?", answer: "LINGARAJ", hint: "SHIVA TEMPLE" },
  { question: "Which famous temple near Bhubaneswar is designed in the shape of a giant chariot?", answer: "KONARK", hint: "SUN TEMPLE" },
  { question: "Which classical dance form originated in Odisha?", answer: "ODISSI", hint: "CLASSICAL DANCE" },
  { question: "Which famous chariot festival is celebrated with great enthusiasm in Odisha?", answer: "RATHYATRA", hint: "JAGANNATH" },
  { question: "What traditional Odisha painting style is famous for detailed artwork on cloth?", answer: "PATTACHITRA", hint: "CLOTH PAINTING" },
  { question: "Which famous peace monument near Bhubaneswar is associated with Emperor Ashoka?", answer: "DHAULI", hint: "PEACE STUPA" },
  { question: "Which ancient caves near Bhubaneswar are associated with Jain traditions?", answer: "KHANDAGIRI", hint: "CAVES" },
  { question: "Which famous Odia sweet is made from cottage cheese and sugar syrup?", answer: "CHHENAPODA", hint: "CHEESECAKE" },
] as const;

const BHUBANESWAR_WORD_GRID_SIZE = 12;

function createBhubaneswarWordGrid(): { grid: WordPuzzleCell[][]; placements: WordPlacement[] } {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const words = [...BHUBANESWAR_WORD_PUZZLE.map((entry) => entry.answer)].sort((a, b) => b.length - a.length);
  for (let restart = 0; restart < 300; restart++) {
    const grid = Array.from({ length: BHUBANESWAR_WORD_GRID_SIZE }, (_, row) =>
      Array.from({ length: BHUBANESWAR_WORD_GRID_SIZE }, (_, col) => ({ row, col, letter: "" }))
    );
    const placements: WordPlacement[] = [];
    const canPlace = (word: string, row: number, col: number, dr: number, dc: number) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= BHUBANESWAR_WORD_GRID_SIZE || c < 0 || c >= BHUBANESWAR_WORD_GRID_SIZE) return false;
        const existing = grid[r][c].letter;
        if (existing && existing !== word[i]) return false;
      }
      return true;
    };
    const placeWord = (word: string) => {
      const candidates: Array<[number, number, number, number]> = [];
      for (let row = 0; row < BHUBANESWAR_WORD_GRID_SIZE; row++) for (let col = 0; col < BHUBANESWAR_WORD_GRID_SIZE; col++) {
        for (const [dr, dc] of WORD_DIRECTIONS) if (canPlace(word, row, col, dr, dc)) candidates.push([row, col, dr, dc]);
      }
      candidates.sort(() => Math.random() - 0.5);
      if (!candidates.length) return false;
      const [row, col, dr, dc] = candidates[0];
      const cells: Array<[number, number]> = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        grid[r][c].letter = word[i]; cells.push([r, c]);
      }
      placements.push({ answer: word, cells });
      return true;
    };
    if (!words.every(placeWord)) continue;
    for (let r = 0; r < BHUBANESWAR_WORD_GRID_SIZE; r++) for (let c = 0; c < BHUBANESWAR_WORD_GRID_SIZE; c++) {
      if (!grid[r][c].letter) grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return { grid, placements };
  }
  throw new Error("Could not create the Bhubaneswar word puzzle grid");
}

const PURI_WORD_PUZZLE = [
  { question: "Which famous temple is the most important cultural and religious landmark of Puri?", answer: "JAGANNATH", hint: "FAMOUS TEMPLE" },
  { question: "Which famous festival features huge chariots carrying Lord Jagannath and other deities?", answer: "RATHYATRA", hint: "CHARIOT FESTIVAL" },
  { question: "Which popular coastal attraction is located in Puri?", answer: "PURIBEACH", hint: "SEA SHORE" },
  { question: "Which famous sweet is traditionally associated with Puri?", answer: "KHAJA", hint: "FAMOUS SWEET" },
  { question: "Which traditional Odisha painting style is famous in the Puri region?", answer: "PATTACHITRA", hint: "CLOTH PAINTING" },
  { question: "What is the name of the three principal deities worshipped at the Jagannath Temple?", answer: "TRIDEITIES", hint: "THREE DEITIES" },
  { question: "Which deity is the presiding deity of the famous temple in Puri?", answer: "JAGANNATH", hint: "LORD OF THE UNIVERSE" },
  { question: "Which state is Puri located in?", answer: "ODISHA", hint: "EASTERN INDIAN STATE" },
] as const;

const PURI_WORD_GRID_SIZE = 12;

function createPuriWordGrid(): { grid: WordPuzzleCell[][]; placements: WordPlacement[] } {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const words = [...PURI_WORD_PUZZLE.map((entry) => entry.answer)].sort((a, b) => b.length - a.length);
  for (let restart = 0; restart < 300; restart++) {
    const grid = Array.from({ length: PURI_WORD_GRID_SIZE }, (_, row) =>
      Array.from({ length: PURI_WORD_GRID_SIZE }, (_, col) => ({ row, col, letter: "" }))
    );
    const placements: WordPlacement[] = [];
    const canPlace = (word: string, row: number, col: number, dr: number, dc: number) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= PURI_WORD_GRID_SIZE || c < 0 || c >= PURI_WORD_GRID_SIZE) return false;
        const existing = grid[r][c].letter;
        if (existing && existing !== word[i]) return false;
      }
      return true;
    };
    const placeWord = (word: string) => {
      const candidates: Array<[number, number, number, number]> = [];
      for (let row = 0; row < PURI_WORD_GRID_SIZE; row++) for (let col = 0; col < PURI_WORD_GRID_SIZE; col++) {
        for (const [dr, dc] of WORD_DIRECTIONS) if (canPlace(word, row, col, dr, dc)) candidates.push([row, col, dr, dc]);
      }
      candidates.sort(() => Math.random() - 0.5);
      if (!candidates.length) return false;
      const [row, col, dr, dc] = candidates[0];
      const cells: Array<[number, number]> = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        grid[r][c].letter = word[i]; cells.push([r, c]);
      }
      placements.push({ answer: word, cells });
      return true;
    };
    if (!words.every(placeWord)) continue;
    for (let r = 0; r < PURI_WORD_GRID_SIZE; r++) for (let c = 0; c < PURI_WORD_GRID_SIZE; c++) {
      if (!grid[r][c].letter) grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return { grid, placements };
  }
  throw new Error("Could not create the Puri word puzzle grid");
}

const createPuzzlePieces = (pieceCount = 16): PuzzlePiece[] =>
  [...Array(pieceCount)].map((_, index) => ({
    id: index,
    correctPosition: index,
  })).sort(() => Math.random() - 0.5);

/* =========================================================
   CULTURE QUEST — HYDERABAD
========================================================= */

type CultureQuestItem = {
  id: number;
  item: string;
  connection: string;
};

const HYDERABAD_CULTURE_QUEST: CultureQuestItem[] = [
  {
    id: 1,
    item: "Bonalu",
    connection: "A Telangana festival dedicated to Goddess Mahankali."
  },
  {
    id: 2,
    item: "Bathukamma",
    connection: "A colourful floral festival celebrated especially by women in Telangana."
  },
  {
    id: 3,
    item: "Hyderabadi Biryani",
    connection: "A famous rice dish associated with Hyderabad's culinary heritage."
  },
  {
    id: 4,
    item: "Laad Bazaar",
    connection: "A historic market near Charminar known for bangles and traditional goods."
  },
  {
    id: 5,
    item: "Pearls",
    connection: "Hyderabad is popularly known as the City of Pearls because of its long pearl-trading tradition."
  },
  {
    id: 6,
    item: "Dakhni",
    connection: "A historic literary and linguistic tradition that developed in the Deccan and is linked with Hyderabad's cultural history."
  },
];

const CHENNAI_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Fort St. George", connection: "Historic British fort" },
  { id: 2, item: "Kapaleeshwarar Temple", connection: "Famous Shiva temple" },
  { id: 3, item: "San Thome Basilica", connection: "Basilica associated with St. Thomas" },
  { id: 4, item: "Mahabalipuram", connection: "Ancient rock-cut temples" },
  { id: 5, item: "Shore Temple", connection: "Pallava-era temple near the sea" },
  { id: 6, item: "Arjuna's Penance", connection: "Famous rock relief" },
  { id: 7, item: "Thousand Lights Mosque", connection: "Historic mosque in Chennai" },
  { id: 8, item: "Madras High Court", connection: "Indo-Saracenic architecture" },
  { id: 9, item: "Valluvar Kottam", connection: "Monument dedicated to Thiruvalluvar" },
  { id: 10, item: "Government Museum, Chennai", connection: "Famous museum with historical collections" },
];

const THANJAVUR_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Brihadeeswarar Temple", connection: "Famous Chola temple built by Raja Raja Chola I" },
  { id: 2, item: "Thanjavur Painting", connection: "Traditional art form with gold foil decoration" },
  { id: 3, item: "Thanjavur Doll", connection: "Traditional dancing doll associated with Thanjavur" },
  { id: 4, item: "Thanjavur Veena", connection: "Traditional South Indian musical instrument" },
  { id: 5, item: "Gangaikonda Cholapuram", connection: "Famous Chola temple complex built by Rajendra Chola I" },
  { id: 6, item: "Chola Culture", connection: "Heritage associated with the Chola dynasty" },
];

const MYSURU_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Mysore Palace", connection: "Famous royal palace and major landmark of Mysore" },
  { id: 2, item: "Chamundi Hill", connection: "Hill famous for the Chamundeshwari Temple" },
  { id: 3, item: "Mysore Dasara", connection: "Famous festival celebrated grandly in Mysore" },
  { id: 4, item: "Mysore Silk", connection: "Famous traditional silk sarees associated with Mysore" },
  { id: 5, item: "Mysore Sandalwood", connection: "Famous traditional product associated with Mysore" },
  { id: 6, item: "Wodeyar Dynasty", connection: "Royal dynasty that ruled the Kingdom of Mysore" },
];

const JAIPUR_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Hawa Mahal", connection: "Famous palace known as the Palace of Winds" },
  { id: 2, item: "Amber Fort", connection: "Historic hill fort known for Rajput architecture" },
  { id: 3, item: "City Palace", connection: "Famous royal palace complex in the heart of Jaipur" },
  { id: 4, item: "Jantar Mantar", connection: "Astronomical observatory with large scientific instruments" },
  { id: 5, item: "Jaipur Blue Pottery", connection: "Traditional craft famous for its blue designs" },
  { id: 6, item: "Gangaur Festival", connection: "Traditional festival celebrated with great enthusiasm in Rajasthan" },
];

const AMRITSAR_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Golden Temple", connection: "Famous Sikh shrine also known as Sri Harmandir Sahib" },
  { id: 2, item: "Jallianwala Bagh", connection: "Historic site associated with the 1919 massacre" },
  { id: 3, item: "Wagah-Attari Border", connection: "Famous border area known for the flag-lowering ceremony" },
  { id: 4, item: "Baisakhi", connection: "Important harvest festival celebrated in Punjab" },
  { id: 5, item: "Bhangra", connection: "Energetic traditional folk dance of Punjab" },
  { id: 6, item: "Amritsari Kulcha", connection: "Popular stuffed flatbread associated with Amritsar" },
];

const DELHI_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Purana Qila", connection: "Historic old fort in Delhi" },
  { id: 2, item: "Humayun’s Tomb", connection: "Tomb of Mughal Emperor Humayun" },
  { id: 3, item: "Safdarjung’s Tomb", connection: "Mughal-era tomb" },
  { id: 4, item: "Jama Masjid", connection: "Famous mosque in Old Delhi" },
  { id: 5, item: "Lotus Temple", connection: "Baháʼí House of Worship" },
  { id: 6, item: "Gurudwara Bangla Sahib", connection: "Sikh place of worship" },
];


const AGRA_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Taj Mahal", connection: "Famous Mughal monument and symbol of love" },
  { id: 2, item: "Agra Petha", connection: "Famous traditional sweet of Agra" },
  { id: 3, item: "Agra Fort", connection: "Historic Mughal fort associated with Agra" },
  { id: 4, item: "Shah Jahan", connection: "Mughal emperor who commissioned the Taj Mahal" },
  { id: 5, item: "Fatehpur Sikri", connection: "UNESCO World Heritage Site near Agra" },
  { id: 6, item: "Yamuna River", connection: "River flowing through Agra beside the Taj Mahal" },
  { id: 7, item: "Mehtab Bagh", connection: "Historic garden across the Yamuna from the Taj Mahal" },
  { id: 8, item: "Akbar", connection: "Mughal ruler closely associated with Agra and Fatehpur Sikri" },
  { id: 9, item: "Dalmoth", connection: "Famous spicy snack associated with Agra" },
  { id: 10, item: "Itmad-ud-Daulah's Tomb", connection: "Historic tomb often known as the Baby Taj" },
];

const KOLKATA_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Indian Museum", connection: "One of the oldest and largest museums in India" },
  { id: 2, item: "College Street", connection: "Famous Kolkata area known for its large number of bookstores" },
  { id: 3, item: "Rabindranath Tagore", connection: "Bengali author who wrote the novel Gora" },
  { id: 4, item: "Dakshineswar Kali Temple", connection: "Famous temple located on the eastern bank of the Hooghly River" },
  { id: 5, item: "Victoria Memorial", connection: "Famous building built in memory of Queen Victoria" },
  { id: 6, item: "Panta Bhat", connection: "Traditional Bengali food made from fermented rice" },
  { id: 7, item: "Marble Palace", connection: "Historic Kolkata palace known for its grand collection of art and antiques" },
  { id: 8, item: "Durga Puja", connection: "Festival that transforms Kolkata with decorated pandals and artistic Durga idols" },
];

const PATNA_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Golghar", connection: "Historic granary with a large dome-shaped structure in Patna" },
  { id: 2, item: "Patna Museum", connection: "Historic museum in Patna known for its archaeological collections" },
  { id: 3, item: "Ganga River", connection: "Major sacred river flowing through Patna" },
  { id: 4, item: "Bodh Gaya", connection: "Important Buddhist pilgrimage site associated with Buddha's enlightenment" },
  { id: 5, item: "Takht Sri Patna Sahib", connection: "Important Sikh pilgrimage site and birthplace of Guru Gobind Singh" },
  { id: 6, item: "Chhath Puja", connection: "Famous festival dedicated to the worship of the Sun God" },
];


const BHUBANESWAR_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Lingaraj Temple", connection: "Famous ancient temple dedicated to Lord Shiva" },
  { id: 2, item: "Konark Sun Temple", connection: "Famous Sun Temple built in the form of a chariot" },
  { id: 3, item: "Dhauli Shanti Stupa", connection: "Buddhist peace monument associated with Emperor Ashoka" },
  { id: 4, item: "Odissi", connection: "Classical dance form of Odisha" },
  { id: 5, item: "Rath Yatra", connection: "Famous chariot festival celebrated in Odisha" },
  { id: 6, item: "Khandagiri and Udayagiri Caves", connection: "Ancient caves associated with Jainism" },
];

const PURI_CULTURE_QUEST: CultureQuestItem[] = [
  { id: 1, item: "Jagannath Temple", connection: "Famous temple dedicated to Lord Jagannath" },
  { id: 2, item: "Rath Yatra", connection: "Famous chariot festival celebrated in Puri" },
  { id: 3, item: "Puri Beach", connection: "Popular beach located on the coast of Odisha" },
  { id: 4, item: "Khaja", connection: "Famous crispy sweet associated with Puri" },
  { id: 5, item: "Pattachitra", connection: "Traditional Odisha painting style done on cloth" },
  { id: 6, item: "Jagannath, Balabhadra and Subhadra", connection: "Three principal deities worshipped at Jagannath Temple" },
];


/* =========================================================
   HERITAGE MAZE DATA
========================================================= */

type MazeLevel = {
  id: number;
  title: string;
  destination: string;
  monument: string;
  difficulty: string;
  size: number;
  description: string;
  background: string;
  accent: string;
  wall: string;
  floor: string;
};

const MAZE_LEVELS: MazeLevel[] = [
  {
    id: 1,
    title: "Enchanted Garden",
    destination: "Taj Mahal",
    monument: "🕌",
    difficulty: "Easy",
    size: 9,
    description: "Find your way through the enchanted gardens of Agra.",
    background:
      "radial-gradient(circle at 50% 20%, #dff6d5 0%, #8fbd7b 45%, #365b3a 100%)",
    accent: "#f7d774",
    wall: "#5a4b32",
    floor: "#dce9c8",
  },
  {
    id: 2,
    title: "Royal Torchlight",
    destination: "Red Fort",
    monument: "🏰",
    difficulty: "Medium",
    size: 11,
    description: "Follow the royal path beneath the torchlight.",
    background:
      "radial-gradient(circle at 50% 20%, #f6c47c 0%, #9b4b35 48%, #3d1716 100%)",
    accent: "#ffd66b",
    wall: "#57382b",
    floor: "#ead1aa",
  },
  {
    id: 3,
    title: "Mystic Deccan",
    destination: "Charminar",
    monument: "🕌",
    difficulty: "Medium-Hard",
    size: 13,
    description: "Enter the mystical Deccan and find the Charminar.",
    background:
      "radial-gradient(circle at 50% 20%, #6c5b9e 0%, #33245b 50%, #100c24 100%)",
    accent: "#cdb7ff",
    wall: "#3c3156",
    floor: "#d8d0e8",
  },
  {
    id: 4,
    title: "Ancient Energy",
    destination: "Konark Sun Temple",
    monument: "☀️",
    difficulty: "Hard",
    size: 15,
    description: "Navigate the ancient paths glowing with golden energy.",
    background:
      "radial-gradient(circle at 50% 20%, #ffe9a6 0%, #c88727 45%, #5a2c10 100%)",
    accent: "#fff0a3",
    wall: "#62452b",
    floor: "#f0dca7",
  },
  {
    id: 5,
    title: "Royal Mirage",
    destination: "Hawa Mahal",
    monument: "🪟",
    difficulty: "Challenge",
    size: 17,
    description: "Cross the royal mirage and reach Hawa Mahal.",
    background:
      "radial-gradient(circle at 50% 20%, #f4b6d5 0%, #8e4d86 48%, #321c48 100%)",
    accent: "#ffd6ed",
    wall: "#56364e",
    floor: "#ead1df",
  },
];

/* =========================================================
   MAZE GENERATOR
========================================================= */

type MazeCell = 0 | 1;

type MazePoint = {
  row: number;
  col: number;
};

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateMaze(size: number, seed: number): MazeCell[][] {
  const grid: MazeCell[][] = Array.from({ length: size }, () =>
    Array(size).fill(1)
  );

  const random = createSeededRandom(seed);

  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  const shuffleDirections = () => {
    const shuffled = [...directions];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };

  const stack: MazePoint[] = [{ row: 1, col: 1 }];

  grid[1][1] = 0;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    const possible = shuffleDirections().filter(([dr, dc]) => {
      const nr = current.row + dr;
      const nc = current.col + dc;

      return (
        nr > 0 &&
        nr < size - 1 &&
        nc > 0 &&
        nc < size - 1 &&
        grid[nr][nc] === 1
      );
    });

    if (possible.length === 0) {
      stack.pop();
      continue;
    }

    const [dr, dc] = possible[0];

    const wallRow = current.row + dr / 2;
    const wallCol = current.col + dc / 2;

    const nextRow = current.row + dr;
    const nextCol = current.col + dc;

    grid[wallRow][wallCol] = 0;
    grid[nextRow][nextCol] = 0;

    stack.push({
      row: nextRow,
      col: nextCol,
    });
  }

  grid[size - 2][size - 2] = 0;
  grid[size - 2][size - 3] = 0;
  grid[size - 3][size - 2] = 0;

  return grid;
}

function getMazeCoins(
  grid: MazeCell[][],
  levelId: number
): MazePoint[] {
  const size = grid.length;

  const openCells: MazePoint[] = [];

  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      if (grid[row][col] === 0) {
        if (
          !(row === 1 && col === 1) &&
          !(row === size - 2 && col === size - 2)
        ) {
          openCells.push({ row, col });
        }
      }
    }
  }

  const random = createSeededRandom(levelId * 773);

  for (let i = openCells.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [openCells[i], openCells[j]] = [
      openCells[j],
      openCells[i],
    ];
  }

  return openCells.slice(0, 3);
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [nickname, setNickname] = useState("");
  const [explorer, setExplorer] = useState<Explorer>("girl");
  const [hyderabadHeritageUnlocked, setHyderabadHeritageUnlocked] = useState(false);

  const [profileReturnScreen, setProfileReturnScreen] =
    useState<"landing" | "activities" | "arcade">("landing");

  /* =======================================================
     MUSIC
  ======================================================= */

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(true);

  useEffect(() => {
    const audio = musicRef.current;

    if (!audio) return;

    audio.volume = 0.6;
    audio.load();
  }, []);

  const startMusic = () => {
    const audio = musicRef.current;

    if (!audio || !isMusicOn) return;

    audio.volume = 0.6;

    if (audio.readyState === 0) {
      audio.load();
    }

    audio.play().catch(() => {
      // Playback is started again by the visible music button if the browser blocks it.
    });
  };

  const stopMusic = () => {
    if (!musicRef.current) return;

    musicRef.current.pause();
    musicRef.current.currentTime = 0;
  };

  const toggleMusic = () => {
    if (!musicRef.current) return;

    if (isMusicOn) {
      musicRef.current.pause();
      setIsMusicOn(false);
    } else {
      musicRef.current.volume = 0.6;

      if (musicRef.current.readyState === 0) {
        musicRef.current.load();
      }

      musicRef.current
        .play()
        .then(() => {
          setIsMusicOn(true);
        })
        .catch(() => {
          // Keep the music button available for another user interaction.
        });
    }
  };

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {
    document.title = "Explore Bharat";
  }, []);

  /* =======================================================
     30-MINUTE COUNTDOWN TIMER
  ======================================================= */

  const [sessionActive, setSessionActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(BREAK_INTERVAL_SECONDS);
  const [showBreakModal, setShowBreakModal] = useState(false);

  useEffect(() => {
    if (!sessionActive || showBreakModal) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, showBreakModal]);

  useEffect(() => {
    if (!sessionActive || remainingSeconds > 0 || showBreakModal) return;

    setSessionActive(false);
    stopMusic();
    setScreen("landing");
    setShowBreakModal(true);
  }, [remainingSeconds, sessionActive, showBreakModal]);

  const startSession = () => {
    setSessionActive(true);
    setRemainingSeconds(BREAK_INTERVAL_SECONDS);
    setShowBreakModal(false);
  };

  const closeTimedSession = () => {
    setShowBreakModal(false);
    setSessionActive(false);
    setRemainingSeconds(BREAK_INTERVAL_SECONDS);
    stopMusic();
    setScreen("landing");
  };

  /* =======================================================
     JOURNEY XP
  ======================================================= */

  const [journeyGameXP, setJourneyGameXP] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("exploreBharatJourneyGameXP");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setJourneyGameXP(parsed);
        }
      }
    } catch {
      // Start with an empty journey XP record if saved data is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "exploreBharatJourneyGameXP",
        JSON.stringify(journeyGameXP)
      );
    } catch {
      // XP still works for the current session if storage is unavailable.
    }
  }, [journeyGameXP]);

  const awardJourneyXP = (
    place: string,
    game: keyof typeof GAME_LABELS,
    amount: number,
    gameMaximum: number
  ) => {
    const key = gameKey(place, game);
    setJourneyGameXP((previous) => {
      const current = previous[key] || 0;
      const updated = Math.min(current + amount, gameMaximum);
      if (updated === current) return previous;
      return { ...previous, [key]: updated };
    });
  };

  const getGameXP = (place: string, game: keyof typeof GAME_LABELS) =>
    journeyGameXP[gameKey(place, game)] || 0;

  const overallJourneyXP = Math.min(
    MAX_JOURNEY_XP,
    Object.values(journeyGameXP).reduce<number>((total, value) => total + Number(value), 0)
  );

  const nextScreen = (next: Screen) => {
    setScreen(next);
  };

  const getBackScreen = (): Screen => {
    switch (screen) {
      case "welcome": return "landing";
      case "nickname": return "welcome";
      case "personal": return "nickname";
      case "region": return "personal";
      case "places": return "region";
      case "activities": return "places";
      case "timeTrek":
      case "pieceOfPast":
      case "cultureQuest":
      case "heritageCard": return "activities";
      case "arcade": return "landing";
      case "memoryLevels": return "arcade";
      case "memory": return "memoryLevels";
      case "maze": return "arcade";
      default: return "landing";
    }
  };

  /* =======================================================
     MEMORY MATCH
  ======================================================= */

  const [selectedMemoryLevel, setSelectedMemoryLevel] = useState(1);

  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>(() =>
    createMemoryCards(1)
  );

  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);

  const resetMemoryGame = (levelId = selectedMemoryLevel) => {
    setSelectedMemoryLevel(levelId);
    setMemoryCards(createMemoryCards(levelId));
    setFlippedCards([]);
    setMemoryMoves(0);
    setMemoryScore(0);
  };

  const openMemoryLevel = (levelId: number) => {
    resetMemoryGame(levelId);
    nextScreen("memory");
  };

  const handleMemoryCardClick = (id: number) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      memoryCards.find((card) => card.id === id)?.matched
    ) {
      return;
    }

    const newFlipped = [...flippedCards, id];

    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((prev) => prev + 1);

      const first = memoryCards.find(
        (card) => card.id === newFlipped[0]
      );

      const second = memoryCards.find(
        (card) => card.id === newFlipped[1]
      );

      if (first && second && first.pairId === second.pairId) {
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((card) =>
              newFlipped.includes(card.id)
                ? { ...card, matched: true }
                : card
            )
          );

          setFlippedCards([]);
          setMemoryScore((prev) => prev + 10);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const currentMemoryLevel = MEMORY_LEVELS.find(
    (level) => level.id === selectedMemoryLevel
  );

  const completedPairs =
    memoryCards.filter((card) => card.matched).length / 2;

  const memoryComplete =
    memoryCards.length > 0 &&
    memoryCards.every((card) => card.matched);

  /* =======================================================
     TIME TREK — HYDERABAD
  ======================================================= */

  const [timeTrekQuestion, setTimeTrekQuestion] = useState(0);
  const [timeTrekSelected, setTimeTrekSelected] = useState("");
  const [timeTrekHint, setTimeTrekHint] = useState(0);
  const [timeTrekAnswered, setTimeTrekAnswered] = useState(false);
  const [timeTrekScore, setTimeTrekScore] = useState(0);
  const [timeTrekComplete, setTimeTrekComplete] = useState(false);
  const [chennaiTimeTrekComplete, setChennaiTimeTrekComplete] = useState(false);
  const [thanjavurTimeTrekComplete, setThanjavurTimeTrekComplete] = useState(false);
  const [mysuruTimeTrekComplete, setMysuruTimeTrekComplete] = useState(false);
  const [jaipurTimeTrekComplete, setJaipurTimeTrekComplete] = useState(false);
  const [amritsarTimeTrekComplete, setAmritsarTimeTrekComplete] = useState(false);
  const [delhiTimeTrekComplete, setDelhiTimeTrekComplete] = useState(false);
  const [agraTimeTrekComplete, setAgraTimeTrekComplete] = useState(false);
  const [kolkataTimeTrekComplete, setKolkataTimeTrekComplete] = useState(false);
  const [patnaTimeTrekComplete, setPatnaTimeTrekComplete] = useState(false);
  const [puriTimeTrekComplete, setPuriTimeTrekComplete] = useState(false);
  const [bhubaneswarTimeTrekComplete, setBhubaneswarTimeTrekComplete] = useState(false);

  const resetTimeTrek = () => {
    setTimeTrekQuestion(0);
    setTimeTrekSelected("");
    setTimeTrekHint(0);
    setTimeTrekAnswered(false);
    setTimeTrekScore(0);
    setTimeTrekComplete(false);
  };

  const openTimeTrek = () => {
    setSelectedPlace("Hyderabad");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openChennaiTimeTrek = () => {
    setSelectedPlace("Chennai");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openThanjavurTimeTrek = () => {
    setSelectedPlace("Thanjavur");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openMysuruTimeTrek = () => {
    setSelectedPlace("Mysuru");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openJaipurTimeTrek = () => {
    setSelectedPlace("Jaipur");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openAmritsarTimeTrek = () => {
    setSelectedPlace("Amritsar");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openDelhiTimeTrek = () => {
    setSelectedPlace("Delhi");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openAgraTimeTrek = () => {
    setSelectedPlace("Agra");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openKolkataTimeTrek = () => {
    setSelectedPlace("Kolkata");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openPatnaTimeTrek = () => {
    setSelectedPlace("Patna");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openPuriTimeTrek = () => {
    setSelectedPlace("Puri");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const openBhubaneswarTimeTrek = () => {
    setSelectedPlace("Bhubaneswar");
    resetTimeTrek();
    nextScreen("timeTrek");
  };

  const currentTimeTrekData =
    selectedPlace === "Chennai"
      ? CHENNAI_TIME_TREK
      : selectedPlace === "Thanjavur"
        ? THANJAVUR_TIME_TREK
        : selectedPlace === "Mysuru"
          ? MYSURU_TIME_TREK
          : selectedPlace === "Jaipur"
            ? JAIPUR_TIME_TREK
            : selectedPlace === "Amritsar"
              ? AMRITSAR_TIME_TREK
              : selectedPlace === "Delhi"
                ? DELHI_TIME_TREK
                : selectedPlace === "Agra"
                  ? AGRA_TIME_TREK
                  : selectedPlace === "Kolkata"
                    ? KOLKATA_TIME_TREK
                    : selectedPlace === "Patna"
                      ? PATNA_TIME_TREK
                      : selectedPlace === "Puri"
                        ? PURI_TIME_TREK
                        : selectedPlace === "Bhubaneswar"
                          ? BHUBANESWAR_TIME_TREK
                          : HYDERABAD_TIME_TREK;

  const handleTimeTrekAnswer = (option: string) => {
    if (timeTrekAnswered || timeTrekComplete) return;

    const current = currentTimeTrekData[timeTrekQuestion];
    setTimeTrekSelected(option);
    setTimeTrekAnswered(true);

    if (option === current.answer) {
      setTimeTrekScore((prev) => prev + 5);
      awardJourneyXP(selectedPlace, "timeTrek", 5, currentTimeTrekData.length * 5);
    }
  };

  const nextTimeTrekQuestion = () => {
    if (!timeTrekAnswered) return;

    if (timeTrekQuestion >= currentTimeTrekData.length - 1) {
      setTimeTrekComplete(true);
      if (selectedPlace === "Chennai") {
        setChennaiTimeTrekComplete(true);
      } else if (selectedPlace === "Thanjavur") {
        setThanjavurTimeTrekComplete(true);
      } else if (selectedPlace === "Mysuru") {
        setMysuruTimeTrekComplete(true);
      } else if (selectedPlace === "Jaipur") {
        setJaipurTimeTrekComplete(true);
      } else if (selectedPlace === "Amritsar") {
        setAmritsarTimeTrekComplete(true);
      } else if (selectedPlace === "Delhi") {
        setDelhiTimeTrekComplete(true);
      } else if (selectedPlace === "Agra") {
        setAgraTimeTrekComplete(true);
      } else if (selectedPlace === "Kolkata") {
        setKolkataTimeTrekComplete(true);
      } else if (selectedPlace === "Patna") {
        setPatnaTimeTrekComplete(true);
      } else if (selectedPlace === "Puri") {
        setPuriTimeTrekComplete(true);
      } else if (selectedPlace === "Bhubaneswar") {
        setBhubaneswarTimeTrekComplete(true);
      }
      return;
    }

    setTimeTrekQuestion((prev) => prev + 1);
    setTimeTrekSelected("");
    setTimeTrekHint(0);
    setTimeTrekAnswered(false);
  };

  const currentTimeTrekQuestion =
    currentTimeTrekData[timeTrekQuestion];

  /* =======================================================
     PIECE OF THE PAST
  ======================================================= */

  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>(() =>
    createPuzzlePieces()
  );
  const [draggedPuzzleIndex, setDraggedPuzzleIndex] = useState<number | null>(null);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [chennaiPuzzleComplete, setChennaiPuzzleComplete] = useState(false);
  const [thanjavurPuzzleComplete, setThanjavurPuzzleComplete] = useState(false);
  const [mysuruPuzzleComplete, setMysuruPuzzleComplete] = useState(false);
  const [jaipurPuzzleComplete, setJaipurPuzzleComplete] = useState(false);
  const [amritsarPuzzleComplete, setAmritsarPuzzleComplete] = useState(false);
  const [delhiPuzzleComplete, setDelhiPuzzleComplete] = useState(false);
  const [agraPuzzleComplete, setAgraPuzzleComplete] = useState(false);
  const [kolkataWordGrid, setKolkataWordGrid] = useState<WordPuzzleCell[][]>([]);
  const [kolkataWordPlacements, setKolkataWordPlacements] = useState<WordPlacement[]>([]);
  const [kolkataWordQuestion, setKolkataWordQuestion] = useState(0);
  const [kolkataFoundWords, setKolkataFoundWords] = useState<number[]>([]);
  const [kolkataCursor, setKolkataCursor] = useState<[number, number]>([0, 0]);
  const [kolkataSelectionStart, setKolkataSelectionStart] = useState<[number, number] | null>(null);
  const [kolkataSelection, setKolkataSelection] = useState<Array<[number, number]>>([]);
  const [kolkataSelecting, setKolkataSelecting] = useState(false);
  const [kolkataPuzzleComplete, setKolkataPuzzleComplete] = useState(false);
  const [patnaWordGrid, setPatnaWordGrid] = useState<WordPuzzleCell[][]>([]);
  const [patnaWordPlacements, setPatnaWordPlacements] = useState<WordPlacement[]>([]);
  const [patnaWordQuestion, setPatnaWordQuestion] = useState(0);
  const [patnaFoundWords, setPatnaFoundWords] = useState<number[]>([]);
  const [patnaCursor, setPatnaCursor] = useState<[number, number]>([0, 0]);
  const [patnaSelectionStart, setPatnaSelectionStart] = useState<[number, number] | null>(null);
  const [patnaSelection, setPatnaSelection] = useState<Array<[number, number]>>([]);
  const [patnaSelecting, setPatnaSelecting] = useState(false);
  const [patnaPuzzleComplete, setPatnaPuzzleComplete] = useState(false);
  const [puriWordGrid, setPuriWordGrid] = useState<WordPuzzleCell[][]>([]);
  const [puriWordPlacements, setPuriWordPlacements] = useState<WordPlacement[]>([]);
  const [puriWordQuestion, setPuriWordQuestion] = useState(0);
  const [puriFoundWords, setPuriFoundWords] = useState<number[]>([]);
  const [puriCursor, setPuriCursor] = useState<[number, number]>([0, 0]);
  const [puriSelectionStart, setPuriSelectionStart] = useState<[number, number] | null>(null);
  const [puriSelection, setPuriSelection] = useState<Array<[number, number]>>([]);
  const [puriSelecting, setPuriSelecting] = useState(false);
  const [puriPuzzleComplete, setPuriPuzzleComplete] = useState(false);
  const [bhubaneswarWordGrid, setBhubaneswarWordGrid] = useState<WordPuzzleCell[][]>([]);
  const [bhubaneswarWordPlacements, setBhubaneswarWordPlacements] = useState<WordPlacement[]>([]);
  const [bhubaneswarWordQuestion, setBhubaneswarWordQuestion] = useState(0);
  const [bhubaneswarFoundWords, setBhubaneswarFoundWords] = useState<number[]>([]);
  const [bhubaneswarCursor, setBhubaneswarCursor] = useState<[number, number]>([0, 0]);
  const [bhubaneswarSelectionStart, setBhubaneswarSelectionStart] = useState<[number, number] | null>(null);
  const [bhubaneswarSelection, setBhubaneswarSelection] = useState<Array<[number, number]>>([]);
  const [bhubaneswarSelecting, setBhubaneswarSelecting] = useState(false);
  const [bhubaneswarPuzzleComplete, setBhubaneswarPuzzleComplete] = useState(false);
  const [bhubaneswarHint, setBhubaneswarHint] = useState(0);
  const [patnaHint, setPatnaHint] = useState(0);
  const [kolkataHint, setKolkataHint] = useState(0);
  const [puriHint, setPuriHint] = useState(0);

  const resetPieceOfPast = (pieceCount = 16) => {
    setPuzzlePieces(createPuzzlePieces(pieceCount));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
  };

  const openPieceOfPast = () => {
    setSelectedPlace("Hyderabad");
    resetPieceOfPast(16);
    nextScreen("pieceOfPast");
  };

  const openChennaiPieceOfPast = () => {
    setSelectedPlace("Chennai");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openThanjavurPieceOfPast = () => {
    setSelectedPlace("Thanjavur");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openMysuruPieceOfPast = () => {
    setSelectedPlace("Mysuru");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openJaipurPieceOfPast = () => {
    setSelectedPlace("Jaipur");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openAmritsarPieceOfPast = () => {
    setSelectedPlace("Amritsar");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openDelhiPieceOfPast = () => {
    setSelectedPlace("Delhi");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openAgraPieceOfPast = () => {
    setSelectedPlace("Agra");
    setPuzzlePieces(createPuzzlePieces(9));
    setDraggedPuzzleIndex(null);
    setPuzzleComplete(false);
    nextScreen("pieceOfPast");
  };

  const openPatnaPieceOfPast = () => {
    const generated = createPatnaWordGrid();
    setSelectedPlace("Patna");
    setPatnaWordGrid(generated.grid);
    setPatnaWordPlacements(generated.placements);
    setPatnaWordQuestion(0);
    setPatnaFoundWords([]);
    setPatnaCursor([0, 0]);
    setPatnaSelectionStart(null);
    setPatnaSelection([]);
    setPatnaSelecting(false);
    setPatnaPuzzleComplete(false);
    setPatnaHint(0);
    nextScreen("pieceOfPast");
  };

  const openPuriPieceOfPast = () => {
    const generated = createPuriWordGrid();
    setSelectedPlace("Puri");
    setPuriWordGrid(generated.grid);
    setPuriWordPlacements(generated.placements);
    setPuriWordQuestion(0);
    setPuriFoundWords([]);
    setPuriCursor([0, 0]);
    setPuriSelectionStart(null);
    setPuriSelection([]);
    setPuriSelecting(false);
    setPuriPuzzleComplete(false);
    setPuriHint(0);
    nextScreen("pieceOfPast");
  };

  const openBhubaneswarPieceOfPast = () => {
    const generated = createBhubaneswarWordGrid();
    setSelectedPlace("Bhubaneswar");
    setBhubaneswarWordGrid(generated.grid);
    setBhubaneswarWordPlacements(generated.placements);
    setBhubaneswarWordQuestion(0);
    setBhubaneswarFoundWords([]);
    setBhubaneswarCursor([0, 0]);
    setBhubaneswarSelectionStart(null);
    setBhubaneswarSelection([]);
    setBhubaneswarSelecting(false);
    setBhubaneswarPuzzleComplete(false);
    setBhubaneswarHint(0);
    nextScreen("pieceOfPast");
  };

  const openKolkataPieceOfPast = () => {
    const generated = createKolkataWordGrid();
    setSelectedPlace("Kolkata");
    setKolkataWordGrid(generated.grid);
    setKolkataWordPlacements(generated.placements);
    setKolkataWordQuestion(0);
    setKolkataFoundWords([]);
    setKolkataCursor([0, 0]);
    setKolkataSelectionStart(null);
    setKolkataSelection([]);
    setKolkataSelecting(false);
    setKolkataPuzzleComplete(false);
    setKolkataHint(0);
    nextScreen("pieceOfPast");
  };

  const checkPieceOfPast = (pieces: PuzzlePiece[]) => {
    const solved = pieces.every(
      (piece, position) => piece.correctPosition === position
    );
    setPuzzleComplete(solved);
  };

  const swapPuzzlePieces = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || puzzleComplete) return;

    const updated = [...puzzlePieces];
    [updated[fromIndex], updated[toIndex]] = [
      updated[toIndex],
      updated[fromIndex],
    ];
    setPuzzlePieces(updated);
    const solved = updated.every(
      (piece, position) => piece.correctPosition === position
    );
    setPuzzleComplete(solved);
    if (selectedPlace === "Chennai" && solved) {
      setChennaiPuzzleComplete(true);
    }
    if (selectedPlace === "Thanjavur" && solved) {
      setThanjavurPuzzleComplete(true);
    }
    if (selectedPlace === "Mysuru" && solved) {
      setMysuruPuzzleComplete(true);
    }
    if (selectedPlace === "Jaipur" && solved) {
      setJaipurPuzzleComplete(true);
    }
    if (selectedPlace === "Amritsar" && solved) {
      setAmritsarPuzzleComplete(true);
    }
    if (selectedPlace === "Delhi" && solved) {
      setDelhiPuzzleComplete(true);
    }
    if (selectedPlace === "Agra" && solved) {
      setAgraPuzzleComplete(true);
    }
    if (solved) {
      awardJourneyXP(selectedPlace, "pieceOfPast", 5, 5);
    }
  };

  /* =======================================================
     CULTURE QUEST STATE
  ======================================================= */

  const [cultureDraggedId, setCultureDraggedId] = useState<number | null>(null);
  const [cultureMatched, setCultureMatched] = useState<number[]>([]);
  const [cultureWrongDrops, setCultureWrongDrops] = useState<Record<number, string[]>>({});
  const [cultureConnectionOrder, setCultureConnectionOrder] = useState<number[]>(() =>
    [...HYDERABAD_CULTURE_QUEST.map((entry) => entry.id)].sort(() => Math.random() - 0.5)
  );
  const [cultureDragOver, setCultureDragOver] = useState<number | null>(null);
  const [cultureSubmitted, setCultureSubmitted] = useState(false);
  const [chennaiCultureComplete, setChennaiCultureComplete] = useState(false);
  const [thanjavurCultureComplete, setThanjavurCultureComplete] = useState(false);
  const [mysuruCultureComplete, setMysuruCultureComplete] = useState(false);
  const [jaipurCultureComplete, setJaipurCultureComplete] = useState(false);
  const [amritsarCultureComplete, setAmritsarCultureComplete] = useState(false);
  const [delhiCultureComplete, setDelhiCultureComplete] = useState(false);
  const [agraCultureComplete, setAgraCultureComplete] = useState(false);
  const [kolkataCultureComplete, setKolkataCultureComplete] = useState(false);
  const [patnaCultureComplete, setPatnaCultureComplete] = useState(false);
  const [puriCultureComplete, setPuriCultureComplete] = useState(false);
  const [bhubaneswarCultureComplete, setBhubaneswarCultureComplete] = useState(false);

  const currentCultureData =
    selectedPlace === "Chennai"
      ? CHENNAI_CULTURE_QUEST
      : selectedPlace === "Thanjavur"
        ? THANJAVUR_CULTURE_QUEST
        : selectedPlace === "Mysuru"
          ? MYSURU_CULTURE_QUEST
          : selectedPlace === "Jaipur"
            ? JAIPUR_CULTURE_QUEST
            : selectedPlace === "Amritsar"
              ? AMRITSAR_CULTURE_QUEST
              : selectedPlace === "Delhi"
                ? DELHI_CULTURE_QUEST
                : selectedPlace === "Agra"
                  ? AGRA_CULTURE_QUEST
                  : selectedPlace === "Kolkata"
                    ? KOLKATA_CULTURE_QUEST
                    : selectedPlace === "Patna"
                      ? PATNA_CULTURE_QUEST
                      : selectedPlace === "Puri"
                        ? PURI_CULTURE_QUEST
                        : selectedPlace === "Bhubaneswar"
                          ? BHUBANESWAR_CULTURE_QUEST
                          : HYDERABAD_CULTURE_QUEST;

  const resetCultureQuest = (place = selectedPlace) => {
    setCultureDraggedId(null);
    setCultureMatched([]);
    setCultureWrongDrops({});
    const data =
      place === "Chennai"
        ? CHENNAI_CULTURE_QUEST
        : place === "Thanjavur"
          ? THANJAVUR_CULTURE_QUEST
          : place === "Mysuru"
            ? MYSURU_CULTURE_QUEST
            : place === "Jaipur"
              ? JAIPUR_CULTURE_QUEST
              : place === "Amritsar"
                ? AMRITSAR_CULTURE_QUEST
                : place === "Delhi"
                  ? DELHI_CULTURE_QUEST
                  : place === "Agra"
                    ? AGRA_CULTURE_QUEST
                    : place === "Kolkata"
                      ? KOLKATA_CULTURE_QUEST
                      : place === "Patna"
                        ? PATNA_CULTURE_QUEST
                        : place === "Puri"
                          ? PURI_CULTURE_QUEST
                          : place === "Bhubaneswar"
                            ? BHUBANESWAR_CULTURE_QUEST
                            : HYDERABAD_CULTURE_QUEST;
    setCultureConnectionOrder(
      [...data.map((entry) => entry.id)].sort(
        () => Math.random() - 0.5
      )
    );
    setCultureDragOver(null);
    setCultureSubmitted(false);
  };

  const openCultureQuest = () => {
    setSelectedPlace("Hyderabad");
    resetCultureQuest("Hyderabad");
    nextScreen("cultureQuest");
  };

  const openChennaiCultureQuest = () => {
    setSelectedPlace("Chennai");
    resetCultureQuest("Chennai");
    nextScreen("cultureQuest");
  };

  const openThanjavurCultureQuest = () => {
    setSelectedPlace("Thanjavur");
    resetCultureQuest("Thanjavur");
    nextScreen("cultureQuest");
  };

  const openMysuruCultureQuest = () => {
    setSelectedPlace("Mysuru");
    resetCultureQuest("Mysuru");
    nextScreen("cultureQuest");
  };

  const openJaipurCultureQuest = () => {
    setSelectedPlace("Jaipur");
    resetCultureQuest("Jaipur");
    nextScreen("cultureQuest");
  };

  const openAmritsarCultureQuest = () => {
    setSelectedPlace("Amritsar");
    resetCultureQuest("Amritsar");
    nextScreen("cultureQuest");
  };

  const openDelhiCultureQuest = () => {
    setSelectedPlace("Delhi");
    resetCultureQuest("Delhi");
    nextScreen("cultureQuest");
  };

  const openAgraCultureQuest = () => {
    setSelectedPlace("Agra");
    resetCultureQuest("Agra");
    nextScreen("cultureQuest");
  };

  const openKolkataCultureQuest = () => {
    setSelectedPlace("Kolkata");
    resetCultureQuest("Kolkata");
    nextScreen("cultureQuest");
  };

  const openPatnaCultureQuest = () => {
    setSelectedPlace("Patna");
    resetCultureQuest("Patna");
    nextScreen("cultureQuest");
  };

  const openPuriCultureQuest = () => {
    setSelectedPlace("Puri");
    resetCultureQuest("Puri");
    nextScreen("cultureQuest");
  };

  const openBhubaneswarCultureQuest = () => {
    setSelectedPlace("Bhubaneswar");
    resetCultureQuest("Bhubaneswar");
    nextScreen("cultureQuest");
  };

  const handleCultureDragStart = (
    event: DragEvent<HTMLDivElement>,
    id: number
  ) => {
    setCultureDraggedId(id);
    event.dataTransfer.setData("text/plain", String(id));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCultureDragEnd = () => {
    setCultureDraggedId(null);
    setCultureDragOver(null);
  };

  // Keep the page scrolling while a culture-answer chip is being carried.
  useEffect(() => {
    if (cultureDraggedId === null) return;

    const handleCultureAutoScroll = (event: Event) => {
      const dragEvent = event as globalThis.DragEvent;
      const y = dragEvent.clientY;
      const edge = 90;
      const speed = 18;

      if (y < edge) {
        window.scrollBy({ top: -speed, left: 0 });
      } else if (y > window.innerHeight - edge) {
        window.scrollBy({ top: speed, left: 0 });
      }
    };

    document.addEventListener("dragover", handleCultureAutoScroll);
    return () => {
      document.removeEventListener("dragover", handleCultureAutoScroll);
    };
  }, [cultureDraggedId]);

  const handleCultureDrop = (
    event: DragEvent<HTMLDivElement>,
    targetId: number
  ) => {
    event.preventDefault();
    setCultureDragOver(null);

    if (cultureSubmitted || cultureMatched.includes(targetId)) return;

    const draggedId = Number(event.dataTransfer.getData("text/plain"));
    const draggedEntry = currentCultureData.find(
      (entry) => entry.id === draggedId
    );

    if (!draggedEntry) return;

    if (draggedId === targetId) {
      setCultureMatched((prev) => {
        if (prev.includes(targetId)) return prev;
        return [...prev, targetId];
      });
      awardJourneyXP(selectedPlace, "cultureQuest", 5, currentCultureData.length * 5);
    } else {
      setCultureWrongDrops((prev) => ({
        ...prev,
        [targetId]: [...(prev[targetId] || []), draggedEntry.connection],
      }));
    }

    setCultureDraggedId(null);
  };

  const submitCultureQuest = () => {
    setCultureSubmitted(true);
    if (selectedPlace === "Chennai" && cultureMatched.length === CHENNAI_CULTURE_QUEST.length) {
      setChennaiCultureComplete(true);
    } else if (selectedPlace === "Thanjavur" && cultureMatched.length === THANJAVUR_CULTURE_QUEST.length) {
      setThanjavurCultureComplete(true);
    } else if (selectedPlace === "Mysuru" && cultureMatched.length === MYSURU_CULTURE_QUEST.length) {
      setMysuruCultureComplete(true);
    } else if (selectedPlace === "Jaipur" && cultureMatched.length === JAIPUR_CULTURE_QUEST.length) {
      setJaipurCultureComplete(true);
    } else if (selectedPlace === "Amritsar" && cultureMatched.length === AMRITSAR_CULTURE_QUEST.length) {
      setAmritsarCultureComplete(true);
    } else if (selectedPlace === "Delhi" && cultureMatched.length === DELHI_CULTURE_QUEST.length) {
      setDelhiCultureComplete(true);
    } else if (selectedPlace === "Agra" && cultureMatched.length === AGRA_CULTURE_QUEST.length) {
      setAgraCultureComplete(true);
    } else if (selectedPlace === "Kolkata" && cultureMatched.length === KOLKATA_CULTURE_QUEST.length) {
      setKolkataCultureComplete(true);
    } else if (selectedPlace === "Patna" && cultureMatched.length === PATNA_CULTURE_QUEST.length) {
      setPatnaCultureComplete(true);
    } else if (selectedPlace === "Puri" && cultureMatched.length === PURI_CULTURE_QUEST.length) {
      setPuriCultureComplete(true);
    }
  };

  const cultureComplete =
    cultureMatched.length === currentCultureData.length;

  useEffect(() => {
    if (
      selectedPlace === "Hyderabad" &&
      timeTrekComplete &&
      puzzleComplete &&
      cultureSubmitted &&
      cultureComplete
    ) {
      setHyderabadHeritageUnlocked(true);
    }
  }, [selectedPlace, timeTrekComplete, puzzleComplete, cultureSubmitted, cultureComplete]);

  /* =======================================================
     HERITAGE MAZE STATE
  ======================================================= */

  const [mazeLevel, setMazeLevel] = useState(1);

  const [mazeGrid, setMazeGrid] = useState<MazeCell[][]>(() =>
    generateMaze(MAZE_LEVELS[0].size, 101)
  );

  const [mazePlayer, setMazePlayer] = useState<MazePoint>({
    row: 1,
    col: 1,
  });

  const [mazeCoins, setMazeCoins] = useState<MazePoint[]>(() =>
    getMazeCoins(
      generateMaze(MAZE_LEVELS[0].size, 101),
      1
    )
  );

  const [mazeCollectedCoins, setMazeCollectedCoins] = useState(0);
  const [mazeComplete, setMazeComplete] = useState(false);

  /*
    Arcade XP is completely separate from the main
    Explore Bharat journey.
  */
  const [arcadeXP, setArcadeXP] = useState(0);

  /*
    Refs make sure a coin can NEVER be collected more
    than once, even if several keyboard events happen
    before React finishes a render.
  */
  const mazeCoinsRef = useRef<MazePoint[]>([]);
  const mazeCollectedCoinsRef = useRef(0);

  const currentMazeLevel =
    MAZE_LEVELS.find((level) => level.id === mazeLevel) ||
    MAZE_LEVELS[0];

  /* =======================================================
     LOAD ARCADE XP
  ======================================================= */

  useEffect(() => {
    const savedXP = localStorage.getItem(
      "exploreBharatArcadeXP"
    );

    if (savedXP) {
      const parsedXP = Number(savedXP);

      if (!Number.isNaN(parsedXP)) {
        setArcadeXP(parsedXP);
      }
    }
  }, []);

  /* =======================================================
     START MAZE LEVEL
  ======================================================= */

  const startMazeLevel = (levelId: number) => {
    const level =
      MAZE_LEVELS.find((item) => item.id === levelId) ||
      MAZE_LEVELS[0];

    const newGrid = generateMaze(
      level.size,
      level.id * 101
    );

    const newCoins = getMazeCoins(
      newGrid,
      level.id
    );

    setMazeLevel(level.id);
    setMazeGrid(newGrid);
    setMazePlayer({ row: 1, col: 1 });

    setMazeCoins(newCoins);

    mazeCoinsRef.current = newCoins;
    mazeCollectedCoinsRef.current = 0;

    setMazeCollectedCoins(0);
    setMazeComplete(false);
    nextScreen("maze");
  };

  const openHeritageMaze = () => {
    startMazeLevel(1);
  };

  /* =======================================================
     KEEP COIN REFS SYNCHRONIZED
  ======================================================= */

  useEffect(() => {
    mazeCoinsRef.current = mazeCoins;
  }, [mazeCoins]);

  useEffect(() => {
    mazeCollectedCoinsRef.current = mazeCollectedCoins;
  }, [mazeCollectedCoins]);

  /* =======================================================
     MAZE KEYBOARD MOVEMENT
  ======================================================= */

  useEffect(() => {
    if (screen !== "maze" || mazeComplete) return;

    const handleMazeKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const key = event.key.toLowerCase();

      let rowChange = 0;
      let colChange = 0;

      if (key === "arrowup" || key === "w") {
        rowChange = -1;
      } else if (key === "arrowdown" || key === "s") {
        rowChange = 1;
      } else if (key === "arrowleft" || key === "a") {
        colChange = -1;
      } else if (key === "arrowright" || key === "d") {
        colChange = 1;
      } else {
        return;
      }

      event.preventDefault();

      setMazePlayer((previous) => {
        const newRow = previous.row + rowChange;
        const newCol = previous.col + colChange;

        if (
          newRow < 0 ||
          newRow >= mazeGrid.length ||
          newCol < 0 ||
          newCol >= mazeGrid.length
        ) {
          return previous;
        }

        if (mazeGrid[newRow][newCol] === 1) {
          return previous;
        }

        const collectedIndex =
          mazeCoinsRef.current.findIndex(
            (coin) =>
              coin.row === newRow &&
              coin.col === newCol
          );

        if (
          collectedIndex !== -1 &&
          mazeCollectedCoinsRef.current < 3
        ) {
          const updatedCoins =
            mazeCoinsRef.current.filter(
              (_, index) => index !== collectedIndex
            );

          mazeCoinsRef.current = updatedCoins;

          setMazeCoins(updatedCoins);

          const updatedCollected =
            mazeCollectedCoinsRef.current + 1;

          mazeCollectedCoinsRef.current =
            updatedCollected;

          setMazeCollectedCoins(
            updatedCollected
          );

          setArcadeXP((previousXP) => {
            const updatedXP =
              previousXP + 5;

            localStorage.setItem(
              "exploreBharatArcadeXP",
              updatedXP.toString()
            );

            return updatedXP;
          });
        }

        const reachedGoal =
          newRow === mazeGrid.length - 2 &&
          newCol === mazeGrid.length - 2;

        if (
          reachedGoal &&
          mazeCollectedCoinsRef.current === 3
        ) {
          setMazeComplete(true);
        }

        return {
          row: newRow,
          col: newCol,
        };
      });
    };

    window.addEventListener(
      "keydown",
      handleMazeKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleMazeKeyDown
      );
    };
  }, [
    screen,
    mazeComplete,
    mazeGrid,
  ]);

  const getTimeTrekMaximum = (place: string) => {
    if (place === "Hyderabad") return HYDERABAD_TIME_TREK.length * 5;
    if (place === "Chennai") return CHENNAI_TIME_TREK.length * 5;
    if (place === "Thanjavur") return THANJAVUR_TIME_TREK.length * 5;
    if (place === "Mysuru") return MYSURU_TIME_TREK.length * 5;
    if (place === "Jaipur") return JAIPUR_TIME_TREK.length * 5;
    if (place === "Amritsar") return AMRITSAR_TIME_TREK.length * 5;
    if (place === "Delhi") return DELHI_TIME_TREK.length * 5;
    if (place === "Agra") return AGRA_TIME_TREK.length * 5;
    if (place === "Kolkata") return KOLKATA_TIME_TREK.length * 5;
    if (place === "Patna") return PATNA_TIME_TREK.length * 5;
    if (place === "Puri") return PURI_TIME_TREK.length * 5;
    if (place === "Bhubaneswar") return BHUBANESWAR_TIME_TREK.length * 5;
    return 0;
  };

  const getCultureMaximum = (place: string) => {
    if (place === "Hyderabad") return HYDERABAD_CULTURE_QUEST.length * 5;
    if (place === "Chennai") return CHENNAI_CULTURE_QUEST.length * 5;
    if (place === "Thanjavur") return THANJAVUR_CULTURE_QUEST.length * 5;
    if (place === "Mysuru") return MYSURU_CULTURE_QUEST.length * 5;
    if (place === "Jaipur") return JAIPUR_CULTURE_QUEST.length * 5;
    if (place === "Amritsar") return AMRITSAR_CULTURE_QUEST.length * 5;
    if (place === "Delhi") return DELHI_CULTURE_QUEST.length * 5;
    if (place === "Agra") return AGRA_CULTURE_QUEST.length * 5;
    if (place === "Kolkata") return KOLKATA_CULTURE_QUEST.length * 5;
    if (place === "Patna") return PATNA_CULTURE_QUEST.length * 5;
    if (place === "Puri") return PURI_CULTURE_QUEST.length * 5;
    if (place === "Bhubaneswar") return BHUBANESWAR_CULTURE_QUEST.length * 5;
    return 0;
  };

  const getPuzzleMaximum = (place: string) =>
    place === "Kolkata" || place === "Patna" || place === "Puri" || place === "Bhubaneswar" ? 5 : ["Hyderabad", "Chennai", "Thanjavur", "Mysuru", "Jaipur", "Amritsar", "Delhi", "Agra"].includes(place) ? 5 : 0;

  const profilePlaceRows = Object.entries(PROFILE_REGIONS).flatMap(
    ([region, places]) => places.map((place) => ({ region, place }))
  );

  const exploredPlacesCount = profilePlaceRows.filter(({ place }) => {
    const maximum =
      getTimeTrekMaximum(place) +
      getPuzzleMaximum(place) +
      getCultureMaximum(place);
    const earned =
      getGameXP(place, "timeTrek") +
      getGameXP(place, "pieceOfPast") +
      getGameXP(place, "cultureQuest");
    return maximum > 0 && earned > 0;
  }).length;

  const challengeCount = Math.floor(overallJourneyXP / 5);
  const explorerLevel = Math.min(10, Math.floor(overallJourneyXP / 100) + 1);

  return (
    <main className="app">

      {/* ===================================================
          BACKGROUND MUSIC
      =================================================== */}

      <audio
        ref={musicRef}
        src="/music/explore-bharat-main.mp3"
        loop
        preload="auto"
      />

      {/* ===================================================
          MUSIC ON / OFF BUTTON
      =================================================== */}

      {!showBreakModal && (
        <button
          onClick={toggleMusic}
          aria-label={
            isMusicOn
              ? "Turn music off"
              : "Turn music on"
          }
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9999,
            border: "1px solid rgba(90,60,35,0.35)",
            borderRadius: 12,
            padding: "9px 15px",
            background: "rgba(255,248,225,0.97)",
            color: "#5a3525",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow:
              "0 5px 15px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {isMusicOn ? "🔊 MUSIC ON" : "🔇 MUSIC OFF"}
        </button>
      )}

      {/* ===================================================
          HOME BUTTON — AVAILABLE ON EVERY SCREEN
      =================================================== */}

      {
        ["welcome", "nickname", "personal", "region", "places", "activities"].includes(screen) &&
        !showBreakModal && (
          <button
            onClick={() => nextScreen(getBackScreen())}
            style={{
              position: "fixed",
              top: 18,
              left: 18,
              zIndex: 9999,
              border: "1px solid rgba(90,60,35,0.35)",
              borderRadius: 12,
              padding: "9px 15px",
              background: "rgba(255,248,225,0.97)",
              color: "#5a3525",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 5px 15px rgba(0,0,0,0.18)",
            }}
          >
            ← BACK
          </button>
        )}

      {/* ===================================================
          TIMER BADGE
      =================================================== */}

      {sessionActive && screen !== "landing" && (
        <div className="timer-badge">
          <span className="timer-icon">⏳</span>
          <span>{formatTime(remainingSeconds)}</span>
        </div>
      )}

      {/* ===================================================
          BREAK MODAL
      =================================================== */}

      {showBreakModal && (
        <div className="break-overlay">
          <div className="break-modal">
            <div className="break-emoji">🌤️</div>

            <h2>🌟 {nickname ? `Great job, ${nickname}, Explorer!` : "Great job, Explorer!"}</h2>

            <p>
              Your 30-minute exploration is complete.
              <br />
              We&apos;ll explore the rest of Bharat tomorrow. 🇮🇳
            </p>

            <div className="break-actions">
              <button
                className="brown-button"
                onClick={closeTimedSession}
              >
                SEE YOU TOMORROW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          LANDING
      =================================================== */}

      {screen === "landing" && (
        <section className="screen landing-screen">
          <div className="india-map">
            <div className="map-glow" />
            <div className="india-shape">INDIA</div>
          </div>

          <button
            className="landing-profile-button"
            onClick={() => {
              setProfileReturnScreen("landing");
              nextScreen("profile");
            }}
          >
            👤 MY PROFILE
          </button>

          <div className="landing-content">
            <div className="chakra">☸</div>

            <h1 className="game-title">
              EXPLORE
              <span>BHARAT</span>
            </h1>

            <p className="tagline">
              Discover <span>•</span> Learn <span>•</span> Play
            </p>

            <button
              className="gold-button"
              onClick={() => {
                startMusic();
                startSession();
                nextScreen("welcome");
              }}
            >
              START JOURNEY
              <span>→</span>
            </button>

            <button
              className="arcade-button"
              onClick={() => {
                startMusic();
                startSession();
                nextScreen("arcade");
              }}
            >
              🎮 BHARAT ARCADE
            </button>
          </div>

          <div className="compass">✧</div>
        </section>
      )}

      {/* ===================================================
          WELCOME
      =================================================== */}

      {screen === "welcome" && (
        <section className="screen parchment-screen">
          <div className="scroll">
            <div className="scroll-top" />

            <h2>Welcome, Explorer!</h2>

            <p className="scroll-description">
              Step into the incredible journey of
              <br />
              India&apos;s history, culture and heritage.
              <br />
              Are you ready to explore?
            </p>

            <div className="explorers">
              <button
                className={`explorer ${explorer === "girl" ? "selected" : ""
                  }`}
                onClick={() => setExplorer("girl")}
              >
                <div className="character girl">
                  👧🏻
                </div>

                <span>Girl Explorer</span>
              </button>

              <button
                className={`explorer ${explorer === "boy" ? "selected" : ""
                  }`}
                onClick={() => setExplorer("boy")}
              >
                <div className="character boy">
                  👦🏻
                </div>

                <span>Boy Explorer</span>
              </button>
            </div>

            <div className="choose-text">
              Choose your Explorer
            </div>

            <button
              className="brown-button"
              onClick={() => nextScreen("nickname")}
            >
              CONTINUE
              <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          NICKNAME
      =================================================== */}

      {screen === "nickname" && (
        <section className="screen parchment-screen">
          <div className="scroll nickname-scroll">
            <h2>What should we call you?</h2>

            <p className="scroll-description">
              Choose a nickname for your journey
              <br />
              across Bharat!
            </p>

            <div className="input-wrapper">
              <span>♙</span>

              <input
                type="text"
                placeholder="Enter your nickname..."
                value={nickname}
                onChange={(e) =>
                  setNickname(e.target.value)
                }
                maxLength={20}
                autoFocus
              />
            </div>

            <button
              className="green-button"
              onClick={() => {
                if (nickname.trim()) {
                  nextScreen("personal");
                }
              }}
            >
              LET&apos;S GO!
              <span>→</span>
            </button>

            {!nickname.trim() && (
              <p className="small-hint">
                Enter a nickname to begin your adventure
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          PERSONAL
      =================================================== */}

      {screen === "personal" && (
        <section className="screen personal-screen">
          <div className="personal-background">
            <div className="monument monument-left">
              🕌
            </div>

            <div className="monument monument-right">
              🛕
            </div>
          </div>

          <div className="personal-scroll">
            <p className="welcome-small">
              ✦ WELCOME ✦
            </p>

            <div className="talking-avatar">
              <div className="character talk-bounce">
                {EXPLORER_DATA[explorer].emoji}
              </div>

              <div className="speech-bubble">
                {EXPLORER_DATA[explorer].greeting(
                  nickname
                )}
              </div>
            </div>

            <div className="decorative-line">
              ─── ✦ ───
            </div>

            <p>
              Your adventure through Bharat
              <br />
              begins now!
            </p>

            <button
              className="green-button"
              onClick={() => nextScreen("region")}
            >
              CONTINUE
              <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          REGION
      =================================================== */}

      {screen === "region" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            <h2>Choose a Region</h2>

            <p className="scroll-description">
              Which part of Bharat would you like
              <br />
              to explore first?
            </p>

            <div className="regions">
              <button
                className="region-card north"
                onClick={() => {
                  setSelectedRegion("North");
                  nextScreen("places");
                }}
              >
                <div>🏰</div>
                <span>North India</span>
              </button>

              <button
                className="region-card south"
                onClick={() => {
                  setSelectedRegion("South");
                  nextScreen("places");
                }}
              >
                <div>🛕</div>
                <span>South India</span>
              </button>

              <button
                className="region-card east"
                onClick={() => {
                  setSelectedRegion("East");
                  nextScreen("places");
                }}
              >
                <div>🏯</div>
                <span>East India</span>
              </button>

              <button
                className="region-card west"
                onClick={() => {
                  setSelectedRegion("West");
                  nextScreen("places");
                }}
              >
                <div>🏛️</div>
                <span>West India</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          PLACES
      =================================================== */}

      {screen === "places" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            <h2>{selectedRegion} India</h2>

            <p className="scroll-description">
              Choose a place to begin your
              <br />
              heritage adventure!
            </p>

            <div className="regions">
              {selectedRegion === "North" && (
                <>
                  <button
                    className="region-card north"
                    onClick={() => {
                      setSelectedPlace("Delhi");
                      nextScreen("activities");
                    }}
                  >
                    <div>🏰</div>
                    <span>Delhi</span>
                  </button>

                  <button
                    className="region-card north"
                    onClick={() => {
                      setSelectedPlace("Agra");
                      nextScreen("activities");
                    }}
                  >
                    <div>🕌</div>
                    <span>Agra</span>
                  </button>

                  <button
                    className="region-card north"
                    onClick={() => {
                      setSelectedPlace("Jaipur");
                      nextScreen("activities");
                    }}
                  >
                    <div>👑</div>
                    <span>Jaipur</span>
                  </button>

                  <button
                    className="region-card north"
                    onClick={() => {
                      setSelectedPlace("Amritsar");
                      nextScreen("activities");
                    }}
                  >
                    <div>🛕</div>
                    <span>Amritsar</span>
                  </button>
                </>
              )}

              {selectedRegion === "South" && (
                <>
                  <button
                    className="region-card south"
                    onClick={() => {
                      setSelectedPlace("Hyderabad");
                      nextScreen("activities");
                    }}
                  >
                    <div>🕌</div>
                    <span>Hyderabad</span>
                  </button>

                  <button
                    className="region-card south"
                    onClick={() => {
                      setSelectedPlace("Mysuru");
                      nextScreen("activities");
                    }}
                  >
                    <div>👑</div>
                    <span>Mysuru</span>
                  </button>

                  <button
                    className="region-card south"
                    onClick={() => {
                      setSelectedPlace("Chennai");
                      nextScreen("activities");
                    }}
                  >
                    <div>🌊</div>
                    <span>Chennai</span>
                  </button>

                  <button
                    className="region-card south"
                    onClick={() => {
                      setSelectedPlace("Thanjavur");
                      nextScreen("activities");
                    }}
                  >
                    <div>🛕</div>
                    <span>Thanjavur</span>
                  </button>
                </>
              )}

              {selectedRegion === "East" && (
                <>
                  <button
                    className="region-card east"
                    onClick={() => {
                      setSelectedPlace("Kolkata");
                      nextScreen("activities");
                    }}
                  >
                    <div>🏛️</div>
                    <span>Kolkata</span>
                  </button>

                  <button
                    className="region-card east"
                    onClick={() => {
                      setSelectedPlace("Bhubaneswar");
                      nextScreen("activities");
                    }}
                  >
                    <div>🛕</div>
                    <span>Bhubaneswar</span>
                  </button>

                  <button
                    className="region-card east"
                    onClick={() => {
                      setSelectedPlace("Puri");
                      nextScreen("activities");
                    }}
                  >
                    <div>🛕</div>
                    <span>Puri</span>
                  </button>

                  <button
                    className="region-card east"
                    onClick={() => {
                      setSelectedPlace("Patna");
                      nextScreen("activities");
                    }}
                  >
                    <div>🏛️</div>
                    <span>Patna</span>
                  </button>
                </>
              )}

              {selectedRegion === "West" && (
                <>
                  <button
                    className="region-card west"
                    onClick={() => {
                      setSelectedPlace("Ahmedabad");
                      nextScreen("activities");
                    }}
                  >
                    <div>🏛️</div>
                    <span>Ahmedabad</span>
                  </button>

                  <button
                    className="region-card west"
                    onClick={() => {
                      setSelectedPlace("Mumbai");
                      nextScreen("activities");
                    }}
                  >
                    <div>🌆</div>
                    <span>Mumbai</span>
                  </button>

                  <button
                    className="region-card west"
                    onClick={() => {
                      setSelectedPlace("Udaipur");
                      nextScreen("activities");
                    }}
                  >
                    <div>🏰</div>
                    <span>Udaipur</span>
                  </button>

                  <button
                    className="region-card west"
                    onClick={() => {
                      setSelectedPlace("Aurangabad");
                      nextScreen("activities");
                    }}
                  >
                    <div>🪨</div>
                    <span>Aurangabad</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          ACTIVITIES
      =================================================== */}

      {screen === "activities" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            <div className="profile-top">
              <button
                className="profile-button"
                onClick={() => {
                  setProfileReturnScreen("activities");
                  nextScreen("profile");
                }}
              >
                👤 MY PROFILE
              </button>
            </div>

            <h2>{selectedPlace}</h2>

            <p className="scroll-description">
              Choose your challenge and begin
              <br />
              your heritage adventure!
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                padding: "8px 14px",
                borderRadius: 14,
                background: "rgba(255,248,225,0.92)",
                border: "1px solid rgba(90,60,35,0.18)",
                color: "#5a3525",
                fontWeight: 700,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 13,
              }}
            >
              🏆 Overall Journey XP: {overallJourneyXP} / {MAX_JOURNEY_XP}
            </div>

            <div className="regions activity-cards">

              <button
                className="region-card north"
                onClick={() => {
                  if (selectedPlace === "Hyderabad") {
                    openTimeTrek();
                  } else if (selectedPlace === "Chennai") {
                    openChennaiTimeTrek();
                  } else if (selectedPlace === "Thanjavur") {
                    openThanjavurTimeTrek();
                  } else if (selectedPlace === "Mysuru") {
                    openMysuruTimeTrek();
                  } else if (selectedPlace === "Jaipur") {
                    openJaipurTimeTrek();
                  } else if (selectedPlace === "Amritsar") {
                    openAmritsarTimeTrek();
                  } else if (selectedPlace === "Delhi") {
                    openDelhiTimeTrek();
                  } else if (selectedPlace === "Agra") {
                    openAgraTimeTrek();
                  } else if (selectedPlace === "Kolkata") {
                    openKolkataTimeTrek();
                  } else if (selectedPlace === "Patna") {
                    openPatnaTimeTrek();
                  } else if (selectedPlace === "Puri") {
                    openPuriTimeTrek();
                  } else if (selectedPlace === "Bhubaneswar") {
                    openBhubaneswarTimeTrek();
                  }
                }}
              >
                <div>⏳</div>

                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    lineHeight: 1.15,
                  }}
                >
                  Time Trek
                </span>

                <small
                  style={{
                    display: "block",
                    lineHeight: 1.45,
                  }}
                >
                  Test your knowledge of{" "}
                  {selectedPlace}&apos;s history
                </small>
                <strong style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  🏆 XP: {getGameXP(selectedPlace, "timeTrek")} / {getTimeTrekMaximum(selectedPlace)}
                </strong>
              </button>

              <button
                className="region-card south"
                onClick={() => {
                  if (selectedPlace === "Hyderabad") {
                    openPieceOfPast();
                  } else if (selectedPlace === "Chennai") {
                    openChennaiPieceOfPast();
                  } else if (selectedPlace === "Thanjavur") {
                    openThanjavurPieceOfPast();
                  } else if (selectedPlace === "Mysuru") {
                    openMysuruPieceOfPast();
                  } else if (selectedPlace === "Jaipur") {
                    openJaipurPieceOfPast();
                  } else if (selectedPlace === "Amritsar") {
                    openAmritsarPieceOfPast();
                  } else if (selectedPlace === "Delhi") {
                    openDelhiPieceOfPast();
                  } else if (selectedPlace === "Agra") {
                    openAgraPieceOfPast();
                  }
                  else if (selectedPlace === "Kolkata") {
                    openKolkataPieceOfPast();
                  } else if (selectedPlace === "Patna") {
                    openPatnaPieceOfPast();
                  } else if (selectedPlace === "Puri") {
                    openPuriPieceOfPast();
                  } else if (selectedPlace === "Bhubaneswar") {
                    openBhubaneswarPieceOfPast();
                  }
                }}
              >
                <div>🧩</div>

                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    lineHeight: 1.15,
                  }}
                >
                  Piece of the Past
                </span>

                <small
                  style={{
                    display: "block",
                    lineHeight: 1.45,
                  }}
                >
                  Rebuild a historical personality
                </small>
                <strong style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  🏆 XP: {getGameXP(selectedPlace, "pieceOfPast")} / {getPuzzleMaximum(selectedPlace)}
                </strong>
              </button>

              <button
                className="region-card east"
                onClick={() => {
                  if (selectedPlace === "Hyderabad") {
                    openCultureQuest();
                  } else if (selectedPlace === "Chennai") {
                    openChennaiCultureQuest();
                  } else if (selectedPlace === "Thanjavur") {
                    openThanjavurCultureQuest();
                  } else if (selectedPlace === "Mysuru") {
                    openMysuruCultureQuest();
                  } else if (selectedPlace === "Jaipur") {
                    openJaipurCultureQuest();
                  } else if (selectedPlace === "Amritsar") {
                    openAmritsarCultureQuest();
                  } else if (selectedPlace === "Delhi") {
                    openDelhiCultureQuest();
                  } else if (selectedPlace === "Agra") {
                    openAgraCultureQuest();
                  } else if (selectedPlace === "Kolkata") {
                    openKolkataCultureQuest();
                  } else if (selectedPlace === "Patna") {
                    openPatnaCultureQuest();
                  } else if (selectedPlace === "Puri") {
                    openPuriCultureQuest();
                  } else if (selectedPlace === "Bhubaneswar") {
                    openBhubaneswarCultureQuest();
                  }
                }}
              >
                <div>🎭</div>

                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    lineHeight: 1.15,
                  }}
                >
                  Culture Quest
                </span>

                <small
                  style={{
                    display: "block",
                    lineHeight: 1.45,
                  }}
                >
                  Discover {selectedPlace}&apos;s culture
                </small>
                <strong style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  🏆 XP: {getGameXP(selectedPlace, "cultureQuest")} / {getCultureMaximum(selectedPlace)}
                </strong>
              </button>

            </div>

            {selectedPlace === "Hyderabad" && (
              <div
                style={{
                  maxWidth: 760,
                  margin: "26px auto 0",
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "rgba(255,248,225,0.9)",
                  border: "1px solid rgba(90,60,35,0.2)",
                  textAlign: "center",
                  color: "#5a3525",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                <strong>🃏 Heritage Card Progress</strong>
                <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                  {timeTrekComplete ? "✅" : "○"} Time Trek &nbsp;•&nbsp; {puzzleComplete ? "✅" : "○"} Piece of the Past &nbsp;•&nbsp; {cultureComplete ? "✅" : "○"} Culture Quest
                </div>

                <button
                  className="green-button"
                  onClick={() => nextScreen("heritageCard")}
                  style={{ marginTop: 14 }}
                >
                  {hyderabadHeritageUnlocked
                    ? "VIEW HYDERABAD HERITAGE CARD"
                    : "PREVIEW HYDERABAD HERITAGE CARD"} <span>→</span>
                </button>
                {!hyderabadHeritageUnlocked && (
                  <small style={{ display: "block", marginTop: 8, opacity: 0.8 }}>
                    Complete all three challenges to officially unlock your card.
                  </small>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          HYDERABAD HERITAGE CARD
      =================================================== */}

      {screen === "heritageCard" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            <div className="profile-top">
              <button
                className="profile-button"
                onClick={() => nextScreen("activities")}
              >
                ← BACK TO HYDERABAD
              </button>
            </div>

            <p className="welcome-small">{hyderabadHeritageUnlocked ? "✦ HERITAGE CARD UNLOCKED ✦" : "✦ HERITAGE CARD PREVIEW ✦"}</p>
            <h2>Hyderabad</h2>
            <p className="scroll-description">
              {hyderabadHeritageUnlocked
                ? "A new piece of Bharat has been added to your collection."
                : "Preview your Hyderabad Heritage Card. Complete all three challenges to unlock it."}
            </p>

            <div
              style={{
                width: "min(430px, 88vw)",
                margin: "20px auto 35px",
                padding: 8,
                borderRadius: 24,
                background: "linear-gradient(145deg, #b98a45, #7b4b35)",
                boxShadow: "0 18px 45px rgba(70,45,25,0.28)",
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "linear-gradient(180deg, rgba(255,248,225,0.98), rgba(244,226,188,0.98))",
                  border: "2px solid rgba(123,75,53,0.35)",
                }}
              >
                <div
                  style={{
                    padding: "18px 20px 12px",
                    textAlign: "center",
                    borderBottom: "1px solid rgba(90,60,35,0.18)",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: "#5a3525",
                  }}
                >
                  <div style={{ fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>
                    EXPLORE BHARAT
                  </div>
                  <div style={{ fontSize: 28, marginTop: 5 }}>🕌</div>
                  <h3 style={{ margin: "5px 0 0", fontSize: 28 }}>HYDERABAD</h3>
                  <div style={{ fontSize: 13, opacity: 0.78, marginTop: 3 }}>
                    The City of Pearls
                  </div>
                </div>

                <div style={{ padding: "20px 22px", color: "#68482f", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.55 }}>
                  <p style={{ marginTop: 0 }}>
                    Hyderabad carries the legacy of the Qutb Shahi dynasty and is known for landmarks, stories, and traditions that reflect Telangana&apos;s rich heritage.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      margin: "18px 0",
                    }}
                  >
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(185,138,69,0.12)", textAlign: "center" }}>
                      <strong>🏛️</strong><br />Charminar
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(185,138,69,0.12)", textAlign: "center" }}>
                      <strong>🏰</strong><br />Golconda Fort
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(185,138,69,0.12)", textAlign: "center" }}>
                      <strong>👑</strong><br />Qutb Shahi Legacy
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(185,138,69,0.12)", textAlign: "center" }}>
                      <strong>🎭</strong><br />Telangana Culture
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(123,75,53,0.08)",
                      textAlign: "center",
                      fontSize: 13,
                    }}
                  >
                    ✦ Time Trek &nbsp; ✦ Piece of the Past &nbsp; ✦ Culture Quest ✦
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 20px 17px",
                    textAlign: "center",
                    borderTop: "1px solid rgba(90,60,35,0.18)",
                    color: "#7b4b35",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  🏆 HERITAGE COLLECTOR • CARD 01
                </div>
              </div>
            </div>

            <button
              className="green-button"
              onClick={() => {
                setProfileReturnScreen("activities");
                nextScreen("profile");
              }}
            >
              VIEW MY COLLECTION <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          TIME TREK — HYDERABAD
      =================================================== */}

      {screen === "timeTrek" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            {!timeTrekComplete ? (
              <>
                <div className="profile-top">
                  <button
                    className="profile-button"
                    onClick={() => nextScreen("activities")}
                  >
                    ← BACK
                  </button>
                </div>

                <h2>⏳ Time Trek: {selectedPlace}</h2>

                <p className="scroll-description">
                  Travel through {selectedPlace}&apos;s history!
                  <br />
                  Answer correctly to continue your trek.
                </p>

                <div
                  style={{
                    maxWidth: 760,
                    margin: "0 auto",
                    padding: "10px 18px 40px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      color: "#5a3525",
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
                  >
                    Question {timeTrekQuestion + 1} of{" "}
                    {currentTimeTrekData.length} · Game XP{" "}
                    {getGameXP(selectedPlace, "timeTrek")} / {currentTimeTrekData.length * 5}
                  </div>

                  <div
                    style={{
                      background: "rgba(255,248,225,0.94)",
                      border: "1px solid rgba(90,60,35,0.25)",
                      borderRadius: 18,
                      padding: "24px",
                      boxShadow: "0 8px 22px rgba(70,45,25,0.12)",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        color: "#5a3525",
                        lineHeight: 1.4,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {currentTimeTrekQuestion.question}
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        marginTop: 18,
                      }}
                    >
                      {currentTimeTrekQuestion.options.map((option) => {
                        const isCorrect =
                          option === currentTimeTrekQuestion.answer;
                        const isSelected =
                          option === timeTrekSelected;

                        let background =
                          "rgba(255,255,255,0.75)";
                        let border =
                          "1px solid rgba(90,60,35,0.25)";

                        if (timeTrekAnswered && isCorrect) {
                          background = "#dff1d8";
                          border = "2px solid #5c8b4a";
                        } else if (
                          timeTrekAnswered &&
                          isSelected &&
                          !isCorrect
                        ) {
                          background = "#f7d6c8";
                          border = "2px solid #b55b4b";
                        }

                        return (
                          <button
                            key={option}
                            onClick={() => handleTimeTrekAnswer(option)}
                            disabled={timeTrekAnswered}
                            style={{
                              padding: "13px 16px",
                              border,
                              borderRadius: 12,
                              background,
                              color: "#4d3022",
                              textAlign: "left",
                              fontFamily:
                                "Georgia, 'Times New Roman', serif",
                              fontSize: 15,
                              fontWeight: 700,
                              cursor: timeTrekAnswered
                                ? "default"
                                : "pointer",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {timeTrekHint >= 1 && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "11px 14px",
                          borderRadius: 10,
                          background: "#fff4cf",
                          color: "#68482f",
                          fontFamily:
                            "Georgia, 'Times New Roman', serif",
                          fontSize: 14,
                        }}
                      >
                        💡 Hint 1: {currentTimeTrekQuestion.hint1}
                      </div>
                    )}

                    {timeTrekHint >= 2 && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "11px 14px",
                          borderRadius: 10,
                          background: "#f8e8bf",
                          color: "#68482f",
                          fontFamily:
                            "Georgia, 'Times New Roman', serif",
                          fontSize: 14,
                        }}
                      >
                        🔎 Hint 2: {currentTimeTrekQuestion.hint2}
                      </div>
                    )}

                    {!timeTrekAnswered && timeTrekHint < 2 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          justifyContent: "center",
                          marginTop: 18,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            setTimeTrekHint((prev) =>
                              Math.min(prev + 1, 2)
                            )
                          }
                          style={{
                            border: "1px solid rgba(90,60,35,0.3)",
                            borderRadius: 10,
                            padding: "9px 14px",
                            background: "#fff8e1",
                            color: "#68482f",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          💡 Use Hint {timeTrekHint + 1}
                        </button>
                      </div>
                    )}

                    {timeTrekAnswered && (
                      <div
                        style={{
                          marginTop: 18,
                          padding: "15px",
                          borderRadius: 12,
                          background:
                            timeTrekSelected ===
                              currentTimeTrekQuestion.answer
                              ? "#e6f4df"
                              : "#fff0df",
                          color: "#5a3525",
                          lineHeight: 1.55,
                          fontFamily:
                            "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        <strong>
                          {timeTrekSelected ===
                            currentTimeTrekQuestion.answer
                            ? "Correct! +5 XP"
                            : "Not quite — try the next challenge!"}
                        </strong>
                        <div style={{ marginTop: 7 }}>
                          {currentTimeTrekQuestion.fact}
                        </div>

                        {timeTrekSelected !==
                          currentTimeTrekQuestion.answer && (
                            <div style={{ marginTop: 7 }}>
                              <strong>Answer:</strong>{" "}
                              {currentTimeTrekQuestion.answer}
                            </div>
                          )}
                      </div>
                    )}

                    {timeTrekAnswered && (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        <button
                          onClick={nextTimeTrekQuestion}
                          style={{
                            border: "none",
                            borderRadius: 12,
                            padding: "11px 20px",
                            background: "#7b4b35",
                            color: "#fff8e1",
                            fontFamily:
                              "Georgia, 'Times New Roman', serif",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {timeTrekQuestion ===
                            currentTimeTrekData.length - 1
                            ? "FINISH TREK"
                            : "NEXT QUESTION →"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  maxWidth: 720,
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "55px 20px",
                }}
              >
                <div style={{ fontSize: 58 }}>🏆</div>
                <h2>{selectedPlace} Time Trek Complete!</h2>
                <p
                  style={{
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    color: "#5a3525",
                    lineHeight: 1.6,
                  }}
                >
                  You completed all {currentTimeTrekData.length} historical challenges and
                  earned <strong>{getGameXP(selectedPlace, "timeTrek")} XP</strong> in Time Trek.
                  <br />
                  <strong>Overall Journey XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</strong>
                </p>

                <div
                  style={{
                    background: "rgba(255,248,225,0.94)",
                    border: "1px solid rgba(90,60,35,0.25)",
                    borderRadius: 16,
                    padding: 20,
                    margin: "24px auto",
                    maxWidth: 560,
                    color: "#5a3525",
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    lineHeight: 1.6,
                  }}
                >
                  {selectedPlace === "Amritsar" ? (
                    <>
                      ✦ You explored the Golden Temple, Jallianwala Bagh, Baisakhi, the Wagah-Attari border, Bhangra, Giddha and Amritsari Kulcha.
                      <br />
                      ✦ Your Amritsar history and culture knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Delhi" ? (
                    <>
                      ✦ You explored the Red Fort, Qutub Minar, India Gate, Lotus Temple, Raj Ghat, Jama Masjid and Chandni Chowk.
                      <br />
                      ✦ Your Delhi history and culture knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Agra" ? (
                    <>
                      ✦ You explored the Taj Mahal, Agra Fort, Fatehpur Sikri, Petha, the Yamuna River and Mehtab Bagh.
                      <br />
                      ✦ Your Agra history and heritage knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Patna" ? (
                    <>
                      <p>✦ You explored Patna's historic landmarks, learning centres, river heritage and festivals.</p>
                      <p>✦ You discovered Golghar, Nalanda, Bodh Gaya, Patna Sahib and Chhath Puja.</p>
                      <p>✦ Patna's heritage reflects the rich history and culture of Bihar.</p>
                    </>
                  ) : selectedPlace === "Puri" ? (
                    <>
                      ✦ You explored the Jagannath Temple, Rath Yatra, Puri Beach, Khaja, Pattachitra and Odisha.
                      <br />
                      ✦ Your Puri history and culture knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Bhubaneswar" ? (
                    <>
                      ✦ You explored Lingaraj Temple, Konark Sun Temple, Dhauli Shanti Stupa, Odissi, Rath Yatra, Khandagiri and Udayagiri Caves, Temple City and Pattachitra.
                      <br />
                      ✦ Your Bhubaneswar history and culture knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Jaipur" ? (
                    <>
                      ✦ You explored Hawa Mahal, the Pink City, Amber Fort, Jantar Mantar, City Palace, Blue Pottery, the Kachwaha Rajputs and Gangaur.
                      <br />
                      ✦ Your Jaipur history knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Thanjavur" ? (
                    <>
                      ✦ You explored Brihadisvara Temple, Rajaraja Chola I,
                      Tanjore Painting, the Chola Dynasty and the Thanjavur Veena.
                      <br />
                      ✦ Your Thanjavur history knowledge just levelled up!
                    </>
                  ) : selectedPlace === "Mysuru" ? (
                    <>
                      ✦ You explored Mysore Palace, Mysuru, Mysore Painting,
                      Mysore Dasara, the Wadiyar Dynasty, Mysore Pak and Chamundi Hill.
                      <br />
                      ✦ Your Mysuru history knowledge just levelled up!
                    </>
                  ) : (
                    <>
                      ✦ You explored Charminar, the Qutb Shahi dynasty,
                      Muhammad Quli Qutb Shah, Golconda Fort and the Musi
                      River.
                      <br />
                      ✦ Your Hyderabad history knowledge just levelled up!
                    </>
                  )}
                </div>

                <button
                  onClick={() => nextScreen("activities")}
                  style={{
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 22px",
                    background: "#7b4b35",
                    color: "#fff8e1",
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ← BACK TO {selectedPlace.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          PIECE OF THE PAST — HYDERABAD / CHENNAI / THANJAVUR / MYSURU
      =================================================== */}

      {screen === "pieceOfPast" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            {selectedPlace === "Bhubaneswar" ? (
              !bhubaneswarPuzzleComplete ? (
                <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "18px 12px 45px", color: "#5a3525", boxSizing: "border-box" }}>
                  <div className="profile-top"><button className="profile-button" onClick={() => nextScreen("activities")}>← BACK</button></div>
                  <p className="welcome-small">✦ PIECE OF THE PAST ✦</p>
                  <h2 style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif" }}>🧩 Bhubaneswar Word Hunt</h2>
                  <p style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>Discover 8 hidden words from Bhubaneswar's history and heritage.</p>
                  <div style={{ width: "min(100%, 620px)", margin: "18px auto", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", boxSizing: "border-box" }}>
                    <strong>🧭 HOW TO PLAY</strong>
                    <div style={{ marginTop: 8, lineHeight: 1.65, fontSize: 14 }}>
                      🔎 Read the question and find its answer in the grid.<br />
                      🎯 Words can go across, down, or diagonally — forwards or backwards.<br />
                      ⌨️ W = Up &nbsp; A = Left &nbsp; S = Down &nbsp; D = Right<br />
                      ✨ Press SPACE on the first letter, move across the word, then press SPACE again.<br />
                      💡 Use the hint if you need help.<br />
                      🏆 Find all 8 hidden words to complete the challenge.
                    </div>
                  </div>
                  <div style={{ width: "min(100%, 620px)", margin: "0 auto 14px", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", textAlign: "center", boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 800, marginBottom: 7 }}>Question {bhubaneswarWordQuestion + 1} of {BHUBANESWAR_WORD_PUZZLE.length}</div>
                    <div style={{ lineHeight: 1.5 }}>{BHUBANESWAR_WORD_PUZZLE[bhubaneswarWordQuestion].question}</div>
                    {bhubaneswarHint > 0 && <div style={{ marginTop: 10, fontWeight: 800 }}>💡 Hint: {BHUBANESWAR_WORD_PUZZLE[bhubaneswarWordQuestion].hint}</div>}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setBhubaneswarHint(1)} disabled={bhubaneswarHint >= 1} style={{ border: "none", borderRadius: 10, padding: "9px 14px", background: "#8b633d", color: "#fff8e1", fontWeight: 700, cursor: bhubaneswarHint >= 1 ? "not-allowed" : "pointer", opacity: bhubaneswarHint >= 1 ? 0.55 : 1 }}>💡 Hint</button>
                      <span style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(123,75,53,0.1)", fontWeight: 700 }}>Found: {bhubaneswarFoundWords.length} / 8</span>
                    </div>
                  </div>
                  <div tabIndex={0} autoFocus onKeyDown={(event) => {
                    if (!bhubaneswarWordGrid.length || bhubaneswarPuzzleComplete) return;
                    const key = event.key.toLowerCase();
                    if (!["w", "a", "s", "d", " ", "spacebar"].includes(key)) return;
                    event.preventDefault();
                    let [r, c] = bhubaneswarCursor;
                    if (key === "w") r = Math.max(0, r - 1);
                    if (key === "s") r = Math.min(BHUBANESWAR_WORD_GRID_SIZE - 1, r + 1);
                    if (key === "a") c = Math.max(0, c - 1);
                    if (key === "d") c = Math.min(BHUBANESWAR_WORD_GRID_SIZE - 1, c + 1);
                    if (key === " ") {
                      if (!bhubaneswarSelecting) {
                        setBhubaneswarSelectionStart([r, c]); setBhubaneswarSelection([[r, c]]); setBhubaneswarSelecting(true);
                      } else {
                        const placementIndex = bhubaneswarWordPlacements.findIndex((placement, index) => {
                          if (bhubaneswarFoundWords.includes(index)) return false;
                          return placement.cells.length === bhubaneswarSelection.length && placement.cells.every(([pr, pc], i) => pr === bhubaneswarSelection[i][0] && pc === bhubaneswarSelection[i][1]);
                        });
                        if (placementIndex >= 0) {
                          const nextFound = [...bhubaneswarFoundWords, placementIndex];
                          setBhubaneswarFoundWords(nextFound); setBhubaneswarSelectionStart(null); setBhubaneswarSelection([]); setBhubaneswarSelecting(false); setBhubaneswarHint(0);
                          if (nextFound.length === BHUBANESWAR_WORD_PUZZLE.length) {
                            setBhubaneswarPuzzleComplete(true); awardJourneyXP("Bhubaneswar", "pieceOfPast", 5, 5);
                          } else setBhubaneswarWordQuestion((q) => q + 1);
                        } else {
                          setBhubaneswarSelectionStart(null); setBhubaneswarSelection([]); setBhubaneswarSelecting(false);
                        }
                      }
                      return;
                    }
                    setBhubaneswarCursor([r, c]);
                    if (bhubaneswarSelecting && bhubaneswarSelectionStart) {
                      const [sr, sc] = bhubaneswarSelectionStart;
                      const dr = Math.sign(r - sr);
                      const dc = Math.sign(c - sc);
                      const straight = (r === sr || c === sc || Math.abs(r - sr) === Math.abs(c - sc));
                      if (straight) {
                        const steps = Math.max(Math.abs(r - sr), Math.abs(c - sc));
                        const path = Array.from({ length: steps + 1 }, (_, i) => [sr + dr * i, sc + dc * i] as [number, number]);
                        setBhubaneswarSelection(path);
                      }
                    }
                  }} style={{ outline: "none" }}>
                    <div style={{ width: "min(560px, 92vw)", maxWidth: 560, margin: "0 auto", padding: 7, borderRadius: 18, background: "#3b281c", boxShadow: "0 14px 35px rgba(70,45,25,0.28)", boxSizing: "border-box" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${BHUBANESWAR_WORD_GRID_SIZE}, 1fr)`, gap: 2, background: "#6f5035", padding: 4, borderRadius: 13 }}>
                        {bhubaneswarWordGrid.flatMap((row) => row).map((cell) => {
                          const key = `${cell.row}-${cell.col}`;
                          const cursor = bhubaneswarCursor[0] === cell.row && bhubaneswarCursor[1] === cell.col;
                          const selected = bhubaneswarSelection.some(([r, c]) => r === cell.row && c === cell.col);
                          const found = bhubaneswarFoundWords.some((index) => bhubaneswarWordPlacements[index]?.cells.some(([r, c]) => r === cell.row && c === cell.col));
                          return <div key={key} style={{ aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: found ? "#d7b76a" : selected ? "#b98a45" : cursor ? "#ead9aa" : "#fff8e1", color: "#4b2e20", fontWeight: 900, fontSize: "clamp(10px, 2.7vw, 20px)", boxShadow: cursor ? "inset 0 0 0 3px #7b4b35" : "none", userSelect: "none" }}>{cell.letter}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 14, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 800, color: "#7b4b35" }}>WASD = Move &nbsp; | &nbsp; SPACE = Start / Finish</div>
                  <div style={{ textAlign: "center", marginTop: 10, color: "#68482f", fontFamily: "Georgia, 'Times New Roman', serif" }}>🏆 Game XP: {getGameXP("Bhubaneswar", "pieceOfPast")} / 5</div>
                </div>
              ) : (
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "35px 20px 50px", textAlign: "center", color: "#5a3525" }}>
                  <div style={{ fontSize: 64 }}>🎉</div>
                  <p className="welcome-small">✦ PIECE OF THE PAST COMPLETE ✦</p>
                  <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Bhubaneswar Word Hunt Complete!</h2>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>You found all 8 hidden words from Bhubaneswar! 🎊</p>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>🏆 Game XP: {getGameXP("Bhubaneswar", "pieceOfPast")} / 5 &nbsp; • &nbsp; Overall XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</p>
                  <div style={{ maxWidth: 620, margin: "20px auto", padding: "18px 20px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.6 }}>
                    <strong>✦ Bhubaneswar discoveries</strong>
                    {BHUBANESWAR_WORD_PUZZLE.map((entry, index) => <p key={`${entry.answer}-${index}`} style={{ margin: "8px 0" }}>✦ {entry.answer}</p>)}
                  </div>
                  <button onClick={() => nextScreen("activities")} style={{ border: "none", borderRadius: 12, padding: "12px 22px", background: "#7b4b35", color: "#fff8e1", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, cursor: "pointer" }}>← BACK TO PURI</button>
                </div>
              )
            ) : selectedPlace === "Patna" ? (

              !patnaPuzzleComplete ? (
                <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "18px 12px 45px", color: "#5a3525", boxSizing: "border-box" }}>
                  <div className="profile-top"><button className="profile-button" onClick={() => nextScreen("activities")}>← BACK</button></div>
                  <p className="welcome-small">✦ PIECE OF THE PAST ✦</p>
                  <h2 style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif" }}>🧩 Patna Word Hunt</h2>
                  <p style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>Discover 8 hidden words from Patna's history and heritage.</p>
                  <div style={{ width: "min(100%, 620px)", margin: "18px auto", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", boxSizing: "border-box" }}>
                    <strong>🧭 HOW TO PLAY</strong>
                    <div style={{ marginTop: 8, lineHeight: 1.65, fontSize: 14 }}>
                      🔎 Read the question and find its answer in the grid.<br />
                      🎯 Words can go across, down, or diagonally — forwards or backwards.<br />
                      ⌨️ W = Up &nbsp; A = Left &nbsp; S = Down &nbsp; D = Right<br />
                      ✨ Press SPACE on the first letter, move across the word, then press SPACE again.<br />
                      💡 Use the hint if you need help.<br />
                      🏆 Find all 8 hidden words to complete the challenge.
                    </div>
                  </div>
                  <div style={{ width: "min(100%, 620px)", margin: "0 auto 14px", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", textAlign: "center", boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 800, marginBottom: 7 }}>Question {patnaWordQuestion + 1} of {PATNA_WORD_PUZZLE.length}</div>
                    <div style={{ lineHeight: 1.5 }}>{PATNA_WORD_PUZZLE[patnaWordQuestion].question}</div>
                    {patnaHint > 0 && <div style={{ marginTop: 10, fontWeight: 800 }}>💡 Hint: {PATNA_WORD_PUZZLE[patnaWordQuestion].hint}</div>}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setPatnaHint(1)} disabled={patnaHint >= 1} style={{ border: "none", borderRadius: 10, padding: "9px 14px", background: "#8b633d", color: "#fff8e1", fontWeight: 700, cursor: patnaHint >= 1 ? "not-allowed" : "pointer", opacity: patnaHint >= 1 ? 0.55 : 1 }}>💡 Hint</button>
                      <span style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(123,75,53,0.1)", fontWeight: 700 }}>Found: {patnaFoundWords.length} / 8</span>
                    </div>
                  </div>
                  <div tabIndex={0} autoFocus onKeyDown={(event) => {
                    if (!patnaWordGrid.length || patnaPuzzleComplete) return;
                    const key = event.key.toLowerCase();
                    if (!["w", "a", "s", "d", " ", "spacebar"].includes(key)) return;
                    event.preventDefault();
                    let [r, c] = patnaCursor;
                    if (key === "w") r = Math.max(0, r - 1);
                    if (key === "s") r = Math.min(PATNA_WORD_GRID_SIZE - 1, r + 1);
                    if (key === "a") c = Math.max(0, c - 1);
                    if (key === "d") c = Math.min(PATNA_WORD_GRID_SIZE - 1, c + 1);
                    if (key === " ") {
                      if (!patnaSelecting) {
                        setPatnaSelectionStart([r, c]); setPatnaSelection([[r, c]]); setPatnaSelecting(true);
                      } else {
                        const placementIndex = patnaWordPlacements.findIndex((placement, index) => {
                          if (patnaFoundWords.includes(index)) return false;
                          return placement.cells.length === patnaSelection.length && placement.cells.every(([pr, pc], i) => pr === patnaSelection[i][0] && pc === patnaSelection[i][1]);
                        });
                        if (placementIndex >= 0) {
                          const nextFound = [...patnaFoundWords, placementIndex];
                          setPatnaFoundWords(nextFound); setPatnaSelectionStart(null); setPatnaSelection([]); setPatnaSelecting(false); setPatnaHint(0);
                          if (nextFound.length === PATNA_WORD_PUZZLE.length) {
                            setPatnaPuzzleComplete(true); awardJourneyXP("Patna", "pieceOfPast", 5, 5);
                          } else setPatnaWordQuestion((q) => q + 1);
                        } else { setPatnaSelectionStart(null); setPatnaSelection([]); setPatnaSelecting(false); }
                      }
                      return;
                    }
                    setPatnaCursor([r, c]);
                    if (patnaSelecting && patnaSelectionStart) {
                      const [sr, sc] = patnaSelectionStart;
                      const dr = Math.sign(r - sr), dc = Math.sign(c - sc);
                      const straight = r === sr || c === sc || Math.abs(r - sr) === Math.abs(c - sc);
                      if (straight) {
                        const steps = Math.max(Math.abs(r - sr), Math.abs(c - sc));
                        setPatnaSelection(Array.from({ length: steps + 1 }, (_, i) => [sr + dr * i, sc + dc * i] as [number, number]));
                      }
                    }
                  }} style={{ outline: "none" }}>
                    <div style={{ width: "min(560px, 92vw)", maxWidth: 560, margin: "0 auto", padding: 7, borderRadius: 18, background: "#3b281c", boxShadow: "0 14px 35px rgba(70,45,25,0.28)", boxSizing: "border-box" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${PATNA_WORD_GRID_SIZE}, 1fr)`, gap: 2, background: "#6f5035", padding: 4, borderRadius: 13 }}>
                        {patnaWordGrid.flatMap((row) => row).map((cell) => {
                          const key = `${cell.row}-${cell.col}`;
                          const cursor = patnaCursor[0] === cell.row && patnaCursor[1] === cell.col;
                          const selected = patnaSelection.some(([r, c]) => r === cell.row && c === cell.col);
                          const found = patnaFoundWords.some((index) => patnaWordPlacements[index]?.cells.some(([r, c]) => r === cell.row && c === cell.col));
                          return <div key={key} style={{ aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: found ? "#d7b76a" : selected ? "#b98a45" : cursor ? "#ead9aa" : "#fff8e1", color: "#4b2e20", fontWeight: 900, fontSize: "clamp(10px, 2.7vw, 20px)", boxShadow: cursor ? "inset 0 0 0 3px #7b4b35" : "none", userSelect: "none" }}>{cell.letter}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 14, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 800, color: "#7b4b35" }}>WASD = Move &nbsp; | &nbsp; SPACE = Start / Finish</div>
                  <div style={{ textAlign: "center", marginTop: 10, color: "#68482f", fontFamily: "Georgia, 'Times New Roman', serif" }}>🏆 Game XP: {getGameXP("Patna", "pieceOfPast")} / 5</div>
                </div>
              ) : (
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "35px 20px 50px", textAlign: "center", color: "#5a3525" }}>
                  <div style={{ fontSize: 64 }}>🎉</div>
                  <p className="welcome-small">✦ PIECE OF THE PAST COMPLETE ✦</p>
                  <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Patna Word Hunt Complete!</h2>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>You found all 8 hidden words from Patna! 🎊</p>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>🏆 Game XP: {getGameXP("Patna", "pieceOfPast")} / 5 &nbsp; • &nbsp; Overall XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</p>
                  <div style={{ maxWidth: 620, margin: "20px auto", padding: "18px 20px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.6 }}>
                    <strong>✦ Patna discoveries</strong>
                    {PATNA_WORD_PUZZLE.map((entry) => <p key={entry.answer} style={{ margin: "8px 0" }}>✦ {entry.answer}</p>)}
                  </div>
                  <button onClick={() => nextScreen("activities")} style={{ border: "none", borderRadius: 12, padding: "12px 22px", background: "#7b4b35", color: "#fff8e1", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, cursor: "pointer" }}>← BACK TO PATNA</button>
                </div>
              )
            ) : selectedPlace === "Kolkata" ? (

              !kolkataPuzzleComplete ? (
                <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "18px 12px 45px", color: "#5a3525", boxSizing: "border-box" }}>
                  <div className="profile-top">
                    <button className="profile-button" onClick={() => nextScreen("activities")}>← BACK</button>
                  </div>
                  <p className="welcome-small">✦ PIECE OF THE PAST ✦</p>
                  <h2 style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    🧩 Kolkata Word Hunt
                  </h2>
                  <p style={{ textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>
                    Discover 8 hidden words from Kolkata's food and culture.
                  </p>

                  <div style={{ width: "min(100%, 620px)", margin: "18px auto", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", boxSizing: "border-box" }}>
                    <strong>🧭 HOW TO PLAY</strong>
                    <div style={{ marginTop: 8, lineHeight: 1.65, fontSize: 14 }}>
                      🔎 Read the question and find its answer in the grid.<br />
                      🎯 Words can go across, down, or diagonally — forwards or backwards.<br />
                      ⌨️ W = Up &nbsp; A = Left &nbsp; S = Down &nbsp; D = Right<br />
                      ✨ Press SPACE on the first letter, move across the word, then press SPACE again.<br />
                      💡 Use Hint 1 or Hint 2 if you need help.<br />
                      🏆 Find all 8 hidden words to complete the challenge.
                    </div>
                  </div>

                  <div style={{ width: "min(100%, 620px)", margin: "0 auto 14px", padding: "16px 18px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", fontFamily: "Georgia, 'Times New Roman', serif", textAlign: "center", boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 800, marginBottom: 7 }}>Question {kolkataWordQuestion + 1} of {KOLKATA_WORD_PUZZLE.length}</div>
                    <div style={{ lineHeight: 1.5 }}>{KOLKATA_WORD_PUZZLE[kolkataWordQuestion].question}</div>
                    {kolkataHint > 0 && <div style={{ marginTop: 10, fontWeight: 800 }}>💡 Hint: {KOLKATA_WORD_PUZZLE[kolkataWordQuestion].hint}</div>}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setKolkataHint(1)} disabled={kolkataHint >= 1} style={{ border: "none", borderRadius: 10, padding: "9px 14px", background: "#8b633d", color: "#fff8e1", fontWeight: 700, cursor: kolkataHint >= 1 ? "not-allowed" : "pointer", opacity: kolkataHint >= 1 ? 0.55 : 1 }}>💡 Hint</button>
                      <span style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(123,75,53,0.1)", fontWeight: 700 }}>Found: {kolkataFoundWords.length} / 8</span>
                    </div>
                  </div>

                  <div
                    tabIndex={0}
                    autoFocus
                    onKeyDown={(event) => {
                      if (!kolkataWordGrid.length || kolkataPuzzleComplete) return;
                      const key = event.key.toLowerCase();
                      if (!["w", "a", "s", "d", " ", "spacebar"].includes(key)) return;
                      event.preventDefault();
                      let [r, c] = kolkataCursor;
                      if (key === "w") r = Math.max(0, r - 1);
                      if (key === "s") r = Math.min(WORD_GRID_SIZE - 1, r + 1);
                      if (key === "a") c = Math.max(0, c - 1);
                      if (key === "d") c = Math.min(WORD_GRID_SIZE - 1, c + 1);
                      if (key === " ") {
                        if (!kolkataSelecting) {
                          setKolkataSelectionStart([r, c]);
                          setKolkataSelection([[r, c]]);
                          setKolkataSelecting(true);
                        } else {
                          const placementIndex = kolkataWordPlacements.findIndex((placement, index) => {
                            if (kolkataFoundWords.includes(index)) return false;
                            return placement.cells.length === kolkataSelection.length && placement.cells.every(([pr, pc], i) => pr === kolkataSelection[i][0] && pc === kolkataSelection[i][1]);
                          });
                          if (placementIndex >= 0) {
                            const nextFound = [...kolkataFoundWords, placementIndex];
                            setKolkataFoundWords(nextFound);
                            setKolkataSelectionStart(null);
                            setKolkataSelection([]);
                            setKolkataSelecting(false);
                            setKolkataHint(0);
                            if (nextFound.length === KOLKATA_WORD_PUZZLE.length) {
                              setKolkataPuzzleComplete(true);
                              awardJourneyXP("Kolkata", "pieceOfPast", 5, 5);
                            } else {
                              setKolkataWordQuestion((q) => q + 1);
                            }
                          } else {
                            setKolkataSelectionStart(null);
                            setKolkataSelection([]);
                            setKolkataSelecting(false);
                          }
                        }
                        return;
                      }
                      setKolkataCursor([r, c]);
                      if (kolkataSelecting && kolkataSelectionStart) {
                        const [sr, sc] = kolkataSelectionStart;
                        const dr = Math.sign(r - sr);
                        const dc = Math.sign(c - sc);
                        const straight = (r === sr || c === sc || Math.abs(r - sr) === Math.abs(c - sc));
                        if (straight) {
                          const steps = Math.max(Math.abs(r - sr), Math.abs(c - sc));
                          const path = Array.from({ length: steps + 1 }, (_, i) => [sr + dr * i, sc + dc * i] as [number, number]);
                          setKolkataSelection(path);
                        }
                      }
                    }}
                    style={{ outline: "none" }}
                  >
                    <div style={{ width: "min(500px, 88vw)", maxWidth: 500, margin: "0 auto", padding: 7, borderRadius: 18, background: "#3b281c", boxShadow: "0 14px 35px rgba(70,45,25,0.28)", boxSizing: "border-box" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${WORD_GRID_SIZE}, 1fr)`, gap: 2, background: "#6f5035", padding: 4, borderRadius: 13 }}>
                        {kolkataWordGrid.flatMap((row) => row).map((cell) => {
                          const key = `${cell.row}-${cell.col}`;
                          const cursor = kolkataCursor[0] === cell.row && kolkataCursor[1] === cell.col;
                          const selected = kolkataSelection.some(([r, c]) => r === cell.row && c === cell.col);
                          const found = kolkataFoundWords.some((index) => kolkataWordPlacements[index]?.cells.some(([r, c]) => r === cell.row && c === cell.col));
                          return (
                            <div key={key} style={{ aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: found ? "#d7b76a" : selected ? "#b98a45" : cursor ? "#ead9aa" : "#fff8e1", color: "#4b2e20", fontWeight: 900, fontSize: "clamp(13px, 3.8vw, 22px)", boxShadow: cursor ? "inset 0 0 0 3px #7b4b35" : "none", userSelect: "none" }}>
                              {cell.letter}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", marginTop: 14, fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 800, color: "#7b4b35" }}>
                    WASD = Move &nbsp; | &nbsp; SPACE = Start / Finish
                  </div>
                  <div style={{ textAlign: "center", marginTop: 10, color: "#68482f", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    🏆 Game XP: {getGameXP("Kolkata", "pieceOfPast")} / 5
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "35px 20px 50px", textAlign: "center", color: "#5a3525" }}>
                  <div style={{ fontSize: 64 }}>🎉</div>
                  <p className="welcome-small">✦ PIECE OF THE PAST COMPLETE ✦</p>
                  <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Kolkata Word Hunt Complete!</h2>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>You found all 8 hidden words from Kolkata! 🎊</p>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>🏆 Game XP: {getGameXP("Kolkata", "pieceOfPast")} / 5 &nbsp; • &nbsp; Overall XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</p>
                  <div style={{ maxWidth: 620, margin: "20px auto", padding: "18px 20px", borderRadius: 16, background: "rgba(255,248,225,0.94)", border: "1px solid rgba(90,60,35,0.2)", textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.6 }}>
                    <strong>✦ Kolkata discoveries</strong>
                    {KOLKATA_WORD_PUZZLE.map((entry) => <p key={entry.answer} style={{ margin: "8px 0" }}>✦ {entry.answer}</p>)}
                  </div>
                  <button onClick={() => nextScreen("activities")} style={{ border: "none", borderRadius: 12, padding: "12px 22px", background: "#7b4b35", color: "#fff8e1", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, cursor: "pointer" }}>← BACK TO KOLKATA</button>
                </div>
              )
            ) : (
              !puzzleComplete ? (
                <>
                  <div className="profile-top"><button className="profile-button" onClick={() => nextScreen("activities")}>← BACK</button></div>
                  <p className="welcome-small">✦ PIECE OF THE PAST ✦</p>
                  <h2>🧩 Rebuild the {selectedPlace === "Chennai" ? "Tradition" : selectedPlace === "Thanjavur" ? "Landmark" : selectedPlace === "Mysuru" ? "Mysore Palace" : selectedPlace === "Jaipur" ? "Hawa Mahal" : selectedPlace === "Amritsar" ? "Golden Temple" : selectedPlace === "Delhi" ? "Lotus Temple" : selectedPlace === "Agra" ? "Taj Mahal" : "Portrait"}</h2>
                  <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 50px" }}>
                    <div style={{ marginBottom: 14, textAlign: "center", color: "#7b4b35", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>
                      <span>{selectedPlace === "Chennai" ? "9-piece culture puzzle" : selectedPlace === "Thanjavur" ? "9-piece landmark puzzle" : selectedPlace === "Mysuru" ? "9-piece palace puzzle" : selectedPlace === "Jaipur" ? "9-piece landmark puzzle" : selectedPlace === "Amritsar" ? "9-piece landmark puzzle" : "16-piece portrait puzzle"}</span>
                      <span style={{ display: "block", marginTop: 4 }}>Drag a piece onto another to swap</span>
                    </div>
                    <div style={{ width: "min(600px, 90vw)", aspectRatio: "1 / 1", margin: "0 auto", padding: 5, display: "grid", gridTemplateColumns: selectedPlace === "Chennai" || selectedPlace === "Thanjavur" || selectedPlace === "Mysuru" || selectedPlace === "Jaipur" || selectedPlace === "Amritsar" || selectedPlace === "Delhi" || selectedPlace === "Agra" ? "repeat(3, 1fr)" : "repeat(4, 1fr)", gridTemplateRows: selectedPlace === "Chennai" || selectedPlace === "Thanjavur" || selectedPlace === "Mysuru" || selectedPlace === "Jaipur" || selectedPlace === "Amritsar" || selectedPlace === "Delhi" || selectedPlace === "Agra" ? "repeat(3, 1fr)" : "repeat(4, 1fr)", gap: 3, background: "#3b281c", borderRadius: 18, boxShadow: "0 12px 30px rgba(70,45,25,0.25)", overflow: "hidden" }}>
                      {puzzlePieces.map((piece, position) => {
                        const puzzleGridSize = selectedPlace === "Chennai" || selectedPlace === "Thanjavur" || selectedPlace === "Mysuru" || selectedPlace === "Jaipur" || selectedPlace === "Amritsar" || selectedPlace === "Delhi" || selectedPlace === "Agra" ? 3 : 4;
                        const row = Math.floor(piece.correctPosition / puzzleGridSize);
                        const col = piece.correctPosition % puzzleGridSize;
                        return <div key={piece.id} draggable={!puzzleComplete} onDragStart={() => setDraggedPuzzleIndex(position)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedPuzzleIndex !== null) swapPuzzlePieces(draggedPuzzleIndex, position); setDraggedPuzzleIndex(null); }} onDragEnd={() => setDraggedPuzzleIndex(null)} style={{ minWidth: 0, minHeight: 0, cursor: puzzleComplete ? "default" : "grab", backgroundImage: `url(${selectedPlace === "Chennai" ? CHENNAI_PERSONALITY_IMAGE : selectedPlace === "Thanjavur" ? THANJAVUR_PUZZLE_IMAGE : selectedPlace === "Mysuru" ? MYSURU_PUZZLE_IMAGE : selectedPlace === "Jaipur" ? JAIPUR_PUZZLE_IMAGE : selectedPlace === "Amritsar" ? AMRITSAR_PUZZLE_IMAGE : selectedPlace === "Delhi" ? DELHI_PUZZLE_IMAGE : selectedPlace === "Agra" ? AGRA_PUZZLE_IMAGE : HYDERABAD_PERSONALITY_IMAGE})`, backgroundSize: selectedPlace === "Chennai" || selectedPlace === "Thanjavur" || selectedPlace === "Mysuru" || selectedPlace === "Jaipur" || selectedPlace === "Amritsar" || selectedPlace === "Delhi" || selectedPlace === "Agra" ? "300% 300%" : "400% 400%", backgroundPosition: selectedPlace === "Chennai" || selectedPlace === "Thanjavur" || selectedPlace === "Mysuru" || selectedPlace === "Jaipur" || selectedPlace === "Amritsar" || selectedPlace === "Delhi" || selectedPlace === "Agra" ? `${col * 50}% ${row * 50}%` : `${col * 33.3333}% ${row * 33.3333}%`, borderRadius: 5, border: "1px solid rgba(255,248,225,0.55)", boxShadow: "inset 0 0 0 1px rgba(60,40,25,0.2)" }} aria-label={`Puzzle piece ${position + 1}`} />;
                      })}
                    </div>
                    <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "rgba(255,248,225,0.9)", border: "1px solid rgba(90,60,35,0.2)", color: "#68482f", fontFamily: "Georgia, 'Times New Roman', serif", textAlign: "center", lineHeight: 1.5 }}>💡 Tip: Drag one piece onto another. They will swap places.</div>
                    <div style={{ marginTop: 10, textAlign: "center", color: "#7b4b35", fontWeight: 700, fontFamily: "Georgia, 'Times New Roman', serif" }}>🏆 Game XP: {getGameXP(selectedPlace, "pieceOfPast")} / 5</div>
                  </div>
                </>
              ) : (
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "35px 20px 50px", textAlign: "center", color: "#5a3525" }}>
                  <div style={{ fontSize: 58 }}>🎉</div>
                  <p className="welcome-small">✦ PIECE OF THE PAST COMPLETE ✦</p>
                  <h2>{selectedPlace === "Mysuru" ? "Mysore Palace Rebuilt!" : selectedPlace === "Jaipur" ? "Hawa Mahal Rebuilt!" : selectedPlace === "Amritsar" ? "Golden Temple Rebuilt!" : selectedPlace === "Delhi" ? "Lotus Temple Rebuilt!" : selectedPlace === "Agra" ? "Taj Mahal Rebuilt!" : "Portrait Rebuilt!"}</h2>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#5a3525", fontWeight: 700 }}>🏆 Game XP: {getGameXP(selectedPlace, "pieceOfPast")} / 5 &nbsp; • &nbsp; Overall XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</p>
                  <div style={{ width: "min(330px, 75vw)", aspectRatio: "1 / 1", margin: "20px auto", borderRadius: 18, overflow: "hidden", border: "4px solid #b98a45", boxShadow: "0 12px 28px rgba(70,45,25,0.25)", backgroundImage: `url(${selectedPlace === "Chennai" ? CHENNAI_PERSONALITY_IMAGE : selectedPlace === "Thanjavur" ? THANJAVUR_PUZZLE_IMAGE : selectedPlace === "Mysuru" ? MYSURU_PUZZLE_IMAGE : selectedPlace === "Jaipur" ? JAIPUR_PUZZLE_IMAGE : selectedPlace === "Amritsar" ? AMRITSAR_PUZZLE_IMAGE : selectedPlace === "Delhi" ? DELHI_PUZZLE_IMAGE : selectedPlace === "Agra" ? AGRA_PUZZLE_IMAGE : HYDERABAD_PERSONALITY_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <h3 style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{selectedPlace === "Chennai" ? "Bharatanatyam" : selectedPlace === "Thanjavur" ? "Thanjavur Heritage" : selectedPlace === "Mysuru" ? "Mysore Palace" : selectedPlace === "Jaipur" ? "Hawa Mahal" : selectedPlace === "Amritsar" ? "Golden Temple" : selectedPlace === "Delhi" ? "Lotus Temple" : selectedPlace === "Agra" ? "Taj Mahal" : "Muhammad Quli Qutb Shah"}</h3>
                  <button onClick={() => nextScreen("activities")} style={{ border: "none", borderRadius: 12, padding: "12px 22px", background: "#7b4b35", color: "#fff8e1", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, cursor: "pointer" }}>← BACK TO {selectedPlace.toUpperCase()}</button>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {screen === "cultureQuest" && (
        <section className="screen parchment-screen">
          <div className="scroll region-scroll">
            <div className="profile-top">
              <button
                className="profile-button"
                onClick={() => nextScreen("activities")}
              >
                ← BACK
              </button>
            </div>

            <p className="welcome-small">✦ CULTURE QUEST ✦</p>

            <h2>🏛️ Match the Following – {selectedPlace} Region</h2>

            <p className="scroll-description">
              Drag the correct description from Column B to Column A
            </p>

            <p
              style={{
                margin: "-4px auto 14px",
                fontSize: 12,
                color: "#6b513f",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              Keep dragging toward the top or bottom edge to scroll while carrying an answer.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 45,
                flexWrap: "wrap",
                maxWidth: 1050,
                margin: "0 auto",
                padding: "8px 18px 25px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minWidth: "min(320px, 90vw)",
                  width: 320,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#5a3525",
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textAlign: "center",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Column A – Place / Culture
                </div>

                {currentCultureData.map((entry) => {
                  const matched = cultureMatched.includes(entry.id);
                  const wrongAnswers = cultureWrongDrops[entry.id] || [];
                  const hasWrong = wrongAnswers.length > 0;
                  const isDragOver = cultureDragOver === entry.id;

                  return (
                    <div
                      key={entry.id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (!matched && !cultureSubmitted) setCultureDragOver(entry.id);
                      }}
                      onDragLeave={() => {
                        if (cultureDragOver === entry.id) setCultureDragOver(null);
                      }}
                      onDrop={(event) => handleCultureDrop(event, entry.id)}
                      style={{
                        width: "100%",
                        minHeight: 75,
                        background: matched
                          ? "#d9f2d9"
                          : isDragOver
                            ? "#fff2cc"
                            : hasWrong
                              ? "#f9d6d6"
                              : "rgba(255,255,255,0.92)",
                        border: matched
                          ? "2px solid #2e7d32"
                          : hasWrong
                            ? "2px solid #c62828"
                            : isDragOver
                              ? "2px solid #d9a441"
                              : "2px dashed #b8862e",
                        borderRadius: 12,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        textAlign: "left",
                        flexWrap: "wrap",
                        transition: "0.2s",
                        transform: isDragOver ? "scale(1.02)" : "scale(1)",
                        boxShadow: "0 5px 14px rgba(70,45,25,0.08)",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      <div style={{ flexGrow: 1, fontSize: 14, color: "#4d3022" }}>
                        <strong>{entry.id}. {entry.item}</strong>

                        {wrongAnswers.map((answer, index) => (
                          <div
                            key={`${entry.id}-wrong-${index}`}
                            style={{ width: "100%", marginTop: 8, fontWeight: 700, fontSize: 13, color: "#c62828" }}
                          >
                            ✗ {answer}
                          </div>
                        ))}

                        {matched && (
                          <div
                            style={{ width: "100%", marginTop: 8, fontWeight: 700, fontSize: 13, color: "#2e7d32" }}
                          >
                            ✓ {entry.connection}
                          </div>
                        )}
                      </div>

                      <span style={{ fontSize: 22, marginLeft: 8 }}>
                        {matched ? "✅" : hasWrong ? "❌" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minWidth: "min(300px, 90vw)",
                  width: 300,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#12313b",
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textAlign: "center",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Column B – Description
                </div>

                {cultureConnectionOrder.map((id) => {
                  const entry = currentCultureData.find((item) => item.id === id);
                  if (!entry) return null;
                  const used = cultureMatched.includes(entry.id);

                  return (
                    <div
                      key={entry.id}
                      draggable={!used && !cultureSubmitted}
                      onDragStart={(event) => handleCultureDragStart(event, entry.id)}
                      onDragEnd={handleCultureDragEnd}
                      style={{
                        width: "100%",
                        padding: "15px 16px",
                        minHeight: 65,
                        display: used ? "none" : "flex",
                        alignItems: "center",
                        background: "#12313b",
                        color: "#fdf6e3",
                        border: "2px solid #0a1f26",
                        borderRadius: 10,
                        cursor: used || cultureSubmitted ? "default" : "grab",
                        fontSize: 13,
                        lineHeight: 1.4,
                        userSelect: "none",
                        opacity: cultureDraggedId === entry.id ? 0.6 : 1,
                        transform: cultureDraggedId === entry.id ? "scale(1.03)" : "scale(1)",
                        boxShadow: cultureDraggedId === entry.id
                          ? "0 8px 18px rgba(0,0,0,0.25)"
                          : "0 5px 10px rgba(0,0,0,0.12)",
                        transition: "0.2s",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {String.fromCharCode(64 + entry.id)}. {entry.connection}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                className="green-button"
                onClick={submitCultureQuest}
                disabled={cultureSubmitted}
                style={{ opacity: cultureSubmitted ? 0.6 : 1, cursor: cultureSubmitted ? "default" : "pointer" }}
              >
                SUBMIT
              </button>

              {cultureSubmitted && (
                <button
                  className="brown-button"
                  onClick={() => resetCultureQuest(selectedPlace)}
                  style={{ marginLeft: 10 }}
                >
                  PLAY AGAIN
                </button>
              )}
            </div>

            <div
              style={{
                margin: "18px auto 35px",
                maxWidth: 650,
                textAlign: "center",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 700,
                color: cultureSubmitted && cultureComplete ? "#2e7d32" : cultureSubmitted ? "#c62828" : "#b8862e",
                fontSize: 17,
              }}
            >
              {cultureSubmitted ? (
                cultureComplete ? (
                  <>🎉 Excellent! Final Score: {cultureMatched.length}/{currentCultureData.length}</>
                ) : cultureMatched.length >= Math.ceil(currentCultureData.length / 2) ? (
                  <>👏 Good Job! Final Score: {cultureMatched.length}/{currentCultureData.length}</>
                ) : (
                  <>🏆 Final Score: {cultureMatched.length}/{currentCultureData.length}</>
                )
              ) : (
                <>
                  {cultureMatched.length}/{currentCultureData.length} matches completed
                  <br />
                  <span style={{ fontSize: 13 }}>🏆 Game XP: {getGameXP(selectedPlace, "cultureQuest")} / {currentCultureData.length * 5}</span>
                  <br />
                  <span style={{ fontSize: 13, fontWeight: 400 }}>
                    Drag a description onto the matching item. Wrong answers stay in the box so you can continue.
                  </span>
                </>
              )}
            </div>

            {cultureSubmitted && cultureComplete && (
              <div
                style={{
                  maxWidth: 650,
                  margin: "0 auto 35px",
                  padding: "20px",
                  borderRadius: 18,
                  background: "rgba(255,248,225,0.95)",
                  border: "1px solid rgba(90,60,35,0.22)",
                  color: "#5a3525",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  lineHeight: 1.6,
                  textAlign: "left",
                }}
              >
                <h3 style={{ textAlign: "center", marginTop: 0 }}>🎭 {selectedPlace} Culture Quest Complete!</h3>
                <p style={{ textAlign: "center", fontWeight: 700 }}>🏆 Game XP: {getGameXP(selectedPlace, "cultureQuest")} / {currentCultureData.length * 5} &nbsp; • &nbsp; Overall XP: {overallJourneyXP} / {MAX_JOURNEY_XP}</p>
                {selectedPlace === "Chennai" ? (
                  <>
                    <p>✦ You matched all 10 Chennai cultural and heritage connections.</p>
                    <p>✦ You discovered forts, temples, monuments, architecture and museums.</p>
                    <p>✦ Chennai&apos;s heritage reflects Tamil culture and a rich historical legacy.</p>
                  </>
                ) : selectedPlace === "Thanjavur" ? (
                  <>
                    <p>✦ You matched all 6 Thanjavur cultural and heritage connections.</p>
                    <p>✦ You discovered Chola heritage, traditional art, dolls and music.</p>
                    <p>✦ Thanjavur&apos;s culture reflects a rich Chola-era historical and artistic legacy.</p>
                  </>
                ) : selectedPlace === "Mysuru" ? (
                  <>
                    <p>✦ You matched all 6 Mysuru cultural and heritage connections.</p>
                    <p>✦ You discovered Mysore Palace, Chamundi Hill, Dasara, silk and sandalwood traditions.</p>
                    <p>✦ Mysuru&apos;s heritage reflects its royal history and rich cultural traditions.</p>
                  </>
                ) : selectedPlace === "Amritsar" ? (
                  <>
                    <p>✦ You matched all 6 Amritsar cultural and heritage connections.</p>
                    <p>✦ You discovered the Golden Temple, Jallianwala Bagh, Wagah-Attari Border and Baisakhi.</p>
                    <p>✦ You also explored Bhangra and Amritsari Kulcha.</p>
                  </>
                ) : selectedPlace === "Delhi" ? (
                  <>
                    <p>✦ You matched all 6 Delhi cultural and heritage connections.</p>
                    <p>✦ You discovered Purana Qila, Humayun’s Tomb, Safdarjung’s Tomb and Jama Masjid.</p>
                    <p>✦ You also explored the Lotus Temple and Gurudwara Bangla Sahib.</p>
                  </>
                ) : selectedPlace === "Agra" ? (
                  <>
                    <p>✦ You matched all 10 Agra cultural and heritage connections.</p>
                    <p>✦ You discovered the Taj Mahal, Agra Fort, Fatehpur Sikri and Mehtab Bagh.</p>
                    <p>✦ You also explored Agra Petha, Dalmoth, the Yamuna River, Shah Jahan and Akbar.</p>
                  </>
                ) : selectedPlace === "Jaipur" ? (
                  <>
                    <p>✦ You matched all 6 Jaipur cultural and heritage connections.</p>
                    <p>✦ You discovered Hawa Mahal, Amber Fort, City Palace and Jantar Mantar.</p>
                    <p>✦ You also explored Jaipur&apos;s blue pottery and the Gangaur Festival.</p>
                  </>
                ) : selectedPlace === "Patna" ? (
                  <>
                    <p>✦ You matched all 6 Patna cultural and heritage connections.</p>
                    <p>✦ You discovered Golghar, Patna Museum, the Ganga, Bodh Gaya and Patna Sahib.</p>
                    <p>✦ You also explored Chhath Puja and Patna's rich heritage.</p>
                  </>
                ) : selectedPlace === "Puri" ? (
                  <>
                    <p>✦ You matched all 6 Puri cultural and heritage connections.</p>
                    <p>✦ You discovered the Jagannath Temple, Rath Yatra, Puri Beach, Khaja and Pattachitra.</p>
                    <p>✦ Puri's heritage reflects the rich history and culture of Odisha.</p>
                  </>
                ) : selectedPlace === "Bhubaneswar" ? (
                  <>
                    <p>✦ You matched all 6 Bhubaneswar cultural and heritage connections.</p>
                    <p>✦ You discovered Lingaraj Temple, Konark Sun Temple, Dhauli Shanti Stupa, Odissi, Rath Yatra and Khandagiri and Udayagiri Caves.</p>
                    <p>✦ Bhubaneswar's heritage reflects the rich history and culture of Odisha.</p>
                  </>
                ) : (
                  <>
                    <p>✦ You matched all 6 Hyderabad cultural connections.</p>
                    <p>✦ You discovered festivals, food, markets, crafts and language traditions.</p>
                    <p>✦ Hyderabad&apos;s culture reflects the rich history of Telangana and the Deccan.</p>
                  </>
                )}
              </div>
            )}

            {cultureSubmitted && (
              <div style={{ textAlign: "center", marginBottom: 35 }}>
                <button
                  className="green-button"
                  onClick={() => nextScreen("activities")}
                >
                  BACK TO {selectedPlace.toUpperCase()}
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          PROFILE
      =================================================== */}

      {screen === "profile" && (
        <section className="screen profile-screen">
          <div className="profile-page">

            <button
              className="profile-back"
              onClick={() =>
                nextScreen(profileReturnScreen)
              }
            >
              ← Back
            </button>

            <div className="profile-header">
              <div className="profile-avatar">
                {EXPLORER_DATA[explorer].emoji}
              </div>

              <div className="profile-info">
                <p className="profile-label">
                  MY EXPLORER PROFILE
                </p>

                <h1>{nickname || "Explorer"}</h1>

                <div className="explorer-title">
                  ✦ Newbie Explorer ✦
                </div>
              </div>
            </div>

            <div className="level-card">

              <div className="level-heading">
                <span>Explorer Level</span>
                <strong>Level {explorerLevel}</strong>
              </div>

              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{
                    width: `${Math.min((overallJourneyXP / MAX_JOURNEY_XP) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="xp-text">
                <span>{overallJourneyXP} XP</span>
                <span>{MAX_JOURNEY_XP} XP</span>
              </div>

              <p
                style={{
                  margin: "10px 0 0",
                  textAlign: "center",
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                🌏 Journey XP — +5 XP for every successful challenge, with a 1000 XP journey limit.
              </p>
            </div>

            <div className="profile-stats">
              <div className="stat-card">
                <div>🗺️</div>
                <strong>{exploredPlacesCount}</strong>
                <span>Places Explored</span>
              </div>

              <div className="stat-card">
                <div>🎯</div>
                <strong>{challengeCount}</strong>
                <span>XP Challenges</span>
              </div>

              <div className="stat-card">
                <div>🏆</div>
                <strong>{overallJourneyXP > 0 ? 1 : 0}</strong>
                <span>Badges Earned</span>
              </div>

              <div className="stat-card">
                <div>🃏</div>
                <strong>{hyderabadHeritageUnlocked ? 1 : 0}</strong>
                <span>Heritage Cards</span>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-heading">
                <h2>📊 Journey Progress</h2>
                <span>{overallJourneyXP} / {MAX_JOURNEY_XP} XP</span>
              </div>

              <p className="collection-description">
                See your XP by region, place and game. Each successful action adds 5 XP.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {Object.entries(PROFILE_REGIONS).map(([region, places]) => (
                  <div
                    key={region}
                    style={{
                      background: "rgba(255,248,225,0.8)",
                      border: "1px solid rgba(90,60,35,0.18)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px",
                        color: "#7b4b35",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      🇮🇳 {region} India
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {places.map((place) => {
                        const timeMax = getTimeTrekMaximum(place);
                        const puzzleMax = getPuzzleMaximum(place);
                        const cultureMax = getCultureMaximum(place);
                        const placeTotal =
                          getGameXP(place, "timeTrek") +
                          getGameXP(place, "pieceOfPast") +
                          getGameXP(place, "cultureQuest");
                        const isBuilt = timeMax + puzzleMax + cultureMax > 0;

                        return (
                          <div
                            key={place}
                            style={{
                              padding: "12px 13px",
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.72)",
                              border: "1px solid rgba(90,60,35,0.12)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                flexWrap: "wrap",
                                fontFamily: "Georgia, 'Times New Roman', serif",
                                color: "#4d3022",
                                fontWeight: 700,
                              }}
                            >
                              <span>📍 {place}</span>
                              <span>{isBuilt ? `${placeTotal} XP total` : "🔒 Coming soon"}</span>
                            </div>

                            {isBuilt && (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                  gap: 8,
                                  marginTop: 9,
                                  fontSize: 12,
                                  color: "#68482f",
                                }}
                              >
                                <div>⏳ Time Trek: <strong>{getGameXP(place, "timeTrek")} / {timeMax}</strong></div>
                                <div>🧩 Piece of the Past: <strong>{getGameXP(place, "pieceOfPast")} / {puzzleMax}</strong></div>
                                <div>🎭 Culture Quest: <strong>{getGameXP(place, "cultureQuest")} / {cultureMax}</strong></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-heading">
                <h2>🏆 Badges & Achievements</h2>
                <span>1 / 6</span>
              </div>

              <div className="badges-grid">
                <div className="badge-card unlocked">
                  <div className="badge-icon">🌱</div>
                  <strong>Journey Begins</strong>
                  <small>
                    Start your Bharat journey
                  </small>
                </div>

                <div className="badge-card locked">
                  <div className="badge-icon">🗺️</div>
                  <strong>First Explorer</strong>
                  <small>
                    Explore your first place
                  </small>
                  <span className="lock">🔒</span>
                </div>

                <div className="badge-card locked">
                  <div className="badge-icon">🧠</div>
                  <strong>History Hunter</strong>
                  <small>
                    Complete history challenges
                  </small>
                  <span className="lock">🔒</span>
                </div>

                <div className="badge-card locked">
                  <div className="badge-icon">🧩</div>
                  <strong>Past Rebuilder</strong>
                  <small>
                    Complete a personality puzzle
                  </small>
                  <span className="lock">🔒</span>
                </div>

                <div className="badge-card locked">
                  <div className="badge-icon">🎭</div>
                  <strong>Culture Keeper</strong>
                  <small>
                    Complete a culture challenge
                  </small>
                  <span className="lock">🔒</span>
                </div>

                <div className="badge-card locked">
                  <div className="badge-icon">🇮🇳</div>
                  <strong>Bharat Explorer</strong>
                  <small>
                    Explore multiple regions
                  </small>
                  <span className="lock">🔒</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-heading">
                <h2>🃏 Heritage Collection</h2>
                <span>{hyderabadHeritageUnlocked ? "1 / 16" : "0 / 16"}</span>
              </div>

              <p className="collection-description">
                Complete all challenges at a place to
                unlock its Heritage Card and add it to
                your collection.
              </p>

              <div className="collection-grid">
                {hyderabadHeritageUnlocked ? (
                  <button
                    className="heritage-card unlocked-card"
                    onClick={() => nextScreen("heritageCard")}
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    <div style={{ fontSize: 38 }}>🕌</div>
                    <strong>Hyderabad</strong>
                    <span>✨ Unlocked</span>
                  </button>
                ) : (
                  <div className="heritage-card locked-card">
                    <div className="card-question">?</div>
                    <strong>Heritage Card</strong>
                    <span>🔒 Locked</span>
                  </div>
                )}

                {[2, 3, 4].map((card) => (
                  <div className="heritage-card locked-card" key={card}>
                    <div className="card-question">?</div>
                    <strong>Heritage Card</strong>
                    <span>🔒 Locked</span>
                  </div>
                ))}
              </div>

              <p className="collection-hint">
                ✦ Your collection will grow as you
                explore Bharat ✦
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          BHARAT ARCADE
      =================================================== */}

      {screen === "arcade" && (
        <section className="screen parchment-screen">
          <div className="scroll arcade-scroll">

            <button
              className="profile-back"
              onClick={() => nextScreen("landing")}
            >
              ← Back
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
              }}
            >
              <button
                className="profile-button"
                onClick={() => {
                  setProfileReturnScreen("arcade");
                  nextScreen("profile");
                }}
              >
                👤 MY PROFILE
              </button>
            </div>

            <div className="arcade-heading">
              <p className="welcome-small">
                ✦ BHARAT ARCADE ✦
              </p>

              <h2>🎮 Play & Learn</h2>

              <p className="scroll-description">
                Take a break from your journey
                <br />
                and enjoy fun heritage games!
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 5,
                  padding: "8px 15px",
                  borderRadius: 14,
                  background: "rgba(255,248,225,0.9)",
                  border: "1px solid rgba(90,60,35,0.18)",
                  color: "#5a3525",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                🎮 Arcade XP: {arcadeXP}
              </div>
            </div>

            <div className="arcade-games">

              <button
                className="arcade-game-card memory-game-card"
                onClick={() =>
                  nextScreen("memoryLevels")
                }
              >
                <div className="arcade-game-icon">
                  🃏
                </div>

                <div className="arcade-game-content">
                  <span>Memory Match</span>

                  <small>
                    Match historical clues with their
                    answers.
                  </small>

                  <strong>2 Levels Available</strong>
                </div>

                <div className="arcade-play">
                  PLAY →
                </div>
              </button>

              <button
                className="arcade-game-card memory-game-card"
                onClick={openHeritageMaze}
              >
                <div className="arcade-game-icon">
                  🧭
                </div>

                <div className="arcade-game-content">
                  <span>Heritage Maze</span>

                  <small>
                    Explore, navigate and discover
                    India&apos;s heritage.
                  </small>

                  <strong>
                    5 Progressive Levels
                  </strong>
                </div>

                <div className="arcade-play">
                  PLAY →
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          MEMORY LEVELS
      =================================================== */}

      {screen === "memoryLevels" && (
        <section className="screen parchment-screen">
          <div className="scroll memory-levels-scroll">
            <button
              className="profile-back"
              onClick={() => nextScreen("arcade")}
            >
              ← Back to Arcade
            </button>

            <div className="memory-levels-heading">
              <p className="welcome-small">
                ✦ BHARAT ARCADE ✦
              </p>

              <h2>🃏 Memory Match</h2>

              <p className="scroll-description">
                Choose a level and test your
                <br />
                knowledge of India&apos;s heritage!
              </p>
            </div>

            <div className="memory-level-selection">
              {MEMORY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  className="memory-level-selection-card"
                  onClick={() =>
                    openMemoryLevel(level.id)
                  }
                >
                  <div className="memory-level-number">
                    LEVEL {level.id}
                  </div>

                  <div className="memory-level-icon">
                    🃏
                  </div>

                  <h3>{level.title}</h3>

                  <p>{level.subtitle}</p>

                  <span>PLAY LEVEL →</span>
                </button>
              ))}

              {LOCKED_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className="memory-level-selection-card locked-memory-selection"
                >
                  <div className="memory-level-number">
                    LEVEL {level.id} 🔒
                  </div>

                  <div className="memory-level-icon">
                    🔒
                  </div>

                  <h3>{level.title}</h3>

                  <p>{level.subtitle}</p>

                  <span>COMING SOON</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          MEMORY MATCH GAME
      =================================================== */}

      {screen === "memory" &&
        currentMemoryLevel && (
          <section className="screen memory-screen">
            <div className="memory-game">

              <button
                className="profile-back"
                onClick={() =>
                  nextScreen("memoryLevels")
                }
              >
                ← Back to Levels
              </button>

              <div className="memory-header">
                <p className="welcome-small">
                  ✦ BHARAT ARCADE ✦
                </p>

                <h1>🃏 Memory Match</h1>

                <p>
                  Level {currentMemoryLevel.id}:{" "}
                  {currentMemoryLevel.title}
                </p>
              </div>

              <div className="memory-rules">
                <h3>📜 HOW TO PLAY</h3>

                <div className="memory-rules-content">
                  <div className="memory-rule memory-rule-blue">
                    <span>🔵 BLUE CARD</span>
                    Question
                  </div>

                  <div className="memory-rule memory-rule-green">
                    <span>🟢 GREEN CARD</span>
                    Answer
                  </div>

                  <div className="memory-rule memory-rule-match">
                    <span>🎯 YOUR GOAL</span>
                    Match each question with its
                    correct answer.
                  </div>
                </div>
              </div>

              <div className="memory-stats">
                <div>
                  <span>⭐</span>
                  <strong>{memoryScore}</strong>
                  <small>Score</small>
                </div>

                <div>
                  <span>🎯</span>
                  <strong>{memoryMoves}</strong>
                  <small>Moves</small>
                </div>

                <div>
                  <span>🃏</span>
                  <strong>
                    {completedPairs}/
                    {currentMemoryLevel.pairs.length}
                  </strong>
                  <small>Pairs</small>
                </div>
              </div>

              {!memoryComplete && (
                <div className="memory-grid">
                  {memoryCards.map((card) => {
                    const isFlipped =
                      flippedCards.includes(card.id) ||
                      card.matched;

                    return (
                      <button
                        key={card.id}
                        className={`memory-card ${isFlipped ? "flipped" : ""
                          } ${card.matched ? "matched" : ""
                          } ${card.type === "question"
                            ? "question-card"
                            : "answer-card"
                          }`}
                        onClick={() =>
                          handleMemoryCardClick(
                            card.id
                          )
                        }
                      >
                        {isFlipped ? (
                          <div className="memory-card-content">
                            {card.type ===
                              "question" ? (
                              <>
                                <span className="memory-card-label">
                                  QUESTION
                                </span>

                                <p>{card.text}</p>
                              </>
                            ) : (
                              <>
                                <span className="memory-card-label">
                                  ANSWER
                                </span>

                                <strong>
                                  {card.text}
                                </strong>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="memory-card-back">
                            <div>🇮🇳</div>
                            <strong>?</strong>
                            <span>Flip Me</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {memoryComplete && (
                <div className="memory-complete">
                  <div className="memory-win-emoji">
                    🎉
                  </div>

                  <h2>Amazing, Explorer!</h2>

                  <p>
                    You matched all the heritage pairs!
                  </p>

                  <div className="memory-final-score">
                    ⭐ {memoryScore} Points
                  </div>

                  <div className="memory-completion-badge">
                    🏆 Level {selectedMemoryLevel}{" "}
                    Complete
                  </div>

                  <p className="memory-fact">
                    ✦ Every match is another opportunity
                    <br />
                    to discover India&apos;s incredible
                    heritage. ✦
                  </p>

                  <div className="memory-actions">
                    <button
                      className="green-button"
                      onClick={() =>
                        resetMemoryGame(
                          selectedMemoryLevel
                        )
                      }
                    >
                      PLAY AGAIN
                      <span>↻</span>
                    </button>

                    <button
                      className="brown-button"
                      onClick={() =>
                        nextScreen("arcade")
                      }
                    >
                      BACK TO ARCADE
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {/* ===================================================
          HERITAGE MAZE
      =================================================== */}

      {screen === "maze" && (
        <section
          className="screen"
          style={{
            minHeight: "100vh",
            width: "100%",
            overflowY: "auto",
            background:
              currentMazeLevel.background,
            color: "#fff",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
            padding: "25px 15px 40px",
            position: "relative",
          }}
        >

          <div
            style={{
              position: "fixed",
              top: 65,
              left: 20,
              fontSize: 34,
              opacity: 0.8,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            🌿
          </div>

          <div
            style={{
              position: "fixed",
              top: 65,
              right: 20,
              fontSize: 34,
              opacity: 0.8,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            🌿
          </div>

          <div
            style={{
              width: "min(1050px, 100%)",
              margin: "0 auto",
            }}
          >

            <button
              onClick={() => nextScreen("arcade")}
              style={{
                background:
                  "rgba(38, 25, 17, 0.78)",
                color: "#fff5d6",
                border:
                  "1px solid rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: "10px 18px",
                cursor: "pointer",
                fontSize: 14,
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                marginBottom: 15,
              }}
            >
              ← Back to Arcade
            </button>

            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  opacity: 0.9,
                  marginBottom: 6,
                }}
              >
                ✦ BHARAT ARCADE ✦
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize:
                    "clamp(30px, 5vw, 48px)",
                  textShadow:
                    "0 3px 15px rgba(0,0,0,0.45)",
                }}
              >
                🧭 Heritage Maze
              </h1>

              <p
                style={{
                  margin: "8px auto 0",
                  maxWidth: 650,
                  fontSize: 15,
                  opacity: 0.95,
                }}
              >
                {currentMazeLevel.description}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >

              <div
                style={{
                  background:
                    "rgba(30,20,15,0.75)",
                  borderRadius: 14,
                  padding: "10px 18px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <strong>
                  LEVEL {currentMazeLevel.id}
                </strong>
              </div>

              <div
                style={{
                  background:
                    "rgba(30,20,15,0.75)",
                  borderRadius: 14,
                  padding: "10px 18px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                ⭐ {currentMazeLevel.difficulty}
              </div>

              <div
                style={{
                  background:
                    "rgba(30,20,15,0.75)",
                  borderRadius: 14,
                  padding: "10px 18px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                🪙 {mazeCollectedCoins} / 3
              </div>

              <div
                style={{
                  background:
                    "rgba(30,20,15,0.75)",
                  borderRadius: 14,
                  padding: "10px 18px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                🎮 {arcadeXP} Arcade XP
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background:
                    "rgba(255,248,220,0.94)",
                  color: "#3c291d",
                  borderRadius: 18,
                  padding: "10px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.3)",
                }}
              >
                <span style={{ fontSize: 28 }}>
                  {currentMazeLevel.monument}
                </span>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      opacity: 0.65,
                    }}
                  >
                    Destination
                  </div>

                  <strong
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {currentMazeLevel.destination}
                  </strong>
                </div>
              </div>
            </div>

            {!mazeComplete && (
              <>
                <div
                  style={{
                    width: "min(760px, 96vw)",
                    aspectRatio: "1 / 1",
                    margin: "0 auto",
                    padding: 10,
                    borderRadius: 24,
                    background:
                      "rgba(35,25,17,0.62)",
                    boxShadow:
                      "0 18px 45px rgba(0,0,0,0.38), inset 0 0 0 2px rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      gridTemplateColumns: `repeat(${currentMazeLevel.size}, 1fr)`,
                      gridTemplateRows: `repeat(${currentMazeLevel.size}, 1fr)`,
                      gap: 2,
                      background:
                        "rgba(20,15,12,0.8)",
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    {mazeGrid.map(
                      (row, rowIndex) =>
                        row.map(
                          (
                            cell,
                            colIndex
                          ) => {

                            const isPlayer =
                              mazePlayer.row ===
                              rowIndex &&
                              mazePlayer.col ===
                              colIndex;

                            const isGoal =
                              rowIndex ===
                              mazeGrid.length - 2 &&
                              colIndex ===
                              mazeGrid.length - 2;

                            const coinIndex =
                              mazeCoins.findIndex(
                                (coin) =>
                                  coin.row ===
                                  rowIndex &&
                                  coin.col ===
                                  colIndex
                              );

                            const isCoin =
                              coinIndex !== -1;

                            const isWall =
                              cell === 1;

                            return (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                  position:
                                    "relative",
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  minWidth: 0,
                                  minHeight: 0,
                                  background:
                                    isWall
                                      ? currentMazeLevel.wall
                                      : currentMazeLevel.floor,
                                  borderRadius:
                                    isWall
                                      ? rowIndex %
                                        3 ===
                                        0
                                        ? "35% 18% 42% 22%"
                                        : "20% 40% 18% 36%"
                                      : 5,
                                  boxShadow:
                                    isWall
                                      ? "inset 2px 2px 4px rgba(255,255,255,0.12), inset -3px -3px 5px rgba(0,0,0,0.32)"
                                      : "inset 0 0 5px rgba(70,50,30,0.16)",
                                  border:
                                    isWall
                                      ? "1px solid rgba(40,25,15,0.32)"
                                      : "1px solid rgba(80,60,40,0.06)",
                                }}
                              >

                                {isWall && (
                                  <span
                                    style={{
                                      position:
                                        "absolute",
                                      bottom: 1,
                                      right: 2,
                                      fontSize:
                                        currentMazeLevel.size >
                                          13
                                          ? 7
                                          : 9,
                                      opacity: 0.7,
                                    }}
                                  >
                                    🌿
                                  </span>
                                )}

                                {isGoal && (
                                  <span
                                    style={{
                                      fontSize:
                                        currentMazeLevel.size >=
                                          15
                                          ? 15
                                          : 20,
                                      filter:
                                        "drop-shadow(0 0 7px rgba(255,215,100,0.95))",
                                      zIndex: 2,
                                    }}
                                  >
                                    {currentMazeLevel.monument}
                                  </span>
                                )}

                                {isCoin && (
                                  <span
                                    style={{
                                      fontSize:
                                        currentMazeLevel.size >=
                                          15
                                          ? 10
                                          : 15,
                                      filter:
                                        `drop-shadow(0 0 5px ${currentMazeLevel.accent})`,
                                      zIndex: 3,
                                    }}
                                  >
                                    🪙
                                  </span>
                                )}

                                {isPlayer && (
                                  <span
                                    style={{
                                      position:
                                        "absolute",
                                      fontSize:
                                        currentMazeLevel.size >=
                                          15
                                          ? 14
                                          : 21,
                                      zIndex: 5,
                                      filter:
                                        "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                                    }}
                                  >
                                    {
                                      EXPLORER_DATA[
                                        explorer
                                      ].emoji
                                    }
                                  </span>
                                )}
                              </div>
                            );
                          }
                        )
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        background:
                          "rgba(30,20,15,0.7)",
                        borderRadius: 8,
                        padding: "5px 9px",
                      }}
                    >
                      ↑
                    </span>

                    <span
                      style={{
                        background:
                          "rgba(30,20,15,0.7)",
                        borderRadius: 8,
                        padding: "5px 9px",
                      }}
                    >
                      ↓
                    </span>

                    <span
                      style={{
                        background:
                          "rgba(30,20,15,0.7)",
                        borderRadius: 8,
                        padding: "5px 9px",
                      }}
                    >
                      ←
                    </span>

                    <span
                      style={{
                        background:
                          "rgba(30,20,15,0.7)",
                        borderRadius: 8,
                        padding: "5px 9px",
                      }}
                    >
                      →
                    </span>

                    <span
                      style={{
                        marginLeft: 4,
                        opacity: 0.9,
                      }}
                    >
                      Arrow Keys
                    </span>
                  </div>

                  <div
                    style={{
                      background:
                        "rgba(30,20,15,0.65)",
                      borderRadius: 12,
                      padding: "7px 15px",
                      fontSize: 13,
                    }}
                  >
                    <strong>W A S D</strong>

                    <span
                      style={{
                        marginLeft: 8,
                      }}
                    >
                      Move Explorer
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 4,
                      fontSize: 13,
                      opacity: 0.88,
                      textAlign: "center",
                    }}
                  >
                    🪙 Collect the glowing coins for
                    <strong> +5 Arcade XP</strong>
                    <br />
                    Collect all 3 coins, then reach
                    the destination to complete the level.
                  </p>
                </div>
              </>
            )}

            {mazeComplete && (
              <div
                style={{
                  width: "min(650px, 94vw)",
                  margin: "35px auto 0",
                  background:
                    "rgba(255,248,225,0.96)",
                  color: "#3b281c",
                  borderRadius: 28,
                  padding: "40px 25px",
                  textAlign: "center",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.4)",
                  border:
                    `2px solid ${currentMazeLevel.accent}`,
                }}
              >

                <div
                  style={{
                    fontSize: 60,
                    marginBottom: 5,
                  }}
                >
                  🎉
                </div>

                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    opacity: 0.65,
                  }}
                >
                  LEVEL {currentMazeLevel.id}
                </div>

                <h2
                  style={{
                    margin: "8px 0",
                    fontSize:
                      "clamp(28px, 5vw, 40px)",
                  }}
                >
                  {currentMazeLevel.title}
                  <br />
                  Complete!
                </h2>

                <p
                  style={{
                    fontSize: 17,
                    marginBottom: 22,
                  }}
                >
                  You reached{" "}
                  <strong>
                    {currentMazeLevel.destination}
                  </strong>
                  !
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 25,
                  }}
                >

                  <div
                    style={{
                      background:
                        "#f5e5b5",
                      borderRadius: 15,
                      padding:
                        "13px 20px",
                    }}
                  >
                    🪙{" "}
                    <strong>
                      {mazeCollectedCoins}
                    </strong>{" "}
                    Coins
                  </div>

                  <div
                    style={{
                      background:
                        "#f5e5b5",
                      borderRadius: 15,
                      padding:
                        "13px 20px",
                    }}
                  >
                    🎮{" "}
                    <strong>
                      +{mazeCollectedCoins * 5}
                    </strong>{" "}
                    Arcade XP
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fff1bd, #f5d977)",
                    borderRadius: 16,
                    padding:
                      "12px 18px",
                    marginBottom: 25,
                    fontSize: 16,
                  }}
                >
                  ✨ Total Arcade XP:{" "}
                  <strong>
                    {arcadeXP}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent:
                      "center",
                    gap: 12,
                  }}
                >

                  {mazeLevel < 5 && (
                    <button
                      onClick={() =>
                        startMazeLevel(
                          mazeLevel + 1
                        )
                      }
                      style={{
                        border: "none",
                        borderRadius: 14,
                        padding:
                          "14px 24px",
                        background:
                          "linear-gradient(135deg, #547b42, #365b32)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow:
                          "0 6px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      NEXT LEVEL →
                    </button>
                  )}

                  {mazeLevel === 5 && (
                    <button
                      onClick={() =>
                        nextScreen("arcade")
                      }
                      style={{
                        border: "none",
                        borderRadius: 14,
                        padding:
                          "14px 24px",
                        background:
                          "linear-gradient(135deg, #8a4d72, #56304f)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow:
                          "0 6px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      BACK TO ARCADE →
                    </button>
                  )}

                  <button
                    onClick={() =>
                      startMazeLevel(
                        mazeLevel
                      )
                    }
                    style={{
                      border:
                        "1px solid #8d6a42",
                      borderRadius: 14,
                      padding:
                        "13px 22px",
                      background:
                        "#fffaf0",
                      color: "#513820",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    PLAY AGAIN ↻
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}