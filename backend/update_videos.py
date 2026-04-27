
import sqlite3
import re
import urllib.request
import json
import ssl

# Bypass SSL errors
ssl._create_default_https_context = ssl._create_unverified_context

# Data Mapping
term1_videos = {
    1: "https://youtu.be/bBq_X1NJeNU",
    2: "https://youtu.be/xBah2reXaXg",
    3: "https://youtu.be/fWGdA2fp3eU",
    4: "https://youtu.be/dzZvbCTJmBg",
    5: "https://youtu.be/0EjvGTln958",
    6: "https://youtu.be/vyAotw-7Ir4",
    7: "https://youtu.be/5fBJc54PjCc",
    8: "https://youtu.be/6IWlS7m7YKI",
    9: "https://youtu.be/o4BwDU619jI",
    10: "https://youtu.be/u-Od2NCo_PU",
    11: "https://youtu.be/0KJTlddO4mo",
    12: "https://youtu.be/7amIPqbtNSw"
}

term2_videos = {
    1: "https://youtu.be/bImN71PDd6Q",
    2: "https://youtu.be/bImN71PDd6Q",
    3: "https://youtu.be/6IWlS7m7YKI",
    4: "https://youtu.be/uC_NXjauO80",
    5: "https://youtu.be/ooCcvLTlC9w",
    6: "https://youtu.be/EmOi3rPsKxM",
    7: "https://youtu.be/YrNBgx92V6o",
    8: "https://youtu.be/u-Od2NCo_PU",
    9: "https://youtu.be/w1sgrkj1shQ",
    10: "https://youtu.be/QigSNl1si_g",
    11: "https://youtu.be/mcdmFQouDD0", 
    12: "https://youtu.be/cCjdMTLm6Wc",
    13: "https://youtu.be/2Bc1LeDCRGo",
    14: "https://youtu.be/jTsVK6bZ1Gs",
    15: "https://youtu.be/jUyi0lLdnOE",
    16: "https://youtu.be/1IdnulUVprY",
    17: "https://youtu.be/BIjge0_pKPA",
    18: "https://youtu.be/rQEH1KqZzYM",
    19: "https://youtu.be/2Ohm692fHAM",
    20: "https://youtu.be/eJGEpJr4eeo",
    21: "https://youtu.be/eZ1-mK3eRoc",
    22: "https://youtu.be/5mVqaZryono",
    23: "https://youtu.be/VrKS7AyDlkY"
}

def get_video_duration(url):
    try:
        # Extract ID
        video_id = url.split("youtu.be/")[1].split("?")[0]
        # Scrape page for initial data (lightweight)
        # Using a public Invidious instance API is easier, but standard scraping is more reliable without keys
        # Let's try to find "approxDurationMs" or "lengthSeconds" in source
        
        # NOTE: Fetching full YouTube page can be slow/blocked. 
        # For now, let's just log the URL update. Getting duration reliably without API key is hard in scripts.
        # We will try a simple regex on the page source for "approxDurationMs".
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
        match = re.search(r'"approxDurationMs":"(\d+)"', html)
        if match:
            ms = int(match.group(1))
            return int(ms / 1000 / 60) # Minutes
            
        # Fallback regex
        match = re.search(r'"lengthSeconds":"(\d+)"', html)
        if match:
            sec = int(match.group(1))
            return int(sec / 60)
            
        return 0
    except Exception as e:
        print(f"  ⚠️ Could not fetch duration for {url}: {e}")
        return 0

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get Course IDs
cursor.execute("SELECT id, title FROM Courses")
courses = cursor.fetchall()

course_map = {}
for c in courses:
    if "1st term" in c[1]:
        course_map['term1'] = c[0]
    elif "2nd term" in c[1]:
        course_map['term2'] = c[0]

print(f"Course Map: {course_map}")

# Update Term 1
print("\nUpdating Term 1 Videos...")
for les_num, url in term1_videos.items():
    if 'term1' not in course_map: break
    
    # Calculate duration
    duration = get_video_duration(url)
    print(f"  Les {les_num}: {duration} min - {url}")
    
    # Update DB - Match by course_id and approximate title matching numbers "1. ", "01. " or just generic ordering mechanism if titles are messed up
    # We will try to match by `order` column assuming it was populated correctly 1..N
    # Or strict title match like "{les_num}. %"
    
    # Try updating by title prefix first "X. "
    cursor.execute("""
        UPDATE Lessons 
        SET video_url = ?, duration = ? 
        WHERE course_id = ? AND (title LIKE ? OR title LIKE ?)
    """, (url, duration, course_map['term1'], f"{les_num}. %", f"Term 1 Les{les_num}%"))
    
    if cursor.rowcount == 0:
         # Fallback to pure partial match if renaming failed or format differs
         cursor.execute("""
            UPDATE Lessons 
            SET video_url = ?, duration = ? 
            WHERE course_id = ? AND title LIKE ?
        """, (url, duration, course_map['term1'], f"%Les{les_num}"))

# Update Term 2
print("\nUpdating Term 2 Videos...")
for les_num, url in term2_videos.items():
    if 'term2' not in course_map: break
    
    duration = get_video_duration(url)
    print(f"  Les {les_num}: {duration} min - {url}")
    
    cursor.execute("""
        UPDATE Lessons 
        SET video_url = ?, duration = ? 
        WHERE course_id = ? AND (title LIKE ? OR title LIKE ?)
    """, (url, duration, course_map['term2'], f"{les_num}. %", f"Term 2 Les{les_num}%"))
    
    if cursor.rowcount == 0:
         cursor.execute("""
            UPDATE Lessons 
            SET video_url = ?, duration = ? 
            WHERE course_id = ? AND title LIKE ?
        """, (url, duration, course_map['term2'], f"%Les{les_num}"))

conn.commit()
conn.close()
print("\n✅ Video updates complete!")
