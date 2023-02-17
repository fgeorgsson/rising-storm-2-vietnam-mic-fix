import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo512.png';
import './App.css';
import { invoke } from '@tauri-apps/api';
import { getGuidForMicrophoneLine } from './utils';

function App() {
  const [config, setConfig] = useState<string>();
  const [microphoneLines, setMicrophoneLines] = useState<string[]>([]);
  const [selectedMicrophoneGUID, setSelectedMicrophoneGUID] = useState<string>('');
  const [deviceNamesAndGUIDs, setDeviceNamesAndGUIDs] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState<boolean>(false);

  useEffect(() => {
    if (config) {
      const lines = config.split('\n');
      const newMicrophoneLines = lines.filter(l => l.startsWith('Microphone'))
      const newMicrophoneGUIDs = newMicrophoneLines
        .map(l => l.match(/{[a-zA-Z0-9-]+}/))
        .map(l => l ? l[0].toUpperCase() : null)
        .filter(l => l !== null) as string[]
        || [];
      console.log(newMicrophoneGUIDs);
      setMicrophoneLines(newMicrophoneGUIDs);
      const selectedMicLine = lines.find(l => l.startsWith('SelectedIndex='));
      if (selectedMicLine) {
        const selectedMicIndexResult = selectedMicLine.match(/\d+/);
        const selectedMicIndex = selectedMicIndexResult?.length ? Number(selectedMicIndexResult[0]) : null;
        onMicClick(selectedMicIndex !== null ? newMicrophoneLines[selectedMicIndex] : '');
      }
    }
  }, [config]);

  const getEngineConfig = useCallback(async () => {
    setConfig(undefined);
    const result = await invoke('get_engine_config') as string;
    setConfig(result);

    const newDeviceData = await invoke('get_devices') as string;
    let newDevices = newDeviceData ? newDeviceData.replaceAll('\r\n', '\n').split('\n').slice(4).filter(l => l !== "") : [];
    const newDeviceRecords = newDevices.reduce((accumulator: Record<string, string>, micLine) => {
      const match = micLine.match(/(.*\)).*}.([{}a-zA-Z0-9-]+)$/);
      if (match?.length && match?.length > 2) {
        accumulator[match[2]] = match[1];
      }
      return accumulator;
    }, {});
    console.log('newDevices', newDeviceRecords);
    setDeviceNamesAndGUIDs(newDeviceRecords);
  }, [setConfig]);

  const setEngineConfig = async () => {
    if (config) {
      console.log('selectedMicrophoneGUID', selectedMicrophoneGUID);
      const index = microphoneLines.findIndex(l => l.toUpperCase().includes(selectedMicrophoneGUID));
      console.log('New index', index);
      
      let newConfig = config
        .replace(/SelectedIndex=\d+/, `SelectedIndex=${index}`)
        .replace(/AllowPeerVoice=[a-z]+/i, `AllowPeerVoice=True`);

      const result = await invoke('set_engine_config', { newConfig }) as string;
      alert(result);
    }
  }

  useEffect(() => {
    getEngineConfig();
  }, [getEngineConfig])

  const toggleShowHelp = () => setShowHelp(!showHelp);

  const onMicClick = (microphoneLine: string) => {
    const guid = getGuidForMicrophoneLine(microphoneLine);
    if (guid) {
      setSelectedMicrophoneGUID(guid);
    } else {
      alert(`Could not find mic details for mic with guid ${guid}. See Help for troubleshooting tips.`);
    }
  }

  const getNameForMicGuid = (guid: string) => {
    return deviceNamesAndGUIDs[guid] || `Unidentified microphone ${guid}. See Help troubleshooting tips.`;
  }

  const removeWriteLock = async () => {
    const result = await invoke('remove_write_lock') as string;
    alert(result);
  }
 
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
              <li>Start RS2 game so that it can detect new mic id:s</li>
              <li>Exit the game</li>
              <li>Click "Reload config"</li>
            </ul>
          </section>
        )}

        <div className="microphones">
          {microphoneLines.map(microphoneLine => (
            <div className="microphone" key={microphoneLine}>
              <input type="radio" id={microphoneLine} name="microphoneGuid" value={microphoneLine} checked={selectedMicrophoneGUID === microphoneLine} onChange={() => onMicClick(microphoneLine)} />
              <label htmlFor={microphoneLine}>{getNameForMicGuid(microphoneLine)}</label>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <button className="button" onClick={getEngineConfig}>Reload config</button>
        <button className="button" onClick={removeWriteLock}>Remove write lock</button>
        <button className="button" onClick={setEngineConfig} id="save">Save</button>
      </footer>
    </div>
  );
}

export default App;
