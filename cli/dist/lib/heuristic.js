/**
 * Heuristic-based CVSS Analysis Engine
 * Keyword-based pattern matching
 */

function analyzeWithHeuristic(pocText) {
    const content = pocText.toLowerCase();

    let vectorParts = {
        AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'N', I: 'N', A: 'N'
    };

    if (content.includes('remote') || content.includes('network') || content.includes('internet')) {
        vectorParts.AV = 'N';
    } else if (content.includes('local') || content.includes('localhost')) {
        vectorParts.AV = 'L';
    } else if (content.includes('physical') || content.includes('usb')) {
        vectorParts.AV = 'P';
    } else if (content.includes('adjacent') || content.includes('wifi')) {
        vectorParts.AV = 'A';
    }

    if (content.includes('complex') || content.includes('race condition') || content.includes('timing')) {
        vectorParts.AC = 'H';
    }

    if (content.includes('unauthenticated') || content.includes('no auth') || content.includes('tanpa login') || content.includes('tidak perlu login')) {
        vectorParts.PR = 'N';
    } else if (content.includes('user') || content.includes('authenticated') || content.includes('perlu login')) {
        vectorParts.PR = 'L';
    } else if (content.includes('admin') || content.includes('root') || content.includes('administrator')) {
        if (content.includes('bypass') || content.includes('injection') || content.includes('exploit')) {
            vectorParts.PR = 'N';
        } else {
            vectorParts.PR = 'H';
        }
    }

    if ((content.includes('click') || content.includes('visit') || content.includes('open') ||
        content.includes('interaksi') || content.includes('user must')) &&
        !content.includes('upload') && !content.includes('automated')) {
        vectorParts.UI = 'R';
    }

    if (content.includes('escape') || content.includes('container') || content.includes('privilege escalation')) {
        vectorParts.S = 'C';
    }

    if (content.includes('dump') || content.includes('steal') || content.includes('exfiltrate') ||
        content.includes('read all') || content.includes('dicuri') || content.includes('semua data')) {
        vectorParts.C = 'H';
    } else if (content.includes('disclosure') || content.includes('leak') || content.includes('version') ||
        content.includes('terekspos') || content.includes('sebagian data')) {
        vectorParts.C = 'L';
    }

    if (content.includes('modify') || content.includes('write') || content.includes('delete') ||
        content.includes('rce') || content.includes('code execution') || content.includes('command injection') ||
        content.includes('ubah') || content.includes('hapus')) {
        vectorParts.I = 'H';
    } else if (content.includes('limited modification') || content.includes('partial write')) {
        vectorParts.I = 'L';
    }

    if (content.includes('crash') || content.includes('dos') || content.includes('denial') ||
        content.includes('shutdown') || content.includes('dimatikan')) {
        vectorParts.A = 'H';
    } else if (content.includes('slow') || content.includes('performance') || content.includes('lambat')) {
        vectorParts.A = 'L';
    }

    if (content.includes('remote code execution') || content.includes('rce') ||
        content.includes('command injection') || content.includes('eksekusi kode')) {
        vectorParts.C = 'H';
        vectorParts.I = 'H';
        vectorParts.A = 'H';
        vectorParts.AV = 'N';
    }

    if (content.includes('sql injection') || content.includes('sqli')) {
        vectorParts.C = 'H';
        vectorParts.I = 'H';
    }

    if (content.includes('file upload') && (content.includes('arbitrary') || content.includes('shell'))) {
        vectorParts.I = 'H';
        if (vectorParts.C === 'N') vectorParts.C = 'H';
    }

    return `CVSS:3.1/AV:${vectorParts.AV}/AC:${vectorParts.AC}/PR:${vectorParts.PR}/UI:${vectorParts.UI}/S:${vectorParts.S}/C:${vectorParts.C}/I:${vectorParts.I}/A:${vectorParts.A}`;
}

module.exports = { analyzeWithHeuristic };
