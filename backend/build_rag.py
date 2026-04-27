import os
from dotenv import load_dotenv  # <--- 1. Import the library

# 2. LOAD THE KEY (Crucial Step)
load_dotenv() 

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Lesson
from vector_store import KnowledgeBase
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 3. CONFIGURATION
RAG_DB_FILE = "rag_content.db"
RAG_DB_URL = f"sqlite:///./{RAG_DB_FILE}"

def build_index():
    # Cleanup old files
    if os.path.exists("course_index.faiss"):
        os.remove("course_index.faiss")
    if os.path.exists("course_meta.pkl"):
        os.remove("course_meta.pkl")
    print("🧹 Cleared old AI memory files.")

    # Check DB
    if not os.path.exists(RAG_DB_FILE):
        print(f"❌ Error: {RAG_DB_FILE} not found. Run 'python ingest_pdfs.py' first!")
        return

    rag_engine = create_engine(RAG_DB_URL, connect_args={"check_same_thread": False})
    RagSession = sessionmaker(autocommit=False, autoflush=False, bind=rag_engine)
    db = RagSession()
    
    # Initialize KnowledgeBase
    try:
        # This will now work because load_dotenv() put the key in memory
        kb = KnowledgeBase()
    except Exception as e:
        print(f"❌ Error initializing KnowledgeBase: {e}")
        print("💡 Check if GEMINI_API_KEY is set in your .env file.")
        return
    
    # Splitter Config (Optimized for Gemini)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=3000,      
        chunk_overlap=500,    
        separators=["Topic ", "\n\n", "\n", ". ", " ", ""]
    )
    
    lessons = db.query(Lesson).all()
    
    if not lessons:
        print("❌ No lessons found in database. Run 'python ingest_pdfs.py' first!")
        return

    print(f"🔄 Processing {len(lessons)} lessons for the Knowledge Base...")

    data_to_embed = []
    
    for lesson in lessons:
        if not lesson.content:
            continue

        chunks = splitter.split_text(lesson.content)
        
        for chunk in chunks:
            full_text = f"Lesson: {lesson.title}.\nContent: {chunk}"
            
            data_to_embed.append({
                "id": lesson.id,           
                "course_id": lesson.course_id,
                "title": lesson.title,
                "text": full_text          
            })
    
    if data_to_embed:
        print(f"🚀 Sending {len(data_to_embed)} chunks to Gemini for embedding...")
        kb.add_lessons(data_to_embed)
        print("✅ SUCCESS: Knowledge Base updated with Gemini-004 embeddings.")
    else:
        print("⚠️ No content found to index.")

if __name__ == "__main__":
    build_index()