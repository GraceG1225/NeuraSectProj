<h3 align="center">NeuraSect</h3>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  
</div>

---

<p align="center"> This project developed for COMP 490 class, is intended to build an Interactive Neural Network Playground – a tool that will combine a training sandbox with a visualizer to make deep learning more transparent and educational. 
    <br> 
</p>

## Table of Contents
- [Setup Instructions](#setup_instructions)

## Setup Instructions <a name = "setup_instructions"></a>

### Prerequisites:
- Node.js (version 14 or higher)
- Supabase instance (local or cloud-based)
- Python 3.12 

### Installation:
1. Clone the repository:
```
git clone https://github.com/GraceG1225/NeuraSectProj.git
```
2. Navigate to the project directory:
```
cd neurasect
```
3. Install dependencies and packages:
```
npm install
```
4. Set up environment variables (create a .env file in the base folder):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
NEXT_PUBLIC_API_URL=your_api_url
```
In Supabase, click the Project Settings button.

Click on Data API to find the Project URL.

Click on API Keys to find the publishable and secret keys.

5. Navigate to the backend directory:
```
cd neurasect/src/backend
```
6. Setup the virtual environment:
```
python -m venv venv
source venv/bin/activate (Windows: venv\Scripts\activate)
```
7. Install required dependencies:
```
pip install -r requirements.txt
```
8. Start the backend development server:
```
python main.py
```
9. Start the frontend development server:
```
npm run dev (in neurasect folder)
```
10. Open the application in your browser:
```
http://localhost:3000
```
