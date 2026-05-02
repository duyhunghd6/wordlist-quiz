const text = "Each student packed a _______ (1) with clothes, food and water. On the first day, we went on a long _______ (2) through the dense _______ (3).";
const parts = text.split(/(_{3,}\s*\(\d+\))/);
console.log(parts);
