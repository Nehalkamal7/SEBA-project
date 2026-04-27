"""
Migration script to add soft delete columns to User table
Run this once to update the database schema
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL

def add_soft_delete_columns():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add is_deleted column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            print("✅ Added is_deleted column")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("⚠️  is_deleted column already exists")
            else:
                print(f"❌ Error adding is_deleted: {e}")
        
        try:
            # Add deleted_at column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN deleted_at TIMESTAMP
            """))
            conn.commit()
            print("✅ Added deleted_at column")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("⚠️  deleted_at column already exists")
            else:
                print(f"❌ Error adding deleted_at: {e}")
    
    print("\n🎉 Migration complete! User soft delete is ready.")

if __name__ == "__main__":
    add_soft_delete_columns()
