<h3 align="center">NeuraSect</h3>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  
</div>

---

<p align="center"> This project developed for COMP 490 class, is intended to build an Interactive Neural Network Playground – a tool that will combine a training sandbox with a visualizer to make deep learning more transparent and educational. 
    <br> 
</p>

## 📝 Table of Contents
- [Setup Instructions](#setup_instructions)

## ⚙️ Setup Instructions <a name = "setup_instructions"></a>

### Prerequisites:
- Node.js (version 14 or higher)
- Supabase instance (local or cloud-based)

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```
In Supabase, click the Project Settings button.

Click on Data API to find the Project URL.

Click on API Keys to find the publishable and secret keys.

5. Start the development server:
```
npm run dev
```
6. Open the application in your browser:
```
http://localhost:3000
```
