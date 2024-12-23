import React, { useState } from 'react';
import axios from 'axios';

const NoteInput = ({ onAddNote }) => {
    const [noteContent, setNoteContent] = useState('');
    const [transcribedContent, setTranscribedContent] = useState('');
    const [llmResponse, setLlmResponse] = useState('');
    const [fileFormat, setFileFormat] = useState('txt'); // State to hold the selected file format
    const [recognition, setRecognition] = useState(null);
    const [transcriptionRecognition, setTranscriptionRecognition] = useState(null);

    const startDictation = () => {
        const newRecognition = new window.webkitSpeechRecognition();
        newRecognition.continuous = true; // Keep listening
        newRecognition.interimResults = true; // Show interim results
        newRecognition.lang = 'en-US'; // Set language

        newRecognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setNoteContent(interimTranscript);
        };

        newRecognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        newRecognition.onend = () => {
            console.log("Speech recognition service disconnected");
        };

        newRecognition.start();
        setRecognition(newRecognition); // Store the recognition instance
    };

    const stopDictation = () => {
        if (recognition) {
            recognition.stop(); // Stop the recognition
            setRecognition(null); // Clear the recognition instance
        }
    };

    const startTranscription = () => {
        const newTranscriptionRecognition = new window.webkitSpeechRecognition();
        newTranscriptionRecognition.continuous = true; // Keep listening
        newTranscriptionRecognition.interimResults = true; // Show interim results
        newTranscriptionRecognition.lang = 'en-US'; // Set language

        newTranscriptionRecognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscribedContent(interimTranscript);
        };

        newTranscriptionRecognition.onerror = (event) => {
            console.error("Transcription error", event.error);
        };

        newTranscriptionRecognition.onend = () => {
            console.log("Transcription service disconnected");
        };

        newTranscriptionRecognition.start();
        setTranscriptionRecognition(newTranscriptionRecognition); // Store the transcription recognition instance
    };

    const stopTranscription = () => {
        if (transcriptionRecognition) {
            transcriptionRecognition.stop(); // Stop the transcription
            setTranscriptionRecognition(null); // Clear the transcription instance
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (noteContent.trim()) {
            onAddNote(noteContent);
            setNoteContent('');
        }
    };

    const sendToLLM = async () => {
        const combinedText = `${noteContent} ${transcribedContent}`; // Combine both transcripts

        console.log("Combined Text:", combinedText);
        console.log("API Key:", process.env.REACT_APP_GROQ_API_KEY); // For debugging

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [
                    {
                        role: "user",
                        content: `I want that my project should work like I want the functionality that the text from the second text box gets combined with the text from the first text box and the data is sent to the LLM model like Groq model and the output gets displayed in the third text box as the user has specified.`
                    },
                    {
                        role: "assistant",
                        content: `You want to create a UI component that allows users to combine text from two text boxes and send it to the Groq model.`
                    },
                    {
                        role: "user",
                        content: combinedText
                    }
                ],
                model: "llama3-8b-8192", // Use the appropriate model ID
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`, // Ensure this is correct
                    'Content-Type': 'application/json',
                }
            });

            // Extract the summary from the Groq response
            const summary = response.data.choices[0]?.message?.content || "Unable to generate summary.";
            setLlmResponse(summary); // Set the response from Groq
        } catch (error) {
            console.error('Error sending to LLM:', error);
            setLlmResponse('Failed to send to LLM. Please check your API key and permissions.');
        }
    };

    // Function to save the LLM response to a file based on selected format
    const saveResponse = () => {
        let blob;
        if (fileFormat === 'txt') {
            blob = new Blob([llmResponse], { type: 'text/plain' });
        } else if (fileFormat === 'pdf') {
            const pdfContent = `
                <html>
                <head>
                    <title>Response</title>
                </head>
                <body>
                    <h1>Your Response</h1>
                    <p>${llmResponse}</p>
                </body>
                </html>
            `;
            blob = new Blob([pdfContent], { type: 'application/pdf' });
        } else {
            alert("Unsupported format selected.");
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `your_response.${fileFormat}`; // Name of the file to be saved
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the URL object
    };

    return (
        <div>
            <h2>Note Dictation</h2>
            <button onClick={startDictation}>Start Dictation</button>
            <button onClick={stopDictation} disabled={!recognition} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Stop Dictation
            </button>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Type your note here..."
                />
                <button type="submit">Add Note</button>
            </form>

            <h2>Transcription</h2>
            <button onClick={startTranscription}>Start Recording</button>
            <button onClick={stopTranscription} disabled={!transcriptionRecognition} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Stop Recording
            </button>
            <textarea
                value={transcribedContent}
                readOnly
                placeholder="Transcribed content will appear here..."
                style={{ marginTop: '10px', height: '100px' }}
            />

            <button onClick={sendToLLM} style={{ marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Send to LLM
            </button>

            <h3>Select File Format:</h3>
            <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
                <option value="txt">TXT</option>
                <option value="pdf">PDF</option>
            </select>

            <button onClick={saveResponse} style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Save the Response
            </button>

            <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h3>Your Response Appears Here:</h3>
                <p>{llmResponse || "No response yet."}</p>
            </div>
        </div>
    );
};

export default NoteInput;
