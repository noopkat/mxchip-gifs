export const sendPayload = (frames, width, height, deviceId) => {
  const fetchBody = JSON.stringify({
    deviceId,
    data: {
      size: [width, height],
      frames
    }
  });

  const fetchOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: fetchBody
  };

  return fetch('/api/gif', fetchOptions)
}

export const populateDeviceList = ($select, $iothubWarning) => {
  fetch('/api/devices/list')
    .then((res) => res.json())
    .then((list) => {
       if (!list.length) return $iothubWarning.style.display = 'inline-block'; 
       const options = list.map((d) => `<option>${d}</option>`); 
       $select.innerHTML = options.join('\n');
    })
    .catch(console.error);
}

