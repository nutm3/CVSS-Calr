const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { calculateScore } = require('./lib/cvss_core');
const { analyzeWithHeuristic } = require('./lib/heuristic');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const COLOR = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Cyan: "\x1b[36m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Magenta: "\x1b[35m",
    Blue: "\x1b[34m"
};

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
}

function printHeader() {
    clearScreen();
    console.log(`${COLOR.Cyan}${COLOR.Bright}`);
    console.log(`=================================================`);
    console.log(`      CVSSCalr v1.0  --  CLI EDITION          `);
    console.log(`=================================================`);
    console.log(` Created by Falatehan Anshor | @nutm3`);
    console.log(`${COLOR.Reset}`);
}

function showMenu() {
    console.log(`\n${COLOR.Yellow}Select Mode:${COLOR.Reset}`);
    console.log(`[1] Manual Calculator (Step-by-Step)`);
    console.log(`[2] File Analysis (Heuristic Engine)`);
    console.log(`[3] Download Template PoC`);
    console.log(`[4] Exit`);
    rl.question(`\n${COLOR.Bright}> `, handleMenuSelection);
}

function handleMenuSelection(choice) {
    switch (choice.trim()) {
        case '1': promptManualVector(); break;
        case '2': promptFileAnalysis(); break;
        case '3': downloadTemplate(); break;
        case '4':
            console.log(`\n${COLOR.Cyan}Exiting... Stay Secure!${COLOR.Reset}`);
            rl.close();
            process.exit(0);
            break;
        default:
            console.log(`${COLOR.Red}Invalid option.${COLOR.Reset}`);
            setTimeout(showMenu, 1000);
            break;
    }
}

function downloadTemplate() {
    // Source: Template is stored in dist/report/template_poc.md
    const templateSource = path.join(__dirname, 'report', 'template_poc.md');

    // Destination: User's Current Working Directory (where they ran the script, likely 'cli/')
    // Since we are in 'dist/', parent is 'cli/'
    const destPath = path.resolve(process.cwd(), '..', 'template_poc.md');

    try {
        if (fs.existsSync(templateSource)) {
            fs.copyFileSync(templateSource, destPath);
            console.log(`\n${COLOR.Green}✔ Template downloaded to: ${COLOR.Bright}${destPath}${COLOR.Reset}`);
        } else {
            console.log(`\n${COLOR.Red}[!] Error: Template source not found at ${templateSource}${COLOR.Reset}`);
            // Fallback: try root dist/template_poc.md if report/ one missing
            const fallback = path.join(__dirname, 'template_poc.md');
            if (fs.existsSync(fallback)) {
                fs.copyFileSync(fallback, destPath);
                console.log(`\n${COLOR.Green}✔ Template downloaded to: ${COLOR.Bright}${destPath}${COLOR.Reset}`);
            }
        }
    } catch (err) {
        console.log(`\n${COLOR.Red}[!] Error saving template: ${err.message}${COLOR.Reset}`);
    }
    waitAndReturn();
}

function promptManualVector() {
    console.log(`\n${COLOR.Cyan}${COLOR.Bright}--- Manual Calculator (Interactive) ---${COLOR.Reset}`);
    console.log(`${COLOR.Yellow}Answer 8 questions to build your CVSS vector.${COLOR.Reset}\n`);
    const metrics = { AV: null, AC: null, PR: null, UI: null, S: null, C: null, I: null, A: null };
    askMetric(1, metrics);
}

function askMetric(step, metrics) {
    const questions = [
        { key: 'AV', title: 'Attack Vector', options: [{ label: 'Network', value: 'N' }, { label: 'Adjacent', value: 'A' }, { label: 'Local', value: 'L' }, { label: 'Physical', value: 'P' }] },
        { key: 'AC', title: 'Attack Complexity', options: [{ label: 'Low', value: 'L' }, { label: 'High', value: 'H' }] },
        { key: 'PR', title: 'Privileges Required', options: [{ label: 'None', value: 'N' }, { label: 'Low', value: 'L' }, { label: 'High', value: 'H' }] },
        { key: 'UI', title: 'User Interaction', options: [{ label: 'None', value: 'N' }, { label: 'Required', value: 'R' }] },
        { key: 'S', title: 'Scope', options: [{ label: 'Unchanged', value: 'U' }, { label: 'Changed', value: 'C' }] },
        { key: 'C', title: 'Confidentiality Impact', options: [{ label: 'None', value: 'N' }, { label: 'Low', value: 'L' }, { label: 'High', value: 'H' }] },
        { key: 'I', title: 'Integrity Impact', options: [{ label: 'None', value: 'N' }, { label: 'Low', value: 'L' }, { label: 'High', value: 'H' }] },
        { key: 'A', title: 'Availability Impact', options: [{ label: 'None', value: 'N' }, { label: 'Low', value: 'L' }, { label: 'High', value: 'H' }] }
    ];

    if (step > 8) {
        const vector = `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`;
        const result = calculateScore(vector);
        console.log(`\n${COLOR.Green}${COLOR.Bright}--- CALCULATION SUCCESS ---${COLOR.Reset}\n`);
        printResult(result);
        return showReportActions(result, metrics);
    }

    const q = questions[step - 1];
    console.log(`${COLOR.Cyan}[${step}/8] ${q.title}:${COLOR.Reset}`);
    q.options.forEach((opt, idx) => console.log(`  [${idx + 1}] ${opt.label}`));

    rl.question(`${COLOR.Bright}Choice > `, (choice) => {
        const idx = parseInt(choice.trim()) - 1;
        if (idx >= 0 && idx < q.options.length) {
            metrics[q.key] = q.options[idx].value;
            askMetric(step + 1, metrics);
        } else {
            console.log(`${COLOR.Red}Invalid choice.${COLOR.Reset}\n`);
            askMetric(step, metrics);
        }
    });
}

function promptFileAnalysis() {
    console.log(`\n${COLOR.Blue}--- File Analysis (Heuristic Engine) ---${COLOR.Reset}`);
    console.log(`Enter path to PoC file:`);
    rl.question(`${COLOR.Bright}> `, (filepath) => {
        if (!fs.existsSync(filepath)) {
            console.log(`${COLOR.Red}File not found!${COLOR.Reset}`);
            return waitAndReturn();
        }
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            const vector = analyzeWithHeuristic(content);
            const result = calculateScore(vector);
            console.log(`\n${COLOR.Green}${COLOR.Bright}--- HEURISTIC ANALYSIS SUCCESS ---${COLOR.Reset}\n`);
            printResult(result);
            showReportActions(result);
        } catch (err) {
            console.log(`${COLOR.Red}Error: ${err.message}${COLOR.Reset}`);
            waitAndReturn();
        }
    });
}

function showReportActions(result, metrics = null) {
    console.log(`\n${COLOR.Yellow}Actions:${COLOR.Reset}`);
    console.log(`[1] Preview Report`);
    console.log(`[2] Save as Markdown (MD)`);
    console.log(`[3] Save as HTML (Professional)`);
    console.log(`[4] Save as JSON`);
    console.log(`[5] Save as YAML`);
    console.log(`[6] Save as CSV`);
    console.log(`[7] Return to Main Menu`);

    rl.question(`\n${COLOR.Bright}Select Action > `, (choice) => {
        const ts = Date.now();
        switch (choice.trim()) {
            case '1': console.log(`\n${generateReportCLI(result, metrics)}`); showReportActions(result, metrics); break;
            case '2': saveFile(`CVSS_Report_${ts}.md`, generateReportCLI(result, metrics)); break;
            case '3': saveFile(`CVSS_Report_${ts}.html`, generateHTMLCLI(result, metrics)); break;
            case '4': saveFile(`CVSS_Report_${ts}.json`, generateJSONCLI(result, metrics)); break;
            case '5': saveFile(`CVSS_Report_${ts}.yaml`, generateYAMLCLI(result, metrics)); break;
            case '6': saveFile(`CVSS_Report_${ts}.csv`, generateCSVCLI(result, metrics)); break;
            case '7': printHeader(); showMenu(); break;
            default: showReportActions(result, metrics); break;
        }
    });
}

function saveFile(filename, content) {
    const reportDir = path.join(__dirname, 'report');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    const fullPath = path.join(reportDir, filename);
    fs.writeFileSync(fullPath, content);
    console.log(`\n${COLOR.Green}✔ Saved to: ${COLOR.Bright}report/${filename}${COLOR.Reset}`);
    waitAndReturn();
}

function generateReportCLI(result, metrics) {
    const date = new Date().toLocaleString();
    let report = `=================================================\n`;
    report += `       CVSSCalr v1.0 - VULNERABILITY REPORT\n`;
    report += `=================================================\n`;
    report += `[+] PRIMARY ASSESSMENT\n-------------------------------------------------\n`;
    report += `Date            : ${date}\n`;
    report += `Generated By    : CVSSCalr v1.0\n\n`;
    report += `[+] RISK PROFILE\n-------------------------------------------------\n`;
    report += `Base Score      : ${result.score} \n`;
    report += `Severity        : ${result.severity.toUpperCase()}\n`;
    report += `Vector String   : ${result.vector}\n\n`;
    report += `[+] VULNERABILITY METRICS\n-------------------------------------------------\n`;

    if (metrics) {
        report += `Exploitability Metrics:\n`;
        report += `- Attack Vector (AV)        : ${metrics.AV}\n`;
        report += `- Attack Complexity (AC)    : ${metrics.AC}\n`;
        report += `- Privileges Required (PR)  : ${metrics.PR}\n`;
        report += `- User Interaction (UI)     : ${metrics.UI}\n`;
        report += `Impact Metrics:\n`;
        report += `- Scope (S)                 : ${metrics.S}\n`;
        report += `- Confidentiality Impact (C): ${metrics.C}\n`;
        report += `- Integrity Impact (I)      : ${metrics.I}\n`;
        report += `- Availability Impact (A)   : ${metrics.A}\n`;
    } else {
        report += `(Detailed metrics refer to vector string)\n`;
    }

    report += `\n[+] ANALYSIS SUMMARY & IMPLICATIONS\n-------------------------------------------------\n`;
    let summary = "";
    const score = parseFloat(result.score);
    if (score >= 9.0) summary = "Kerentanan ini bersifat KRITIS dan dapat dieksploitasi dengan dampak maksimal. Penyerang dapat memperoleh kontrol penuh atas sistem secara remote, yang berarti kompromi total terhadap kerahasiaan, integritas, dan ketersediaan data sangat mungkin terjadi.";
    else if (score >= 7.0) summary = "Kerentanan TINGGI yang memungkinkan penyerang menyebabkan kerusakan signifikan atau pencurian data sensitif. Diperlukan tindakan segera untuk memitigasi risiko sebelum dieksploitasi.";
    else if (score >= 4.0) summary = "Kerentanan TINGKAT SEDANG yang memerlukan kondisi khusus untuk eksploitasi. Disarankan perbaikan terjadwal.";
    else summary = "Kerentanan TINGKAT RENDAH dengan dampak minimal.";
    report += summary + "\n\n";

    let priority = "P3 (Routine Action)";
    if (score >= 4.0) priority = "P2 (Scheduled Fix)";
    if (score >= 7.0) priority = "P1 (Urgent Action)";
    if (score >= 9.0) priority = "P0 (Immediate Action Required)";

    report += `[+] REMEDIATION PRIORITY\n-------------------------------------------------\n`;
    report += `Priority Level  : ${priority}\n`;
    report += `Status          : ${result.severity} Discovery\n\n`;
    report += `=================================================\nGenerated by CVSSCalr - Advanced Severity Engine\n-------------------------------------------------\n`;
    return report;
}

function generateHTMLCLI(result, metrics) {
    const date = new Date().toLocaleString();
    let metricRows = "";
    if (metrics) {
        Object.keys(metrics).forEach(k => metricRows += `<tr><td><strong>${k}</strong></td><td>${metrics[k]}</td></tr>`);
    }
    const sevClass = result.severity.toLowerCase();
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report</title><style>
        body { font-family: sans-serif; color: #000; background: #fff; padding: 30px; }
        .box { max-width: 700px; margin: auto; border: 1px solid #ddd; padding: 25px; border-radius: 5px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; }
        .section { background: #eee; padding: 8px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #000; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; border-bottom: 1px solid #f1f1f1; }
        .badge { padding: 3px 10px; border-radius: 10px; font-weight: bold; }
        .sev-critical { background: red; color: white; }
        .sev-high { background: orange; color: black; }
        .sev-medium { background: yellow; color: black; }
        .footer { font-size: 11px; margin-top: 30px; text-align: center; color: #888; }
    </style></head><body><div class="box"><div class="header"><h1>VULNERABILITY REPORT</h1></div>
    <div class="section">ASSESSMENT</div><p>Date: ${date}</p>
    <div class="section">RESULT</div><table><tr><td>Score</td><td><strong>${result.score}</strong></td></tr>
    <tr><td>Severity</td><td><span class="badge sev-${sevClass}">${result.severity}</span></td></tr>
    <tr><td>Vector</td><td><code>${result.vector}</code></td></tr></table>
    <div class="section">METRICS</div><table>${metricRows || "<tr><td>Details</td><td>Refer to vector</td></tr>"}</table>
    <div class="footer">Generated by CVSSCalr v1.0</div></div></body></html>`;
}

function getCLIAnalysis(score) {
    if (score >= 9.0) return "Kerentanan ini bersifat KRITIS dan dapat dieksploitasi dengan dampak maksimal. Penyerang dapat memperoleh kontrol penuh atas sistem secara remote, yang berarti kompromi total terhadap kerahasiaan, integritas, dan ketersediaan data sangat mungkin terjadi.";
    if (score >= 7.0) return "Kerentanan TINGGI yang memungkinkan penyerang menyebabkan kerusakan signifikan atau pencurian data sensitif. Diperlukan tindakan segera.";
    if (score >= 4.0) return "Kerentanan TINGKAT SEDANG yang memerlukan kondisi khusus untuk eksploitasi. Disarankan perbaikan terjadwal.";
    return "Kerentanan TINGKAT RENDAH dengan dampak minimal.";
}

function getCLIPriority(score) {
    if (score >= 9.0) return "P0 (Immediate Action Required)";
    if (score >= 7.0) return "P1 (Urgent Action)";
    if (score >= 4.0) return "P2 (Scheduled Fix)";
    return "P3 (Routine Action)";
}

function generateJSONCLI(result, metrics) {
    const score = parseFloat(result.score);
    return JSON.stringify({
        report_type: "VULNERABILITY REPORT",
        metadata: { app: "CVSSCalr v1.0", date: new Date().toISOString() },
        assessment: { result, metrics },
        analysis: {
            summary: getCLIAnalysis(score),
            priority: getCLIPriority(score),
            status: `${result.severity} Discovery`
        }
    }, null, 4);
}

function generateYAMLCLI(result, metrics) {
    const score = parseFloat(result.score);
    let y = `report_type: "VULNERABILITY REPORT"\n`;
    y += `metadata:\n  app: "CVSSCalr v1.0"\n  date: "${new Date().toISOString()}"\n`;
    y += `assessment:\n  score: ${result.score}\n  severity: "${result.severity}"\n  vector: "${result.vector}"\n`;
    if (metrics) {
        y += `  metrics:\n`;
        Object.keys(metrics).forEach(k => y += `    ${k}: "${metrics[k]}"\n`);
    }
    y += `analysis:\n  summary: "${getCLIAnalysis(score)}"\n`;
    y += `  priority: "${getCLIPriority(score)}"\n`;
    y += `  status: "${result.severity} Discovery"\n`;
    return y;
}

function generateCSVCLI(result, metrics) {
    const score = parseFloat(result.score);
    let c = `Section,Metric,Value\n`;
    c += `PRIMARY,Date,${new Date().toISOString()}\n`;
    c += `RISK,Score,${result.score}\n`;
    c += `RISK,Severity,${result.severity}\n`;
    c += `RISK,Vector,${result.vector}\n`;
    if (metrics) {
        Object.keys(metrics).forEach(k => c += `METRIC,${k},${metrics[k]}\n`);
    }
    c += `ANALYSIS,Summary,"${getCLIAnalysis(score)}"\n`;
    c += `PRIORITY,Level,"${getCLIPriority(score)}"\n`;
    return c;
}

function printResult(result) {
    console.log(`${COLOR.Yellow}Vector   :${COLOR.Reset} ${COLOR.Bright}${result.vector}${COLOR.Reset}`);
    console.log(`${COLOR.Yellow}Base Score:${COLOR.Reset} ${COLOR.Bright}${result.score}${COLOR.Reset}`);
    let clr = COLOR.Green;
    if (result.severity === 'Medium') clr = COLOR.Yellow;
    else if (result.severity === 'High') clr = COLOR.Red;
    else if (result.severity === 'Critical') clr = COLOR.Magenta;
    console.log(`${COLOR.Yellow}Severity :${COLOR.Reset} ${clr}${COLOR.Bright}${result.severity}${COLOR.Reset}`);
}

function waitAndReturn() {
    console.log(`\n${COLOR.Blue}Press ENTER to return...${COLOR.Reset}`);
    rl.question('', () => { printHeader(); showMenu(); });
}

printHeader(); showMenu();
