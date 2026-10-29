# Interactive Agency Website — Frontend Study

An **unofficial frontend implementation / visual engineering study** exploring complex motion, 3D scenes and interaction patterns in a modern agency website.

This repository is an independent study of a reference experience, **not the official TRIONN website** and not affiliated with the reference brand.

## Engineering focus

- Interactive page sections and scroll-based motion
- Three.js scenes and 3D visual elements
- GSAP animation orchestration and transitions
- Smooth scrolling with Lenis
- Component-oriented implementation in Next.js / React
- Visual comparison tooling for UI regression and reference alignment

## Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Motion & graphics:** GSAP, @gsap/react, Three.js, Lenis
- **Styling:** Tailwind CSS 4
- **Validation:** ESLint, Node.js tests, Playwright-based visual comparison tooling

## Run locally

Requirements: a recent Node.js version and pnpm 10.x.

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Open http://localhost:3000

### Quality checks

\`\`\`bash
pnpm lint
pnpm build
pnpm test:visual-compare
\`\`\`

Visual comparison commands may need additional browser or reference-image setup; see [visual comparison documentation](docs/visual-comparison.md).

## Code organization

- \`src/app/\`: Next.js App Router entry points
- \`src/features/\`: feature-oriented home page sections (hero, services, work, motion, footer)
- \`scripts/\`: visual comparison utilities and tests
- \`docs/\`: reference inventories and comparison notes

## Scope and limitations

This is a frontend engineering and interaction study, not a production service or an official company website. Visual similarities to the referenced website are for analysis and learning; third-party names, designs and assets remain the property of their respective owners.

The repository demonstrates implementation techniques rather than a claim of original ownership of the reference design.
