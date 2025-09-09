const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8900 });

wss.on("connection", (ws) => {
  console.log("Client connected");
  
  // Each connection gets its own interval
  let interval = null;

  ws.on("message", (msg) => {
    const command = msg.toString();
    console.log("Received command:", command);

    if (command === "start") {
      if (!interval) {
        console.log("Starting number generation");
        interval = setInterval(() => {
          const randomNum = Math.floor(Math.random() * 100) + 1;
          console.log("Sending number:", randomNum);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "number", value: randomNum }));
          } else {
            console.log("WebSocket not open, clearing interval");
            clearInterval(interval);
            interval = null;
          }
        }, 1000);
      }
    }

    if (command === "stop") {
      console.log("Stopping number generation");
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stopped" }));
      }
    }

    if (command === "restart") {
      console.log("Restarting number generation");
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "number", value: randomNum }));
        }
      }, 1000);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });
});

console.log("WebSocket server running on port 8900");