import webbrowser
import os

def visualize():
    html_path = os.path.abspath("frontend/public/index.html")
    webbrowser.open(f"file:///{html_path}")

visualize()
