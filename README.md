# Seba - AI Educational Platform with Emotion-Aware Virtual Teacher

## Overview

**Seba** is an AI-powered educational platform designed to provide **personalized, emotionally intelligent tutoring** for students.

The system addresses major challenges in the Egyptian education system such as:

* Overcrowded classrooms
* Lack of personalized learning
* High cost of private tutoring

Seba transforms traditional LMS into an **intelligent virtual teacher** using advanced AI techniques like RAG and emotion detection.

---

## Key Features

* Emotion-aware AI Tutor (detects student feelings)
* Curriculum-based responses using RAG
* Bilingual support (Arabic / English)
* Learning analytics dashboard
* Dynamic quiz generation
* Microservices architecture with Docker

---

## System Architecture

* **Frontend:** React (RTL support for Arabic)
* **Backend:** FastAPI (Python)
* **AI Engine:** RAG + NLP models
* **Vector Database:** FAISS
* **Emotion Detection:** RoBERTa (GoEmotions)
* **Deployment:** Docker & Microservices

---

## How It Works

1. Student sends a question (Arabic or English)
2. System analyzes emotion using NLP
3. Query is processed using Hybrid RAG:

   * Semantic Search (FAISS)
   * Keyword Search (BM25)
4. AI generates response based on curriculum
5. System adapts explanation based on student emotion
6. Dynamic quiz is generated based on performance

---

## Tech Stack

* Python (FastAPI, NLP libraries)
* Hugging Face Transformers
* FAISS (Vector Search)
* React + TypeScript
* Docker & Docker Compose
* SQLite / PostgreSQL

---

## Installation & Setup

### Using Docker (Recommended)

```bash
docker-compose up --build
```

---

### Manual Setup

#### Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

#### Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## Project Objectives

* Build an **emotion-aware AI tutor**
* Implement **Hybrid RAG system**
* Support **Arabic + English (RTL)**
* Provide **learning analytics dashboard**
* Ensure **scalable architecture**
* Follow **WCAG accessibility standards**

---

## Use Cases

* Students needing personalized explanations
* Teachers tracking student performance
* Reducing dependency on private tutoring

---

## Screenshots

<img width="781" height="423" alt="image" src="https://github.com/user-attachments/assets/a6d378ba-077b-45ef-baf5-fa2374a9fb8e" />
<img width="698" height="294" alt="image" src="https://github.com/user-attachments/assets/02957597-a647-4a72-aaa2-eb2fdb4fec5e" />
<img width="681" height="349" alt="image" src="https://github.com/user-attachments/assets/1ca7cd4d-e609-4b48-8de7-e168fb1fa45f" />
<img width="648" height="405" alt="image" src="https://github.com/user-attachments/assets/62924e2c-14be-4057-94b0-42f024ff4691" />
<img width="655" height="316" alt="image" src="https://github.com/user-attachments/assets/5289beb6-4a5a-423d-8821-73b2e18a1228" />
<img width="777" height="392" alt="image" src="https://github.com/user-attachments/assets/a4fd886c-3c71-498b-9a05-5bc5213af126" />
<img width="780" height="346" alt="image" src="https://github.com/user-attachments/assets/f55f7a1c-7a0c-4e0d-867b-fc2dca26f8a1" />
<img width="774" height="303" alt="image" src="https://github.com/user-attachments/assets/ba620482-e86b-45e6-bd2c-293a2ddddfea" />


---

## Future Work

* Voice interaction (Speech-to-Text)
* Mobile application
* Advanced deep learning models
* Cloud deployment

---

## Team

* Nehal Kamal & teammates in graduation project
  


---

## Notes

This project is developed as a **Graduation Project** for the Artificial Intelligence Engineering Program at Mansoura University.

It demonstrates the integration of:

* AI in Education
* Emotion-aware systems
* Retrieval-Augmented Generation (RAG)
* [graduation project 2 Final.pdf](https://github.com/user-attachments/files/27126262/graduation.project.2.Final.pdf)

---

