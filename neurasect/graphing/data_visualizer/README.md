Running the Local Development Server (Summary)
To view the visualization in your browser, you must run a local server. This ensures that your HTML, JavaScript, and JSON files load correctly using standard web rules.
1. Open a terminal and navigate to the project root
cd <data_visualizer>


2. Activate the virtual environment (PowerShell)
.\.venv\Scripts\activate


3. Start the Python local server
python -m http.server 8000


This serves the entire project directory at:
http://localhost:8000


4. Open the application in your browser
http://localhost:8000/public/index.html


TIP: Disable cache in your browser's developer tools.
CTR + SHIFT + I -> Network -> Disable cache
This gives you the up to date version of model.json after every refresh.



