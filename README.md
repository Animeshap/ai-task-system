\# AI-Powered Task \& Knowledge Management System



\## Overview



This is a full-stack AI-powered task and knowledge management system.



The system allows admins to upload documents, manage users, assign tasks, and view analytics. Users can search knowledge documents using AI semantic search and manage assigned tasks.



\## Tech Stack



\### Backend

\- Python

\- FastAPI

\- MySQL

\- SQLAlchemy

\- JWT Authentication

\- FAISS Vector Database

\- Sentence Embeddings



\### Frontend

\- React.js

\- Vite

\- Axios

\- React Router



\## Features



\### Authentication \& Authorization

\- JWT based authentication

\- Role Based Access Control (RBAC)

\- Admin and User roles



\### Document Management

\- Upload text documents

\- Store document metadata

\- Generate embeddings for AI search



\### AI Semantic Search

\- Convert text into embeddings

\- Store vectors using FAISS

\- Retrieve relevant documents based on user queries



\### Task Management

Admin:

\- Create tasks

\- Assign tasks to users



User:

\- View assigned tasks

\- Update task status



\### Dynamic Filtering



Supported filtering:



Example:



/tasks?status=completed



/tasks?assigned\_to=1





\### Activity Logging



Tracks:

\- Login

\- Document uploads

\- Search activity

\- Task updates



\### Analytics Dashboard



Shows:

\- Total tasks

\- Completed tasks

\- Pending tasks

\- Search analytics





\## Backend Setup



Go to backend:



```bash

cd backend

```



Create virtual environment:



```bash

python -m venv venv

```



Activate environment:



```bash

venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Create `.env` file:



```env

DATABASE\_URL=your\_mysql\_database\_url

SECRET\_KEY=your\_secret\_key

```



Start server:



```bash

uvicorn app.main:app --reload

```





\## Frontend Setup



Go to frontend:



```bash

cd frontend

```



Install packages:



```bash

npm install

```



Run React app:



```bash

npm run dev

```





\## Main APIs



\- POST /auth/login

\- GET/POST /tasks

\- POST /documents

\- GET /search

\- GET /analytics





\## Database



Database used:



MySQL



Tables:



\- users

\- roles

\- tasks

\- documents

\- activity\_logs





\## AI Implementation



The application implements embedding-based semantic search.



Flow:



Document Text → Embeddings → FAISS Vector Store → Query Matching → Search Results





\## Author



AI-Powered Task \& Knowledge Management System Assignment

