/**
 * CVSSCalr CVSS 3.1 Calculation Logic
 * Author: Falatehan Anshor
 */

const WEIGHTS = {
    AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.20 },
    AC: { L: 0.77, H: 0.44 },
    PR: {
        U: { N: 0.85, L: 0.62, H: 0.27 },
        C: { N: 0.85, L: 0.68, H: 0.50 }
    },
    UI: { N: 0.85, R: 0.62 },
    S: { U: 6.42, C: 7.52 },
    C: { H: 0.56, L: 0.22, N: 0.00 },
    I: { H: 0.56, L: 0.22, N: 0.00 },
    A: { H: 0.56, L: 0.22, N: 0.00 }
};

function roundup_v2(val) {
    return Math.ceil(val * 10) / 10;
}

function calculateScore(vector) {
    const metrics = {};
    vector.split('/').forEach(part => {
        const [key, val] = part.split(':');
        if (key && val) metrics[key] = val;
    });

    const req = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'];
    for (let r of req) {
        if (!metrics[r]) return { score: 0, severity: "None", error: "Missing metric: " + r };
    }

    const AV = WEIGHTS.AV[metrics.AV];
    const AC = WEIGHTS.AC[metrics.AC];
    const UI = WEIGHTS.UI[metrics.UI];
    const C = WEIGHTS.C[metrics.C];
    const I = WEIGHTS.I[metrics.I];
    const A = WEIGHTS.A[metrics.A];
    const Scope = metrics.S;
    const PR = WEIGHTS.PR[Scope][metrics.PR];

    const ISS = 1 - ((1 - C) * (1 - I) * (1 - A));

    let Impact = 0;
    if (Scope === 'U') {
        Impact = 6.42 * ISS;
    } else {
        Impact = 7.52 * (ISS - 0.029) - 3.25 * Math.pow((ISS - 0.02), 15);
    }

    const Exploitability = 8.22 * AV * AC * PR * UI;

    let BaseScore = 0;
    if (Impact <= 0) {
        BaseScore = 0;
    } else {
        if (Scope === 'U') {
            BaseScore = roundup_v2(Math.min((Impact + Exploitability), 10));
        } else {
            BaseScore = roundup_v2(Math.min(1.08 * (Impact + Exploitability), 10));
        }
    }

    let Severity = "None";
    if (BaseScore === 0) Severity = "None";
    else if (BaseScore >= 0.1 && BaseScore <= 3.9) Severity = "Low";
    else if (BaseScore >= 4.0 && BaseScore <= 6.9) Severity = "Medium";
    else if (BaseScore >= 7.0 && BaseScore <= 8.9) Severity = "High";
    else if (BaseScore >= 9.0 && BaseScore <= 10.0) Severity = "Critical";

    return {
        score: BaseScore.toFixed(1),
        severity: Severity,
        vector: vector
    };
}

module.exports = { calculateScore };
