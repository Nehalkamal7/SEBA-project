import os
import fitz  # PyMuPDF
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Course, Lesson 

# Configuration
PDF_ROOT = "./curriculum_pdfs"
RAG_DB_FILE = "rag_content.db"
RAG_DB_URL = f"sqlite:///./{RAG_DB_FILE}"

def clean_extracted_text(text):
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    text = re.sub(r'33\s*√', r'cube_root(', text)
    text = re.sub(r'3\s*√', r'cube_root(', text)
    text = re.sub(r'√', r'sqrt(', text)
    text = text.replace(" ̸=", " not_equal ")
    text = re.sub(r'(are)(integers)', r'\1 \2', text)
    text = text.replace("", "")
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'([a-zA-Z])([23])(?![0-9])', r'\1^\2', text)
    return text

def get_pdf_text(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        # Fallback logic: Try blocks first, if empty, try standard text
        page_text = ""
        blocks = page.get_text("blocks")
        if blocks:
            blocks.sort(key=lambda b: (b[1], b[0]))
            for b in blocks:
                page_text += b[4] + "\n"
        
        # If block extraction resulted in nothing, use standard text extraction
        if not page_text.strip():
            page_text = page.get_text()
            
        full_text += page_text

    # DEBUG: See if the file actually has text before cleaning
    if len(full_text.strip()) == 0:
        print(f"⚠️ Warning: No selectable text found in {os.path.basename(pdf_path)}")
    
    return clean_extracted_text(full_text)

def natural_sort_key(s):
    # Splits strings by numbers so "term_1" comes before "term_2"
    return [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', s)]

def ingest_multicourse():
    print(f"🚀 Starting RAG Ingestion (Deep Search)...")
    
    rag_engine = create_engine(RAG_DB_URL, connect_args={"check_same_thread": False})
    RagSession = sessionmaker(autocommit=False, autoflush=False, bind=rag_engine)
    Base.metadata.create_all(bind=rag_engine)
    db = RagSession()
    
    if not os.path.exists(PDF_ROOT):
        print(f"❌ Folder '{PDF_ROOT}' not found.")
        return

    # Get course folders (e.g., "Math")
    course_folders = [d for d in os.listdir(PDF_ROOT) if os.path.isdir(os.path.join(PDF_ROOT, d))]

    for course_title in course_folders:
        print(f"\nProcessing Course: {course_title}")
        
        # Create or Get Course
        course = db.query(Course).filter(Course.title == course_title).first()
        if not course:
            course = Course(title=course_title, instructor="AI", duration=0)
            db.add(course)
            db.commit()
            db.refresh(course)

        course_path = os.path.join(PDF_ROOT, course_title)
        
        # --- NEW LOGIC: Recursively find all PDFs in subfolders ---
        pdf_files = []
        for root, dirs, files in os.walk(course_path):
            for file in files:
                if file.endswith('.pdf'):
                    full_path = os.path.join(root, file)
                    pdf_files.append(full_path)
        
        # Sort by full path (ensures term_1 comes before term_2)
        pdf_files.sort(key=natural_sort_key)

        for i, file_path in enumerate(pdf_files):
            # Calculate a unique title based on folder + filename
            # e.g., "term_1\les1.pdf" -> "Term 1 Les1"
            rel_path = os.path.relpath(file_path, course_path)
            clean_title = rel_path.replace(".pdf", "").replace("\\", " ").replace("/", " ").replace("_", " ").title()
            
            print(f"   📄 Found: {clean_title}")
            
            try:
                full_text = get_pdf_text(file_path)

                if not full_text.strip():
                    print(f"   ❌ Skipping {clean_title}: No text extracted.")
                    continue # Don't save empty rows
                
                lesson = db.query(Lesson).filter(Lesson.course_id == course.id, Lesson.title == clean_title).first()
                
                if lesson:
                    lesson.content = full_text
                else:
                    lesson = Lesson(
                        course_id=course.id,
                        title=clean_title,
                        content=full_text,
                        description="", 
                        duration=0, 
                        order=i + 1 # Maintains sequence across terms
                    )
                    db.add(lesson)
                db.commit()
            except Exception as e:
                print(f"   ❌ Error processing {clean_title}: {e}")
            
    print(f"\n✅ Done! Data saved to {RAG_DB_FILE}")
    db.close()

if __name__ == "__main__":
    ingest_multicourse()