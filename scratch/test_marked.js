const marked = require('marked');

const renderer = {
    heading({ text, depth }) {
        const rawText = Array.isArray(text)
            ? text.map(t => t.text || t.raw || '').join('')
            : String(text || '');
        const cleanText = rawText.replace(/^[✅◆🔹]\s*/, '').trim();
        return `<h${depth} class="textbook-h3">${cleanText}</h${depth}>`;
    }
};

marked.use({ renderer });
console.log(marked.parse('### **Hello**'));
