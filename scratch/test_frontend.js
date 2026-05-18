

let markdownText = `### **Type - 2 এর সমাধান (ভার্নিয়ার ধ্রুবক সংক্রান্ত)**

| সূত্র | প্রতীক পরিচিতি | একক | মাত্রা |
| --- | --- | --- | --- |
| 1. $VC = \\frac{x}{n}$ <br>

<br> 2. $VC = s - x$ | VC = ভার্নিয়ার ধ্রুবক | m | L |
| | s = প্রধান স্কেলের ক্ষুদ্রতম 1 ভাগের দৈর্ঘ্য | m | L |
| | n = ভার্নিয়ার স্কেলের ভাগ সংখ্যা | এককবিহীন | মাত্রাবিহীন |
| | x = ভার্নিয়ার স্কেলের ক্ষুদ্রতম 1 ভাগের দৈর্ঘ্য | m | L |`;

markdownText = markdownText.replace(/(<br\s*\/?>)\s*[\r\n]+/gi, '$1 ');
markdownText = markdownText.replace(/[\r\n]+\s*(<br\s*\/?>)/gi, ' $1');

console.log("---- Fixed Markdown ----");
console.log(markdownText);

// Simulate the double newline replacement for tables
let lines = markdownText.split(/\n/);
let processedText = '';
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    
    if (/^\s+/.test(line) && !/^\s*([\*\-\+]\s|\d+\.\s|>|\|)/.test(line)) {
        line = line.trimStart();
    }

    let isTable = trimmed.startsWith('|') || (trimmed.includes('|') && !trimmed.startsWith('#') && !trimmed.startsWith('>'));
    let nextTrimmed = i + 1 < lines.length ? lines[i + 1].trim() : '';
    let nextIsTable = nextTrimmed.startsWith('|') || (nextTrimmed.includes('|') && !nextTrimmed.startsWith('#') && !nextTrimmed.startsWith('>') && nextTrimmed !== '');

    processedText += line;
    if (i < lines.length - 1) {
        if (isTable && nextIsTable) {
            processedText += '\n';
        } else if (trimmed === '' && nextTrimmed === '') {
            processedText += '\n';
        } else {
            processedText += '\n\n';
        }
    }
}
processedText = processedText.replace(/\n{3,}/g, '\n\n');

console.log("---- Processed Text ----");
console.log(processedText);
