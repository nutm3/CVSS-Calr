# CVSSCalr v1.0 🛡️
### Enterprise-Grade CVSS 3.1 Scoring Ecosystem & Heuristic Analysis Engine

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CVSS](https://img.shields.io/badge/CVSS-3.1-green.svg)](https://www.first.org/cvss/v3.1/specification-document)
[![Version](https://img.shields.io/badge/v1.0-stable-orange.svg)](.)
[![Node.js](https://img.shields.io/badge/nodejs->=18.0.0-brightgreen.svg)](https://nodejs.org/)

> **Architected by [Falatehan Anshor](https://github.com/nutm3)** — Advanced Security Capability Development

---

## ⚡ Executive Summary

**CVSSCalr** is a high-performance vulnerability scoring ecosystem designed to bridge the gap between manual assessment and automated reporting. Built for **Red Team Operations**, **Pentest Engagements**, and **Vulnerability Management**, it delivers precision scoring through a dual-interface architecture.

This tool streamlines the vulnerability lifecycle by integrating **Heuristic Analysis**—transforming raw Proof-of-Concept (PoC) narratives into standard CVSS 3.1 Vectors instantly.

---

## 📸 Interface Preview

### 🌐 The Advanced Web Portal
*Experience a modern, glass-morphism interface optimized for rapid triage.*
![Main Web UI](imgs/preview-web-ui.png)

### 💻 The High-Speed CLI Core
*Zero-latency terminal performance for offensive security automation.*
![Main CLI UI](imgs/preview-cli.png)

---

## 🚀 Operational Capabilities

### 1. **Dual-Core Architecture**
- **Web Portal**: Cyberpunk-themed interface with drag-and-drop heuristic analysis, real-time vector calculation, and visual severity indicators.
- **CLI Suite**: Lightweight, scriptable core designed for headless servers and rapid terminal-based assessments.

### 2. **Next-Gen Reporting Module**
Generate C-Level ready documents and technical exports instantly.

| **Web Reporting Types** | **Visual Preview** |
| :--- | :--- |
| **HTML Executive Report**<br>High-contrast, polished layouts for client delivery. | ![HTML Report](imgs/preview-web-report-html.png) |
| **Markdown Documentation**<br>Seamless integration with Git-based docs. | ![Markdown Report](imgs/preview-web-report-markdown.png) |
| **JSON Data Structure**<br>Structured data for SIEM ingestion. | ![JSON Report](imgs/preview-web-report-json.png) |
| **Heuristic Upload Analysis**<br>Instant vector generation from templates. | ![Upload Template](imgs/preview-web-report-uploadtemplate.png) |

*(Full reporting suite also includes CSV and formatted text exports)*

![General Web Report View](imgs/preview-web-report.png)

### 3. **Smart Environment Launcher**
Intelligent orchestration script that detects Docker environments, manages dependencies, and handles port conflicts automatically.

| **Deployment Mode** | **Launcher view** |
| :--- | :--- |
| **Docker Container**<br>Isolated, production-ready environment. | ![Docker Launch](imgs/smart-launcer-for-run-webapp-docker.png) |
| **Local Node.js**<br>Native execution for maximum performance. | ![Local Launch](imgs/smart-launcer-for-run-webapp-local.png) |
| **Intelligent Selection**<br>Auto-prompt for runtime environment. | ![Smart Launcher](imgs/smart-launcer-tools-preselect-local-or-docker.png) |

---

## 🛠️ Deployment & Execution

### **Web Application Container**
Deploy the full graphical experience with our smart launcher.
```bash
cd web
./build.sh  # Auto-detects environment (Docker/Local) and resolves ports
```

### **CLI Assessment Suite**
Execute rapid assessments directly from your terminal. Supports direct PoC file ingestion.
```bash
cd cli
./build.sh  # Instantly compiles and launches the interactive core
```
![CLI Heuristic Report](imgs/preview-cli-report-uploadtemplate.png)

---

## 🏗️ System Architecture

Engineered for modularity and scalability.

```
CVSSCalr/
├── web/              # Presentation Layer (Express.js + EJS)
│   ├── dist/         # Compiled Production Assets
│   └── build.sh      # Intelligent Environment Orchestrator
├── cli/              # Logic Core (Node.js)
│   ├── dist/         # Application Binaries
│   │   ├── app.js    # Interactive Shell
│   │   ├── lib/      # Core Calculation & Heuristic Modules
│   │   └── report/   # Generated Assessment Artifacts
│   └── build.sh      # Deployment Script
└── imgs/             # Visual Assets & Previews
```

---

## 🎯 Strategic Use Cases

| Persona | Benefit |
| :--- | :--- |
| **Penetration Testers** | Rapidly calculate and export scores for final client report deliverables. |
| **Red Team Operators** | Assess exploit impact and prioritize chains based on severity metrics. |
| **Bug Bounty Hunters** | Validate findings against standard scoring models to maximize payout potential. |
| **DevSecOps** | Integrate JSON/CSV outputs into CI/CD pipelines for automated gating. |

---

## 👨‍💻 Author Profile

**Falatehan Anshor**  
*Offensive Security Specialist | Security Tool Developer*

Dedicated to building high-impact tools that empower the cybersecurity community. Open to collaboration on advanced security augmentation projects.

- **LinkedIn**: [Falatehan Anshor](https://linkedin.com/in/falatehananshor)
- **GitHub**: [@nutm3](https://github.com/nutm3)

---

**Star this Repository** ⭐ to support open-source security innovation.
*Engineered with precision. Deployed with confidence.*
