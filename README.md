# SentryC2

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Research%20Prototype-yellow.svg)]()
[![Website](https://img.shields.io/badge/Website-sentryc2.com-cyan.svg)](https://www.sentryc2.com)

**Edge-delegated authorization for industrial robotics in DIL environments.**

When connectivity fails, cloud-issued operating leases expire and robots halt — not because
anything became unsafe, but because permission timed out in a datacenter they can no longer
reach. SentryC2 moves the authorization decision onto hardened hardware beside the robot,
keeps work running through the outage, and — when trust collapses — physically halts a live
UR5 through a fail-safe hardware intercept.

The name is the architecture: a **sentry** node standing watch beside the robot, holding
**C2** — command and control — locally, where no outage can revoke it.

---

## The core contribution

A latency model connecting verification cost to physical stop time, exercised across an
extensive campaign of physical hardware trials on a live Universal Robots UR5. Under attack,
the edge node's trust score decays geometrically each verification cycle; the time from attack
onset to physical stop is the number of decay cycles multiplied by the cycle period, plus a
detection offset. The model matched the ordering and magnitude of every condition tested, held
out-of-sample in a pre-registered confirmatory campaign, and inverts into a design tool: given
a stop-time budget, it returns which verification workloads and decay settings are admissible.

Qualitative findings:

- **Verification cost delays the stop.** Heavier cryptographic verification per cycle arrives
  at the halt measurably later, in a predictable way.
- **Outage duration decides whether a stop occurs.** Short outages ride through on residual
  trust; outages that outlast the decay boundary end in a physical stop.
- **Stronger proofs price into stop latency.** Privacy-preserving verification is affordable
  for continuity but delays the stop — a trade the model prices explicitly.

Quantitative detail lives in the thesis and is withheld from this public summary.

## Research integrity

Partway through the work, the experimental pipeline was audited against the firmware and raw
telemetry. Two instrumentation defects were found — a stub cryptographic workload timed to fit
a budget, and an experimental factor the firmware could not observe. The affected claims were
**withdrawn in a verified-numbers ledger**, the firmware was fixed, and the campaigns were
re-run clean with pre-registered acceptance criteria. The withdrawn claims are recorded
alongside the results, corrected in the open.

## Standards position

SentryC2 is exploratory research into authorization latency — **not** a validated functional
safety architecture. It operates outside ISO 13849-1, ISO 13855, and IEC 62061; enforcement is
single-channel (hardware fault tolerance of zero); and the latency model is average-case, not
a worst-case execution bound. These limits define the roadmap:

1. Independent supervision of the execution deadline (hardware watchdog)
2. Genuine dual-channel enforcement with cross-monitoring
3. A worst-case execution basis for the latency model
4. A kinematically derived stop requirement (ISO 13855)
5. Bounding the failover blind window
6. The full physical attack campaign under genuine privacy-preserving verification

## Website

The site ([www.sentryc2.com](https://www.sentryc2.com)) is a single page served from this
repository via GitHub Pages: [index.html](index.html), with styles, scripts, and media under
`assets/`. The project is a work in progress; the site reflects that.

## Contact

Pilot design partners and research collaborators welcome.

**Email**: [contact@sentryc2.com](mailto:contact@sentryc2.com) · **Web**: [www.sentryc2.com](https://www.sentryc2.com)

## License

Copyright © 2026 SentryC2 Project. Licensed under the [Apache License 2.0](LICENSE).

---

*Edge-delegated authorization for industrial robotics in DIL environments.*
