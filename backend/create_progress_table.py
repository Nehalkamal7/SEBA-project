
from database import engine, Base
from models import LessonProgress

print("Creating lesson_progress table...")
LessonProgress.__table__.create(bind=engine, checkfirst=True)
print("Done.")
