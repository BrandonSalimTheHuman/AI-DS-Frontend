import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  FormHelperText,
  Box,
  Typography,
  Button,
} from '@mui/material';

function App() {
  /* useStates for variables */
  const [approach, setApproach] = useState('');
  const [noteAmount, setNoteAmount] = useState('');
  const [temperature, setTemperature] = useState('');
  const [rootNote, setRootNote] = useState('');
  const [scaleType, setScaleType] = useState('');
  const [rangeLow, setRangeLow] = useState('');
  const [rangeHigh, setRangeHigh] = useState('');
  const [tempo, setTempo] = useState('');
  const [approachError, setApproachError] = useState(false);
  const [noteAmountError, setNoteAmountError] = useState(false);
  const [temperatureError, setTemperatureError] = useState(false);
  const [rootNoteError, setRootNoteError] = useState(false);
  const [scaleTypeError, setScaleTypeError] = useState(false);
  const [rangeLowError, setRangeLowError] = useState(false);
  const [rangeHighError, setRangeHighError] = useState(false);
  const [tempoError, setTempoError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [durations, setDurations] = useState({
    'semibreve (4 beats)': 20,
    'minim (2 beats)': 20,
    'crotchet (1 beat)': 20,
    'quaver (1/2 beat)': 20,
    'semiquaver (1/4 beat)': 20,
  });

  // changing approach
  const handleApproachChange = (event) => {
    setApproach(event.target.value);
  };

  // changing text field
  const handleNoteAmountChange = (event) => {
    setNoteAmount(event.target.value);
  };

  // changing slider
  const handleTemperatureChange = (event) => {
    setTemperature(event.target.value);
  };

  // changing root note
  const handleRootNoteChange = (event) => {
    setRootNote(event.target.value);
    let lowerRange = event.target.value + '4';
    let higherRange = event.target.value + '5';
    setRangeLow(lowerRange);
    setRangeHigh(higherRange);
  };

  // changing scale type
  const handleScaleTypeChange = (event) => {
    setScaleType(event.target.value);
  };

  // changing range from
  const handleRangeLowChange = (event) => {
    setRangeLow(event.target.value);
  };

  // changing range to
  const handleRangeHighChange = (event) => {
    setRangeHigh(event.target.value);
  };

  // changing tempo
  const handleTempoChange = (event) => {
    setTempo(event.target.value);
  };

  // changing the percentage for duration sliders
  const handleDurationSliderChange = (type, value) => {
    // get the current total
    const total =
      Object.values(durations).reduce((sum, val) => sum + val, 0) -
      durations[type] +
      value;

    // if more than total
    if (total > 100) {
      // reduce the other sliders proportianally by getting their percentage of the new total and mapping them to max 100
      const keys = Object.keys(durations).filter((key) => key !== type);
      let proportionalPercentages = keys.map((key) =>
        Math.round((durations[key] / total) * 100)
      );

      // get the new total
      let adjustedTotal =
        proportionalPercentages.reduce((sum, val) => sum + val, 0) + value;

      // if the new total is not 100 because of the rounding
      while (adjustedTotal !== 100) {
        // get the difference
        const diff = adjustedTotal > 100 ? -1 : 1;

        for (let i = 0; i < proportionalPercentages.length; i++) {
          // make sure to not apply a -1 change to a slider that's at 0
          if (proportionalPercentages[i] + diff >= 0) {
            // apply difference
            proportionalPercentages[i] += diff;
            adjustedTotal += diff;
            // break if new total is already exactly 100
            if (adjustedTotal === 100) break;
          }
        }
      }

      // set the new percentages for each duration type
      setDurations((prev) => ({
        ...prev,
        [type]: value,
        ...keys.reduce(
          (obj, key, i) => ({
            ...obj,
            [key]: proportionalPercentages[i],
          }),
          {}
        ),
      }));
    } else {
      // If the total doesn't exceed 100, update the value and adjust only one other slider
      const keys = Object.keys(durations).filter((key) => key !== type);
      // Pick last key not being slid
      const adjustmentKey = keys[keys.length - 1] === type ? keys[keys.length - 2] : keys[keys.length - 1];
      const remainingValue = 100 - value;

      // Update the durations object
      setDurations((prev) => ({
        ...prev,
        [type]: value,
        ...keys.reduce(
          (obj, key) => ({
            ...obj,
            [key]: key === adjustmentKey ? remainingValue : prev[key],
          }),
          {}
        ),
      }));
    }
  };

  // checking for errors, then show everything
  const displayEverything = async () => {
    // numebr of notes is integer, the other two must be numbers
    const isAmountValid = Number.isInteger(Number(noteAmount));
    const isTemperatureValid = !isNaN(Number(temperature));
    const isTempoValid = !isNaN(Number(tempo));

    // if anything is empty, apply errors
    if (
      !approach ||
      !noteAmount ||
      !isAmountValid ||
      !temperature ||
      !isTemperatureValid ||
      !rootNote ||
      !scaleType ||
      !rangeLow ||
      !rangeHigh ||
      !tempo ||
      !isTempoValid
    ) {
      setApproachError(!approach);
      setNoteAmountError(!noteAmount || !isAmountValid);
      setTemperatureError(!temperature || !isTemperatureValid);
      setRootNoteError(!rootNote);
      setScaleTypeError(!scaleType);
      setRangeLowError(!rangeLow);
      setRangeHighError(!rangeHigh);
      setTempoError(!tempo || !isTempoValid);
      return;
      // check that the key exists
    } else if (getScale(rootNote, scaleType).length == 0) {
      setErrorMessage("Please don't choose a theoretical key");
      return;
      // check that range is from a lower to a higher note
    } else if (!isLowerThan(rangeLow, rangeHigh)) {
      setErrorMessage('Range must be from lower to higher note');
    } else if (
      Object.values(durations).reduce((sum, val) => sum + val, 0) != 100
    ) {
      setErrorMessage('Percentages for durations must add up to 100');
    } else {
      // get scale
      const scale = getScale(rootNote, scaleType);
      console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      // reverting errors
      setApproachError(false);
      setNoteAmountError(false);
      setTemperatureError(false);
      setRootNoteError(false);
      setScaleTypeError(false);
      setRangeLowError(false);
      setRangeHighError(false);
      setTempoError(false);

      // api call
      try {
        const durationValues = Object.values(durations).map(
          (value) => value / 100
        );
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/generate-music/`,
          {
            model_type: approach,
            amount_of_notes: noteAmount,
            valid_notes: scale,
            range_lower: convertToNumber(rangeLow),
            range_upper: convertToNumber(rangeHigh),
            tempo: tempo,
            temperature: temperature,
            durations: durationValues,
          },
          {
            // to download the file
            responseType: 'blob',
          }
        );

        // download the resulting midi file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `generated_music_${approach}.mid`);
        document.body.appendChild(link);
        link.click();
        // clean up link
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error('Error generating music:', error);
      }
    }
  };

  // cleaning error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // chromatic scale, treats everything as sharps
  const chromaticScaleSharp = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  // chromatic scale, treats everything as flats
  const chromaticScaleFlat = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ];

  // major and minor keys that use sharps and flats.
  // this is about circle of fifths you don't need to know what this does
  const sharpKeysMajor = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  const flatKeysMajor = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  const sharpKeysMinor = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'];
  const flatKeysMinor = ['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'];

  // pattern of intervals for major scales and harmonic minor scales
  const scaleIntervals = {
    major: [2, 2, 1, 2, 2, 2],
    minor: [2, 1, 2, 2, 1, 3],
  };

  // determine if a key prefers sharps or flats
  const prefersSharpsMajor = (key) => sharpKeysMajor.includes(key);
  const prefersFlatsMajor = (key) => flatKeysMajor.includes(key);
  const prefersSharpsMinor = (key) => sharpKeysMinor.includes(key);
  const prefersFlatsMinor = (key) => flatKeysMinor.includes(key);

  // function to generate the scale
  const getScale = (rootNote, scaleType) => {
    // if both parameters exist
    if (rootNote && scaleType) {
      let chromaticScale = null;
      // if major scale
      if (scaleType == 'major') {
        // select the appropriate chromatic scale
        if (prefersSharpsMajor(rootNote)) {
          chromaticScale = chromaticScaleSharp;
        }
        if (prefersFlatsMajor(rootNote)) {
          chromaticScale = chromaticScaleFlat;
        }
        // if minor scale
      } else if (scaleType == 'minor') {
        // select the appropriate chromatic scale
        if (prefersSharpsMinor(rootNote)) {
          chromaticScale = chromaticScaleSharp;
        }
        if (prefersFlatsMinor(rootNote)) {
          chromaticScale = chromaticScaleFlat;
        }
      }

      // if it doesn't exist, return an empty array
      if (chromaticScale == null) {
        return [];
      }

      // get the pattern of the sacle, and the starting index based on the root note
      const intervals = scaleIntervals[scaleType];
      const startIndex = chromaticScale.indexOf(rootNote);

      // in case root note somehow doesn't exist
      if (startIndex === -1) {
        console.error('Invalid root note:', rootNote);
        return [];
      }

      // initialize scale with an empty array
      const scale = [];
      // start at the root note
      let currentIndex = startIndex;

      // add root note
      scale.push(chromaticScale[currentIndex]);

      // using the steps, find the index for the next note in the scale, then add the note name to scale
      intervals.forEach((step) => {
        currentIndex = (currentIndex + step) % chromaticScale.length;
        scale.push(chromaticScale[currentIndex]);
      });

      return scale;
    }
    return [];
  };

  // mapping notes to number to get their midi number later
  const noteToNumber = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  // convert note to number
  const convertToNumber = (note) => {
    // regex go brr
    const noteMatch = note.match(/^([A-G#b]+)(-?\d+)$/);

    if (noteMatch) {
      const noteName = noteMatch[1];
      const octave = parseInt(noteMatch[2], 10);

      // calculate number by multiplaying octave * 12 then + mapped number
      return noteToNumber[noteName] + (octave + 1) * 12;
    }

    // if no note found
    throw new Error('Invalid note format');
  };

  // comparing two notes
  const isLowerThan = (note1, note2) => {
    const num1 = convertToNumber(note1);
    const num2 = convertToNumber(note2);

    return num1 < num2;
  };

  // generate menu items for every note within midi range
  const generateMenuItems = () => {
    // octave range for midi
    const octaves = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // all possible notes, including enharmonic ones
    const notes = [
      'C',
      'C#',
      'Db',
      'D',
      'D#',
      'Eb',
      'E',
      'F',
      'F#',
      'Gb',
      'G',
      'G#',
      'Ab',
      'A',
      'A#',
      'Bb',
      'B',
    ];

    // the max for midi is G9
    const validNotesForOctave9 = [
      'C',
      'C#',
      'Db',
      'D',
      'D#',
      'Eb',
      'E',
      'F',
      'F#',
      'Gb',
      'G',
    ];

    const menuItems = [];
    octaves.forEach((octave) => {
      notes.forEach((note) => {
        // if it's the 9th, don't allow notes higher than G9
        if (octave === 9 && !validNotesForOctave9.includes(note)) {
          // skip invalid notes
          return;
        }

        const noteLabel = `${note}${octave}`;
        const noteValue = `${note}${octave}`;
        menuItems.push(
          <MenuItem key={noteValue} value={noteValue}>
            {noteLabel}
          </MenuItem>
        );
      });
    });

    return menuItems;
  };

  return (
    <>
      {/* Error message for theoretical keys */}
      {errorMessage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'red',
            color: 'white',
            textAlign: 'center',
            padding: '1vh',
            zIndex: 1000,
          }}
        >
          {errorMessage}
        </Box>
      )}

      <div className='title' >
        <div className='content'>
          {/* Title */}
          <h1>ClAIssical</h1>
          <h3>AI Music Composer for Classical Music Using
          LSTM, Transformer, and GRU Approach</h3>
        </div>
      </div>
      
      
      <div className='parameters'>

      <div className='parameters-container'>
        {/* Subheading */}
        <h2>Parameters</h2>
        <hr/>
        <p>
          Various music-based parameters to specify how the music is generated. 
        </p>
        <div className='details' onClick={() => window.open("https://drive.google.com/file/d/1eA6Dpm9X9zqEgRIIGG8kIPEFRGl8XicY/view?usp=sharing", "_blank")}>More Details</div>
      </div>
      
      {/* Select approach */}
      <div className='parameters-container'>
      <div>
      <FormControl sx={{ m: 3.5, minWidth: '25vh' }}>
        {/* Label for the select component */}
        <InputLabel sx={{ fontSize: '2vh' }}>Select AI Model</InputLabel>
        <Select
          sx={{ fontSize: '2vh', minHeight: '6.5vh' }}
          value={approach}
          onChange={handleApproachChange}
          error={approachError}
          label='Choose approach'
        >
          {/* All choices, first is for default */}
          <MenuItem value=''>
            <em>None</em>
          </MenuItem>
          <MenuItem value={'lstm'}>LSTM</MenuItem>
          <MenuItem value={'transformer'}>Transformer</MenuItem>
          <MenuItem value={'gru'}>GRU</MenuItem>
        </Select>
        {approachError && (
          <FormHelperText>Please choose an approach.</FormHelperText>
        )}
      </FormControl>
      </div>

      {/* Number of notes */}
      <FormControl sx={{ m: 3, minWidth: '25vh' }}>
        <TextField
          label='Amount of notes'
          value={noteAmount}
          onChange={handleNoteAmountChange}
          error={noteAmountError}
          helperText={
            noteAmountError
              ? 'Please choose amount of notes. (Must be integer)'
              : ''
          }
          InputProps={{
            style: { color: 'black' },
          }}
          FormHelperTextProps={{
            style: { color: 'black' },
          }}
          sx={{ fontSize: '2vh' }}
        />
      </FormControl>

      {/* Temperature */}
      <FormControl sx={{ m: 3, minWidth: '25vh' }}>
          <TextField
            label='Temperature'
            value={temperature}
            onChange={handleTemperatureChange}
            error={temperatureError}
            helperText={
              temperatureError
                ? 'Please choose temperature. (Must be number)'
                : ''
            }
            InputProps={{
              style: { color: 'black' },
            }}
            FormHelperTextProps={{
              style: { color: 'black' },
            }}
            sx={{ fontSize: '2vh' }}
          />
      </FormControl>
      </div>
      
      {/* Durations */}
      <div className='parameters-container'>
      <Typography sx={{ fontSize: '2vh' }}>Durations</Typography>

      <Box>
        {/* for each key value pair in durations */}
        {/* create a title and a slider */}
        {Object.entries(durations).map(([key, value]) => (
          <Box key={key} sx={{ m: 2 }}>
            <Typography>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}%
            </Typography>
            {/* step size of 1 so it's less messy */}
            <Slider
              value={value}
              onChange={(e, newValue) =>
                handleDurationSliderChange(key, newValue)
              }
              min={0}
              max={100}
              step={1}
              sx={{ width: '50%', color: '#555555' }}
            />
          </Box>
        ))}
        <Typography>
          Total: {Object.values(durations).reduce((sum, val) => sum + val, 0)}%
        </Typography>
      </Box>
      </div>

      <div className='parameters-container'>
      <Box sx={{ mt: 3 }}>
        <Typography variant='body1' sx={{ fontSize: '2vh' }}>
          Selected Key: {rootNote} {scaleType}
        </Typography>
      </Box>

      {/* Key selection, don't know if we're using this */}
      <Box sx={{ m: 3 }}>
        {/* First one for choosing the root note */}
        <FormControl sx={{ minWidth: '17.5vh', m: 2 }}>
          <InputLabel sx={{ fontSize: '2vh' }}>Root note</InputLabel>
          <Select
            sx={{ fontSize: '2vh', minHeight: '6.5vh' }}
            value={rootNote}
            onChange={handleRootNoteChange}
            error={rootNoteError}
            label='Root note'
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            <MenuItem value={'C'}>C</MenuItem>
            <MenuItem value={'C#'}>C#</MenuItem>
            <MenuItem value={'Db'}>Db</MenuItem>
            <MenuItem value={'D'}>D</MenuItem>
            <MenuItem value={'D#'}>D#</MenuItem>
            <MenuItem value={'Eb'}>Eb</MenuItem>
            <MenuItem value={'E'}>E</MenuItem>
            <MenuItem value={'F'}>F</MenuItem>
            <MenuItem value={'F#'}>F#</MenuItem>
            <MenuItem value={'Gb'}>Gb</MenuItem>
            <MenuItem value={'G'}>G</MenuItem>
            <MenuItem value={'G#'}>G#</MenuItem>
            <MenuItem value={'Ab'}>Ab</MenuItem>
            <MenuItem value={'A'}>A</MenuItem>
            <MenuItem value={'A#'}>A#</MenuItem>
            <MenuItem value={'Bb'}>Bb</MenuItem>
            <MenuItem value={'B'}>B</MenuItem>
          </Select>
          {rootNoteError && (
            <FormHelperText>Please choose a root note.</FormHelperText>
          )}
        </FormControl>

        {/* Second one for choosing the scale type */}
        <FormControl sx={{ minWidth: '17.5vh', m: 2 }}>
          <InputLabel sx={{ fontSize: '2vh' }}>Scale type</InputLabel>
          <Select
            sx={{ fontSize: '2vh', minHeight: '6.5vh' }}
            value={scaleType}
            onChange={handleScaleTypeChange}
            error={scaleTypeError}
            label='Scale type'
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            <MenuItem value={'major'}>Major</MenuItem>
            <MenuItem value={'minor'}>Minor</MenuItem>
          </Select>
          {scaleTypeError && (
            <FormHelperText>Please choose a scale type.</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontSize: '2vh' }}>
          Selected range: {rangeLow} - {rangeHigh}
        </Typography>
      </Box>

      {/* Range */}
      <Box sx={{ m: 3 }}>
        <FormControl sx={{ minWidth: '17.5vh', m: 2 }}>
          <InputLabel sx={{ fontSize: '2vh' }}>Range from</InputLabel>
          <Select
            sx={{ fontSize: '2vh', minHeight: '6.5vh' }}
            value={rangeLow}
            onChange={handleRangeLowChange}
            error={rangeLowError}
            label='Range from'
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>

            {generateMenuItems()}
          </Select>
          {rangeLowError && (
            <FormHelperText>Please choose the range</FormHelperText>
          )}
        </FormControl>

        <FormControl sx={{ minWidth: '17.5vh', m: 2 }}>
          <InputLabel sx={{ fontSize: '2vh' }}>Range to</InputLabel>
          <Select
            sx={{ fontSize: '2vh', minHeight: '6.5vh' }}
            value={rangeHigh}
            onChange={handleRangeHighChange}
            error={rangeHighError}
            label='Range to'
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>

            {generateMenuItems()}
          </Select>
          {rangeHighError && (
            <FormHelperText>Please choose the range</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* Tempo */}
      <Box sx={{ m: 3 }}>
        <FormControl sx={{ m: 3, minWidth: '25vh' }}>
          <TextField
            label='Tempo'
            value={tempo}
            onChange={handleTempoChange}
            error={tempoError}
            helperText={
              tempoError ? 'Please choose tempo. (Must be number)' : ''
            }
            InputProps={{
              style: { color: 'black' },
            }}
            FormHelperTextProps={{
              style: { color: 'black' },
            }}
            sx={{ fontSize: '2vh' }}
          />
        </FormControl>
      </Box>
      </div>

      <Button
        variant='outlined'
        color='success'
        sx={{ 
          fontSize: '2.5vh', 
          minWidth: '20vh',
          backgroundColor: 'white',  
          color: 'green',             
          border: '1px solid green',  
          '&:hover': {
            backgroundColor: '#a8e6a1', 
            border: '1px solid green', 
            color: 'green'             
          }
          }}
        
        onClick={displayEverything}
      >
        Generate
      </Button>
      </div>
    </>
  );
}

export default App;
