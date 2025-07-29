import React, { useState } from 'react';

export default function TestInput() {
  const [value, setValue] = useState('');

  return (
    <div className="p-8 bg-white">
      <h2 className="text-xl mb-4">Input Test</h2>
      <div className="space-y-4">
        <div>
          <label>Simple Input:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              console.log('Input change:', e.target.value);
              setValue(e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Type here..."
          />
          <p>Current value: {value}</p>
        </div>
        
        <div>
          <label>Uncontrolled Input:</label>
          <input
            type="text"
            onChange={(e) => console.log('Uncontrolled:', e.target.value)}
            className="w-full p-2 border border-red-300 rounded"
            placeholder="Uncontrolled input..."
          />
        </div>
      </div>
    </div>
  );
}
