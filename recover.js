const fs = require('fs');
const path = require('path');

const logPath = `C:\\Users\\Forgeindiaconnect\\.gemini\\antigravity\\brain\\da368d7f-db8f-4e58-ab95-e05310d03e69\\.system_generated\\logs\\overview.txt`;
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim());

const filesToRecover = [
    'ClientDashboard.jsx',
    'LandingPage.jsx',
    'index.css',
    'Booking.jsx',
    'ProfessionalDashboard.jsx',
    'MiniWebsite.jsx',
    'SettingsPage.jsx',
    'ClientRegister.jsx',
    'CalendarPage.jsx',
    'Login.jsx',
    'RatingModal.jsx',
    'StaffOnboardingForm.jsx'
];

let earliestVersions = {};

// Find step indices for view_file calls, then find the corresponding TOOL_RESPONSE
// First pass: find all view_file tool call step indices for our target files
let viewFileStepIndices = {}; // stepIndex -> fileName

for (const line of lines) {
    try {
        const data = JSON.parse(line);
        if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
            for (const tc of data.tool_calls) {
                if (tc.name === 'view_file') {
                    const absPath = tc.args?.AbsolutePath;
                    if (absPath) {
                        const cleaned = absPath.replace(/^"|"$/g, '').replace(/\\\\/g, '\\');
                        const fileName = path.basename(cleaned);
                        if (filesToRecover.includes(fileName) && !earliestVersions[fileName]) {
                            // Look for corresponding TOOL_RESPONSE
                            viewFileStepIndices[data.step_index] = fileName;
                        }
                    }
                }
            }
        }
    } catch(e) {}
}

console.log('View file indices found:', Object.keys(viewFileStepIndices).length);

// Second pass: find TOOL_RESPONSE for those step indices
for (const line of lines) {
    try {
        const data = JSON.parse(line);
        if (data.type === 'TOOL_RESPONSE' && data.step_index && viewFileStepIndices[data.step_index]) {
            const fileName = viewFileStepIndices[data.step_index];
            if (!earliestVersions[fileName]) {
                const output = data.output || data.result || '';
                const contentLines = output.split('\n');
                let cleanContent = [];
                for (const l of contentLines) {
                    const m = l.match(/^(\d+): (.*)/);
                    if (m) {
                        cleanContent.push(m[2]);
                    }
                }
                if (cleanContent.length > 0) {
                    earliestVersions[fileName] = cleanContent.join('\n');
                    console.log(`Found ${fileName} (${cleanContent.length} lines)`);
                }
            }
        }
    } catch(e) {}
}

console.log('Files recovered:', Object.keys(earliestVersions));

for (const [fileName, fileContent] of Object.entries(earliestVersions)) {
    let targetPath;
    if (fileName === 'index.css') {
        targetPath = `C:\\Users\\Forgeindiaconnect\\Downloads\\Main-Project\\Appointment-Scheduling-System\\client\\src\\${fileName}`;
    } else if (fileName === 'RatingModal.jsx' || fileName === 'StaffOnboardingForm.jsx') {
        targetPath = `C:\\Users\\Forgeindiaconnect\\Downloads\\Main-Project\\Appointment-Scheduling-System\\client\\src\\components\\${fileName}`;
    } else {
        targetPath = `C:\\Users\\Forgeindiaconnect\\Downloads\\Main-Project\\Appointment-Scheduling-System\\client\\src\\pages\\${fileName}`;
    }
    fs.writeFileSync(targetPath, fileContent, 'utf8');
    console.log(`Written: ${targetPath}`);
}

console.log('Done!');
