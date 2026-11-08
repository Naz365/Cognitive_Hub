# Security & MCP Tool Integration Guide

This workspace is integrated with industry-leading AI security, offensive testing, and Model Context Protocol (MCP) servers:

---

## 1. Snyk Security MCP Server
- **Package**: `snyk@latest` (official Snyk CLI & MCP server)
- **Transport**: `stdio`
- **MCP Command**:
  ```json
  "snyk": {
    "command": "npx",
    "args": ["-y", "snyk@latest", "mcp", "-t", "stdio"]
  }
  ```
- **Capabilities**:
  - `snyk_code_scan` (SAST static analysis)
  - `snyk_sca_scan` (Software composition & open-source vulnerability scanning)
  - `snyk_iac_scan` (Infrastructure as Code security)
  - `snyk_secret_scan` (Secret and credential leak detection)
  - `snyk_container_scan` (Docker container security analysis)
- **Authentication**:
  Run `npx snyk auth` or provide `SNYK_TOKEN` environment variable.

---

## 2. HexStrike AI (Offensive Security & Red Team Engine)
- **Source**: [`0x4m4/hexstrike-ai`](https://github.com/0x4m4/hexstrike-ai)
- **Directory**: `tools/hexstrike-ai`
- **Architecture**:
  - Backend API Engine: `python tools/hexstrike-ai/hexstrike_server.py --port 8888`
  - FastMCP Bridge: `python tools/hexstrike-ai/hexstrike_mcp.py --server http://127.0.0.1:8888`
- **MCP Command**:
  ```json
  "hexstrike-ai": {
    "command": "python",
    "args": [
      "c:/Users/Nazmu/OneDrive/Desktop/Cognitive Hub/tools/hexstrike-ai/hexstrike_mcp.py",
      "--server",
      "http://127.0.0.1:8888"
    ],
    "env": {
      "PYTHONIOENCODING": "utf-8",
      "PYTHONUTF8": "1"
    }
  }
  ```
- **Capabilities**:
  - Bridges AI agents with 150+ offensive security and penetration testing utilities.
  - Reconnaissance, subdomain enumeration, port scanning (Nmap, Masscan, RustScan).
  - Vulnerability discovery, SQL injection, fuzzing (SQLMap, Nuclei, Gobuster, FFUF).
  - Binary analysis, reverse engineering, exploit verification.

---

## 3. ClaudIT Security (HarmonicSecurity/claudit-sec)
- **Source**: [`HarmonicSecurity/claudit-sec`](https://github.com/HarmonicSecurity/claudit-sec)
- **Directory**: `tools/claudit-sec`
- **Architecture**:
  - Native Audit Script: `powershell -ExecutionPolicy Bypass -File tools/claudit-sec/claude_audit.ps1`
  - FastMCP Wrapper: `python tools/claudit-sec/claudit_mcp.py`
- **MCP Command**:
  ```json
  "claudit-security": {
    "command": "python",
    "args": [
      "c:/Users/Nazmu/OneDrive/Desktop/Cognitive Hub/tools/claudit-sec/claudit_mcp.py"
    ],
    "env": {
      "PYTHONIOENCODING": "utf-8",
      "PYTHONUTF8": "1"
    }
  }
  ```
- **Capabilities**:
  - Read-only security audit of AI assistants, MCP servers, and connected endpoints.
  - Automatic credential and secret redaction (`[REDACTED]`).
  - Audits scheduled tasks, file system exposure, dangerous tools, and connector permissions.
  - JSON and HTML report generation for SIEM and compliance.

---

## 4. Stitch MCP
- **Package**: `stitch-mcp` (Google Cloud / Firebase Stitch integration)
- **MCP Command**:
  ```json
  "stitch": {
    "command": "npx",
    "args": ["-y", "stitch-mcp"],
    "env": {
      "GOOGLE_CLOUD_PROJECT": "cognitive-hub-bd"
    }
  }
  ```
- **Capabilities**:
  - Connects AI agents with Google Cloud / Firebase Stitch services.
  - Authenticate via `gcloud auth application-default login`.

---

## Quick Setup Script
To reinstall or update dependencies on any workstation:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-security-tools.ps1
```
