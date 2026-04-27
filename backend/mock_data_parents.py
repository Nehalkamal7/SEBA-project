
from database import SessionLocal
from models import User
from auth import get_password_hash

db = SessionLocal()

def create_user(name, email, role):
    u = db.query(User).filter(User.email == email).first()
    if not u:
        print(f"Creating {role}: {email}")
        u = User(
            name=name,
            email=email,
            hashed_password=get_password_hash("password123"),
            role=role
        )
        db.add(u)
        db.commit()
        db.refresh(u)
    return u

print("Checking users...")
parent = create_user("Parent User", "parent@example.com", "parent")
teacher = create_user("Teacher User", "teacher@example.com", "teacher")

# Link Parent to Rahma
rahma = db.query(User).filter(User.email == "rahma@example.com").first()
if rahma:
    if rahma not in parent.children:
        print("Linking Parent -> Rahma")
        parent.children.append(rahma)
else:
    print("Rahma not found")

# Link Teacher to Ayman
ayman = db.query(User).filter(User.email == "ayman@example.com").first()
if ayman:
    if ayman not in teacher.students_taught:
        print("Linking Teacher -> Ayman")
        teacher.students_taught.append(ayman)
else:
    print("Ayman not found")

db.commit()
db.close()
print("Mock parents/teachers setup complete.")
