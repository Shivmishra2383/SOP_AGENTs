# 🧠 OpsMind AI – Context-Aware Corporate Knowledge Brain

## 📌 Overview

**OpsMind AI** is an enterprise-grade AI-powered knowledge assistant designed to help organizations efficiently access and utilize their Standard Operating Procedures (SOPs).

Large corporations often store SOPs across hundreds of PDF documents, making it difficult for employees to quickly find accurate information. OpsMind AI solves this problem using a **Retrieval Augmented Generation (RAG)** pipeline that enables instant, context-aware, and source-backed answers.

---

## 🚀 Key Features

### 🔍 1. Retrieval Augmented Generation (RAG)

* Upload SOP PDFs and automatically:

  * Parse documents
  * Split into semantic chunks
  * Generate vector embeddings
  * Store embeddings in MongoDB
* On user query:

  * Retrieve top 3–5 most relevant chunks
  * Generate precise answers based only on retrieved context

---

### 📖 2. Source Citation (Zero Hallucination System)

* Every response includes exact references:

  * Document name
  * Page number
  * Section details
* Example:

  ```
  "According to Refund Policy (Page 12, Section 3.1)..."
  ```
* Ensures **trustworthy and verifiable outputs**

---

### 🛠️ 3. Admin Knowledge Base Panel

* Secure admin interface to:

  * Upload SOP documents (PDF)
  * Delete outdated documents
  * Manage knowledge base
* Automatically triggers:

  * Re-indexing
  * Embedding generation
  * Vector storage updates

---

## 🏗️ System Architecture

```
          ┌──────────────┐
          │   Frontend   │
          │ (React App)  │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   Backend    │
          │ (Node.js API)│
          └──────┬───────┘
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
PDF Parser   Chunk Service   Embedding Service
   │             │             │
   └──────► Vector Storage (MongoDB)
                         │
                         ▼
                 Query Retrieval Engine
                         │
                         ▼
                 LLM Response Generator
```

---

## ⚙️ Tech Stack

### 🖥️ Frontend

* React.js
* Redux Toolkit
* Tailwind CSS / Bootstrap
* React Toastify

### 🔧 Backend

* Node.js
* Express.js
* MongoDB (Vector Storage)
* Multer (File Upload)

### 🤖 AI & Processing

* Embedding Model (OpenAI / Similar)
* Custom Chunking Algorithm
* Semantic Search (Vector Similarity)

---

## 📂 Project Structure

```
OpsMind-AI/
│
├── backend/
│   ├── controllers/
│   ├── services/
│   │   ├── chunkService.js
│   │   ├── embeddingService.js
│   │   └── vectorService.js
│   ├── utils/
│   │   └── pdfParser.js
│   ├── models/
│   └── routes/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   └── utils/
│
├── .env
├── .gitignore
└── README.md
```

---

## 🔄 Workflow

### 📥 Document Upload Flow

1. Admin uploads SOP PDF
2. PDF is parsed into raw text
3. Text is split into chunks
4. Embeddings are generated
5. Stored in MongoDB

---

### ❓ Query Flow

1. User asks a question
2. Query is converted to embedding
3. Top relevant chunks are retrieved
4. LLM generates answer using context only
5. Response includes source citations

---

## 🧪 Example Query

**User Input:**

```
How do I process a refund?
```

**AI Output:**

```
According to the Refund Policy (Page 12, Section 3.1),
a refund request must be submitted within 7 days of purchase...
```

---

## 🔐 Security & Reliability

* Role-based admin access
* No hallucination policy (strict context grounding)
* Secure file handling
* Environment-based configuration (.env)

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/OpsMind-AI.git
cd OpsMind-AI
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌍 Environment Variables

Create a `.env` file in the backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
OPENAI_API_KEY=your_api_key
```

---

## 📌 Future Enhancements

* Multi-language support
* Role-based query permissions
* Real-time document syncing
* Analytics dashboard (query insights)
* Voice-based SOP assistant

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Final Note

OpsMind AI transforms static SOP documents into a **dynamic, intelligent knowledge system**, enabling employees to get **instant, accurate, and source-backed answers**—boosting productivity
