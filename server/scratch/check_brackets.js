const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Forgeindiaconnect\\Downloads\\Main-Project\\Appointment-Scheduling-System\\client\\src\\pages\\HRDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
            if (stack.length === 0) {
                console.log(`❌ Unexpected closing bracket ${char} at line ${i + 1}, col ${j + 1}`);
            } else {
                let last = stack.pop();
                if ((char === '}' && last.char !== '{') ||
                    (char === ')' && last.char !== '(') ||
                    (char === ']' && last.char !== '[')) {
                    console.log(`❌ Mismatched bracket ${char} at line ${i + 1}, col ${j + 1}. Expected match for ${last.char} from line ${last.line}, col ${last.col}`);
                }
            }
        }
    }
}

if (stack.length > 0) {
    console.log(`❌ Unclosed brackets at end of file:`);
    stack.forEach(s => console.log(`  - ${s.char} from line ${s.line}, col ${s.col}`));
} else {
    console.log('✅ No obvious bracket mismatches found.');
}
