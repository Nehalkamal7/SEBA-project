from vector_store import KnowledgeBase

def check_brain_health():
    print("🧠 Loading Knowledge Base...")
    kb = KnowledgeBase()
    
    # 1. Test a Specific Math Concept (from your new PDF)
    # We want to see if it retrieves "x^2" (Good) or "x2" (Bad)
    query = "How do I factorize x^2 + 5x + 6?"
    
    print(f"\n🔍 Query: '{query}'")
    results = kb.search(query, k=3)
    
    if not results:
        print("❌ CRITICAL FAILURE: The brain is empty.")
        return

    print(f"✅ Found {len(results)} memory chunks. Inspecting content:\n")
    
    for i, res in enumerate(results):
        content = res['text']
        print(f"--- 📄 Chunk {i+1} (from Lesson ID: {res.get('id', 'Unknown')}) ---")
        
        # CHECK 1: Does it have the source tag?
        if "Lesson:" in content:
            print("   ✅ Metadata Tag: DETECTED (AI knows which lesson this is)")
        else:
            print("   ⚠️ Metadata Tag: MISSING (AI might get confused)")
            
        # CHECK 2: Is the Math clean?
        # We look for the "carrot" symbol (^) which implies x^2
        if "^" in content or "sqrt(" in content:
            print("   ✅ Math Formatting: LOOKS GOOD (Found x^2 or sqrt)")
        else:
            print("   ⚠️ Math Formatting: CHECK MANUALLY (Might be 'x2')")

        print("\n--- RAW TEXT CONTENT ---")
        print(content[:500]) # Print first 500 characters
        print("\n" + "="*60)

if __name__ == "__main__":
    check_brain_health()