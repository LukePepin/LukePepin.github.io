# SentryC2

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Early%20Development-yellow.svg)]()
[![Website](https://img.shields.io/badge/Website-sentryc2.com-cyan.svg)](https://lukepepin.github.io)

**Sustaining Industrial Operations in Disconnected Environments**

SentryC2 is an Edge-First industrial resilience framework that decouples authorization infrastructure from internet connectivity using Mobile Ad-hoc Networks (MANET), Zero-Knowledge Proofs, and Probabilistic Trust Scores.

---

## The Problem

Modern "Cloud-First" Industry 4.0 architectures create a critical single point of failure: centralized Identity Providers (IdP). When backhaul connectivity fails, authorization leases expire, triggering production halts that cost manufacturers **$400B annually** and threaten forward-deployed defense logistics.

## The Solution

SentryC2 implements a decentralized MANET architecture that:
- **Reduces MTTR by ≥50%** under high-loss conditions (20% packet loss) compared to cloud-auth baselines
- Maintains authorization continuity during network partitions
- Provides cryptographic trust propagation through mesh topologies

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Edge Node (Industrial Device)              │
│  ┌────────────────────────────────────────────┐    │
│  │   Probabilistic Trust Score (Γ)            │    │
│  │   • ZKP Verification                        │    │
│  │   • Temporal Decay Function                 │    │
│  │   • Mesh Reputation Propagation             │    │
│  └────────────────────────────────────────────┘    │
│                      ↕                              │
│  ┌────────────────────────────────────────────┐    │
│  │   MANET Authorization Layer                 │    │
│  │   • Peer-to-Peer Trust Chains              │    │
│  │   • Offline Capability                      │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
         ↕ (Opportunistic Sync)
    ☁️ Cloud (When Available)
```

### Implementation Tiers

#### 1. **Industrial Sprint**
- **Cryptography**: Elliptic Curve Cryptography (ECC)
- **Target MTTR**: <500ms authorization recovery
- **Use Case**: Manufacturing floors, supply chain logistics

#### 2. **Tactical Fortress**
- **Cryptography**: Schnorr Zero-Knowledge Proofs
- **Security Model**: Mathematical privacy guarantees
- **Use Case**: Contested environments, defense logistics

### Key Research Hypotheses

**H1 (Resilience)**: Edge-First MANET with Probabilistic Trust Scores (Γ) reduces MTTR by ≥50% compared to centralized cloud-auth under high-loss conditions (20% packet loss).

**H2 (Security Tax)**: Zero-Knowledge Proofs provide significantly higher System Trust Scores during adversarial injection than ECC, but incur latency penalties exceeding 15%.

**H3 (Scalability)**: MTTR for ZKP-based arbitration scales exponentially with Node Density due to cryptographic verification queuing, compared to linear scaling in ECC.

---

## Project Status

🚧 **Early Development Phase**

SentryC2 is currently in active research and development. The framework is not yet production-ready. We are validating core hypotheses through simulation and field testing.

### Current Focus
- [ ] MANET protocol implementation
- [ ] Trust score propagation algorithms
- [ ] ZKP integration and performance benchmarking
- [ ] Industrial pilot program design

---

## Contact

For inquiries, research collaboration, or pilot program participation:

**Email**: [contact@sentryc2.com](mailto:contact@sentryc2.com)

**Repository**: [github.com/LukePepin/SentryC2](https://github.com/LukePepin/SentryC2)

---

## License

Copyright © 2026 SentryC2 Project

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## Acknowledgments

Built on principles from:
- Byzantine Fault Tolerance research
- Federal Acquisition Regulation (FAR) Part 7 (Buy vs. Make analysis)
- Industrial Cyber-Physical Systems (ICPS) standards
- NIST Cybersecurity Framework

---

*Edge-First Authorization for Industrial Cyber-Physical Systems*
