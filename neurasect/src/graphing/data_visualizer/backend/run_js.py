import subprocess

result = subprocess.run(
    ["node", "backend/script.js", "wazzah", "42"],
    capture_output=True,
    text=True
)

print("JS said:", result.stdout) 
