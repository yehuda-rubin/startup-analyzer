import os
import pickle
from typing import List, Dict, Any, Optional
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from ..config import settings


class RAGService:
    """Retrieval-Augmented Generation Service using FAISS"""
    
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.vector_stores: Dict[int, FAISS] = {}  # startup_id -> FAISS
        
    def _get_store_path(self, startup_id: int) -> str:
        """Get path for vector store"""
        return os.path.join(settings.VECTOR_STORE_DIR, f"startup_{startup_id}")
    
    async def add_documents(
        self,
        startup_id: int,
        texts: List[str],
        metadatas: Optional[List[Dict]] = None
    ) -> List[str]:
        """Add documents to vector store"""
        try:
            # Split texts into chunks
            chunks = []
            chunk_metadatas = []
            
            for i, text in enumerate(texts):
                text_chunks = self.text_splitter.split_text(text)
                chunks.extend(text_chunks)
                
                # Add metadata for each chunk
                base_metadata = metadatas[i] if metadatas else {}
                chunk_metadatas.extend([
                    {**base_metadata, "chunk_id": j}
                    for j in range(len(text_chunks))
                ])
            
            # Create or update vector store
            if startup_id in self.vector_stores:
                # Add to existing store
                vector_store = self.vector_stores[startup_id]
                ids = vector_store.add_texts(chunks, metadatas=chunk_metadatas)
            else:
                # Create new store
                vector_store = FAISS.from_texts(
                    chunks,
                    self.embeddings,
                    metadatas=chunk_metadatas
                )
                self.vector_stores[startup_id] = vector_store
                ids = [str(i) for i in range(len(chunks))]
            
            # Save to disk
            store_path = self._get_store_path(startup_id)
            vector_store.save_local(store_path)
            
            return ids
            
        except Exception as e:
            raise Exception(f"Failed to add documents: {str(e)}")
    
    async def search(
        self,
        startup_id: int,
        query: str,
        k: int = 5
        ) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        try:
            print(f"\n🔍 RAG SEARCH:")
            print(f"   Startup ID: {startup_id}")
            print(f"   Query: {query[:100]}")
            print(f"   K: {k}")
            
            # Load vector store if not in memory
            if startup_id not in self.vector_stores:
                store_path = self._get_store_path(startup_id)
                print(f"   Loading from: {store_path}")
                
                if os.path.exists(store_path):
                    self.vector_stores[startup_id] = FAISS.load_local(
                        store_path,
                        self.embeddings
                    )
                    print(f"   ✅ Loaded vector store")
                else:
                    print(f"   ❌ Vector store not found!")
                    return []
            
            vector_store = self.vector_stores[startup_id]
            
            # Search
            results = vector_store.similarity_search_with_score(query, k=k)
            
            print(f"   📊 Found {len(results)} results")
            
            formatted_results = []
            for i, (doc, score) in enumerate(results):
                print(f"   Result {i+1}: score={score:.3f}, length={len(doc.page_content)}")
                print(f"   Preview: {doc.page_content[:100]}...")
                
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": float(score)
                })
            
            return formatted_results
            
        except Exception as e:
            print(f"   ❌ Search failed: {str(e)}")
            raise Exception(f"Search failed: {str(e)}")
    
    async def get_context(
        self,
        startup_id: int,
        query: str,
        max_chunks: int = 5
    ) -> List[str]:
        """Get context chunks for a query"""
        results = await self.search(startup_id, query, k=max_chunks)
        return [r["content"] for r in results]
    
    async def delete_startup_data(self, startup_id: int):
        """Delete all vector data for a startup"""
        try:
            # Remove from memory
            if startup_id in self.vector_stores:
                del self.vector_stores[startup_id]
            
            # Remove from disk
            store_path = self._get_store_path(startup_id)
            if os.path.exists(store_path):
                import shutil
                shutil.rmtree(store_path)
                
        except Exception as e:
            raise Exception(f"Failed to delete data: {str(e)}")


# Singleton instance
rag_service = RAGService()