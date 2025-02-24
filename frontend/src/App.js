import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
    const [logs, setLogs] = useState([]);

    // Fetch Attack Logs on Page Load
    useEffect(() => {
        axios.get("http://localhost:5000/log-attack")
            .then(response => setLogs(response.data))
            .catch(error => console.error("Error fetching data:", error));

        // Listen for real-time updates
        socket.on("newAttack", (newAttack) => {
            setLogs(prevLogs => [newAttack, ...prevLogs]);
        });

        return () => socket.off("newAttack"); // Cleanup listener
    }, []);

    return (
        <div>
            <h1>Honeypot Attack Logs (Real-time)</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>Country</th>
                        <th>Attack Type</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.ip}</td>
                            <td>{log.country}</td>
                            <td>{log.attackType}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
