import { defineMermaidSetup } from '@slidev/types'

// Zure palette applied to Mermaid so diagrams match the deck.
export default defineMermaidSetup(() => ({
  theme: 'base',
  fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
  themeVariables: {
    background: '#ffffff',
    primaryColor: '#ffffff',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#666666',
    secondaryColor: '#f3f3f2',
    secondaryTextColor: '#1a1a1a',
    secondaryBorderColor: '#d9d9d6',
    tertiaryColor: '#ffffff',
    tertiaryTextColor: '#1a1a1a',
    tertiaryBorderColor: '#d9d9d6',
    lineColor: '#666666',
    textColor: '#1a1a1a',
    mainBkg: '#ffffff',
    nodeBorder: '#666666',
    clusterBkg: '#ffffff',
    clusterBorder: '#d9d9d6',
    edgeLabelBackground: '#ffffff',
    fontSize: '16px',
  },
  flowchart: {
    curve: 'linear',
    padding: 10,
    nodeSpacing: 34,
    rankSpacing: 40,
    useMaxWidth: true,
  },
  sequence: {
    useMaxWidth: true,
    actorFontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
    noteFontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
    messageFontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
  },
}))
