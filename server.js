import express from "express";
import fetch from "node-fetch";

const app = express();

// Simple proxy that rewrites _blank to _self
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target);
    let html = await response.text();

    // Rewrite any target="_blank" links to stay in the iframe
    html = html.replace(/target="_blank"/g, 'target="_self"');

    // (Optional) Intercept window.open and redirect in the same frame
    html += `
      <script>
        window.open = function(url) {
          window.location.href = url;
        };
      </script>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).send("Error fetching target: " + err.message);
  }
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
