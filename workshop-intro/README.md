# App modernization lab intro

Twelve slides for Pasi Huuhka's introduction to the GitHub Copilot
app modernization MicroHack. Uses the shared Zure theme.

```bash
npm run dev:workshop-intro
npm run build:workshop-intro
```

## Running order

| Slide | Topic | Time |
| --- | --- | --- |
| 1 | Welcome | 0:15 |
| 2 | Today's agenda | 0:30 |
| 3 | Meet Pasi, experience and community | 0:30 |
| 4 | IglooConf 2027, speakers and tickets | 0:30 |
| 5 | Open the participant site, link and QR | 0:15 |
| 6 | Challenge 1, agent, skill and MCP | 1:00 |
| 7 | Challenge 2, assess and upgrade | 1:15 |
| 8 | Challenge 3, modernize and deploy | 1:15 |
| 9 | Credentials and browser sign-in | 1:30 |
| 10 | Local tools and client sign-in | 1:30 |
| 11 | Walkthrough and fork workarounds | 1:15 |
| 12 | Policy-aware deployment and start the lab | 1:45 |

The speaker introduction uses a type-only, full-canvas layout. The IglooConf
announcement shows portraits of all seven announced 2027 speakers, links
to ticket sales and includes a small sponsor strip. Both slides are static,
with no source footer. The portraits and sponsor logos are stored locally
in `public/assets/iglooconf-2027` so the deck does not need the event site
to load them during the presentation.

Speaker notes include the detailed steps, caveats and official source URLs.
Slide text uses readable addresses and tool names rather than installation
links. The sign-in screenshot has placeholder values and enlarged labels.
The original credential image is not included in this repository.

The 404s, client sign-in issues and VNet policy failures describe Pasi's lab
run. They are not universal product limitations.

## Sources

- [IglooConf, announced 2027 speakers, portraits, sponsors and tickets](https://www.iglooconf.fi/)
- [Microsoft MicroHack](https://github.com/microsoft/MicroHack/tree/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization)
- [Modernization agent quickstart](https://learn.microsoft.com/azure/developer/github-copilot-app-modernization/modernization-agent/quickstart)
- [GitHub CLI authentication](https://cli.github.com/manual/gh_auth_login)
- [Copilot CLI setup](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli)
- [GitHub remote management](https://docs.github.com/en/get-started/git-basics/managing-remote-repositories)
- [Azure Policy deployment errors](https://learn.microsoft.com/azure/azure-resource-manager/troubleshooting/error-policy-requestdisallowedbypolicy)

Source content checked on September 10, 2026. SDK versions on slide 7 are the
lab's specified targets.

## Cover artwork

- Asset: `public/assets/cover-workshop.png`
- Generated with Azure AI Foundry using Azure CLI authentication.
- Deployment: `gpt-image-2-1`
- Size: 1536 × 1024
- Quality: high
- Prompt:

> Cover illustration for a professional Zure workshop presentation about modernizing old software. Editorial architectural watercolor and fine graphite on warm white paper, wide landscape composition. A single small industrial workshop building undergoing thoughtful renovation: left part weathered brick and exposed old pipes, right part repaired pale facade and precise teal structural beams, a few restrained vermilion-red details, open cutaway exposing the structure. Human-scale, tactile and quietly technical. Building occupies the right two thirds with airy off-white surroundings, ground contact and light pencil construction lines. Large clear empty area on the left for slide title, no text anywhere, no lettering, no logos, no floating UI, no clouds, no glowing neon, no gradients, no robots. Refined muted palette charcoal, pale grey, teal #037f91, sparse red #de1e05. One coherent scene not a collage.

## Participant links page

Live site: https://kind-plant-0aa636f03.5.azurestaticapps.net/

**https://zure.ly/hack-links** redirects to that address. The slides use this
short address; Pasi manages the redirect.

The plain HTML and CSS are in `links/`. No build step is needed for the page.
It includes installation pages, challenges, solutions, sample repos and
sign-in guidance. The site uses four pages with shared step navigation:
`index.html`, `install.html`, `login.html` and `walkthroughs.html`. Optional tools
and troubleshooting details expand on demand. `guide.html` forwards to the intro.
The MicroHack portal at https://emea.microhack.cloud/login holds participants'
lab materials and Credentials tab. Participants receive credentials for that
portal separately. The site emphasizes direct links to the walkthroughs. JDK, Maven, Docker, azd, Node.js and PowerShell are listed
as tools to install when a task needs them. .NET SDK stays in the initial setup.

Azure deployment:

- App: `hack-links`
- Resource group: `rg-hack-links`
- Region: West Europe
- SKU: Free
- Subscription: Microsoft Azure Sponsorship, `ede0939c-80c4-4dfe-bf3d-84521f3f6d1f`

To publish edits using an authenticated Azure CLI session:

```bash
bash workshop-intro/deploy-links.sh
```

The script reads the deployment token into an environment variable and deploys
only `links/` to production. It does not publish slides or credentials.

The fifth slide contains only `zure.ly/hack-links` and a QR code encoding
`https://zure.ly/hack-links`. The SVG was generated with Segno.
