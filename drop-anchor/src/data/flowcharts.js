export const scenarios = {
  sonNotListening: {
    id: 'sonNotListening',
    title: "Son Isn't Listening",
    description: "An action plan for when communication breaks down and frustration rises.",
    nodes: [
      { id: '1', type: 'input', data: { label: 'Has he heard you clearly?' }, position: { x: 250, y: 0 }, className: 'node-decision' },
      { id: '2', data: { label: 'Action: Move into his line of sight, get down to his eye level, and say his name gently.' }, position: { x: 100, y: 100 }, className: 'node-action' },
      { id: '3', data: { label: 'Decision: Is he engaged in a high-focus activity? (e.g., screen time, deep play)' }, position: { x: 400, y: 100 }, className: 'node-decision' },
      { id: '4', data: { label: 'Action: Give a 2-minute warning. "In two minutes, we need to X." Then step back.' }, position: { x: 300, y: 250 }, className: 'node-action' },
      { id: '5', data: { label: 'Decision: Are you feeling physically agitated/frustrated?' }, position: { x: 500, y: 250 }, className: 'node-decision' },
      { id: '6', data: { label: 'Action: Tap out. Tell him: "I need 2 minutes to calm my body." Walk to another room and take deep breaths.' }, position: { x: 400, y: 400 }, className: 'node-action' },
      { id: '7', data: { label: 'Action: State the instruction clearly with only 3-4 words. E.g., "Shoes on now, please."' }, position: { x: 600, y: 400 }, className: 'node-action' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'No / Unsure' },
      { id: 'e1-3', source: '1', target: '3', label: 'Yes' },
      { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
      { id: 'e3-5', source: '3', target: '5', label: 'No' },
      { id: 'e5-6', source: '5', target: '6', label: 'Yes' },
      { id: 'e5-7', source: '5', target: '7', label: 'No' },
    ]
  },
  rumbleStage: {
    id: 'rumbleStage',
    title: "Rumble Stage (Pre-Meltdown)",
    description: "Grounding and de-escalation plan when you feel the rumble starting.",
    nodes: [
      { id: '1', type: 'input', data: { label: 'What is the primary trigger right now?' }, position: { x: 250, y: 0 }, className: 'node-decision' },
      { id: '2', data: { label: 'Sensory Overload' }, position: { x: 50, y: 150 }, className: 'node-decision' },
      { id: '3', data: { label: 'Emotional / Social Overload' }, position: { x: 250, y: 150 }, className: 'node-decision' },
      { id: '4', data: { label: 'Physical (Hungry/Tired)' }, position: { x: 450, y: 150 }, className: 'node-decision' },
      
      { id: '5', data: { label: 'Action: Move to a dark, quiet room immediately. Put on noise-cancelling headphones.' }, position: { x: 0, y: 300 }, className: 'node-action' },
      { id: '6', data: { label: 'Action: Send your SOS text to a safe person. "I am overwhelmed, need space." Then disconnect.' }, position: { x: 250, y: 300 }, className: 'node-action' },
      { id: '7', data: { label: 'Action: Drink a glass of cold water. Grab a safe, simple snack. Lie down for 10 minutes.' }, position: { x: 500, y: 300 }, className: 'node-action' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e1-4', source: '1', target: '4' },
      
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e3-6', source: '3', target: '6' },
      { id: 'e4-7', source: '4', target: '7' },
    ]
  }
};
