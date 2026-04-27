import os
import pickle
import faiss
import numpy as np
import google.generativeai as genai
from sentence_transformers import CrossEncoder
from rank_bm25 import BM25Okapi

class KnowledgeBase:
    def __init__(self, index_file="course_index.faiss", meta_file="course_meta.pkl"):
        self.index_file = index_file
        self.meta_file = meta_file
        
        # 1. Setup Gemini API for Embeddings
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables.")
        genai.configure(api_key=api_key)
        self.model_name = "models/text-embedding-004"
        
        # 2. Reranking Model (Maintained for high-precision validation)
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
        self.index = None
        self.metadata = [] 
        self.bm25 = None  
        
        self._load_index()

    def _load_index(self):
        """Loads FAISS, Metadata, and rebuilds BM25 index."""
        if os.path.exists(self.index_file) and os.path.exists(self.meta_file):
            self.index = faiss.read_index(self.index_file)
            with open(self.meta_file, "rb") as f:
                self.metadata = pickle.load(f)
            
            # Rebuild BM25 index (Fast enough to do in memory)
            tokenized_corpus = [doc['text'].lower().split() for doc in self.metadata]
            self.bm25 = BM25Okapi(tokenized_corpus)
            
            print(f"✅ Loaded Knowledge Base: {len(self.metadata)} documents.")
        else:
            print("⚠️ No index found. Initializing new index with 768 dimensions.")
            # text-embedding-004 uses 768 dimensions by default
            self.index = faiss.IndexFlatL2(768)

    def add_lessons(self, lessons_data: list):
        """Embeds and adds lesson chunks in batches via Gemini API."""
        if not lessons_data:
            return

        print(f"⏳ Generating embeddings for {len(lessons_data)} chunks...")
        texts = [item['text'] for item in lessons_data]
        
        # 1. Vector Embedding (Batch processing via API)
        result = genai.embed_content(
            model=self.model_name,
            content=texts,
            task_type="retrieval_document"
        )
        
        embeddings = np.array(result['embedding']).astype('float32')
        self.index.add(embeddings)
        
        # 2. Metadata Storage
        self.metadata.extend(lessons_data)
        
        # 3. BM25 Indexing
        tokenized_corpus = [doc['text'].lower().split() for doc in self.metadata]
        self.bm25 = BM25Okapi(tokenized_corpus)
        
        self.save()
        print(f"✅ Added {len(lessons_data)} chunks. Hybrid System Ready.")

    def search(self, query: str, course_id: int = None, k=3):
        """Performs Hybrid Search + Reranking using Gemini Embeddings."""
        if self.index.ntotal == 0:
            return []

        # --- STEP 1: RETRIEVAL (Broad Search) ---
        candidates = {} 

        # A. Vector Search (Semantic)
        res = genai.embed_content(
            model=self.model_name,
            content=query,
            task_type="retrieval_query"
        )
        query_vector = np.array(res['embedding']).reshape(1, -1).astype('float32')
        
        # Retrieve top 10 candidates for reranking
        v_distances, v_indices = self.index.search(query_vector, k=10)
        
        for idx in v_indices[0]:
            if idx != -1 and idx < len(self.metadata):
                doc = self.metadata[idx]
                if course_id is None or doc.get('course_id') == course_id:
                    candidates[idx] = doc

        # B. Keyword Search (BM25)
        if self.bm25:
            tokenized_query = query.lower().split()
            bm25_docs = self.bm25.get_top_n(tokenized_query, self.metadata, n=10)
            
            for doc in bm25_docs:
                if course_id is None or doc.get('course_id') == course_id:
                    if doc not in candidates.values():
                        # Deduplicate while preserving doc reference
                        candidates[f"bm25_{len(candidates)}"] = doc

        unique_candidates = list(candidates.values())
        if not unique_candidates:
            return []

        # --- STEP 2: RERANKING ---
        # Limit to top 10 unique candidates to optimize speed
        top_candidates_to_rerank = unique_candidates[:10]
        
        pairs = [[query, doc['text']] for doc in top_candidates_to_rerank]
        scores = self.reranker.predict(pairs)
        
        scored_docs = []
        for doc, score in zip(top_candidates_to_rerank, scores):
            # Create a copy to avoid modifying the original metadata during the loop
            new_doc = doc.copy()
            new_doc['rerank_score'] = float(score)
            scored_docs.append(new_doc)
        
        return scored_docs[:k]

    def save(self):
        """Persists the FAISS index and metadata to disk."""
        faiss.write_index(self.index, self.index_file)
        with open(self.meta_file, "wb") as f:
            pickle.dump(self.metadata, f)