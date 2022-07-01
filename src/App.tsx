import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo512.png';
import './App.css';
import { invoke } from '@tauri-apps/api';

function App() {
  const [config, setConfig] = useState("apa")
  const [microphoneGUIDs, setMicrophoneGUIDs] = useState<string[]>([]);
  const [selectedMicrophoneIndex, setSelectedMicrophoneGUID] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  useEffect(() => {
    invoke('getEngineConfig', { delta: 0 }).then((result) => setConfig(result as string))
  }, [])
  
  useEffect(() => {
    // Find line "[VoiceInterfaceVivox.AudioDevicesList]"
    const lines = config.split('\n');
    const audioDevicesListIndex = lines.findIndex(s => s.includes("[VoiceInterfaceVivox.AudioDevicesList]"));
    const audioDevicesIndex = lines.findIndex(s => s.includes("[VoiceInterfaceVivox.AudioDevicesIndex]"));
    setMicrophoneGUIDs(lines.slice(audioDevicesListIndex + 1, audioDevicesIndex - 1));
    const selectedMicLine = lines[audioDevicesIndex + 1];
    const selectedMicIndexResult = selectedMicLine.match(/\d+/);
    const selectedMicIndex = selectedMicIndexResult?.length ? Number(selectedMicIndexResult[0]) : null;
    setSelectedMicrophoneGUID(selectedMicIndex ? microphoneGUIDs[selectedMicIndex] : '');

  }, [config]);

  const getEngineConfig = useCallback(async () => {
    const result = await invoke('getEngineConfig', { delta: 1 }) as string
    setConfig(result)    
  }, [setConfig])

  const toggleShowHelp = () => setShowHelp(!showHelp);
  
  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      
      <main>      
        <div className="row">
          <h3>Select the microphone you want to use</h3>
          <button id="helpIcon" onClick={toggleShowHelp}>i</button>
        </div>        

        {showHelp && (
        <section className="help">
          <h4>My mic is not listed</h4>
          <ul id="help">
            <li>Click "remove write protection"</li>          
            <li>Start RS2 game so that it can detect new mic</li>
            <li>Exit the game</li>
            <li>Click "Reload config"</li>
          </ul>
        </section>
        )}

        <div className="microphones">
        {microphoneGUIDs.map(guid => (
          <div className="microphone">
            <input type="radio" id={guid} name="microphoneGuid" value={guid} checked={selectedMicrophoneIndex === guid} />
            <label htmlFor={guid}>{guid}</label>
          </div>
        ))}
        </div>
      </main>
      
      <footer>
        <button className="button" onClick={getEngineConfig}>Reload config</button>
        <button className="button">Remove write lock</button>
        <button className="button" id="save">Save</button>
      </footer>
    </div>
  );
}

export default App;
