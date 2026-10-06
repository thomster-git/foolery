# Project DropAnchor

Project DropAnchor is a personal web-based tool designed to provide a digital safe space and actionable guidance during moments of neurodivergent burnout, sensory overload, and meltdowns.

## Features

- **Action Flowcharts**: Interactive, adaptable step-by-step guides for specific overwhelming scenarios (e.g., "Son isn't listening" or "Rumble Stage"). These are built with `reactflow` and provide clear, decisive actions when executive function is low.
- **My Corkboard**: A digital motivation board to pin affirmations, goals, and reflections. It serves as an anchor to remind you of your core values and capabilities.
- **Password Protection**: A simple entry gate (password: `anchor`) to keep the space personal and secure.
- **Low-Stimulation Design**: Built with a sleek, premium, dark-mode glassmorphism aesthetic that is calming and accessible.

## Development

This project was built using React and Vite. It is intended to be integrated into the broader **Project Atlas** ecosystem.

### Running Locally

```bash
cd drop-anchor
npm install
npm run dev
```

### Adding New Flowcharts

To add a new scenario, open `src/data/flowcharts.js` and add a new object to the `scenarios` export. 
- Use `className: 'node-decision'` for questions or decisions.
- Use `className: 'node-action'` for specific steps to take.

## Philosophy
Standard de-escalation plans often require too much cognitive load to read during a meltdown. DropAnchor is designed to be *functional*. It removes the need for decision-making by walking you through predetermined, effective actions one step at a time.
